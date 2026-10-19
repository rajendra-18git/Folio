// Folio Navigation and UI helper
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const navToggle = document.getElementById('navToggle');
  const backdrop = document.getElementById('backdrop');

  if (navToggle && app) {
    navToggle.addEventListener('click', () => {
      const current = app.getAttribute('data-nav');
      const next = current === 'open' ? 'closed' : 'open';
      app.setAttribute('data-nav', next);
      navToggle.setAttribute('aria-expanded', next === 'open');
    });
  }

  if (backdrop && app) {
    backdrop.addEventListener('click', () => {
      app.setAttribute('data-nav', 'closed');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    });
  }

  // Comparison checkbox toggle helper
  const cmpTiles = document.querySelectorAll('.cmp input[type="checkbox"]');
  const cmpCount = document.getElementById('cmpCount');
  cmpTiles.forEach((input) => {
    input.addEventListener('change', () => {
      const parent = input.closest('.cmp');
      if (parent) {
        if (input.checked) {
          parent.classList.add('on');
        } else {
          parent.classList.remove('on');
        }
      }
      if (cmpCount) {
        const checked = document.querySelectorAll('.cmp input[type="checkbox"]:checked').length;
        cmpCount.textContent = `${checked} of ${cmpTiles.length} selected`;
      }
    });
  });
});
