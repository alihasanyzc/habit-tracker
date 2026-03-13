import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import tr from '../locales/tr';
import en from '../locales/en';

const i18n = new I18n({ tr, en });

i18n.defaultLocale = 'tr';
i18n.enableFallback = true;

export function initLocale(savedLocale?: string | null) {
  if (savedLocale && (savedLocale === 'tr' || savedLocale === 'en')) {
    i18n.locale = savedLocale;
    return;
  }

  const deviceLocales = Localization.getLocales();
  const deviceLang = deviceLocales?.[0]?.languageCode ?? 'tr';
  i18n.locale = deviceLang === 'en' ? 'en' : 'tr';
}

export function setLocale(locale: 'tr' | 'en') {
  i18n.locale = locale;
}

export function getLocale(): 'tr' | 'en' {
  return i18n.locale as 'tr' | 'en';
}

export default i18n;
