import { useState, useEffect, createContext, useContext } from 'react';

// Import all locale files - organized by locale folder
import enUi from '../locales/en/ui.json';
import enJobs from '../locales/en/jobs.json';
import enSkills from '../locales/en/skills.json';

import thUi from '../locales/th/ui.json';
import thJobs from '../locales/th/jobs.json';
import thSkills from '../locales/th/skills.json';

import viUi from '../locales/vi/ui.json';
import viJobs from '../locales/vi/jobs.json';
import viSkills from '../locales/vi/skills.json';

import ptBRUi from '../locales/pt-BR/ui.json';
import ptBRJobs from '../locales/pt-BR/jobs.json';
import ptBRSkills from '../locales/pt-BR/skills.json';

import ruUi from '../locales/ru/ui.json';
import ruJobs from '../locales/ru/jobs.json';
import ruSkills from '../locales/ru/skills.json';

import zhUi from '../locales/zh/ui.json';
import zhJobs from '../locales/zh/jobs.json';
import zhSkills from '../locales/zh/skills.json';

// Merge locale files per language
const translations = {
  en: { ...enUi, ...enJobs, ...enSkills },
  th: { ...thUi, ...thJobs, ...thSkills },
  vi: { ...viUi, ...viJobs, ...viSkills },
  'pt-BR': { ...ptBRUi, ...ptBRJobs, ...ptBRSkills },
  ru: { ...ruUi, ...ruJobs, ...ruSkills },
  zh: { ...zhUi, ...zhJobs, ...zhSkills }
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
