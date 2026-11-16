/* =========================================================
   LEARNOVA - script.js  (complete, final version)
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  const inPages = location.pathname.includes('/pages/');
  const PAGES = inPages ? '' : 'pages/';
  const HOME = inPages ? '../index.html' : 'index.html';
  const LOGIN = PAGES + 'login.html';
  const COURSES = PAGES + 'courses.html';

  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) {}
    }
  };

  const escapeHTML = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

  /* ---------- Extra CSS used by the JavaScript features ---------- */
  const style = document.createElement('style');
  style.textContent = `
    header.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .nav-links a.active { color: var(--primary); }
    .menu { cursor: pointer; user-select: none; }
    @media (max-width: 900px) {
      .nav-links.open {
        display: flex; flex-direction: column; align-items: flex-start;
        position: absolute; top: 76px; left: 0; right: 0;
        background: var(--white); padding: 20px 4%; gap: 16px;
        border-bottom: 1px solid var(--border); box-shadow: var(--shadow);
      }
    }
    .nav-greet { font-size: 14px; font-weight: 600; color: var(--dark); }

    .reveal { opacity: 0; transform: translateY(26px);
              transition: opacity .6s ease, transform .6s ease; }
    .reveal.show { opacity: 1; transform: none; }

    #lv-toasts { position: fixed; top: 90px; right: 20px; z-index: 5000;
                 display: flex; flex-direction: column; gap: 10px; }
    .lv-toast { background: #111827; color: #fff; padding: 13px 18px;
                border-radius: 10px; font-size: 14px; font-weight: 600;
                box-shadow: 0 10px 30px rgba(0,0,0,.2);
                opacity: 0; transform: translateX(30px); transition: .3s;
                border-left: 4px solid #10b981; max-width: 320px; }
    .lv-toast.error { border-left-color: #ef4444; }
    .lv-toast.show { opacity: 1; transform: none; }

    #lv-top { position: fixed; bottom: 25px; right: 25px; width: 46px; height: 46px;
              border-radius: 50%; border: none; background: var(--primary); color: #fff;
              font-size: 20px; cursor: pointer; box-shadow: var(--shadow);
              opacity: 0; pointer-events: none; transition: .3s; z-index: 900; }
    #lv-top.show { opacity: 1; pointer-events: auto; }
    #lv-top:hover { background: var(--primary-dark); }

    .lv-modal { position: fixed; inset: 0; background: rgba(15,23,42,.6);
                display: flex; align-items: center; justify-content: center;
                z-index: 4000; padding: 20px; opacity: 0; transition: .25s; }
    .lv-modal.show { opacity: 1; }
    .lv-modal-box { background: var(--white); width: min(460px, 100%);
                    border-radius: 20px; overflow: hidden; position: relative;
                    transform: translateY(20px); transition: .25s; }
    .lv-modal.show .lv-modal-box { transform: none; }
    .lv-modal-top { background: linear-gradient(135deg,#4f46e5,#0ea5e9);
                    height: 130px; display: flex; align-items: center;
                    justify-content: center; font-size: 56px; color: #fff; }
    .lv-modal-body { padding: 26px; }
    .lv-modal-body h3 { color: var(--dark); font-size: 22px; margin: 8px 0; }
    .lv-modal-body p { color: var(--muted); font-size: 14px; margin-bottom: 18px; }
    .lv-modal-info { display: flex; justify-content: space-between;
                     padding: 14px 0; border-top: 1px solid var(--border);
                     border-bottom: 1px solid var(--border); margin-bottom: 20px;
                     font-size: 14px; color: var(--text); }
    .lv-modal-actions { display: flex; gap: 12px; }
    .lv-modal-actions .btn { flex: 1; text-align: center; }
    .lv-close { position: absolute; top: 12px; right: 14px; background: rgba(255,255,255,.9);
                border: none; width: 32px; height: 32px; border-radius: 50%;
                font-size: 16px; cursor: pointer; }

    .course-image { position: relative; }
    .enrolled-tag { position: absolute; top: 12px; right: 12px; background: #10b981;
                    color: #fff; font-size: 11px; font-weight: 700;
                    padding: 4px 10px; border-radius: 20px; }
    .course-card, .category-card { cursor: pointer; }

    .lv-filter { display: flex; flex-wrap: wrap; gap: 14px; align-items: center;
                 margin-bottom: 14px; }
    .lv-filter input, .lv-filter select, .lv-faq-search {
      padding: 12px 14px; border: 1px solid var(--border); border-radius: 10px;
      font-family: inherit; font-size: 14px; outline: none;
      background: var(--white); color: var(--dark); }
    .lv-filter input { flex: 1; min-width: 200px; }
    .lv-filter input:focus, .lv-faq-search:focus { border-color: var(--primary); }
    .lv-levels { display: flex; gap: 8px; flex-wrap: wrap; }
    .lv-chip { padding: 10px 16px; border-radius: 50px; border: 1px solid var(--border);
               background: var(--white); color: var(--text); font-family: inherit;
               font-size: 13px; font-weight: 600; cursor: pointer; transition: .25s; }
    .lv-chip:hover { border-color: var(--primary); color: var(--primary); }
    .lv-chip.active { background: var(--primary); border-color: var(--primary); color: #fff; }
    .lv-info { font-size: 13px; color: var(--muted); margin-bottom: 22px; }
    .lv-info button { margin-left: 8px; border: none; background: #e0e7ff;
                      color: var(--primary); padding: 4px 10px; border-radius: 20px;
                      cursor: pointer; font-weight: 700; font-family: inherit; }
    .lv-empty { text-align: center; padding: 50px 0; color: var(--muted); display: none; }

    .lv-billing { display: flex; justify-content: center; gap: 10px; margin: -20px 0 40px; }
    .lv-billing .lv-chip small { color: #10b981; font-weight: 700; }
    .lv-billing .lv-chip.active small { color: #fff; }

    .lv-faq-search { width: 100%; margin-bottom: 14px; }
    .lv-faq-empty { text-align: center; color: var(--muted); padding: 24px 0; display: none; }
    details summary { transition: color .2s; }
    details[open] summary { color: var(--primary); }

    .form-msg { font-size: 13px; font-weight: 600; margin-bottom: 10px; display: none;
                padding: 10px 12px; border-radius: 8px; }
    .form-msg.error { display: block; background: #fee2e2; color: #b91c1c; }
    .form-msg.success { display: block; background: #d1fae5; color: #047857; }
    .lv-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
              background: none; border: none; cursor: pointer; font-size: 16px; }

    .lv-tabs { display:flex; background:var(--light); border:1px solid var(--border);
               border-radius:12px; padding:4px; margin-bottom:24px; }
    .lv-tab { flex:1; padding:10px; border:none; background:none; border-radius:9px;
              font-family:inherit; font-size:14px; font-weight:700; color:var(--muted);
              cursor:pointer; transition:.25s; }
    .lv-tab.active { background:var(--primary); color:#fff; }

    body.dark { --white:#0f172a; --dark:#f1f5f9; --text:#cbd5e1; --muted:#94a3b8;
                --light:#1e293b; --border:#334155; --shadow:0 10px 30px rgba(0,0,0,.45); }
    body.dark .hero, body.dark .login-page { background: linear-gradient(135deg,#1e1b4b,#0f172a); }
    body.dark .badge, body.dark .course-icon, body.dark .category-icon,
    body.dark .course-level, body.dark .benefit-icon { background:#312e81; color:#c7d2fe; }
    body.dark .instructor-avatar { background: linear-gradient(135deg,#3730a3,#075985); }
    body.dark .path-card { background:#1e293b; }
    body.dark .progress { background:#334155; }
    body.dark .btn-primary, body.dark .statistics, body.dark .cta-box,
    body.dark .popular, body.dark .lv-chip.active, body.dark .lv-tab.active { color:#fff; }
    body.dark .btn-light { background:#f1f5f9; color:#4f46e5; }
    body.dark footer h4 { color:#fff; }
    body.dark input, body.dark select { background:#1e293b; color:#f1f5f9; }
    body.dark .lv-info button { background:#312e81; color:#c7d2fe; }
  `;
  document.head.appendChild(style);

  /* ---------- Toast notifications ---------- */
  function toast(message, type) {
    let box = $('#lv-toasts');
    if (!box) {
      box = document.createElement('div');
      box.id = 'lv-toasts';
      document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.className = 'lv-toast ' + (type || 'success');
    t.textContent = message;
    box.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 300);
    }, 3000);
  }

  /* =========================================================
     1. NAVBAR: mobile menu, active link
     ========================================================= */
  const header = $('header');
  const navbar = $('.navbar');
  const navLinks = $('.nav-links');

  if (navbar && navLinks) {
    let menu = $('.menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'menu';
      menu.textContent = '☰';
      navbar.appendChild(menu);
    }
    menu.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menu.textContent = open ? '✕' : '☰';
    });
    $$('a', navLinks).forEach((a) =>
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menu.textContent = '☰';
      })
    );

    const current = location.pathname.split('/').pop();
    $$('a', navLinks).forEach((a) => {
      const file = a.getAttribute('href').split('/').pop();
      if (current && file === current) a.classList.add('active');
    });
  }

  /* =========================================================
     2. BACK-TO-TOP BUTTON + HEADER SHADOW
     ========================================================= */
  const topBtn = document.createElement('button');
  topBtn.id = 'lv-top';
  topBtn.type = 'button';
  topBtn.textContent = '↑';
  topBtn.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(topBtn);
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    topBtn.classList.toggle('show', window.scrollY > 400);
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  /* =========================================================
     3. DARK MODE
     ========================================================= */
  const navActions = $('.nav-actions');
  function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    const b = $('#lv-theme');
    if (b) b.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  if (navActions) {
    const themeBtn = document.createElement('button');
    themeBtn.id = 'lv-theme';
    themeBtn.type = 'button';
    themeBtn.className = 'btn btn-outline';
    themeBtn.setAttribute('aria-label', 'Toggle dark mode');
    navActions.insertBefore(themeBtn, navActions.firstChild);
    themeBtn.addEventListener('click', () => {
      const next = document.body.classList.contains('dark') ? 'light' : 'dark';
      store.set('learnova_theme', next);
      applyTheme(next);
    });
  }
  applyTheme(store.get('learnova_theme', 'light'));

  /* =========================================================
     4. LOGIN STATE IN NAVBAR
     ========================================================= */
  const currentUser = store.get('learnova_user', null);
  const signInLink = $('.nav-actions a[href$="login.html"]');
  if (currentUser && signInLink) {
    const greet = document.createElement('span');
    greet.className = 'nav-greet';
    greet.textContent = '👋 ' + currentUser.name.split(' ')[0];
    signInLink.parentNode.insertBefore(greet, signInLink);
    signInLink.textContent = 'Logout';
    signInLink.setAttribute('href', '#');
    signInLink.addEventListener('click', (e) => {
      e.preventDefault();
      store.remove('learnova_user');
      toast('You have been logged out');
      setTimeout(() => location.reload(), 700);
    });
  }

  /* =========================================================
     5. SCROLL-REVEAL ANIMATION
     ========================================================= */
  const revealTargets = $$(
    '.category-card, .course-card, .benefit, .testimonial, .path-card, ' +
    '.price-card, .instructor, .section-heading, .cta-box'
  );
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          revealObserver.unobserve(entry.target);
          setTimeout(() => entry.target.classList.remove('reveal', 'show'), 800);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((el) => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

  /* =========================================================
     6. ANIMATED COUNTERS
     ========================================================= */
  function countUp(el) {
    const m = el.textContent.trim().match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    const target = parseFloat(m[1]);
    const suffix = m[2];
    const duration = 1600;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = m[1] + suffix;
    }
    requestAnimationFrame(step);
  }
  const counters = $$('.stat strong, .statistics-grid strong');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => counterObserver.observe(c));
  }

  /* =========================================================
     7. HOME PAGE: search box + category cards
     ========================================================= */
  const searchBox = $('.search-box');
  if (searchBox) {
    const sInput = $('input', searchBox);
    const sSelect = $('select', searchBox);
    const sButton = $('a.btn', searchBox);

    function goSearch() {
      const q = sInput.value.trim();
      const cat = sSelect.value;
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (cat && cat !== 'All Categories') params.set('category', cat);
      const qs = params.toString();
      location.href = COURSES + (qs ? '?' + qs : '');
    }
    sButton.addEventListener('click', (e) => { e.preventDefault(); goSearch(); });
    sInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') goSearch(); });
  }

  $$('.category-card').forEach((card) => {
    card.addEventListener('click', () => {
      const name = $('h3', card).textContent.trim();
      location.href = COURSES + '?category=' + encodeURIComponent(name);
    });
  });

  /* =========================================================
     8. COURSES PAGE: search, level filter, sort, category
     ========================================================= */
  const CATEGORY_WORDS = {
    'web development': ['web', 'html', 'css', 'javascript'],
    'data science': ['data', 'python', 'analytics'],
    'design': ['design', 'ui/ux'],
    'ui/ux design': ['design', 'ui/ux'],
    'business': ['business', 'leadership', 'management']
  };

  const courseGrid = $('.course-grid');
  if (courseGrid && /courses\.html$/.test(location.pathname)) {
    const params = new URLSearchParams(location.search);
    let query = (params.get('search') || '').toLowerCase();
    let category = (params.get('category') || '').toLowerCase();
    let level = 'ALL';
    let sort = 'default';

    const bar = document.createElement('div');
    bar.className = 'lv-filter';
    bar.innerHTML =
      '<input type="text" id="lvSearch" placeholder="🔍 Search courses..." value="' +
      escapeHTML(params.get('search') || '') + '">' +
      '<div class="lv-levels">' +
      ['All', 'Beginner', 'Intermediate', 'Advanced'].map((l, i) =>
        '<button type="button" class="lv-chip' + (i === 0 ? ' active' : '') +
        '" data-level="' + l.toUpperCase() + '">' + l + '</button>').join('') +
      '</div>' +
      '<select id="lvSort">' +
      '<option value="default">Sort: Featured</option>' +
      '<option value="low">Price: Low to High</option>' +
      '<option value="high">Price: High to Low</option>' +
      '<option value="rating">Top Rated</option>' +
      '</select>';
    const info = document.createElement('p');
    info.className = 'lv-info';
    const empty = document.createElement('div');
    empty.className = 'lv-empty';
    empty.innerHTML = '<h3>😕 No courses found</h3><p>Try a different search or filter.</p>';
    courseGrid.parentNode.insertBefore(bar, courseGrid);
    courseGrid.parentNode.insertBefore(info, courseGrid);
    courseGrid.parentNode.insertBefore(empty, courseGrid.nextSibling);

    const cards = $$('.course-card', courseGrid).map((el, i) => {
      const title = $('h3', el).textContent.trim();
      return {
        el: el, index: i, title: title,
        text: (title + ' ' + $('p', el).textContent).toLowerCase(),
        level: $('.course-level', el).textContent.trim().toUpperCase(),
        price: parseInt($('.course-price', el).textContent.replace(/[^\d]/g, ''), 10),
        rating: parseFloat($('.course-meta span', el).textContent.replace(/[^\d.]/g, ''))
      };
    });

    function matchesCategory(c) {
      if (!category || category === 'all categories') return true;
      const words = CATEGORY_WORDS[category] || [category];
      return words.some((w) => c.text.includes(w));
    }

    function applyFilters() {
      const list = cards.filter((c) =>
        (level === 'ALL' || c.level === level) &&
        (!query || c.text.includes(query)) &&
        matchesCategory(c)
      );
      if (sort === 'low') list.sort((a, b) => a.price - b.price);
      else if (sort === 'high') list.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
      else list.sort((a, b) => a.index - b.index);

      cards.forEach((c) => (c.el.style.display = 'none'));
      list.forEach((c) => {
        c.el.style.display = '';
        courseGrid.appendChild(c.el);
      });

      let text = 'Showing ' + list.length + ' of ' + cards.length + ' courses';
      if (category && category !== 'all categories') {
        text += ' &nbsp;•&nbsp; Category: <strong>' + escapeHTML(category) +
                '</strong><button type="button" id="lvClearCat">✕ Clear</button>';
      }
      info.innerHTML = text;
      empty.style.display = list.length ? 'none' : 'block';
    }

    $('#lvSearch').addEventListener('input', (e) => {
      query = e.target.value.trim().toLowerCase();
      applyFilters();
    });
    $('#lvSort').addEventListener('change', (e) => {
      sort = e.target.value;
      applyFilters();
    });
    $$('.lv-chip', bar).forEach((chip) =>
      chip.addEventListener('click', () => {
        $$('.lv-chip', bar).forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        level = chip.dataset.level;
        applyFilters();
      })
    );
    info.addEventListener('click', (e) => {
      if (e.target.id === 'lvClearCat') { category = ''; applyFilters(); }
    });

    applyFilters();
  }

  /* =========================================================
     9. COURSE MODAL + ENROLL
     ========================================================= */
  function getEnrolled() { return store.get('learnova_enrolled', []); }

  function markEnrolled() {
    const enrolled = getEnrolled();
    $$('.course-card').forEach((card) => {
      const title = $('h3', card).textContent.trim();
      const img = $('.course-image', card);
      const existing = $('.enrolled-tag', card);
      if (enrolled.includes(title) && !existing && img) {
        const tag = document.createElement('span');
        tag.className = 'enrolled-tag';
        tag.textContent = '✓ Enrolled';
        img.appendChild(tag);
      }
    });
  }

  function openCourseModal(card) {
    const title = $('h3', card).textContent.trim();
    const desc = $('p', card).textContent.trim();
    const level = $('.course-level', card).textContent.trim();
    const icon = $('.course-image', card).firstChild.textContent.trim();
    const spans = $$('.course-meta span', card);
    const rating = spans[0].textContent.trim();
    const hours = spans[1].textContent.trim();
    const price = spans[2].textContent.trim();
    const already = getEnrolled().includes(title);

    const overlay = document.createElement('div');
    overlay.className = 'lv-modal';
    overlay.innerHTML =
      '<div class="lv-modal-box">' +
        '<button class="lv-close" type="button" aria-label="Close">✕</button>' +
        '<div class="lv-modal-top">' + escapeHTML(icon) + '</div>' +
        '<div class="lv-modal-body">' +
          '<span class="course-level">' + escapeHTML(level) + '</span>' +
          '<h3>' + escapeHTML(title) + '</h3>' +
          '<p>' + escapeHTML(desc) + '</p>' +
          '<div class="lv-modal-info"><span>' + escapeHTML(rating) + '</span><span>' +
            escapeHTML(hours) + '</span><strong>' + escapeHTML(price) + '</strong></div>' +
          '<div class="lv-modal-actions">' +
            '<button type="button" class="btn btn-outline" data-act="close">Close</button>' +
            '<button type="button" class="btn btn-primary" data-act="enroll">' +
              (already ? '✓ Already Enrolled' : 'Enroll Now') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.classList.add('show'));

    function close() {
      overlay.classList.remove('show');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      setTimeout(() => overlay.remove(), 250);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('.lv-close') ||
          e.target.dataset.act === 'close') { close(); return; }

      if (e.target.dataset.act === 'enroll') {
        if (!store.get('learnova_user', null)) {
          toast('Create an account or sign in to enroll', 'error');
          sessionStorage.setItem('learnova_next', location.href);
          setTimeout(() => (location.href = LOGIN + '?mode=signup'), 1200);
          return;
        }
        const list = getEnrolled();
        if (list.includes(title)) { toast('You are already enrolled in this course'); return; }
        list.push(title);
        store.set('learnova_enrolled', list);
        markEnrolled();
        toast('🎉 Enrolled in ' + title);
        close();
      }
    });
  }

  $$('.course-card').forEach((card) =>
    card.addEventListener('click', () => openCourseModal(card))
  );
  markEnrolled();

  /* =========================================================
     10. LEARNING PATHS
     ========================================================= */
  $$('.path-card .btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = $('h3', btn.closest('.path-card')).textContent.trim();
      store.set('learnova_path', name);
      toast('🛤️ Learning path selected: ' + name);
      setTimeout(() => (location.href = btn.getAttribute('href')), 900);
    });
  });

  /* =========================================================
     11. PRICING: monthly / yearly toggle
     ========================================================= */
  const pricingGrid = $('.pricing-grid');
  if (pricingGrid) {
    const toggle = document.createElement('div');
    toggle.className = 'lv-billing';
    toggle.innerHTML =
      '<button type="button" class="lv-chip active" data-bill="monthly">Monthly</button>' +
      '<button type="button" class="lv-chip" data-bill="yearly">Yearly <small>Save 20%</small></button>';
    pricingGrid.parentNode.insertBefore(toggle, pricingGrid);

    const prices = $$('.price', pricingGrid).map((el) => ({
      el: el,
      base: parseInt(el.firstChild.nodeValue.replace(/[^\d]/g, ''), 10),
      unit: $('span', el)
    }));

    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.lv-chip');
      if (!btn) return;
      $$('.lv-chip', toggle).forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const yearly = btn.dataset.bill === 'yearly';
      prices.forEach((p) => {
        const value = yearly ? Math.round(p.base * 12 * 0.8) : p.base;
        p.el.firstChild.nodeValue = '\n₹' + value.toLocaleString('en-IN') + '\n';
        p.unit.textContent = yearly ? '/year' : '/month';
      });
    });
  }

  /* =========================================================
     12. FAQ: accordion + search
     ========================================================= */
  const faq = $('.faq');
  if (faq) {
    const items = $$('details', faq);

    items.forEach((d) =>
      d.addEventListener('toggle', () => {
        if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
      })
    );

    const faqSearch = document.createElement('input');
    faqSearch.type = 'text';
    faqSearch.className = 'lv-faq-search';
    faqSearch.placeholder = '🔍 Search questions...';
    const none = document.createElement('div');
    none.className = 'lv-faq-empty';
    none.textContent = 'No matching questions found.';
    faq.insertBefore(faqSearch, faq.firstChild);
    faq.appendChild(none);

    faqSearch.addEventListener('input', () => {
      const q = faqSearch.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((d) => {
        const match = d.textContent.toLowerCase().includes(q);
        d.style.display = match ? '' : 'none';
        if (match) shown++;
      });
      none.style.display = shown ? 'none' : 'block';
    });
  }

  /* =========================================================
     13. LOGIN PAGE: tabs (Sign In / Create Account)
     ========================================================= */
  const loginPage = $('.login-page');
  if (loginPage) {
    const lCard = $('.login-card', loginPage);
    const lForm = $('form', lCard);
    const lTitle = $('h1', lCard);
    const lSubtitle = $('.login-card > p', loginPage);
    const lEmail = $('#email');
    const lPass = $('#password');
    const lSubmit = $('button[type="submit"]', lForm);
    const switchPara = $$('.login-links p', lCard)[0];
    const forgotLink = $$('.login-links a', lCard).find((a) => /forgot/i.test(a.textContent));

    // tabs
    const tabs = document.createElement('div');
    tabs.className = 'lv-tabs';
    tabs.innerHTML =
      '<button type="button" class="lv-tab active" data-mode="signin">Sign In</button>' +
      '<button type="button" class="lv-tab" data-mode="signup">Create Account</button>';
    lCard.insertBefore(tabs, lTitle);

    // message box
    const lMsg = document.createElement('div');
    lMsg.className = 'form-msg';
    lForm.insertBefore(lMsg, lSubmit);
    function showMsg(text, type) {
      lMsg.textContent = text;
      lMsg.className = 'form-msg ' + type;
    }

    // show / hide password
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    lPass.parentNode.insertBefore(wrap, lPass);
    wrap.appendChild(lPass);
    lPass.style.paddingRight = '44px';
    const eye = document.createElement('button');
    eye.type = 'button';
    eye.className = 'lv-eye';
    eye.textContent = '👁️';
    wrap.appendChild(eye);
    eye.addEventListener('click', () => {
      const hidden = lPass.type === 'password';
      lPass.type = hidden ? 'text' : 'password';
      eye.textContent = hidden ? '🙈' : '👁️';
    });

    // Full Name field (Create Account only)
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    nameGroup.style.display = 'none';
    nameGroup.innerHTML =
      '<label for="fullname">Full Name</label>' +
      '<input type="text" id="fullname" placeholder="Enter your full name">';
    lForm.insertBefore(nameGroup, lForm.firstChild);
    const nameInput = $('#fullname', nameGroup);

    let mode = 'signin';
    function setMode(m) {
      mode = m;
      lMsg.className = 'form-msg';
      $$('.lv-tab', tabs).forEach((t) => t.classList.toggle('active', t.dataset.mode === m));
      if (m === 'signup') {
        lTitle.textContent = 'Create Account';
        lSubtitle.textContent = 'Join Learnova and start learning today.';
        nameGroup.style.display = '';
        lSubmit.textContent = 'Create Account';
        switchPara.innerHTML = 'Already have an account? <a href="#" id="lvSwitch">Sign In</a>';
      } else {
        lTitle.textContent = 'Welcome Back';
        lSubtitle.textContent = 'Sign in to continue learning with Learnova.';
        nameGroup.style.display = 'none';
        lSubmit.textContent = 'Sign In';
        switchPara.innerHTML = "Don't have an account? <a href=\"#\" id=\"lvSwitch\">Create Account</a>";
      }
    }

    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('.lv-tab');
      if (b) setMode(b.dataset.mode);
    });
    switchPara.addEventListener('click', (e) => {
      if (e.target.id === 'lvSwitch') {
        e.preventDefault();
        setMode(mode === 'signin' ? 'signup' : 'signin');
      }
    });

    if (new URLSearchParams(location.search).get('mode') === 'signup') setMode('signup');

    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = lEmail.value.trim();
        if (!isValidEmail(email)) { showMsg('Enter your email above first.', 'error'); return; }
        showMsg('Password reset link sent to ' + email + ' (demo).', 'success');
      });
    }

    lForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = lEmail.value.trim().toLowerCase();
      const pw = lPass.value;
      const name = nameInput.value.trim();
      const users = store.get('learnova_users', {});

      if (mode === 'signup' && name.length < 2) { showMsg('Please enter your full name.', 'error'); return; }
      if (!isValidEmail(email)) { showMsg('Please enter a valid email address.', 'error'); return; }
      if (pw.length < 6) { showMsg('Password must be at least 6 characters.', 'error'); return; }

      let loggedUser;
      if (mode === 'signup') {
        if (users[email]) { showMsg('Account already exists. Use the Sign In tab.', 'error'); return; }
        users[email] = { name: name, password: pw };   // DEMO ONLY
        store.set('learnova_users', users);
        loggedUser = { name: name, email: email };
      } else {
        const found = users[email];
        if (!found) { showMsg('No account found. Use the Create Account tab first.', 'error'); return; }
        if (found.password !== pw) { showMsg('Incorrect password. Try again.', 'error'); return; }
        loggedUser = { name: found.name, email: email };
      }

      store.set('learnova_user', loggedUser);
      showMsg(mode === 'signup' ? 'Account created! Redirecting...' : 'Signed in! Redirecting...', 'success');
      const next = sessionStorage.getItem('learnova_next');
      sessionStorage.removeItem('learnova_next');
      setTimeout(() => (location.href = next || HOME), 900);
    });
  }

  /* =========================================================
     14. CONTACT PAGE
     ========================================================= */
  if (!loginPage) {
    const contactForm = $('.login-card form');
    if (contactForm) {
      const cSubmit = $('button[type="submit"]', contactForm);
      const cMsg = document.createElement('div');
      cMsg.className = 'form-msg';
      contactForm.insertBefore(cMsg, cSubmit);

      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#name').value.trim();
        const email = $('#email').value.trim();
        const message = $('#message').value.trim();

        if (name.length < 2) { cMsg.textContent = 'Please enter your name.'; cMsg.className = 'form-msg error'; return; }
        if (!isValidEmail(email)) { cMsg.textContent = 'Please enter a valid email.'; cMsg.className = 'form-msg error'; return; }
        if (message.length < 10) { cMsg.textContent = 'Message must be at least 10 characters.'; cMsg.className = 'form-msg error'; return; }

        const all = store.get('learnova_messages', []);
        all.push({ name: name, email: email, message: message, date: new Date().toISOString() });
        store.set('learnova_messages', all);

        cMsg.className = 'form-msg';
        contactForm.reset();
        toast('✅ Thanks ' + name.split(' ')[0] + '! Your message has been sent.');
      });
    }
  }
});