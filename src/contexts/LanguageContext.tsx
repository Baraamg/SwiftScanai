
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define available languages
export type Language = "en" | "ar";
export type Direction = "ltr" | "rtl";

// Default language
const DEFAULT_LANGUAGE: Language = "en";

// Get initial language from localStorage or use default
const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const savedLanguage = localStorage.getItem("language") as Language;
    return savedLanguage || DEFAULT_LANGUAGE;
  }
  return DEFAULT_LANGUAGE;
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: Direction;
}

// English and Arabic translations
import enTranslations from "../locales/en.json";
import arTranslations from "../locales/ar.json";

const translations = {
  en: enTranslations,
  ar: arTranslations,
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Set HTML dir attribute and save to localStorage when language changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("language", language);
  }, [language]);

  // Update language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string): string => {
    // @ts-ignore - We know the structure but TypeScript doesn't
    const translation = language === "en" 
      ? enTranslations[key] 
      : arTranslations[key];
    
    return translation || key;
  };

  const value: LanguageContextProps = {
    language,
    setLanguage,
    t,
    dir: language === "ar" ? "rtl" : "ltr",
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
