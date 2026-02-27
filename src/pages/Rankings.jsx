import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { StarIcon, CoinIcon, CrownIcon } from '../components/Icons';
import { VerifiedBadge, PremiumBadge } from '../components/VerifiedBadge';
import { resolveFileUrl } from '../utils/resolveFileUrl';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    })
};

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

function PodiumItem({ user, rank, height, glow = '', gradient, t }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: rank * 0.1, type: "spring", stiffness: 100 }}
            className="flex flex-col items-center relative"
        >
            <Link to={`/user/${user.id}`} className="mb-2 flex flex-col items-center group relative z-20">
                {rank === 1 && (
                    <motion.div
                        initial={{ rotate: -15, scale: 0 }}
                        animate={{ rotate: 12, scale: 1.2 }}
                        transition={{
                            delay: 0.5,
                            type: "spring",
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 2
                        }}
                        className="absolute -top-10 -right-4 z-30 pointer-events-none"
                    >
                        <CrownIcon size={44} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] fill-yellow-400/20" />
                    </motion.div>
                )}

                <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-3xl overflow-hidden border-2 mb-3 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 ${rank === 1 ? 'border-yellow-400' : rank === 2 ? 'border-zinc-300' : 'border-amber-600'
                    } ${glow}`}>
                    {user.avatarUrl ? (
                        <img src={resolveFileUrl(user.avatarUrl)} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-dark-200 flex items-center justify-center text-2xl font-black text-white/20">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                        <span className="text-[10px] text-white font-bold uppercase tracking-wider">{t('rankings.profile')}</span>
                    </div>
                </div>

                <div className="flex flex-col items-center px-2 text-center">
                    <div className="text-sm md:text-base font-bold truncate max-w-[120px] text-white group-hover:text-neon transition-colors">
                        {user.name}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                        <StarIcon size={12} filled className={rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-zinc-300' : 'text-amber-500'} />
                        <span className="text-xs font-bold text-white/70">{user.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                </div>
            </Link>

            <div
                className={`w-28 md:w-32 rounded-t-[2rem] border-t border-x relative flex flex-col items-center justify-start pt-6 shadow-2xl overflow-hidden ${gradient} ${rank === 1 ? 'border-yellow-400/50' : rank === 2 ? 'border-zinc-300/30' : 'border-amber-600/30'}`}
                style={{ height: `${height}px` }}
            >
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                <div className={`font-display font-black text-5xl md:text-6xl drop-shadow-lg ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-zinc-300' : 'text-amber-600'}`}>
                    {rank}
                </div>

                {/* Stats hint inside podium block */}
                <div className="mt-2 text-[10px] font-bold uppercase tracking-widest opacity-40 text-center">
                    {user.sessionsCount || 0} {t('rankings.sessionsCountLabel')}
                </div>
            </div>
        </motion.div>
    );
}

export default function Rankings() {
    const { apiFetch } = useAuth();
    const { t } = useLanguage();
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRankings();
    }, []);

    const loadRankings = async () => {
        try {
            const data = await apiFetch('/users/rankings');
            setTutors(data.tutors || []);
        } catch (err) {
            console.error('Error loading rankings', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark pt-24 pb-20 bg-grid overflow-x-hidden">
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-neon/5 to-transparent pointer-events-none" />

            <div className="page-container relative z-10 max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="inline-block"
                    >
                        <span className="badge-neon mb-6 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]">
                            {t('rankings.topTutors')}
                        </span>
                    </motion.div>
                    <h1 className="font-display text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        {t('rankings.title')} <span className="neon-text underline-neon">{t('rankings.titleHL')}</span>
                    </h1>
                    <p className="text-white/40 max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed">
                        {t('rankings.subtitle')}
                    </p>
                </motion.div>

                {/* Top 3 Podium */}
                {!loading && tutors.length >= 3 && (
                    <div className="flex items-end justify-center gap-4 md:gap-10 mb-24 mt-12 px-4">
                        {/* 2nd Place */}
                        <div className="order-1">
                            <PodiumItem
                                user={tutors[1]}
                                rank={2}
                                height={150}
                                gradient="bg-gradient-to-b from-zinc-400/20 to-zinc-900/50"
                                glow="shadow-[0_0_20px_rgba(161,161,170,0.1)]"
                                t={t}
                            />
                        </div>
                        {/* 1st Place */}
                        <div className="order-2 mb-8">
                            <PodiumItem
                                user={tutors[0]}
                                rank={1}
                                height={200}
                                gradient="bg-gradient-to-b from-yellow-400/20 to-yellow-900/50"
                                glow="shadow-[0_0_40px_rgba(250,204,21,0.2)]"
                                t={t}
                            />
                        </div>
                        {/* 3rd Place */}
                        <div className="order-3">
                            <PodiumItem
                                user={tutors[2]}
                                rank={3}
                                height={110}
                                gradient="bg-gradient-to-b from-amber-800/20 to-amber-950/50"
                                glow="shadow-[0_0_20px_rgba(146,64,14,0.1)]"
                                t={t}
                            />
                        </div>
                    </div>
                )}

                {/* Mobile Podium fallback (small screens still need the list, but let's make the podium responsive above) */}

                <div className="space-y-4 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6 px-4">
                        <h2 className="text-xl font-bold font-display">{t('rankings.allTutors')}</h2>
                        <div className="h-px flex-1 bg-white/5 mx-6"></div>
                        <span className="text-white/30 text-xs uppercase tracking-widest">
                            {t('rankings.usersCount').replace('{count}', tutors.length)}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center py-20 gap-4">
                            <div className="spinner-neon" />
                            <p className="text-white/20 animate-pulse font-bold tracking-widest text-xs uppercase">{t('rankings.loading')}</p>
                        </div>
                    ) : (
                        <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col gap-4">
                            {tutors.map((user, index) => (
                                <motion.div key={user.id} variants={fadeUp} custom={index}>
                                    <Link to={`/user/${user.id}`} className="glass-card-hover p-5 flex items-center justify-between group transition-all duration-300">
                                        <div className="flex items-center gap-5 md:gap-8 grow">
                                            <div className={`w-10 font-display font-black text-center text-2xl ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-600' : 'text-white/10'
                                                }`}>
                                                {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                            </div>

                                            <div className="relative">
                                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:border-neon/40 group-hover:scale-105">
                                                    {user.avatarUrl ? (
                                                        <img src={resolveFileUrl(user.avatarUrl)} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="font-black text-white/10 text-xl">{user.name?.charAt(0).toUpperCase()}</div>
                                                    )}
                                                </div>
                                                {index < 3 && (
                                                    <div className={`absolute -top-1.5 -right-1.5 p-1 rounded-lg bg-dark border shadow-lg ${index === 0 ? 'border-yellow-400 text-yellow-400' :
                                                        index === 1 ? 'border-zinc-300 text-zinc-300' :
                                                            'border-amber-600 text-amber-600'
                                                        }`}>
                                                        <StarIcon size={10} filled />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="font-bold flex items-center gap-2 text-base md:text-lg group-hover:text-neon transition-colors truncate">
                                                    {user.name}
                                                    {user.userType === 'tutor' && <VerifiedBadge size={16} />}
                                                    {user.isPremium && <PremiumBadge size={16} />}
                                                </h3>
                                                <p className="text-white/40 text-xs md:text-sm truncate font-medium">{user.university || 'SkillSwap Member'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-5 md:gap-12 shrink-0 ml-4">
                                            <div className="flex flex-col items-center">
                                                <div className="text-neon font-black text-sm md:text-base flex items-center gap-1.5">
                                                    <StarIcon size={14} filled />
                                                    {user.rating?.toFixed(1) || '0.0'}
                                                </div>
                                                <div className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">{t('rankings.rating')}</div>
                                            </div>

                                            <div className="hidden sm:flex flex-col items-center">
                                                <div className="text-white/80 font-black text-sm md:text-base flex items-center gap-1.5">
                                                    <CoinIcon size={14} className="text-neon" />
                                                    {user.sessionsCount || 0}
                                                </div>
                                                <div className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">{t('rankings.sessions')}</div>
                                            </div>

                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-neon/10 transition-all">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-neon"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
