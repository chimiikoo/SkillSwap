import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import { resolveFileUrl } from '../utils/resolveFileUrl';
import { SparklesIcon } from './Icons';

export default function Navbar({ onProfileClick, onUpgradeClick }) {
    const { isAuthenticated, isAdmin, user, logout, unreadCount } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('skillswap_theme') !== 'light';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.remove('light-mode');
            localStorage.setItem('skillswap_theme', 'dark');
        } else {
            document.body.classList.add('light-mode');
            localStorage.setItem('skillswap_theme', 'light');
        }
    }, [isDarkMode]);

    const handleProfileClick = (e) => {
        // Only track if authenticated
        if (isAuthenticated) {
            const clicks = parseInt(sessionStorage.getItem('profileClicks') || '0') + 1;
            sessionStorage.setItem('profileClicks', clicks.toString());

            if (clicks % 3 === 0) {
                // Don't navigate, show modal instead? 
                // The user said "вылазила на экран пользователя каждый 3 раз при нажатии кнопки профиля"
                // Usually this means it shows UPON clicking, but maybe also navigates.
                // I'll trigger the modal and still allow navigation if desired, or just show modal.
                // Let's trigger the modal.
                if (onProfileClick) onProfileClick();
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isLanding = location.pathname === '/';
    const isAuth = ['/login', '/register'].includes(location.pathname);

    return (
        <nav 
            role="navigation" 
            aria-label="Main Navigation"
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isLanding ? 'bg-transparent' : 'bg-dark/80 backdrop-blur-xl border-b border-white/5'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group" aria-label="SkillSwap Home">
                        <div className="w-8 h-8 group-hover:shadow-neon transition-all duration-300">
                            <img src="/vite.svg" alt="" aria-hidden="true" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-display font-bold text-lg">
                            <span className="text-neon">Skill</span><span className="text-white">Swap</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {isAuthenticated ? (
                            <>
                                {!isAdmin && <NavLink to="/dashboard" current={location.pathname}>{t('nav.dashboard')}</NavLink>}
                                <NavLink to="/search" current={location.pathname}>{t('nav.search')}</NavLink>
                                <NavLink to="/chat" current={location.pathname} badge={unreadCount > 0}>
                                    {t('nav.messages')}
                                    {unreadCount > 0 && (
                                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-neon text-[10px] text-dark font-bold animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </NavLink>
                                {!isAdmin && <NavLink to="/communities" current={location.pathname}>{t('nav.communities') || 'Сообщества'}</NavLink>}
                                <NavLink to="/rankings" current={location.pathname}>Рейтинг</NavLink>
                                <NavLink to="/profile" current={location.pathname} onClick={handleProfileClick}>{t('nav.profile')}</NavLink>
                                {isAdmin && <NavLink to="/admin" current={location.pathname}>{t('nav.admin')}</NavLink>}

                                {!isAdmin && (
                                    <button onClick={onUpgradeClick} className="px-3 py-1.5 ml-2 rounded-[10px] bg-neon/10 border border-neon/30 text-neon text-xs font-bold flex items-center gap-1.5 hover:bg-neon hover:text-dark transition-all">
                                        <SparklesIcon size={14} />
                                        Premium
                                    </button>
                                )}

                                <div className="w-px h-6 bg-white/10 mx-2"></div>
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-neon transition-colors"
                                    title={isDarkMode ? "Светлая тема" : "Темная тема"}
                                >
                                    {isDarkMode ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                                    )}
                                </button>
                                <div className="w-px h-6 bg-white/10 mx-2"></div>
                                <LanguageSwitcher />
                                <div className="w-px h-6 bg-white/10 mx-2"></div>
                                <div className="flex items-center gap-3">
                                    <Link to="/profile" onClick={handleProfileClick} className="flex items-center gap-2 group/prof">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-neon/10 border border-neon/20 flex items-center justify-center text-neon text-sm font-bold group-hover/prof:border-neon transition-all duration-300 shadow-[0_0_10px_rgba(163,255,18,0.05)] group-hover/prof:shadow-neon">
                                            {user?.avatarUrl ? (
                                                <img src={resolveFileUrl(user.avatarUrl)} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user?.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-sm text-white/70 group-hover/prof:text-neon transition-colors hidden lg:inline">{user?.name}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-xs text-white/30 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
                                    >
                                        {t('nav.logout')}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <LanguageSwitcher />
                                {!isAuth && (
                                    <>
                                        <Link to="/login" className="neon-btn-outline text-sm px-4 py-2 ml-2">
                                            {t('nav.login')}
                                        </Link>
                                        <Link to="/register" className="neon-btn text-sm px-4 py-2 ml-2">
                                            {t('nav.start')}
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile burger */}
                    <div className="md:hidden flex items-center gap-2">
                        <LanguageSwitcher />
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-expanded={mobileOpen}
                            aria-label="Toggle Menu"
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center transition-colors hover:bg-white/10"
                        >
                            <div className="flex flex-col gap-1.5">
                                <motion.span
                                    animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                                    className="w-5 h-0.5 bg-white/70 block"
                                />
                                <motion.span
                                    animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                                    className="w-5 h-0.5 bg-white/70 block"
                                />
                                <motion.span
                                    animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                                    className="w-5 h-0.5 bg-white/70 block"
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-dark-300/95 backdrop-blur-xl border-t border-white/5"
                    >
                        <div className="px-4 py-4 space-y-2">
                            {isAuthenticated ? (
                                <>
                                    {!isAdmin && <MobileNavLink to="/dashboard" onClick={() => setMobileOpen(false)}>{t('nav.dashboard')}</MobileNavLink>}
                                    <MobileNavLink to="/search" onClick={() => setMobileOpen(false)}>{t('nav.search')}</MobileNavLink>
                                    <MobileNavLink to="/chat" onClick={() => setMobileOpen(false)}>
                                        <div className="flex items-center justify-between w-full">
                                            {t('nav.messages')}
                                            {unreadCount > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-neon text-[10px] text-dark font-bold">
                                                    {unreadCount} {t('nav.newMsg')}
                                                </span>
                                            )}
                                        </div>
                                    </MobileNavLink>
                                    {!isAdmin && <MobileNavLink to="/communities" onClick={() => setMobileOpen(false)}>{t('nav.communities') || 'Сообщества'}</MobileNavLink>}
                                    <MobileNavLink to="/rankings" onClick={() => setMobileOpen(false)}>Рейтинг</MobileNavLink>
                                    <MobileNavLink to="/profile" onClick={(e) => { handleProfileClick(e); setMobileOpen(false); }}>{t('nav.profile')}</MobileNavLink>
                                    {isAdmin && <MobileNavLink to="/admin" onClick={() => setMobileOpen(false)}>{t('nav.admin')}</MobileNavLink>}
                                    
                                    {!isAdmin && (
                                        <button
                                            onClick={() => { if (onUpgradeClick) onUpgradeClick(); setMobileOpen(false); }}
                                            className="w-full text-left px-4 py-3 text-neon hover:bg-neon/10 rounded-xl transition-colors font-bold flex items-center gap-2"
                                        >
                                            <SparklesIcon size={16} />
                                            Premium
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { handleLogout(); setMobileOpen(false); }}
                                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        {t('nav.logout')}
                                    </button>

                                    <button
                                        onClick={() => setIsDarkMode(!isDarkMode)}
                                        className="w-full text-left px-4 py-3 text-white/70 hover:text-white rounded-xl flex items-center gap-3 transition-colors"
                                    >
                                        {isDarkMode ? '🌞 Светлая тема' : '🌙 Темная тема'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <MobileNavLink to="/login" onClick={() => setMobileOpen(false)}>{t('nav.login')}</MobileNavLink>
                                    <MobileNavLink to="/register" onClick={() => setMobileOpen(false)}>{t('nav.start')}</MobileNavLink>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

function NavLink({ to, current, children, badge, onClick }) {
    const isActive = current === to;
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center ${isActive
                ? 'text-neon bg-neon/5 shadow-[0_0_15px_rgba(163,255,18,0.1)]'
                : badge ? 'text-neon/80 shadow-[0_0_10px_rgba(163,255,18,0.05)]' : 'text-white/60 hover:text-white hover:bg-white/5'
                } ${badge ? 'neon-glow-subtle' : ''}`}
        >
            {children}
            {badge && (
                <span className="ml-1.5 w-2 h-2 rounded-full bg-neon animate-pulse shadow-[0_0_10px_#a3ff12]"></span>
            )}
        </Link>
    );
}

function MobileNavLink({ to, onClick, children }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="block px-4 py-3 text-white/70 hover:text-neon hover:bg-white/5 rounded-xl transition-colors"
        >
            {children}
        </Link>
    );
}
