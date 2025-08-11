'use client';

import { useEffect, useState, ReactNode } from 'react';
import { Locale, I18nContext, getNestedTranslation, loadTranslations } from '../lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export default function I18nProvider({ children, initialLocale = 'ru' }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [translations, setTranslations] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLocaleTranslations = async () => {
      setIsLoading(true);
      try {
        const newTranslations = await loadTranslations(locale);
        setTranslations(newTranslations);
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocaleTranslations();
  }, [locale]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale;
      if (savedLocale && ['en', 'ru', 'ua', 'md'].includes(savedLocale)) {
        setLocaleState(savedLocale);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  };

  const t = (key: string, fallback?: string): string => {
    if (isLoading) {
      return fallback || key;
    }

    const translation = getNestedTranslation(translations, key);
    
    if (translation && typeof translation === 'string') {
      return translation;
    }
    
    return fallback || key;
  };

  const value = {
    locale,
    setLocale,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
} 