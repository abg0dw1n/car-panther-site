// Language filter for forum posts.
//  - BLOCKED: hateful slurs. A post containing one is rejected outright.
//  - MASKED: everyday swear words. They are allowed but shown as f***.
// Matching tolerates common look-alike swaps (0 for o, @ for a, $ for s...) and repeated letters.

const BLOCKED = [
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded', 'kike', 'chink', 'spic', 'wetback',
  'tranny', 'dyke', 'gook', 'coon', 'beaner', 'raghead', 'towelhead'
];

const MASKED = [
  'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'shitty', 'bullshit', 'bitch', 'bitches',
  'asshole', 'bastard', 'dick', 'dickhead', 'pussy', 'cunt', 'whore', 'slut', 'cock', 'prick', 'twat'
];

const LOOKALIKE = { a: 'a@4', e: 'e3', i: 'i1!|', o: 'o0', s: 's$5', t: 't7+', g: 'g9', l: 'l1|', u: 'uv' };

function wordPattern(word) {
  const body = [...word].map(ch => {
    const set = LOOKALIKE[ch] || ch;
    return `[${set.replace(/[\]\\^-]/g, '\\$&')}]+[\\W_]*`;
  }).join('');
  return body.replace(/\[\\W_\]\*$/, '');
}

const blockedRe = new RegExp(`(?<![a-z0-9])(?:${BLOCKED.map(wordPattern).join('|')})(?![a-z0-9])`, 'i');
const maskedRe = new RegExp(`(?<![a-z0-9])(?:${MASKED.map(wordPattern).join('|')})(?![a-z0-9])`, 'gi');

export function hasBlockedWord(text) {
  return blockedRe.test(String(text || ''));
}

export function maskProfanity(text) {
  return String(text || '').replace(maskedRe, m => m[0] + '*'.repeat(Math.max(2, m.replace(/[\W_]/g, '').length - 1)));
}
