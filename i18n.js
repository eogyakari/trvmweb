// TRVM i18n Engine v2 — Comprehensive Language Switcher
(function () {
  'use strict';

  const STORAGE_KEY = 'trvm_lang';
  const RTL_LANGS   = ['ar'];
  const SUPPORTED   = ['en', 'fr', 'id', 'ar', 'es', 'sw'];
  const LANG_META   = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'id', flag: '🇮🇩', label: 'Bahasa Indonesia' },
    { code: 'ar', flag: '🇸🇦', label: 'العربية' },
    { code: 'es', flag: '🇪🇸', label: 'Español' },
    { code: 'sw', flag: '🇰🇪', label: 'Kiswahili' },
  ];

  function getLang() {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s && SUPPORTED.includes(s)) return s;
    const b = (navigator.language || '').split('-')[0].toLowerCase();
    return SUPPORTED.includes(b) ? b : 'en';
  }
  function saveLang(l) { localStorage.setItem(STORAGE_KEY, l); }

  function dict(lang) {
    const d = window.TRVM_T;
    if (!d) return {};
    return d[lang] || d['en'] || {};
  }
  function t(lang, key) {
    const v = dict(lang)[key];
    return (v !== undefined && v !== null) ? v : (dict('en')[key] || '');
  }

  // Build reverse map: English plain text -> translation key
  let reverseMap = null;
  function buildReverseMap() {
    if (reverseMap) return;
    reverseMap = Object.create(null);
    const en = dict('en');
    for (const key of Object.keys(en)) {
      const val = en[key];
      if (typeof val !== 'string') continue;
      const clean = val.replace(/<[^>]+>/g, '').trim();
      if (clean && clean.length > 2 && !reverseMap[clean]) reverseMap[clean] = key;
      const raw = val.trim();
      if (raw && raw.length > 2 && !reverseMap[raw]) reverseMap[raw] = key;
    }
  }

  // 1. Attribute-based translation
  function applyAttributes(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(lang, key);
      if (val) el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      const val = t(lang, key);
      if (val) el.placeholder = val;
    });
  }

  // 2. Text-node walker — catches all untagged hardcoded text
  const SKIP_TAGS = new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','CODE','PRE']);
  function walkTextNodes(lang) {
    buildReverseMap();
    const langDict = dict(lang);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(node => {
      const parent = node.parentElement;
      if (!parent) return;
      if (SKIP_TAGS.has(parent.tagName)) return;
      if (parent.closest('.lang-switcher,.lang-dropdown,#langMobileMenu')) return;
      if (parent.hasAttribute('data-i18n')) return;
      const original = node.textContent;
      const trimmed  = original.trim();
      if (!trimmed || trimmed.length < 3) return;
      const key = reverseMap[trimmed];
      if (!key) return;
      const translated = langDict[key];
      if (!translated || translated === trimmed || translated.includes('<')) return;
      node.textContent = original.replace(trimmed, translated);
    });
  }

  // 3. RTL support
  function applyRTL(lang) {
    const isRTL = RTL_LANGS.includes(lang);
    document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.classList.toggle('trvm-rtl', isRTL);
  }

  // 4. Update switcher UI state
  function updateSwitcherUI(lang) {
    const meta = LANG_META.find(m => m.code === lang) || LANG_META[0];
    document.querySelectorAll('.lang-toggle-label').forEach(el => {
      el.textContent = meta.flag + ' ' + meta.code.toUpperCase();
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  // Main apply
  function applyLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'en';
    saveLang(lang);
    applyRTL(lang);
    applyAttributes(lang);
    walkTextNodes(lang);
    updateSwitcherUI(lang);
  }

  // Dropdown HTML shared between desktop and mobile
  function dropdownHTML() {
    return LANG_META.map(m =>
      '<button class="lang-btn" data-lang="' + m.code + '" type="button">' +
      '<span class="lang-flag">' + m.flag + '</span>' +
      '<span class="lang-name">' + m.label + '</span></button>'
    ).join('');
  }

  // Inject CSS
  function injectCSS() {
    if (document.getElementById('trvm-i18n-style')) return;
    const s = document.createElement('style');
    s.id = 'trvm-i18n-style';
    s.textContent = `
      /* Nav compact */
      .nav { flex-wrap: nowrap !important; padding: 0.85rem 1.8rem !important; gap: 0.5rem !important; align-items: center !important; }
      .nav-links { display: flex; flex-wrap: wrap; gap: 0.2rem 0.8rem; align-items: center; }
      .nav-links a { font-size: 0.76rem !important; white-space: nowrap; }
      .nav-cta { padding: 0.35rem 0.9rem !important; font-size: 0.76rem !important; }
      .social-bar { gap: 0.3rem; flex-shrink: 0; }
      .social-btn { width: 28px !important; height: 28px !important; font-size: 0.8rem !important; }

      /* Hamburger */
      #navHamburger {
        display: none; flex-direction: column; justify-content: center; gap: 5px;
        background: none; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;
        padding: 6px 8px; cursor: pointer; flex-shrink: 0; margin-left: auto;
      }
      #navHamburger span { display: block; width: 20px; height: 2px; background:#fff; border-radius:2px; transition:all 0.25s; }
      #navHamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
      #navHamburger.open span:nth-child(2) { opacity: 0; }
      #navHamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

      /* Mobile menu */
      #langMobileMenu {
        display: none; position: fixed; top: 72px; left: 0; right: 0;
        background: rgba(42,10,74,0.97); backdrop-filter: blur(16px);
        z-index: 99; padding: 1.2rem 1.5rem; flex-direction: column; gap: 0.4rem;
        border-bottom: 1px solid rgba(212,160,23,0.2); max-height: calc(100vh - 72px); overflow-y: auto;
      }
      #langMobileMenu.open { display: flex; }
      #langMobileMenu a {
        color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.95rem; font-weight: 500;
        padding: 0.6rem 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.07);
        display: flex; align-items: center; gap: 0.5rem; transition: color 0.2s;
      }
      #langMobileMenu a:hover, #langMobileMenu a.active { color: #D4A017; }
      #langMobileMenu .mob-social { display: flex; gap: 0.8rem; padding: 0.8rem 0.5rem 0.5rem; }
      #langMobileMenu .mob-lang { padding: 0.8rem 0.5rem 0.2rem; border-top: 1px solid rgba(212,160,23,0.15); margin-top: 0.4rem; }
      #langMobileMenu .mob-lang-title { color: #D4A017; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 0.5rem; font-weight: 600; }
      #langMobileMenu .mob-lang-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
      #langMobileMenu .lang-btn {
        background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
        border-radius: 8px; color: #fff; padding: 0.45rem 0.6rem; font-size: 0.82rem;
        cursor: pointer; display: flex; align-items: center; gap: 0.4rem;
        font-family: DM Sans,sans-serif; transition: background 0.2s; white-space: nowrap;
      }
      #langMobileMenu .lang-btn:hover,
      #langMobileMenu .lang-btn.active { background: rgba(212,160,23,0.2); border-color: rgba(212,160,23,0.5); }

      /* Desktop switcher */
      .lang-switcher { position: relative; flex-shrink: 0; margin-left: 0.3rem; }
      .lang-toggle {
        display: flex; align-items: center; gap: 0.3rem;
        background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
        color: #fff; padding: 0.3rem 0.65rem; border-radius: 50px; font-size: 0.76rem;
        font-weight: 500; cursor: pointer; white-space: nowrap; font-family: DM Sans,sans-serif;
        transition: background 0.2s;
      }
      .lang-toggle:hover { background: rgba(255,255,255,0.2); }
      .lang-chevron { transition: transform 0.2s; flex-shrink: 0; }
      .lang-toggle[aria-expanded="true"] .lang-chevron { transform: rotate(180deg); }
      .lang-dropdown {
        display: none; position: absolute; top: calc(100% + 6px); right: 0;
        background: #fff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.18);
        min-width: 185px; overflow: hidden; z-index: 200;
        border: 1px solid rgba(74,26,122,0.12);
        animation: langFadeIn 0.15s ease;
      }
      .lang-dropdown.open { display: block; }
      @keyframes langFadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      .lang-btn { display:flex; align-items:center; gap:0.7rem; width:100%; padding:0.6rem 1rem; background:none; border:none; cursor:pointer; font-family:DM Sans,sans-serif; font-size:0.87rem; color:#333; text-align:left; transition:background 0.15s; }
      .lang-btn:hover { background: rgba(74,26,122,0.07); }
      .lang-btn.active { background: rgba(74,26,122,0.1); color: #6B2FA0; font-weight: 600; }
      .lang-flag { font-size: 1.05rem; }

      /* RTL */
      body.trvm-rtl { direction: rtl; }
      body.trvm-rtl .nav { flex-direction: row-reverse; }
      body.trvm-rtl .nav-links { flex-direction: row-reverse; }
      body.trvm-rtl .lang-dropdown { right: auto; left: 0; }
      body.trvm-rtl .lang-btn { flex-direction: row-reverse; text-align: right; }
      body.trvm-rtl .breadcrumb { flex-direction: row-reverse; }
      body.trvm-rtl .contact-detail { flex-direction: row-reverse; }
      body.trvm-rtl .how-item { flex-direction: row-reverse; border-left: none; border-right: 4px solid #6B2FA0; }
      body.trvm-rtl .footer-links { flex-direction: row-reverse; }
      body.trvm-rtl .social-bar { flex-direction: row-reverse; }
      body.trvm-rtl #langMobileMenu { direction: rtl; }
      body.trvm-rtl .impact-grid { direction: rtl; }

      /* Responsive */
      @media (max-width: 1100px) {
        .nav-links { display: none !important; }
        .social-bar { display: none !important; }
        .lang-switcher { display: none !important; }
        #navHamburger { display: flex !important; }
      }
      @media (min-width: 1101px) {
        #navHamburger { display: none !important; }
        #langMobileMenu { display: none !important; }
      }
    `;
    document.head.appendChild(s);
  }

  // Build desktop switcher widget
  function buildDesktopSwitcher() {
    const lang = getLang();
    const meta = LANG_META.find(m => m.code === lang) || LANG_META[0];
    const wrap = document.createElement('div');
    wrap.className = 'lang-switcher';
    wrap.innerHTML =
      '<button class="lang-toggle" id="langToggleBtn" aria-expanded="false" type="button">' +
      '<span class="lang-toggle-label">' + meta.flag + ' ' + meta.code.toUpperCase() + '</span>' +
      '<svg class="lang-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">' +
      '<path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<div class="lang-dropdown" id="langDropdown">' + dropdownHTML() + '</div>';

    const btn = wrap.querySelector('#langToggleBtn');
    const dd  = wrap.querySelector('#langDropdown');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', () => {
      dd.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
    wrap.querySelectorAll('.lang-btn').forEach(b => {
      b.addEventListener('click', e => {
        e.stopPropagation();
        applyLang(b.dataset.lang);
        dd.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
    return wrap;
  }

  // Build hamburger button
  function buildHamburger() {
    const btn = document.createElement('button');
    btn.id = 'navHamburger';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Menu');
    btn.innerHTML = '<span></span><span></span><span></span>';
    return btn;
  }

  // Build mobile menu
  function buildMobileMenu(nav) {
    // Collect nav links
    let linksHTML = '';
    nav.querySelectorAll('.nav-links a').forEach(a => {
      const i18n = a.getAttribute('data-i18n') || (a.querySelector('[data-i18n]') ? a.querySelector('[data-i18n]').getAttribute('data-i18n') : '');
      const text = a.textContent.trim();
      const href = a.getAttribute('href') || '#';
      const cls  = a.classList.contains('nav-cta') ? ' style="color:var(--gold,#D4A017);font-weight:700;"' : '';
      linksHTML += '<a href="' + href + '"' + cls + (i18n ? ' data-i18n="' + i18n + '"' : '') + '>' + text + '</a>\n';
    });

    // Collect social icons
    let socialHTML = '<div class="mob-social">';
    nav.querySelectorAll('.social-bar a').forEach(s => {
      socialHTML += '<a href="' + s.href + '" target="_blank" rel="noopener" class="' + s.className + '">' + s.innerHTML + '</a>';
    });
    socialHTML += '</div>';

    const menu = document.createElement('div');
    menu.id = 'langMobileMenu';
    menu.innerHTML = linksHTML + socialHTML +
      '<div class="mob-lang">' +
      '<div class="mob-lang-title" data-i18n="lang_label">Language</div>' +
      '<div class="mob-lang-grid">' + dropdownHTML() + '</div>' +
      '</div>';

    menu.querySelectorAll('.lang-btn').forEach(b => {
      b.addEventListener('click', () => {
        applyLang(b.dataset.lang);
        menu.classList.remove('open');
        document.getElementById('navHamburger') && document.getElementById('navHamburger').classList.remove('open');
      });
    });
    document.body.appendChild(menu);
    return menu;
  }

  // Inject into nav
  function injectNav() {
    document.querySelectorAll('nav.nav').forEach(nav => {
      if (nav.querySelector('.lang-switcher')) return;
      nav.appendChild(buildDesktopSwitcher());
      const hamburger  = buildHamburger();
      nav.appendChild(hamburger);
      const mobileMenu = buildMobileMenu(nav);

      hamburger.addEventListener('click', e => {
        e.stopPropagation();
        const open = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open', open);
      });
      document.addEventListener('click', e => {
        if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.remove('open');
          hamburger.classList.remove('open');
        }
      });
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          mobileMenu.classList.remove('open');
          hamburger.classList.remove('open');
        });
      });
    });
  }

  // Init
  function init() {
    if (!window.TRVM_T) { setTimeout(init, 60); return; }
    injectCSS();
    injectNav();
    applyLang(getLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TRVM_I18N = { setLang: applyLang, getLang: getLang };
})();
