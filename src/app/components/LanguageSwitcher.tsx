'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { i18n, localeNames, isLocale, type Locale } from '@/i18n/config';

// Goes at: src/app/components/LanguageSwitcher.tsx
// Globe dropdown that swaps the leading /xx segment of the current URL,
// themed to match the purple/gold navbar. Persists the pick in a cookie.

export default function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function switchTo(locale: Locale) {
    const segments = pathname.split('/');
    if (segments[1] && isLocale(segments[1])) {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }
    const nextPath = segments.join('/') || `/${locale}`;
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    router.push(nextPath);
    router.refresh();
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: '1px solid rgba(245,166,35,0.5)',
          color: '#F5A623',
          borderRadius: 999,
          padding: '6px 12px',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 1,
          cursor: 'pointer',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {current.toUpperCase()}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            background: '#1A0A2E',
            border: '1px solid rgba(123,47,190,0.3)',
            borderRadius: 8,
            overflow: 'hidden',
            minWidth: 180,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 200,
          }}
        >
          {i18n.locales.map((loc) => {
            const active = loc === current;
            return (
              <button
                key={loc}
                onClick={() => switchTo(loc)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 20px',
                  background: active ? 'rgba(245,166,35,0.08)' : 'transparent',
                  color: active ? '#F5A623' : '#e0e0f0',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: active ? 700 : 600,
                  cursor: 'pointer',
                }}
              >
                {localeNames[loc]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}