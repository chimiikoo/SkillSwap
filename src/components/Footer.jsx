import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
    GlobeIcon,
    GithubIcon,
    TwitterIcon,
    InstagramIcon,
    RocketIcon,
    SparklesIcon
} from './Icons';

export default function Footer() {
    const { t, lang } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-dark border-t border-white/5 pt-16 pb-8 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-neon/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 group-hover:shadow-neon transition-all duration-300">
                                <img src="/vite.svg" alt="SkillSwap" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-display font-bold text-xl">
                                <span className="text-neon">Skill</span><span className="text-white">Swap</span><span className="ml-1 text-white/50 text-sm uppercase tracking-widest">AI</span>
                            </span>
                        </Link>
                        <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                            {t('landing.subtitle') || 'Платформа для обмена знаниями, объединяющая студентов и менторов.'}
                        </p>
                        <div className="flex items-center gap-4">
                            <SocialLink href="#" icon={<GithubIcon size={20} />} label="GitHub" />
                            <SocialLink href="#" icon={<TwitterIcon size={20} />} label="Twitter" />
                            <SocialLink href="#" icon={<InstagramIcon size={20} />} label="Instagram" />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">{t('footer.platform') || 'Платформа'}</h4>
                        <ul className="space-y-4">
                            <FooterLink to="/search">{t('nav.search')}</FooterLink>
                            <FooterLink to="/rankings">{t('nav.rankings') || 'Рейтинг'}</FooterLink>
                            <FooterLink to="/pricing">Тарифы</FooterLink>
                            <FooterLink to="/communities">{t('nav.communities') || 'Сообщества'}</FooterLink>
                            <FooterLink to="/register">{t('nav.start')}</FooterLink>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">{t('footer.resources') || 'Ресурсы'}</h4>
                        <ul className="space-y-4">
                            <FooterLink to="/help">{t('footer.help') || 'Помощь'}</FooterLink>
                            <FooterLink to="/privacy">{t('footer.privacy') || 'Конфиденциальность'}</FooterLink>
                            <FooterLink to="/terms">{t('footer.terms') || 'Условия'}</FooterLink>
                            <FooterLink to="/blog">{t('footer.blog') || 'Блог'}</FooterLink>
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                            <SparklesIcon size={16} className="text-neon" />
                            {t('footer.newsletter') || 'Будь в курсе'}
                        </h4>
                        <p className="text-white/30 text-xs mb-4">
                            {t('footer.newsletterDesc') || 'Получайте лучшие предложения и обновления.'}
                        </p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon/40 transition-all pr-12"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neon hover:text-white transition-colors">
                                <RocketIcon size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[11px] text-white/30 uppercase tracking-[0.2em] font-medium">
                        <p>© {currentYear} SkillSwap.kg</p>
                        <span className="hidden md:inline w-1 h-1 rounded-full bg-white/10" />
                        <div className="flex items-center gap-2">
                            <GlobeIcon size={12} />
                            <span>Bishkek, Kyrgyzstan</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                            v2.1.0 Stable
                        </div>
                        <div className="px-3 py-1 rounded-full bg-neon/10 border border-neon/20 text-[10px] font-bold text-neon uppercase tracking-tighter shadow-[0_0_10px_rgba(163,255,18,0.1)]">
                            System Online
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ to, children }) {
    return (
        <li>
            <Link
                to={to}
                className="text-white/40 hover:text-neon text-sm transition-all duration-300 flex items-center group gap-2"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-neon/0 group-hover:bg-neon transition-all" />
                {children}
            </Link>
        </li>
    );
}

function SocialLink({ href, icon, label }) {
    return (
        <a
            href={href}
            aria-label={label}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-neon hover:border-neon/20 transition-all duration-300"
        >
            {icon}
        </a>
    );
}
