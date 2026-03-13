import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import i18n, { initLocale, setLocale, getLocale } from '../utils/i18n';
import {
  getLanguagePreference,
  setLanguagePreference as persistLanguagePreference,
} from '../utils/storage';

export type AppLanguage = 'tr' | 'en';

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  t: (scope: string, options?: Record<string, any>) => any;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(getLocale());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        const saved = await getLanguagePreference();
        initLocale(saved);
        if (isActive) {
          setLanguageState(getLocale());
        }
      } catch (error) {
        console.warn('Failed to load language preference.', error);
      } finally {
        if (isActive) setReady(true);
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSetLanguage = useCallback(async (lang: AppLanguage) => {
    setLocale(lang);
    setLanguageState(lang);

    try {
      await persistLanguagePreference(lang);
    } catch (error) {
      console.warn('Failed to save language preference.', error);
    }
  }, []);

  const t = useCallback(
    (scope: string, options?: Record<string, any>) => i18n.t(scope, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language]
  );

  if (!ready) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (context) {
    return context;
  }

  return {
    language: getLocale(),
    setLanguage: async () => {},
    t: (scope: string, options?: Record<string, any>) => i18n.t(scope, options),
  };
}
