import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { SKILL_CATEGORIES, ALL_SKILLS } from '../data/skills';
import { UNIVERSITIES } from '../data/universities';
import { SkillIcon, SearchIcon, SparklesIcon, StarIcon } from '../components/Icons';

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
                        <AnimatePresence>
                            {filtered.map((user, i) => (
                                <motion.div key={user.id || i} variants={fadeUp} custom={i} layout>
                                    <UserCard user={user} />
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

function UserCard({ user }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-30px' });

    const scoreBg = user.matchScore >= 80 ? 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400'
        : user.matchScore >= 60 ? 'from-neon/20 to-neon/5 border-neon/20 text-neon'
            : user.matchScore >= 40 ? 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400'
                : 'from-white/10 to-white/5 border-white/10 text-white/50';

    return (
        <motion.div
            ref={ref}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
        >
            <Link to={`/user/${user.id}`} className="glass-card-hover p-5 block group h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-neon/10 border border-neon/20 flex items-center justify-center text-neon font-bold text-lg group-hover:shadow-neon transition-all duration-500">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name?.charAt(0)
                            )}
                        </div>
                        <div>
                            <h3 className="font-medium group-hover:text-neon transition-colors">{user.name}</h3>
                            <p className="text-white/30 text-xs flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                {user.university}
                            </p>
                        </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg bg-gradient-to-r ${scoreBg} text-xs font-bold border`}>
                        {user.matchScore}%
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= Math.round(user.rating || 0) ? '#A3FF12' : 'none'} stroke="#A3FF12" strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    ))}
                    <span className="text-white/30 text-xs ml-1">{user.rating?.toFixed(1)}</span>
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
                    <p className="text-white/25 text-xs line-clamp-2 flex items-start gap-1">
                        <SparklesIcon size={12} className="flex-shrink-0 mt-0.5" />
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
        { id: '1', name: 'Айдана Касымова', university: 'КГТУ им. Раззакова', teachSkills: ['Python', 'Machine Learning', 'Data Science', 'SQL'], rating: 4.8, sessionsCount: 15, matchScore: 92, matchReason: 'Может научить вас: Python, Machine Learning. Идеальный бартер навыков!' },
        { id: '2', name: 'Бекзат Алиев', university: 'АУЦА', teachSkills: ['UI/UX Design', 'Figma', 'Photoshop'], rating: 4.5, sessionsCount: 8, matchScore: 78, matchReason: 'Может научить вас: Figma, UI/UX Design' },
        { id: '3', name: 'Нурай Темирова', university: 'КРСУ', teachSkills: ['Data Science', 'Python', 'Machine Learning'], rating: 4.9, sessionsCount: 22, matchScore: 85, matchReason: 'Может научить вас: Data Science. Учится в КРСУ.' },
        { id: '4', name: 'Тимур Батырканов', university: 'КГТУ им. Раззакова', teachSkills: ['React', 'Node.js', 'TypeScript', 'DevOps'], rating: 4.6, sessionsCount: 10, matchScore: 71, matchReason: 'Хочет изучить у вас: Machine Learning, Python' },
        { id: '5', name: 'Асель Жумабекова', university: 'АУЦА', teachSkills: ['Маркетинг', 'SEO', 'English', 'Copywriting'], rating: 4.3, sessionsCount: 7, matchScore: 55, matchReason: 'Может научить вас: English' },
        { id: '6', name: 'Эмир Турсунов', university: 'Международный Университет Ала-Тоо', teachSkills: ['Java', 'C++', 'SQL', 'Git'], rating: 4.4, sessionsCount: 12, matchScore: 48, matchReason: 'Хочет изучить: React, UI/UX Design, Figma' },
        { id: '7', name: 'Мира Сатылганова', university: 'АУЦА', teachSkills: ['Корейский', 'English', 'Японский'], rating: 4.7, sessionsCount: 18, matchScore: 65, matchReason: 'Может научить вас: Корейский, English' },
        { id: '8', name: 'Дамир Усенов', university: 'КРСУ', teachSkills: ['Немецкий', 'Математика', 'Физика'], rating: 4.2, sessionsCount: 9, matchScore: 42, matchReason: 'Может научить вас: Немецкий' },
    ];
}
