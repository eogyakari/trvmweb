'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getDict } from '@/i18n/client'
import { localeFromPathname, localize } from '@/i18n/client'

function Icon({ name }: { name: string }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'home': return <svg {...common}><path d="M3 9.5 12 3l9 6.5" /><path d="M5 10v10h14V10" /></svg>
    case 'book': return <svg {...common}><path d="M4 4h11a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z" /><path d="M17 4h3v14" /></svg>
    case 'heart': return <svg {...common}><path d="M12 20s-7-4.5-9-8.5C1.5 8 3.5 5 6.5 5c2 0 3.5 1.5 5.5 3.5C14 6.5 15.5 5 17.5 5c3 0 5 3 3.5 6.5-2 4-9 8.5-9 8.5z" /></svg>
    case 'mail': return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
    case 'more': return <svg {...common}><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
    default: return null
  }
}

export default function BottomNav() {
  const pathname = usePathname() || '/'
  const [moreOpen, setMoreOpen] = useState(false)

  // Never on admin.
  if (pathname.startsWith('/admin')) return null

  const lang = localeFromPathname(pathname)
  const dict = getDict(lang)
  const n = dict.nav
  const L = (href: string) => localize(href, lang)

  const isActive = (href: string) => {
    const full = L(href)
    if (href === '/') return pathname === `/${lang}` || pathname === '/'
    return pathname.startsWith(full)
  }

  const tabs = [
    { href: '/', icon: 'home', label: n.home },
    { href: '/devotions', icon: 'book', label: n.devotions },
    { href: '/donate', icon: 'heart', label: n.donate },
    { href: '/contact', icon: 'mail', label: n.contact },
  ]

  const moreLinks = [
    { href: '/about', label: n.about },
    { href: '/programs', label: n.programs },
    { href: '/publications', label: n.publications },
    { href: '/gallery', label: n.gallery },
    { href: '/videos', label: n.videos },
  ]

  return (
    <>
      {/* Spacer so page content isn't hidden behind the bar */}
      <div className="trvm-bottomnav-spacer" aria-hidden />

      {/* More sheet */}
      {moreOpen && (
        <div onClick={() => setMoreOpen(false)} className="trvm-more-overlay">
          <div onClick={e => e.stopPropagation()} className="trvm-more-sheet">
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.25)', margin: '0 auto 18px' }} />
            {moreLinks.map(l => (
              <Link key={l.href} href={L(l.href)} onClick={() => setMoreOpen(false)}
                style={{ display: 'block', color: 'white', textDecoration: 'none', padding: '14px 8px', fontSize: 16, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Georgia, serif' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <nav className="trvm-bottomnav">
        {tabs.map(t => {
          const active = isActive(t.href)
          return (
            <Link key={t.href} href={L(t.href)} className="trvm-tab" style={{ color: active ? '#F5A623' : 'rgba(255,255,255,0.6)' }}>
              <Icon name={t.icon} />
              <span>{t.label}</span>
            </Link>
          )
        })}
        <button onClick={() => setMoreOpen(v => !v)} className="trvm-tab" style={{ color: moreOpen ? '#F5A623' : 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Icon name="more" />
          <span>{dict.common?.more || 'More'}</span>
        </button>
      </nav>

      <style>{`
        .trvm-bottomnav {
          display: none;
        }
        @media (max-width: 767px) {
          .trvm-bottomnav {
            display: flex;
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 4500;
            background: rgba(13,13,26,0.96);
            backdrop-filter: blur(12px);
            border-top: 1px solid rgba(123,47,190,0.4);
            padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
            justify-content: space-around; align-items: stretch;
          }
          .trvm-bottomnav-spacer { height: 64px; }
          .trvm-tab {
            flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
            text-decoration: none; font-family: Georgia, serif;
            font-size: 10.5px; font-weight: 600; padding: 4px 0;
          }
          .trvm-more-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 4600;
            display: flex; align-items: flex-end;
          }
          .trvm-more-sheet {
            width: 100%; background: linear-gradient(135deg, #1A0A2E, #0D0D1A);
            border-top-left-radius: 20px; border-top-right-radius: 20px;
            padding: 14px 22px calc(22px + env(safe-area-inset-bottom));
            border-top: 1px solid rgba(123,47,190,0.4);
          }
        }
      `}</style>
    </>
  )
}