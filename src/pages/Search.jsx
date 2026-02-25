import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { SKILL_CATEGORIES, ALL_SKILLS } from '../data/skills';
import { UNIVERSITIES } from '../data/universities';
import { SkillIcon, SearchIcon, SparklesIcon, StarIcon, HeartIcon } from '../components/Icons';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { resolveFileUrl } from '../utils/resolveFileUrl';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    })
};

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export default function Search() {
    const { apiFetch } = useAuth();
    const { t } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [uniFilter, setUniFilter] = useState('');
    const [sortBy, setSortBy] = useState('match');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await apiFetch('/users/search');
            setUsers(data.users || []);
        } catch {
            setUsers(getMockUsers());
        } finally {
            setLoading(false);
        }
    };

    const handleFollowInList = async (e, targetUserId, isCurrentlyFollowing) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const endpoint = isCurrentlyFollowing ? `/users/${targetUserId}/unfollow` : `/users/${targetUserId}/follow`;
            const data = await apiFetch(endpoint, { method: 'POST' });

            setUsers(prev => prev.map(u => {
                if (u.id === targetUserId) {
                    return {
                        ...u,
                        isFollowing: data.isFollowing,
                        followersCount: u.followersCount + (data.isFollowing ? 1 : -1)
                    };
                }
                return u;
            }));
        } catch (err) {
            console.error('Follow error:', err);
        }
    };

    const filtered = users
        .filter(u => {
            const matchesQuery = !query || u.name?.toLowerCase().includes(query.toLowerCase()) ||
                u.teachSkills?.some(s => s.toLowerCase().includes(query.toLowerCase()));
            const matchesSkill = !skillFilter || u.teachSkills?.includes(skillFilter);
            const matchesUni = !uniFilter || u.university === uniFilter;
            return matchesQuery && matchesSkill && matchesUni;
        })
        .sort((a, b) => {
            if (sortBy === 'match') return (b.matchScore || 0) - (a.matchScore || 0);
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
            if (sortBy === 'sessions') return (b.sessionsCount || 0) - (a.sessionsCount || 0);
            return 0;
        });

    return (
        <div className="min-h-screen bg-dark pt-20 pb-12 bg-grid">
            <div className="absolute top-16 left-0 right-0 h-[200px] bg-glow-top pointer-events-none" />

            <div className="page-container relative z-10">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                        <SearchIcon size={28} />
                        {t('search.title')} <span className="neon-text">{t('search.titleHL')}</span>
                    </h1>
                    <p className="text-white/40">{t('search.subtitle')}</p>
                </motion.div>

                {/* Search bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-3 mb-4"
                >
                    <div className="flex-1 relative">
                        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="input-dark pl-12 w-full"
                            placeholder={t('search.searchPh')}
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${showFilters ? 'bg-neon/10 text-neon border border-neon/20' : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                            }`}
                    >
                        <FilterIcon />
                        {t('search.filters')}
                    </button>
                </motion.div>

                {/* Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden mb-6"
                        >
                            <div className="glass-card p-5 grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-white/40 mb-1.5 block">{t('search.skill')}</label>
                                    <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)} className="input-dark text-sm">
                                        <option value="">{t('search.allSkills')}</option>
                                        {ALL_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 mb-1.5 block">{t('search.universityLabel')}</label>
                                    <select value={uniFilter} onChange={e => setUniFilter(e.target.value)} className="input-dark text-sm">
                                        <option value="">{t('search.allUnis')}</option>
                                        {UNIVERSITIES.filter(Boolean).map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 mb-1.5 block">{t('search.sortLabel')}</label>
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-dark text-sm">
                                        <option value="match">{t('search.sortMatch')}</option>
                                        <option value="rating">{t('search.sortRating')}</option>
                                        <option value="sessions">{t('search.sortExp')}</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results count */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between mb-6"
                >
                    <span className="text-white/30 text-sm">
                        {loading ? t('search.loading') : t('search.found').replace('{count}', filtered.length)}
                    </span>
                </motion.div>

                {/* Results Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-8 h-8 border-2 border-neon/20 border-t-neon rounded-full"
                        />
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((user, i) => (
                                <motion.div key={user.id || i} variants={fadeUp} custom={i} layout>
                                    <UserCard user={user} onFollow={handleFollowInList} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {!loading && filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card p-12 text-center"
                    >
                        <SearchIcon size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-white/40">{t('search.noResults')}</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function UserCard({ user, onFollow }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-30px' });
    const { t } = useLanguage();

    const scoreBg = user.matchScore >= 80 ? 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400'
        : user.matchScore >= 60 ? 'from-neon/20 to-neon/5 border-neon/20 text-neon'
            : user.matchScore >= 40 ? 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400'
                : 'from-white/10 to-white/5 border-white/10 text-white/50';

    return (
        <motion.div
            ref={ref}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="h-full"
        >
            <Link to={`/user/${user.id}`} className="glass-card-hover p-5 block group h-full relative">
                {/* Follow Button - Absolutely positioned to keep clickable */}
                <button
                    onClick={(e) => onFollow(e, user.id, user.isFollowing)}
                    className={`absolute top-5 right-5 z-20 p-2 rounded-xl border transition-all ${user.isFollowing
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : 'bg-white/5 border-white/10 text-white/20 hover:text-neon hover:border-neon/30'
                        }`}
                >
                    <HeartIcon size={16} filled={user.isFollowing} />
                </button>

                {/* Header */}
                <div className="flex items-start justify-between mb-4 mr-8">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-neon/10 border border-neon/20 flex items-center justify-center text-neon font-bold text-lg group-hover:shadow-neon transition-all duration-500">
                            {user.avatarUrl ? (
                                <img src={resolveFileUrl(user.avatarUrl)} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name?.charAt(0)
                            )}
                        </div>
                        <div>
                            <h3 className="font-medium group-hover:text-neon transition-colors flex items-center gap-1.5">
                                {user.name}
                                {user.userType === 'tutor' && <VerifiedBadge size={15} />}
                            </h3>
                            <p className="text-white/30 text-xs flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                {user.university}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="flex items-center gap-3 mb-4 text-[10px] uppercase font-bold tracking-tighter">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-white/40">
                        <HeartIcon size={10} className={user.isFollowing ? 'text-red-500' : 'text-neon/40'} filled={user.isFollowing} />
                        <span className="text-white">{user.followersCount || 0}</span>
                        <span className="opacity-50">{t('userProfile.followers')}</span>
                    </div>
                    <div className={`px-2 py-0.5 rounded-md border text-[10px] font-black tracking-widest bg-gradient-to-r ${scoreBg}`}>
                        {user.matchScore}% MATCH
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= Math.round(user.rating || 0) ? '#A3FF12' : 'none'} stroke="#A3FF12" strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    ))}
                    <span className="text-white/30 text-xs ml-1 font-mono">{user.rating?.toFixed(1)}</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {(user.teachSkills || []).slice(0, 4).map(s => (
                        <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-neon/5 text-neon/60 border border-neon/10 flex items-center gap-1">
                            <SkillIcon skill={s} size={10} />
                            {s}
                        </span>
                    ))}
                    {(user.teachSkills?.length || 0) > 4 && (
                        <span className="text-white/20 text-[11px]">+{user.teachSkills.length - 4}</span>
                    )}
                </div>

                {/* Match reason */}
                {user.matchReason && (
                    <p className="text-white/25 text-xs line-clamp-2 flex items-start gap-1 italic">
                        <SparklesIcon size={12} className="flex-shrink-0 mt-0.5 opacity-50" />
                        {user.matchReason}
                    </p>
                )}
            </Link>
        </motion.div>
    );
}

function FilterIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    );
}

function getMockUsers() {
    return [
        { id: '1', name: 'Айдана Касымова', university: 'КГТУ им. Раззакова', teachSkills: ['Python', 'Machine Learning', 'Data Science', 'SQL'], rating: 4.8, sessionsCount: 15, followersCount: 1250, matchScore: 92, matchReason: 'Может научить вас: Python, Machine Learning. Идеальный бартер навыков!' },
        { id: '2', name: 'Бекзат Алиев', university: 'АУЦА', teachSkills: ['UI/UX Design', 'Figma', 'Photoshop'], rating: 4.5, sessionsCount: 8, followersCount: 420, matchScore: 78, matchReason: 'Может научить вас: Figma, UI/UX Design' },
    ];
}
