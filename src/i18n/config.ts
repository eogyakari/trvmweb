// Central i18n configuration for the TRVM website.
// Goes at: src/i18n/config.ts

export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'id', 'sw'],
} as const;

export type Locale = (typeof i18n)['locales'][number];

// Each language shown in its own script, for the switcher menu.
export const localeNames: Record<Locale, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
  sw: 'Kiswahili',
};

// Guard used across the app to validate a URL segment.
export function isLocale(value: string): value is Locale {
  return (i18n.locales as readonly string[]).includes(value);
}