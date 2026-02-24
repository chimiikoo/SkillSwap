import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { SkillIcon } from '../components/Icons';
import { resolveFileUrl } from '../utils/resolveFileUrl';
import {
    CoinIcon, StarIcon, BrainIcon, SearchIcon, RocketIcon, SparklesIcon,
} from '../components/Icons';

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
    const [stats, setStats] = useState(null);
    const [matches, setMatches] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, matchesData, sessionsData] = await Promise.all([
                apiFetch('/users/stats'),
                apiFetch('/matching/recommendations'),
                apiFetch('/sessions/my'),
            ]);
            setStats(statsData);
            setMatches(matchesData.matches || []);
            setSessions(sessionsData.sessions || []);
        } catch {
            setStats({ skillCoins: 5, sessionsCount: 0, avgRating: 0, reviewsCount: 0 });
            setMatches(getMockMatches());
            setSessions(getMockSessions());
        } finally {
            setLoading(false);
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

                {/* Stats Grid */}
                <ScrollSection className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <motion.div variants={fadeUp} custom={0}>
                        <StatCard icon={<CoinIcon size={22} />} label="SkillCoins" value={stats?.skillCoins || 0} accent />
                    </motion.div>
                    <motion.div variants={fadeUp} custom={1}>
                        <StatCard icon={<CalendarIcon />} label={t('dashboard.sessionsStat')} value={stats?.sessionsCount || 0} />
                    </motion.div>
                    <motion.div variants={fadeUp} custom={2}>
                        <StatCard icon={<StarIcon size={22} />} label={t('dashboard.rating')} value={stats?.avgRating?.toFixed(1) || '—'} />
                    </motion.div>
                    <motion.div variants={fadeUp} custom={3}>
                        <StatCard icon={<ChatIcon />} label={t('dashboard.reviews')} value={stats?.reviewsCount || 0} />
                    </motion.div>
                </ScrollSection>

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

                {/* AI Recommendations */}
                <ScrollSection className="mb-10">
                    <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <SparklesIcon size={20} />
                            AI Рекомендации
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

                {/* Upcoming Sessions */}
                <ScrollSection>
                    <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <CalendarIcon />
                            {t('dashboard.upcomingSessions')}
                        </h2>
                    </motion.div>

                    <div className="space-y-3">
                        {sessions.slice(0, 5).map((session, i) => (
                            <motion.div key={session.id || i} variants={fadeUp} custom={i}>
                                <SessionCard session={session} />
                            </motion.div>
                        ))}
                        {sessions.length === 0 && (
                            <div className="glass-card p-8 text-center">
                                <CalendarIcon size={24} className="mx-auto mb-3 opacity-30" />
                                <p className="text-white/40">{t('dashboard.noSessions')} <Link to="/search" className="text-neon hover:underline">{t('dashboard.findPartner')}</Link></p>
                            </div>
                        )}
                    </div>
                </ScrollSection>
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
                        <h4 className="font-medium text-sm group-hover:text-neon transition-colors">{match.name}</h4>
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

function SessionCard({ session }) {
    const statusMap = {
        pending: { label: 'Ожидание', style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
        offered: { label: 'Предложено', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
        active: { label: 'Активно', style: 'bg-neon/10 text-neon border-neon/20' },
        completed: { label: 'Завершено', style: 'bg-green-500/10 text-green-400 border-green-500/20' },
        cancelled: { label: 'Отменено', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
    };
    const st = statusMap[session.status] || statusMap.pending;

    return (
        <div className="glass-card-hover p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-neon/5 border border-neon/10 flex flex-col items-center justify-center group-hover:border-neon/20 transition-all">
                    <span className="text-xs text-neon/50">{session.date?.split('-')[2] || '—'}</span>
                    <span className="text-[10px] text-white/30">
                        {session.date ? new Date(session.date).toLocaleString('ru', { month: 'short' }) : ''}
                    </span>
                </div>
                <div>
                    <p className="font-medium text-sm">{session.partnerName || t('dashboard.partner')}</p>
                    <p className="text-white/30 text-xs">{session.skill || t('dashboard.skillNotSet')}</p>
                </div>
            </div>
            <span className={`px-3 py-1 rounded-lg text-xs border ${st.style}`}>
                {st.label}
            </span>
        </div>
    );
}

function CalendarIcon({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function ChatIcon({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
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

function getMockSessions() {
    return [
        { id: '1', partnerName: 'Айдана К.', skill: 'Python', date: '2026-02-20', status: 'confirmed' },
        { id: '2', partnerName: 'Бекзат А.', skill: 'UI/UX Design', date: '2026-02-22', status: 'pending' },
    ];
}
