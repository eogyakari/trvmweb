import en from './dictionaries/en.json';
import id from './dictionaries/id.json';
import sw from './dictionaries/sw.json';
import { i18n, isLocale, type Locale } from './config';

// Goes at: src/i18n/client.ts
// Client-safe counterpart to getDictionary.ts. Reads the SAME JSON files, but
// synchronously and importable into client components (Navbar, Footer, etc.).

const dicts = { en, id, sw } as const;
export type Dictionary = typeof en;

export function getDict(locale: Locale): Dictionary {
  return dicts[locale] ?? dicts.en;
}

/** Pull the locale off the front of a pathname ('/id/devotions' -> 'id'). */
export function localeFromPathname(pathname: string | null): Locale {
  if (!pathname) return i18n.defaultLocale;
  const seg = pathname.split('/')[1];
  return seg && isLocale(seg) ? seg : i18n.defaultLocale;
}

/**
 * Prefix an internal href with the current locale.
 * Handles anchors ('/publications#books') and root ('/').
 */
export function localize(href: string, locale: Locale): string {
  if (href.startsWith('#')) return href; // pure on-page anchor
  const [path, hash] = href.split('#');
  const clean = path.startsWith('/') ? path : `/${path}`;
  const prefixed = `/${locale}${clean === '/' ? '' : clean}`;
  return hash ? `${prefixed}#${hash}` : prefixed;
}