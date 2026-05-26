import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { SkillIcon } from '../components/Icons';
import { VerifiedBadge, PremiumBadge, isTutorVerified } from '../components/VerifiedBadge';
import { ALLOW_MOCKS } from '../utils/allowMocks';
import { resolveFileUrl } from '../utils/resolveFileUrl';
import {
    CoinIcon, StarIcon, BrainIcon, SearchIcon, RocketIcon, SparklesIcon, HeartIcon,
} from '../components/Icons';
import TopUpModal from '../components/TopUpModal';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    })
};

const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
};

function ScrollSection({ children, className = '' }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={stagger}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function Dashboard() {
    const { user, apiFetch } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [matches, setMatches] = useState([]);
    const [recCommunities, setRecCommunities] = useState([]);
    const [potentialStudents, setPotentialStudents] = useState([]);
    const [mySessions, setMySessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success')) {
            // They just returned from Stripe checkout success
            apiFetch('/users/subscribe', {
                method: 'POST',
                body: JSON.stringify({ success: true })
            }).then(() => {
                alert(t('payment.success') || 'Оплата успешно завершена! Вы теперь Premium пользователь.');
                // clean up url
                window.history.replaceState({}, document.title, window.location.pathname);
            }).catch(console.error);
        } else if (query.get('canceled')) {
            alert(t('payment.canceled') || 'Оплата была отменена.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, matchesData] = await Promise.all([
                apiFetch('/users/stats'),
                apiFetch('/matching/recommendations'),
            ]);
            setStats(statsData);
            setMatches(matchesData.matches || []);
        } catch {
            if (ALLOW_MOCKS) {
                setStats({ skillCoins: 5, reviewsCount: 0, avgRating: 0, followersCount: 0 });
                setMatches(getMockMatches());
            }
        } finally {
            setLoading(false);
        }
        try {
            const sessData = await apiFetch('/sessions/my');
            setMySessions(sessData?.sessions || []);
        } catch { }
        // Load recommended communities
        try {
            const commData = await apiFetch('/communities/recommended');
            setRecCommunities(commData?.communities || []);
        } catch { }
        // Load potential students for tutors
        if (user?.userType === 'tutor') {
            try {
                const studData = await apiFetch('/matching/potential-students');
                setPotentialStudents(studData?.students || []);
            } catch { }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center pt-16">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-neon/20 border-t-neon rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark pt-20 pb-12 bg-grid">
            <div className="absolute top-16 left-0 right-0 h-[200px] bg-glow-top pointer-events-none" />

            <div className="page-container relative z-10">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="font-display text-3xl md:text-4xl font-bold">
                        {t('dashboard.hello')} <span className="neon-text">{user?.name?.split(' ')[0] || t('dashboard.defaultName')}</span>
                    </h1>
                    <p className="text-white/40 mt-2">{t('dashboard.overview')}</p>
                </motion.div>

                {(user?.userType === 'tutor' || user?.userType === 'school') && user?.tutorStatus === 'pending' && (
                    <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-200/90 text-sm">
                        <strong>Профиль на модерации.</strong> Пока вас не видят студенты в поиске. Обычно проверка занимает 24–48 часов.
                    </div>
                )}

                {/* Onboarding Guide — shows for new users who haven't completed key actions */}
                {!localStorage.getItem('skillswap_onboarding_dismissed') && (
                    (user?.teachSkills?.length === 0 && user?.learnSkills?.length === 0)
                ) && (
                    <ScrollSection className="mb-8">
                        <motion.div variants={fadeUp} className="glass-card p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-neon/5 to-transparent rounded-bl-full pointer-events-none" />
                            <button 
                                onClick={() => { localStorage.setItem('skillswap_onboarding_dismissed', 'true'); window.location.reload(); }}
                                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/30 hover:text-white/60 z-10"
                                title="Скрыть"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                            
                            <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                                <RocketIcon size={20} className="text-neon" />
                                {t('dashboard.onboardingTitle') || 'Начни своё обучение'}
                            </h3>
                            <p className="text-white/40 text-sm mb-5">{t('dashboard.onboardingSubtitle') || '3 простых шага чтобы найти идеального ментора'}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Step 1: Profile */}
                                <Link to="/profile" className={`p-4 rounded-xl border transition-all group hover:border-neon/30 ${
                                    (user?.teachSkills?.length > 0 || user?.learnSkills?.length > 0) && user?.bio
                                        ? 'bg-neon/5 border-neon/20' 
                                        : 'bg-white/[0.02] border-white/10'
                                }`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                            (user?.teachSkills?.length > 0 || user?.learnSkills?.length > 0) && user?.bio
                                                ? 'bg-neon/20 text-neon' : 'bg-white/10 text-white/40'
                                        }`}>
                                            {(user?.teachSkills?.length > 0 || user?.learnSkills?.length > 0) && user?.bio ? '✓' : '1'}
                                        </div>
                                        <span className="font-medium text-sm group-hover:text-neon transition-colors">
                                            {t('dashboard.onboardingStep1') || 'Заполни профиль'}
                                        </span>
                                    </div>
                                    <p className="text-white/30 text-xs">{t('dashboard.onboardingStep1Desc') || 'Укажи навыки и расскажи о себе'}</p>
                                </Link>

                                {/* Step 2: Find mentor */}
                                <Link to="/search" className="p-4 rounded-xl border bg-white/[0.02] border-white/10 transition-all group hover:border-neon/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-white/10 text-white/40">2</div>
                                        <span className="font-medium text-sm group-hover:text-neon transition-colors">
                                            {t('dashboard.onboardingStep2') || 'Найди ментора'}
                                        </span>
                                    </div>
                                    <p className="text-white/30 text-xs">{t('dashboard.onboardingStep2Desc') || 'Умный подбор подберёт лучших менторов'}</p>
                                </Link>

                                {/* Step 3: Contact */}
                                <div className={`p-4 rounded-xl border transition-all ${
                                    (stats?.chatsCount > 0 || stats?.reviewsCount > 0)
                                        ? 'bg-neon/5 border-neon/20' 
                                        : 'bg-white/[0.02] border-white/10'
                                }`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                            (stats?.chatsCount > 0 || stats?.reviewsCount > 0) ? 'bg-neon/20 text-neon' : 'bg-white/10 text-white/40'
                                        }`}>
                                            {(stats?.chatsCount > 0 || stats?.reviewsCount > 0) ? '✓' : '3'}
                                        </div>
                                        <span className="font-medium text-sm">
                                            {t('dashboard.onboardingStep3') || 'Свяжись с наставником'}
                                        </span>
                                    </div>
                                    <p className="text-white/30 text-xs">{t('dashboard.onboardingStep3Desc') || 'Напиши сообщение и договорись о занятиях вне платформы'}</p>
                                </div>
                            </div>
                        </motion.div>
                    </ScrollSection>
                )}

                {/* Stats Grid */}
                <ScrollSection className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <motion.div variants={fadeUp} custom={0} className="relative group/stat">
                        <StatCard icon={<CoinIcon size={22} />} label="SkillCoins" value={stats?.skillCoins || 0} accent />
                        <button
                            onClick={() => setIsTopUpOpen(true)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-neon text-dark opacity-0 group-hover/stat:opacity-100 transition-all hover:scale-110 shadow-neon"
                            title="Пополнить баланс"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                    </motion.div>
                    <motion.div variants={fadeUp} custom={1}>
                        <StatCard icon={<ChatIcon />} label={t('dashboard.reviews') || 'Отзывы'} value={stats?.reviewsCount || 0} />
                    </motion.div>
                    <motion.div variants={fadeUp} custom={2}>
                        <StatCard icon={<StarIcon size={22} />} label={t('dashboard.rating')} value={Number(stats?.avgRating || 0).toFixed(1)} />
                    </motion.div>
                    <motion.div variants={fadeUp} custom={3}>
                        <StatCard icon={<HeartIcon size={22} className="text-red-500" filled />} label={t('userProfile.followers')} value={stats?.followersCount || 0} />
                    </motion.div>
                </ScrollSection>

                <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />

                {/* Skills Overview */}
                <ScrollSection className="grid md:grid-cols-2 gap-6 mb-10">
                    <motion.div variants={fadeUp} className="glass-card p-6">
                        <h3 className="flex items-center gap-2 font-bold mb-4 text-white/80">
                            <RocketIcon size={18} />
                            {t('dashboard.teachSkills')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(user?.teachSkills || []).map(skill => (
                                <span key={skill} className="badge-neon flex items-center gap-1.5">
                                    <SkillIcon skill={skill} size={14} />
                                    {skill}
                                </span>
                            ))}
                            {(user?.teachSkills?.length === 0) && (
                                <p className="text-white/30 text-sm">{t('dashboard.noSkills')} <Link to="/profile" className="text-neon hover:underline">{t('dashboard.addSkills')}</Link></p>
                            )}
                        </div>
                    </motion.div>
                    <motion.div variants={fadeUp} className="glass-card p-6">
                        <h3 className="flex items-center gap-2 font-bold mb-4 text-white/80">
                            <SearchIcon size={18} />
                            {t('dashboard.learnSkills')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(user?.learnSkills || []).map(skill => (
                                <span key={skill} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 flex items-center gap-1.5">
                                    <SkillIcon skill={skill} size={14} />
                                    {skill}
                                </span>
                            ))}
                            {(user?.learnSkills?.length === 0) && (
                                <p className="text-white/30 text-sm">{t('dashboard.noSkills')} <Link to="/profile" className="text-neon hover:underline">{t('dashboard.addSkills')}</Link></p>
                            )}
                        </div>
                    </motion.div>
                </ScrollSection>

                {/* Tutor: Potential Students */}
                {user?.userType === 'tutor' && potentialStudents.length > 0 && (
                    <ScrollSection className="mb-10">
                        <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <RocketIcon size={20} className="text-neon" />
                                {t('dashboard.potentialStudents') || 'Потенциальные студенты'}
                            </h2>
                            <Link to="/search" className="text-neon text-sm hover:underline flex items-center gap-1">
                                {t('dashboard.allResults')}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </Link>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {potentialStudents.slice(0, 6).map((s, i) => (
                                <motion.div key={s.id} variants={fadeUp} custom={i}>
                                    <Link to={`/user/${s.id}`} className="glass-card-hover p-5 block group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-neon/10 border border-neon/20 flex items-center justify-center text-neon font-bold group-hover:shadow-neon transition-all duration-500">
                                                    {s.avatarUrl ? (
                                                        <img src={resolveFileUrl(s.avatarUrl)} alt={s.name} className="w-full h-full object-cover" />
                                                    ) : s.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-sm group-hover:text-neon transition-colors">{s.name}</h4>
                                                    <p className="text-white/30 text-xs">{s.university}</p>
                                                </div>
                                            </div>
                                            <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
                                                {s.matchScore}%
                                            </div>
                                        </div>
                                        <p className="text-white/40 text-xs mb-1">{t('dashboard.wantsToLearn') || 'Хочет изучить'}:</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(s.wantsToLearn || []).map(sk => (
                                                <span key={sk} className="px-2 py-0.5 rounded text-[11px] bg-cyan-500/10 text-cyan-400/70 border border-cyan-500/15 flex items-center gap-1">
                                                    <SkillIcon skill={sk} size={10} />
                                                    {sk}
                                                </span>
                                            ))}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </ScrollSection>
                )}

                {/* My Sessions */}
                {mySessions.length > 0 && (
                    <ScrollSection className="mb-10">
                        <motion.div variants={fadeUp} className="mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">📅 Мои занятия</h2>
                        </motion.div>
                        <div className="space-y-3">
                            {mySessions.slice(0, 8).map(s => (
                                <SessionRow key={s.id} session={s} userId={user?.id} onConfirm={async (sessionId) => {
                                    try {
                                        await apiFetch(`/sessions/${sessionId}/confirm`, { method: 'POST' });
                                        loadData();
                                    } catch (e) { alert(e.message); }
                                }} />
                            ))}
                        </div>
                    </ScrollSection>
                )}

                {/* Smart matching recommendations */}
                <ScrollSection className="mb-10">
                    <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <SparklesIcon size={20} />
                            Умный подбор
                        </h2>
                        <Link to="/search" className="text-neon text-sm hover:underline flex items-center gap-1">
                            {t('dashboard.allResults')}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence>
                            {matches.slice(0, 6).map((match, i) => (
                                <motion.div
                                    key={match.id || i}
                                    variants={fadeUp}
                                    custom={i}
                                    layout
                                >
                                    <MatchCard match={match} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {matches.length === 0 && (
                        <div className="glass-card p-8 text-center">
                            <BrainIcon size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-white/40">{t('dashboard.addSkillsForAI')}</p>
                        </div>
                    )}
                </ScrollSection>

                {/* Recommended Communities */}
                {recCommunities.length > 0 && (
                    <ScrollSection className="mb-10">
                        <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#A3FF12" strokeWidth="1.8">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                {t('communities.recommended') || '⚡ AI Сообщества'}
                            </h2>
                            <Link to="/communities" className="text-neon text-sm hover:underline flex items-center gap-1">
                                {t('dashboard.allResults') || 'Все'}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </Link>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recCommunities.slice(0, 6).map((c, i) => (
                                <motion.div key={c.id} variants={fadeUp} custom={i}>
                                    <CommunityCard community={c} onJoin={async () => {
                                        try {
                                            await apiFetch(`/communities/${c.id}/join`, { method: 'POST' });
                                            navigate(`/community/${c.id}`);
                                        } catch (err) { alert(err.message); }
                                    }} />
                                </motion.div>
                            ))}
                        </div>
                    </ScrollSection>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, accent }) {
    return (
        <div className="glass-card-hover p-5 group">
            <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-neon/5 border border-neon/10 flex items-center justify-center group-hover:border-neon/30 group-hover:shadow-neon transition-all duration-500">
                    {icon}
                </div>
            </div>
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className={`text-3xl font-bold ${accent ? 'neon-text' : ''}`}
            >
                {value}
            </motion.div>
            <div className="text-white/40 text-sm mt-1">{label}</div>
        </div>
    );
}

function MatchCard({ match }) {
    const scoreBg = match.matchScore >= 80 ? 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400'
        : match.matchScore >= 60 ? 'from-neon/20 to-neon/5 border-neon/20 text-neon'
            : 'from-white/10 to-white/5 border-white/10 text-white/60';

    return (
        <Link to={`/user/${match.id}`} className="glass-card-hover p-5 block group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-neon/10 border border-neon/20 flex items-center justify-center text-neon font-bold group-hover:shadow-neon transition-all duration-500">
                        {match.avatarUrl ? (
                            <img src={resolveFileUrl(match.avatarUrl)} alt={match.name} className="w-full h-full object-cover" />
                        ) : (
                            match.name?.charAt(0)
                        )}
                    </div>
                    <div>
                        <h4 className="font-medium text-sm group-hover:text-neon transition-colors flex items-center gap-1.5 flex-wrap">
                            {match.name}
                            {isTutorVerified(match) && <VerifiedBadge size={14} />}
                            {match.isPremium && <PremiumBadge size={14} />}
                        </h4>
                        <p className="text-white/30 text-xs">{match.university}</p>
                    </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${scoreBg} text-xs font-bold border`}>
                    {match.matchScore}%
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
                {(match.teachSkills || []).slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-neon/5 text-neon/60 border border-neon/10 flex items-center gap-1">
                        <SkillIcon skill={s} size={10} />
                        {s}
                    </span>
                ))}
                {(match.teachSkills?.length || 0) > 3 && (
                    <span className="text-white/20 text-[11px]">+{match.teachSkills.length - 3}</span>
                )}
            </div>

            {match.reason && (
                <p className="text-white/30 text-xs line-clamp-2">{match.reason}</p>
            )}
        </Link>
    );
}

function CommunityCard({ community: c, onJoin }) {
    const themeColor = c.color || '#A3FF12';
    const scoreBg = c.matchScore >= 30 ? 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400'
        : c.matchScore > 0 ? 'from-neon/20 to-neon/5 border-neon/20 text-neon'
            : 'from-white/10 to-white/5 border-white/10 text-white/60';

    return (
        <div className="glass-card-hover p-5 block group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-lg font-bold border"
                        style={{ backgroundColor: themeColor + '15', borderColor: themeColor + '30', color: themeColor }}>
                        {c.avatarUrl ? (
                            <img src={resolveFileUrl(c.avatarUrl)} alt="" className="w-full h-full object-cover" />
                        ) : c.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <Link to={`/community/${c.id}`} className="font-medium text-sm group-hover:text-neon transition-colors">
                            {c.name}
                        </Link>
                        <p className="text-white/30 text-xs flex items-center gap-1">
                            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            </svg>
                            {c.memberCount || 0}
                        </p>
                    </div>
                </div>
                {c.matchScore > 0 && (
                    <div className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${scoreBg} text-xs font-bold border flex items-center gap-1`}>
                        <SparklesIcon size={12} />
                        {c.matchScore}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 mb-3">
                {c.category && (
                    <span className="px-2 py-0.5 rounded text-[11px] bg-white/5 text-white/50 border border-white/5">{c.category}</span>
                )}
            </div>

            {c.description && (
                <p className="text-white/30 text-xs line-clamp-2 mb-3">{c.description}</p>
            )}

            <button onClick={onJoin}
                className="w-full py-2 bg-neon/10 text-neon rounded-lg text-xs font-semibold hover:bg-neon/20 transition-all border border-neon/20">
                Вступить
            </button>
        </div>
    );
}



function ChatIcon({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function SessionRow({ session, userId, onConfirm }) {
    const isRequester = session.requesterId === userId;
    const myConfirmed = isRequester ? session.requesterConfirmed : session.providerConfirmed;
    const otherConfirmed = isRequester ? session.providerConfirmed : session.requesterConfirmed;
    const statusLabel = session.status === 'completed' ? 'Завершено' : session.status === 'requested' ? 'Запрошено' : session.status;

    return (
        <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                <p className="font-medium text-sm">{session.partnerName}</p>
                <p className="text-white/40 text-xs">{session.skill} · {session.date} {session.time}</p>
                <span className="text-[10px] uppercase tracking-wider text-neon/70">{statusLabel}</span>
            </div>
            {session.status !== 'completed' && (
                <button
                    onClick={() => onConfirm(session.id)}
                    disabled={myConfirmed}
                    className={`px-4 py-2 rounded-xl text-xs font-bold ${myConfirmed ? 'bg-white/5 text-white/30' : 'neon-btn'}`}
                >
                    {myConfirmed ? (otherConfirmed ? 'Ожидание...' : 'Вы подтвердили') : 'Занятие прошло'}
                </button>
            )}
        </div>
    );
}

function getMockMatches() {
    return [
        { id: '1', name: 'Айдана К.', university: 'КГТУ им. И. Раззакова', teachSkills: ['Python', 'ML', 'Data Science'], matchScore: 92, reason: 'Может научить вас: Python, Machine Learning. Идеальный бартер!' },
        { id: '2', name: 'Бекзат А.', university: 'Американский Университет Центральной Азии (АУЦА)', teachSkills: ['Figma', 'UI/UX Design', 'Photoshop'], matchScore: 78, reason: 'Может научить вас: Figma, UI/UX Design' },
        { id: '3', name: 'Нурай Т.', university: 'Кыргызско-Российский Славянский университет (КРСУ)', teachSkills: ['Data Science', 'Python'], matchScore: 85, reason: 'Может научить вас: Data Science. Учится в КРСУ' },
        { id: '4', name: 'Тимур Б.', university: 'КГТУ им. И. Раззакова', teachSkills: ['React', 'Node.js', 'TypeScript'], matchScore: 71, reason: 'Хочет изучить у вас: Machine Learning' },
        { id: '5', name: 'Асель Ж.', university: 'Американский Университет Центральной Азии (АУЦА)', teachSkills: ['English', 'SEO', 'Маркетинг'], matchScore: 55, reason: 'Может научить вас: English' },
        { id: '6', name: 'Эмир Т.', university: 'Международный университет «Ала-Тоо»', teachSkills: ['Java', 'C++', 'SQL'], matchScore: 45, reason: 'Хочет изучить Figma и UI/UX' },
    ];
}


