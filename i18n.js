// TRVM i18n Engine — Language Switcher
(function () {
  'use strict';

  const STORAGE_KEY = 'trvm_lang';
  const RTL_LANGS = ['ar'];
  const SUPPORTED = ['en', 'fr', 'id', 'ar', 'es', 'sw'];

  // ── Get stored or default language ──
  function getLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
    // Try browser language
    const browser = (navigator.language || '').split('-')[0].toLowerCase();
    if (SUPPORTED.includes(browser)) return browser;
    return 'en';
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'en';
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
  }

  function t(lang, key) {
    const dict = window.TRVM_T;
    if (!dict) return '';
    const langData = dict[lang] || dict['en'];
    return langData[key] !== undefined ? langData[key] : (dict['en'][key] || '');
  }

  function applyLang(lang) {
    const dict = window.TRVM_T;
    if (!dict) return;

    // Set html dir and lang attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(lang, key);
      if (val !== '') el.innerHTML = val;
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      const val = t(lang, key);
      if (val !== '') el.placeholder = val;
    });

    // Update active state on switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // RTL adjustments
    if (RTL_LANGS.includes(lang)) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }

    // Update flag/label in the switcher toggle
    const toggle = document.getElementById('langToggleLabel');
    if (toggle) {
      const flags = { en: '🇬🇧', fr: '🇫🇷', id: '🇮🇩', ar: '🇸🇦', es: '🇪🇸', sw: '🇰🇪' };
      const names = { en: 'EN', fr: 'FR', id: 'ID', ar: 'AR', es: 'ES', sw: 'SW' };
      toggle.textContent = (flags[lang] || '') + ' ' + (names[lang] || 'EN');
    }
  }

  // ── Build the switcher HTML ──
  function buildSwitcher() {
    const langs = [
      { code: 'en', flag: '🇬🇧', name: 'English' },
      { code: 'fr', flag: '🇫🇷', name: 'Français' },
      { code: 'id', flag: '🇮🇩', name: 'Bahasa Indonesia' },
      { code: 'ar', flag: '🇸🇦', name: 'العربية' },
      { code: 'es', flag: '🇪🇸', name: 'Español' },
      { code: 'sw', flag: '🇰🇪', name: 'Kiswahili' },
    ];

    const wrapper = document.createElement('div');
    wrapper.className = 'lang-switcher';
    wrapper.innerHTML = `
      <button class="lang-toggle" id="langToggleBtn" aria-label="Select language" aria-expanded="false">
        <span id="langToggleLabel">🇬🇧 EN</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" class="lang-chevron">
          <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="lang-dropdown" id="langDropdown">
        ${langs.map(l => `
          <button class="lang-btn" data-lang="${l.code}">
            <span class="lang-flag">${l.flag}</span>
            <span class="lang-name">${l.name}</span>
          </button>
        `).join('')}
      </div>
    `;

    // Toggle dropdown
    const btn = wrapper.querySelector('#langToggleBtn');
    const dropdown = wrapper.querySelector('#langDropdown');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dropdown.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });

    // Close on outside click
    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });

    // Language selection
    wrapper.querySelectorAll('.lang-btn').forEach(langBtn => {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setLang(langBtn.dataset.lang);
        dropdown.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    return wrapper;
  }

  // ── Inject CSS for the switcher ──
  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
      .lang-switcher {
        position: relative;
        flex-shrink: 0;
        margin-left: 0.5rem;
      }
      .lang-toggle {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: #fff;
        padding: 0.4rem 0.8rem;
        border-radius: 50px;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
        white-space: nowrap;
        font-family: DM Sans, sans-serif;
      }
      .lang-toggle:hover { background: rgba(255,255,255,0.18); }
      .lang-chevron { transition: transform 0.2s; flex-shrink: 0; }
      .lang-toggle[aria-expanded="true"] .lang-chevron { transform: rotate(180deg); }
      .lang-dropdown {
        display: none;
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        background: #fff;
        border-radius: 0.9rem;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        min-width: 180px;
        overflow: hidden;
        z-index: 200;
        border: 1px solid rgba(74,26,122,0.1);
      }
      .lang-dropdown.open { display: block; animation: langFadeIn 0.15s ease; }
      @keyframes langFadeIn {
        from { opacity: 0; transform: translateY(-6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .lang-btn {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        width: 100%;
        padding: 0.7rem 1rem;
        background: none;
        border: none;
        cursor: pointer;
        font-family: DM Sans, sans-serif;
        font-size: 0.88rem;
        color: #333;
        text-align: left;
        transition: background 0.15s;
      }
      .lang-btn:hover { background: rgba(74,26,122,0.07); }
      .lang-btn.active { background: rgba(74,26,122,0.1); color: #6B2FA0; font-weight: 600; }
      .lang-flag { font-size: 1.1rem; }
      .lang-name { flex: 1; }

      /* RTL global adjustments */
      body.rtl { direction: rtl; }
      body.rtl .nav { flex-direction: row-reverse; }
      body.rtl .nav-links { flex-direction: row-reverse; }
      body.rtl .breadcrumb { flex-direction: row-reverse; }
      body.rtl .lang-dropdown { right: auto; left: 0; }
      body.rtl .lang-btn { text-align: right; flex-direction: row-reverse; }
      body.rtl .how-item { flex-direction: row-reverse; }
      body.rtl .contact-detail { flex-direction: row-reverse; }
      body.rtl .scripture-block::before { left: auto; right: 1.2rem; }
      body.rtl .how-item { border-left: none; border-right: 4px solid var(--purple-mid, #6B2FA0); }
      body.rtl .footer-links { flex-direction: row-reverse; }

      @media (max-width: 768px) {
        .lang-dropdown { right: auto; left: 0; min-width: 160px; }
        body.rtl .lang-dropdown { left: auto; right: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Init ──
  function init() {
    // Wait for translations to load
    if (!window.TRVM_T) {
      setTimeout(init, 50);
      return;
    }

    injectCSS();

    // Inject switcher into every .nav element
    document.querySelectorAll('nav.nav').forEach(nav => {
      const switcher = buildSwitcher();
      nav.appendChild(switcher);
    });

    // Apply stored language
    const lang = getLang();
    applyLang(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.TRVM_I18N = { setLang, getLang, t };

})();
