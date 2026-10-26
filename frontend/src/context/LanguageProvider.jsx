import { useCallback, useEffect, useMemo, useState } from 'react';
import { LanguageContext } from './LanguageContext';
import { LANGUAGES, translations } from '../i18n/translations';

const STORAGE_KEY = 'clearance_app_language';
const DEFAULT_LANGUAGE = 'en';

export default function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {
      // LocalStorage access may fail in certain environments
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = useCallback((code) => {
    if (!LANGUAGES.some((l) => l.code === code)) return;
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key, fallback) => {
      const langTranslations = translations[language];
      if (langTranslations && key in langTranslations) {
        return langTranslations[key];
      }
      const fallbackTranslations = translations[DEFAULT_LANGUAGE];
      if (fallbackTranslations && key in fallbackTranslations) {
        return fallbackTranslations[key];
      }
      return fallback ?? key;
    },
    [language],
  );

  const currentLanguage = useMemo(
    () => LANGUAGES.find((l) => l.code === language) || LANGUAGES[0],
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: LANGUAGES,
      currentLanguage,
      t,
    }),
    [language, setLanguage, currentLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

