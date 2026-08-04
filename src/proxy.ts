import { NextRequest, NextResponse } from 'next/server';
import { i18n } from './i18n/config';

// Goes at: src/proxy.ts  (Next.js 16 renamed the old "middleware" convention
// to "proxy"; the logic is identical.)
// Sends every public request to a locale-prefixed URL (/en, /id, /sw).
// admin, api, Next internals, and static files are excluded via `config.matcher`.

function getLocale(req: NextRequest): string {
  // 1. Explicit choice remembered in a cookie wins.
  const cookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (cookie && (i18n.locales as readonly string[]).includes(cookie)) return cookie;

  // 2. Otherwise honor the browser's Accept-Language preference.
  const header = req.headers.get('accept-language');
  if (header) {
    const preferred = header
      .split(',')
      .map((part) => part.split(';')[0].trim().toLowerCase());
    for (const pref of preferred) {
      const base = pref.split('-')[0];
      if ((i18n.locales as readonly string[]).includes(base)) return base;
    }
  }

  // 3. Fall back to English.
  return i18n.defaultLocale;
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocale = (i18n.locales as readonly string[]).some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return;

  const locale = getLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything EXCEPT admin, api, Next internals, and files with an
  // extension (favicon.ico, images, etc.).
  matcher: ['/((?!admin|api|_next|.*\\..*).*)'],
};