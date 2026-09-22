/* An illustrative terminal, with user-controlled workspace modes. */
(() => {
  const tabs = [...document.querySelectorAll('[data-demo]')];
  const panel = document.getElementById('terminal-demo');
  if (!panel) return;
  function select(tab) {
    const mode = tab.dataset.demo;
    tabs.forEach((button) => {
      const active = button === tab;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    panel.dataset.mode = mode;
    document.getElementById('demo-secondary').hidden = mode !== 'split';
    document.getElementById('demo-completions').hidden = mode !== 'completion';
    document.getElementById('demo-input').textContent = mode === 'completion' ? 'git st' : 'git status';
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next]);
      tabs[next].focus();
    });
  });
})();
