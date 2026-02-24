import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
    const { isAuthenticated, isAdmin, user, logout, unreadCount } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isLanding = location.pathname === '/';
    const isAuth = ['/login', '/register'].includes(location.pathname);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isLanding ? 'bg-transparent' : 'bg-dark/80 backdrop-blur-xl border-b border-white/5'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 group-hover:shadow-neon transition-all duration-300">
                            <img src="/vite.svg" alt="SkillSwap AI" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-display font-bold text-lg">
                            <span className="text-neon">Skill</span><span className="text-white">Swap</span><span className="ml-1 text-white/50">AI</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {isAuthenticated ? (
                            <>
                                <NavLink to="/dashboard" current={location.pathname}>{t('nav.dashboard')}</NavLink>
                                <NavLink to="/search" current={location.pathname}>{t('nav.search')}</NavLink>
                                <NavLink to="/chat" current={location.pathname} badge={unreadCount > 0}>
                                    {t('nav.messages')}
                                    {unreadCount > 0 && (
                                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-neon text-[10px] text-dark font-bold animate-pulse">
                                            {unreadCount}
                                        </span>
                                    )}
                                </NavLink>
                                <NavLink to="/profile" current={location.pathname}>{t('nav.profile')}</NavLink>
                                {isAdmin && <NavLink to="/admin" current={location.pathname}>{t('nav.admin')}</NavLink>}
                                <div className="w-px h-6 bg-white/10 mx-2"></div>
                                <LanguageSwitcher />
                                <div className="w-px h-6 bg-white/10 mx-2"></div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-neon/10 border border-neon/20 flex items-center justify-center text-neon text-sm font-bold">
                                            {user?.avatarUrl ? (
                                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                user?.name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-sm text-white/70">{user?.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm text-white/40 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
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
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
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
                                    <MobileNavLink to="/dashboard" onClick={() => setMobileOpen(false)}>{t('nav.dashboard')}</MobileNavLink>
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
                                    <MobileNavLink to="/profile" onClick={() => setMobileOpen(false)}>{t('nav.profile')}</MobileNavLink>
                                    {isAdmin && <MobileNavLink to="/admin" onClick={() => setMobileOpen(false)}>{t('nav.admin')}</MobileNavLink>}
                                    <button
                                        onClick={() => { handleLogout(); setMobileOpen(false); }}
                                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        {t('nav.logout')}
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

function NavLink({ to, current, children, badge }) {
    const isActive = current === to;
    return (
        <Link
            to={to}
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
