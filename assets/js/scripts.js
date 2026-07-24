// =============================================================
// Power Use Explainer — scripts.js
// Vanilla JS only. No external libraries.
// =============================================================

(function () {
  'use strict';

  // Respect reduced motion globally
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =============================================================
  // CHART DATA
  // =============================================================
  const chartData = [
    {
      label: 'Industrial motors & processes',
      twh: 8000,
      pct: '~28%',
      color: '#3a3a3a',
    },
    {
      label: 'Lighting',
      twh: 2200,
      pct: '~8%',
      color: '#6e6e6e',
    },
    {
      label: 'Space cooling',
      twh: 2100,
      pct: '~7%',
      color: '#8e8e8e',
    },
    {
      label: 'Water heating',
      twh: 1400,
      pct: '~5%',
      color: '#ababab',
    },
    {
      label: 'Appliances & electronics',
      twh: 1100,
      pct: '~4%',
      color: '#c0bbb2',
    },
    {
      label: 'Data centers',
      twh: 415,
      pct: '~1.5%',
      color: '#c8882a', // accent — highlighted
      highlight: true,
    },
    {
      label: 'Electric vehicles (charging)',
      twh: 130,
      pct: '~0.5%',
      color: '#e5c98a',
    },
  ];

  const maxTwh = chartData[0].twh; // 8000

  // =============================================================
  // BUILD CHART BARS
  // =============================================================
  function buildChart() {
    const container = document.getElementById('chart-bars');
    if (!container) return;

    chartData.forEach(function (item) {
      const pct = (item.twh / maxTwh) * 100;

      const row = document.createElement('div');
      row.className = 'chart-row';

      const label = document.createElement('div');
      label.className = 'chart-label';
      label.textContent = item.label;

      const track = document.createElement('div');
      track.className = 'chart-bar-track';

      const fill = document.createElement('div');
      fill.className = 'chart-bar-fill';
      fill.style.backgroundColor = item.color;
      fill.style.width = '0%';
      fill.dataset.targetWidth = pct.toFixed(2);

      // Accessible label on bar
      fill.setAttribute('role', 'presentation');

      // Highlight ring for data centers
      if (item.highlight) {
        track.style.outline = '1.5px solid rgba(200, 136, 42, 0.5)';
        track.style.outlineOffset = '2px';
        label.style.color = '#c8882a';
        label.style.fontWeight = '600';
      }

      track.appendChild(fill);

      const valueEl = document.createElement('div');
      valueEl.className = 'chart-value';
      valueEl.textContent = item.twh.toLocaleString() + ' TWh';

      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(valueEl);

      container.appendChild(row);
    });
  }

  // =============================================================
  // ANIMATE CHART BARS (on scroll into view)
  // =============================================================
  function animateChartBars() {
    const container = document.getElementById('chart-bars');
    if (!container) return;

    if (prefersReducedMotion) {
      // Set immediately
      const fills = container.querySelectorAll('.chart-bar-fill');
      fills.forEach(function (fill) {
        fill.style.width = fill.dataset.targetWidth + '%';
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const fills = entry.target.querySelectorAll('.chart-bar-fill');
            fills.forEach(function (fill, i) {
              // Stagger each bar
              setTimeout(function () {
                fill.style.width = fill.dataset.targetWidth + '%';
              }, i * 90);
            });
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(container);
  }

  // =============================================================
  // COUNTER ANIMATION (hero stat strip)
  // =============================================================
  function animateCounters() {
    const stats = document.querySelectorAll('[data-counter]');
    if (!stats.length) return;

    if (prefersReducedMotion) {
      stats.forEach(function (stat) {
        const numEl = stat.querySelector('.stat-num');
        const target = parseFloat(stat.dataset.counter);
        const decimals = parseInt(stat.dataset.decimal || '0', 10);
        if (numEl) numEl.textContent = target.toFixed(decimals);
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const stat = entry.target;
            const numEl = stat.querySelector('.stat-num');
            const target = parseFloat(stat.dataset.counter);
            const decimals = parseInt(stat.dataset.decimal || '0', 10);
            const duration = 1800;
            const start = performance.now();

            function tick(now) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = target * eased;
              if (numEl) numEl.textContent = current.toFixed(decimals);
              if (progress < 1) {
                requestAnimationFrame(tick);
              } else {
                if (numEl) numEl.textContent = target.toFixed(decimals);
              }
            }

            requestAnimationFrame(tick);
            obs.unobserve(stat);
          }
        });
      },
      { threshold: 0.5 }
    );

    stats.forEach(function (stat) { observer.observe(stat); });
  }

  // =============================================================
  // REVEAL CARDS ON SCROLL (IntersectionObserver)
  // =============================================================
  function revealCards() {
    const cards = document.querySelectorAll('.reveal-card');
    if (!cards.length) return;

    if (prefersReducedMotion) {
      cards.forEach(function (c) { c.classList.add('revealed'); });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            // Find position in group for stagger
            const el = entry.target;
            const siblings = Array.from(el.parentElement.querySelectorAll('.reveal-card'));
            const idx = siblings.indexOf(el);
            setTimeout(function () {
              el.classList.add('revealed');
            }, idx * 110);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    cards.forEach(function (card) { observer.observe(card); });
  }

  // =============================================================
  // PARALLAX — subtle vertical drift on hero on scroll
  // =============================================================
  function initParallax() {
    if (prefersReducedMotion) return;

    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    if (!hero || !heroContent) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          const scrollY = window.scrollY;
          // Only apply while hero is in view
          if (scrollY < hero.offsetHeight) {
            heroContent.style.transform = 'translateY(' + (scrollY * 0.18) + 'px)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // =============================================================
  // STICKY NAV SCROLL SHADOW
  // =============================================================
  function initNavShadow() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 2px 16px rgba(17,17,17,0.08)';
      } else {
        header.style.boxShadow = 'none';
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // =============================================================
  // MOBILE NAV TOGGLE
  // =============================================================
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      links.classList.toggle('open', !expanded);
    });

    // Close on link click
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('open');
      }
    });
  }

  // =============================================================
  // ACTIVE NAV LINK HIGHLIGHT on scroll
  // =============================================================
  function initNavHighlight() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.style.color = '';
              const href = link.getAttribute('href');
              if (href === '#' + entry.target.id) {
                link.style.color = 'var(--color-accent)';
              }
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach(function (sec) { observer.observe(sec); });
  }

  // =============================================================
  // CHART HOVER TOOLTIP (optional enhancement)
  // =============================================================
  function initChartHover() {
    const container = document.getElementById('chart-bars');
    if (!container) return;

    container.querySelectorAll('.chart-row').forEach(function (row, i) {
      const item = chartData[i];
      if (!item) return;

      row.addEventListener('mouseenter', function () {
        const track = row.querySelector('.chart-bar-track');
        if (track) track.style.filter = 'brightness(1.15)';
      });
      row.addEventListener('mouseleave', function () {
        const track = row.querySelector('.chart-bar-track');
        if (track) track.style.filter = '';
      });

      // Show percent in value cell on hover
      const valueEl = row.querySelector('.chart-value');
      if (valueEl) {
        const originalText = item.twh.toLocaleString() + ' TWh';
        const altText = item.pct + ' of world electricity';

        row.addEventListener('mouseenter', function () {
          valueEl.textContent = altText;
          valueEl.style.color = item.highlight ? '#c8882a' : 'var(--color-dark-muted)';
        });
        row.addEventListener('mouseleave', function () {
          valueEl.textContent = originalText;
          valueEl.style.color = '';
        });
        row.addEventListener('focusin', function () {
          valueEl.textContent = altText;
        });
        row.addEventListener('focusout', function () {
          valueEl.textContent = originalText;
        });
      }
    });
  }

  // =============================================================
  // INIT
  // =============================================================
  function init() {
    buildChart();
    animateChartBars();
    animateCounters();
    revealCards();
    initParallax();
    initNavShadow();
    initMobileNav();
    initNavHighlight();
    initChartHover();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());