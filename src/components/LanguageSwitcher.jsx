import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const FLAG_EMOJIS = { ru: '🇷🇺', ky: '🇰🇬', en: '🇬🇧' };

export default function LanguageSwitcher() {
    const { lang, setLang, t, SUPPORTED_LANGS } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={ref} className="lang-switcher">
            <button
                onClick={() => setOpen(!open)}
                className="lang-switcher-btn"
                aria-label="Switch language"
                id="lang-switcher-btn"
            >
                <span className="lang-flag">{FLAG_EMOJIS[lang]}</span>
                <span className="lang-code">{lang.toUpperCase()}</span>
                <svg
                    className={`lang-chevron ${open ? 'lang-chevron-open' : ''}`}
                    width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="lang-dropdown"
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                        {SUPPORTED_LANGS.map((code) => (
                            <button
                                key={code}
                                onClick={() => { setLang(code); setOpen(false); }}
                                className={`lang-option ${code === lang ? 'lang-option-active' : ''}`}
                                id={`lang-option-${code}`}
                            >
                                <span className="lang-flag">{FLAG_EMOJIS[code]}</span>
                                <span className="lang-option-name">{t(`langNames.${code}`)}</span>
                                {code === lang && (
                                    <motion.span
                                        layoutId="lang-check"
                                        className="lang-check"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </motion.span>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
