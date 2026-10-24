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

  // Games load only when the Arcade is opened
  if (tabId === 'arcade-tab' && typeof loadArcadeGame === 'function') loadArcadeGame();

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
