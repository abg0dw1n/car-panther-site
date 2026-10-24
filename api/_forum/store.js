// Storage for the forum: JSON documents with optimistic locking.
//   read(key)                 -> { data, etag } or null
//   write(key, data, { etag }) -> writes only if the stored copy still has that etag (or, with no etag,
//                                only if the document doesn't exist yet). Throws ConflictError otherwise.
// In production the documents live in a private Vercel Blob store (BLOB_READ_WRITE_TOKEN is set by
// Vercel). Without a token (local tests) an in-memory store is used.

export class ConflictError extends Error {}

export function memoryStore() {
  const docs = new Map();
  let n = 0;
  return {
    kind: 'memory',
    async read(key) {
      const d = docs.get(key);
      return d ? { data: JSON.parse(d.json), etag: d.etag } : null;
    },
    async write(key, data, { etag } = {}) {
      const cur = docs.get(key);
      if (etag ? !cur || cur.etag !== etag : cur) throw new ConflictError(key);
      docs.set(key, { json: JSON.stringify(data), etag: `e${++n}` });
    }
  };
}

export async function blobStore() {
  const { get, put } = await import('@vercel/blob');
  const path = key => `forum/${key}.json`;
  return {
    kind: 'blob',
    async read(key) {
      const res = await get(path(key), { access: 'private', useCache: false });
      if (!res || res.statusCode !== 200) return null;
      const text = await new Response(res.stream).text();
      return { data: JSON.parse(text), etag: res.blob.etag };
    },
    async write(key, data, { etag } = {}) {
      try {
        await put(path(key), JSON.stringify(data), {
          access: 'private',
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: Boolean(etag),
          ...(etag ? { ifMatch: etag } : {})
        });
      } catch (err) {
        const msg = String((err && (err.name + ' ' + err.message)) || err);
        if (/precondition|already exists|412|409|etag/i.test(msg)) throw new ConflictError(key);
        throw err;
      }
    }
  };
}

let cached = null;
export async function getStore() {
  if (!cached) cached = process.env.BLOB_READ_WRITE_TOKEN ? await blobStore() : memoryStore();
  return cached;
}

// Read-modify-write with retries. `fn` gets the current document (or init()) and returns
// the value to send back; it may mutate the document. Return { abort: value } to skip writing.
export async function update(store, key, init, fn, tries = 6) {
  for (let i = 0; i < tries; i++) {
    const cur = await store.read(key);
    const data = cur ? cur.data : init();
    const result = await fn(data);
    if (result && result.abort !== undefined) return result.abort;
    try {
      await store.write(key, data, cur ? { etag: cur.etag } : {});
      return result;
    } catch (err) {
      if (!(err instanceof ConflictError)) throw err;
      await new Promise(r => setTimeout(r, 40 + Math.random() * 120 * (i + 1)));
    }
  }
  throw new Error('busy');
}
