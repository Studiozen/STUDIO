'use client';

import { useLanguage } from '@/context/language-context';
import en from '@/locales/en.json';
import it from '@/locales/it.json';

const translations = { en, it };

type TranslationKey = keyof (typeof en);

// This is a simple implementation for replacing placeholders like {name}
function interpolate(text: string, params: Record<string, string> = {}): string {
    return Object.entries(params).reduce(
        (acc, [key, value]) => acc.replace(new RegExp(`{${key}}`, 'g'), value),
        text
    );
}

function getNestedValue(obj: any, path: string): string | undefined {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export const useTranslation = () => {
  const { language } = useLanguage();
  const t = (key: string, params?: Record<string, string>): string => {
    const translationSet = translations[language];
    const value = getNestedValue(translationSet, key);

    if (!value) {
      console.warn(`Translation key not found: ${key}`);
      // Fallback to English if key not found in current language
      const fallbackValue = getNestedValue(translations.en, key);
      if (fallbackValue) {
          return interpolate(fallbackValue, params);
      }
      return key;
    }
    
    return interpolate(value, params);
  };

  return { t, language };
};
