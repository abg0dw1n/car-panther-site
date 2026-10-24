// Switching between the top navigation tabs.

function openTab(evt, tabId) {
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(c => c.classList.add('hidden'));

  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(t => {
    t.classList.remove('active', 'border-panthers-blue', 'text-white', 'bg-panthers-blue/20');
    t.classList.add('border-transparent', 'text-panthers-silver');
  });

  document.getElementById(tabId).classList.remove('hidden');

  // Load the embedded trivia game only when the Arcade is opened
  if (tabId === 'arcade-tab') {
    const frame = document.getElementById('trivia-frame');
    if (frame && !frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);
  }

  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add('active', 'border-panthers-blue', 'text-white', 'bg-panthers-blue/20');
    evt.currentTarget.classList.remove('border-transparent', 'text-panthers-silver');
  }
}

function openTabByNav(tabId) {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(t => {
    if (t.getAttribute('onclick').includes(tabId)) {
      t.click();
    }
  });
}
