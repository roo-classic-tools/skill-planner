import { useState, useEffect, createContext, useContext } from 'react';

// Import all locale files
import en from '../locales/en.json';
import th from '../locales/th.json';
import vi from '../locales/vi.json';
import ptBR from '../locales/pt-BR.json';
import ru from '../locales/ru.json';
import zh from '../locales/zh.json';

const translations = {
  en,
  th,
  vi,
  'pt-BR': ptBR,
  ru,
  zh
};

const STORAGE_KEY = 'skillPlanner_locale';
const DEFAULT_LOCALE = 'en';

// Create context
const TranslationContext = createContext();

// Detect browser language
const detectLocale = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && translations[saved]) return saved;
  
  const browserLang = navigator.language || navigator.userLanguage;
  
  // Exact match
  if (translations[browserLang]) return browserLang;
  
  // Language code match (e.g., 'pt' from 'pt-BR')
  const langCode = browserLang.split('-')[0];
  const match = Object.keys(translations).find(key => key.startsWith(langCode));
  
  return match || DEFAULT_LOCALE;
};

// Provider component
export function TranslationProvider({ children }) {
  const [locale, setLocaleState] = useState(detectLocale);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const t = (key, params) => {
    let text = translations[locale]?.[key] || translations[DEFAULT_LOCALE]?.[key] || key;
    
    // Replace parameters like {jobName}
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
      });
    }
    
    return text;
  };

  const setLocale = (newLocale) => {
    if (translations[newLocale]) {
      setLocaleState(newLocale);
    }
  };

  const availableLocales = [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
    { code: 'th', name: 'ไทย' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'pt-BR', name: 'Português (BR)' },
    { code: 'ru', name: 'Русский' }
  ];

  const value = { 
    t, 
    locale, 
    setLocale,
    availableLocales
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

// Hook to use translation
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}

