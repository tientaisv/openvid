import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'es', 'ru', 'ko', 'vi'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];

const messageLoaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('./messages/en.json'),
  es: () => import('./messages/es.json'),
  ru: () => import('./messages/ru.json'),
  ko: () => import('./messages/ko.json'),
  vi: () => import('./messages/vi.json'),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  const baseLocale: Locale = (locale && locales.includes(locale as Locale)) 
    ? (locale as Locale)
    : defaultLocale;

  const loader = messageLoaders[baseLocale] || messageLoaders[defaultLocale];
  const messages = (await loader()).default;

  return {
    locale: baseLocale,
    messages
  };
});