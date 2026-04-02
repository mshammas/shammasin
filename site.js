/* ============================================================
   site.js — Shared initialisation for shammas.in
   Loaded via <script src="/site.js"></script> in every page.
   Scripts injected through innerHTML don't execute, so all
   shared behaviour lives here instead of inside header.html.
   ============================================================ */

// ── 1. Theme + JS flag (apply immediately — no flash) ────────
(function () {
  var t = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', t);
  // Mark that JS is running so reveal CSS activates
  document.documentElement.classList.add('js-reveal');
})();

// ── 2. Header init — called after header HTML is injected ─────
window.initHeader = function () {

  // Theme toggle button
  var themeBtn = document.getElementById('theme-toggle');
  var moon     = document.getElementById('icon-moon');
  var sun      = document.getElementById('icon-sun');

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
    if (moon) moon.style.display = t === 'dark'  ? '' : 'none';
    if (sun)  sun.style.display  = t === 'light' ? '' : 'none';
  }

  // Sync icons with current theme
  applyTheme(localStorage.getItem('theme') || 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  // Mobile menu
  var menuBtn    = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (mobileMenu.classList.contains('open') &&
          !mobileMenu.contains(e.target) &&
          !menuBtn.contains(e.target)) {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Highlight active nav link
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#desktop-nav a, #mobile-menu a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href && (href === path || (path === '' && href === 'index.html'))) {
      a.style.color      = 'var(--blue)';
      a.style.background = 'rgba(79,142,247,0.08)';
    }
  });

  // Observe any reveal elements that may have been missed
  if (window._revealObserver) {
    document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible)')
      .forEach(function (el) { window._revealObserver.observe(el); });
  }
};

// ── 3. Scroll: progress bar + header elevation ────────────────
window.addEventListener('scroll', function () {
  var scrollTop    = document.documentElement.scrollTop || document.body.scrollTop;
  var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

  var bar = document.getElementById('progress-bar');
  if (bar && scrollHeight > 0) {
    bar.style.width = ((scrollTop / scrollHeight) * 100) + '%';
  }

  var header = document.getElementById('site-header');
  if (header) header.classList.toggle('elevated', scrollTop > 30);
}, { passive: true });

// ── 4. Scroll reveal ─────────────────────────────────────────
(function () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07 });

  // Expose so initHeader() can register elements added later
  window._revealObserver = observer;

  function observeAll() {
    document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible)')
      .forEach(function (el) {
        var rect = el.getBoundingClientRect();
        // Already above the viewport (scrolled past) — show immediately
        if (rect.bottom < window.innerHeight * 0.5 && rect.top < 0) {
          el.classList.add('visible');
        } else {
          observer.observe(el);
        }
      });
  }

  // Run now + after DOM is ready + after header injection settles
  observeAll();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeAll);
  }
  setTimeout(observeAll, 200);
  setTimeout(observeAll, 700);
})();
