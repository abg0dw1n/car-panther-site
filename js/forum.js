// Fan Discussions tab (posts are not saved; they reset when the page reloads).

function createNewPost() {
  const title = document.getElementById('post-title').value.trim();
  const body = document.getElementById('post-body').value.trim();

  if (!title || !body) {
    alert('Please enter both a thread title and message.');
    return;
  }

  const list = document.getElementById('forum-threads-list');
  const newThread = document.createElement('div');
  newThread.className = 'bg-panthers-black/50 border border-panthers-cardBorder p-3 rounded-lg';
  // Title and body are user input, so they must be escaped before going into innerHTML
  newThread.innerHTML = `
    <div class="flex justify-between items-start mb-1">
      <h3 class="font-heading font-bold text-white text-base">${escapeHtml(title)}</h3>
      <span class="text-[9px] bg-panthers-blue/20 text-panthers-blue border border-panthers-blue px-1.5 py-0.5 rounded font-heading font-bold">FAN THREAD</span>
    </div>
    <p class="text-panthers-silver text-xs mb-2 whitespace-pre-line">${escapeHtml(body)}</p>
    <div class="flex items-center gap-3 text-[10px] text-panthers-silver pt-1.5 border-t border-panthers-cardBorder/50">
      <span>Posted by <strong class="text-white">CarolinaFan</strong></span>
      <span>• Just now</span>
      <button onclick="upvotePost(this)" class="hover:text-panthers-blue font-heading font-bold uppercase tracking-wider ml-auto">▲ <span class="vote-count">1</span> Like</button>
    </div>
  `;

  list.prepend(newThread);
  document.getElementById('post-title').value = '';
  document.getElementById('post-body').value = '';
}

// One like per button: click again to take it back
function upvotePost(btn) {
  const countSpan = btn.querySelector('.vote-count');
  const count = parseInt(countSpan.textContent, 10);
  const liked = btn.dataset.liked === '1';
  countSpan.textContent = liked ? count - 1 : count + 1;
  btn.dataset.liked = liked ? '0' : '1';
  btn.classList.toggle('text-panthers-blue', !liked);
}
