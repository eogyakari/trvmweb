import 'server-only';
import type { Locale } from './config';

// Lazily import only the requested language's JSON on the server.
// Goes at: src/i18n/getDictionary.ts
const dictionaries = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  id: () => import('./dictionaries/id.json').then((m) => m.default),
  sw: () => import('./dictionaries/sw.json').then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)['en']>>;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  (dictionaries[locale] ?? dictionaries.en)();