import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { StarIcon, CoinIcon, HeartIcon } from '../components/Icons';
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
        <div className="min-h-screen bg-dark pt-20 pb-12 bg-grid">
            <div className="absolute top-16 left-0 right-0 h-[200px] bg-glow-top pointer-events-none" />

            <div className="page-container relative z-10 max-w-4xl">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
                    <span className="badge-neon mb-4 inline-flex items-center gap-1.5">
                        <StarIcon size={14} />
                        Топ Репетиторов
                    </span>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                        Доска <span className="neon-text">Почета</span>
                    </h1>
                    <p className="text-white/40 max-w-xl mx-auto">
                        Лучшие репетиторы платформы на основе отзывов студентов, количества проведенных сессий и рейтинга.
                    </p>
                </motion.div>

                {/* Top 3 Podium (Optional, Desktop mainly) */}
                {!loading && tutors.length >= 3 && (
                    <div className="hidden md:flex items-end justify-center gap-6 mb-16 mt-8 h-[250px]">
                        {/* 2nd Place */}
                        <PodiumItem user={tutors[1]} rank={2} height={160} color="bg-zinc-300 text-zinc-900 border-zinc-200" />
                        {/* 1st Place */}
                        <PodiumItem user={tutors[0]} rank={1} height={200} color="bg-yellow-400 text-yellow-900 border-yellow-300" glow="shadow-[0_0_30px_rgba(250,204,21,0.3)]" />
                        {/* 3rd Place */}
                        <PodiumItem user={tutors[2]} rank={3} height={120} color="bg-amber-600 text-amber-50 border-amber-500" />
                    </div>
                )}

                {/* List of Rankings */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-neon/20 border-t-neon rounded-full" />
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="flex flex-col gap-3">
                        {tutors.map((user, index) => (
                            <motion.div key={user.id} variants={fadeUp} custom={index}>
                                <Link to={`/user/${user.id}`} className="glass-card-hover p-4 md:p-5 flex items-center justify-between group transition-all duration-300 hover:border-neon/30">
                                    <div className="flex items-center gap-4 md:gap-6">
                                        <div className={`w-8 font-display font-bold text-center text-xl md:text-2xl ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-amber-500' : 'text-white/20'}`}>
                                            #{index + 1}
                                        </div>
                                        <div className="relative">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold group-hover:border-neon/50 transition-colors">
                                                {user.avatarUrl ? (
                                                    <img src={resolveFileUrl(user.avatarUrl)} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.name?.charAt(0)
                                                )}
                                            </div>
                                            {index < 3 && (
                                                <div className={`absolute -top-2 -right-2 text-xs md:text-sm p-1 rounded-full bg-dark border ${index === 0 ? 'border-yellow-400 text-yellow-400' : index === 1 ? 'border-zinc-300 text-zinc-300' : 'border-amber-500 text-amber-500'}`}>
                                                    <StarIcon size={12} filled />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold flex items-center gap-2 text-sm md:text-base group-hover:text-neon transition-colors">
                                                {user.name}
                                                {user.userType === 'tutor' && <VerifiedBadge size={14} />}
                                                {user.isPremium && <PremiumBadge size={14} />}
                                            </h3>
                                            <p className="text-white/40 text-xs md:text-sm">{user.university || 'SkillSwap'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 md:gap-8 text-right">
                                        <div className="hidden sm:block">
                                            <div className="text-neon font-bold flex items-center justify-end gap-1">
                                                <StarIcon size={14} /> {user.rating?.toFixed(1) || '0.0'}
                                            </div>
                                            <div className="text-white/30 text-[10px] md:text-xs">Рейтинг</div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="text-white/80 font-bold flex items-center justify-end gap-1">
                                                <HeartIcon size={14} className="text-red-500" filled /> {user.followersCount || 0}
                                            </div>
                                            <div className="text-white/30 text-[10px] md:text-xs">Подписчики</div>
                                        </div>
                                        <div>
                                            <div className="text-white font-bold flex items-center justify-end gap-1">
                                                <CoinIcon size={14} /> {user.sessionsCount || 0}
                                            </div>
                                            <div className="text-white/30 text-[10px] md:text-xs">Сессий</div>
                                        </div>

                                        <div className="text-white/20 group-hover:text-neon transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function PodiumItem({ user, rank, height, color, glow = '' }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: rank * 0.1, type: "spring", stiffness: 100 }}
            className="flex flex-col items-center"
        >
            <Link to={`/user/${user.id}`} className="mb-4 flex flex-col items-center group">
                <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 mb-2 transition-transform group-hover:scale-110 ${rank === 1 ? 'border-yellow-400' : rank === 2 ? 'border-zinc-300' : 'border-amber-500'} ${glow}`}>
                    {user.avatarUrl ? (
                        <img src={resolveFileUrl(user.avatarUrl)} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-dark-200 flex items-center justify-center text-xl font-bold">{user.name?.charAt(0)}</div>
                    )}
                </div>
                <div className="text-sm font-bold truncate max-w-[100px] text-center group-hover:text-neon transition-colors">{user.name}</div>
                <div className="text-white/40 text-xs flex items-center gap-1"><StarIcon size={10} /> {user.rating?.toFixed(1) || '0.0'}</div>
            </Link>
            <div
                className={`w-24 rounded-t-xl border flex flex-col items-center justify-start pt-4 font-display font-black text-4xl shadow-lg relative overflow-hidden ${color} ${glow}`}
                style={{ height: `${height}px` }}
            >
                {rank}
                <div className="absolute inset-x-0 top-0 h-4 bg-white/20"></div>
            </div>
        </motion.div>
    );
}
