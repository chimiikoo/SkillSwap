import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

const SUPPORTED_LANGS = ['ru', 'ky', 'en'];
const DEFAULT_LANG = 'ru';

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        const saved = localStorage.getItem('skillswap_lang');
        return SUPPORTED_LANGS.includes(saved) ? saved : DEFAULT_LANG;
    });

    useEffect(() => {
        localStorage.setItem('skillswap_lang', lang);
        document.documentElement.setAttribute('lang', lang);
    }, [lang]);

    const t = (key) => {
        const keys = key.split('.');
        let val = translations[lang];
        for (const k of keys) {
            val = val?.[k];
        }
        return val || translations[DEFAULT_LANG]?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, SUPPORTED_LANGS }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
