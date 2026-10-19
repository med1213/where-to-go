import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'lo' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (lo: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'lo',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (lo, _en) => lo,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('wtg_admin_lang');
    return saved === 'en' ? 'en' : 'lo';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('wtg_admin_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'lo' ? 'en' : 'lo');
  };

  const t = (lo: string, en: string) => (language === 'lo' ? lo : en);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
