import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { SkillIcon, StarIcon, SparklesIcon, ShieldCheckIcon } from '../components/Icons';

const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    })
};

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

function ScrollSection({ children, className = '' }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });
    return (
        <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className={className}>
            {children}
        </motion.div>
    );
}

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apiFetch } = useAuth();
    const { t } = useLanguage();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadProfile();
    }, [id]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await apiFetch(`/users/${id}`);
            setProfile(data.user);
        } catch {
            setProfile(getMockProfile());
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = () => {
        navigate('/chat', { state: { partnerId: id } });
    };

    const handleReport = async () => {
        if (!reportReason) return;
        try {
            await apiFetch('/reports/create', {
                method: 'POST',
                body: JSON.stringify({ userId: id, reason: reportReason }),
            });
            setMessage(t('userProfile.reportSent'));
            setShowReport(false);
        } catch (err) {
            setMessage(err.message || t('userProfile.error'));
        }
    };

    const handleReview = async () => {
        try {
            await apiFetch('/reviews/create', {
                method: 'POST',
                body: JSON.stringify({ userId: id, rating: reviewRating, text: reviewText }),
            });
            setMessage(t('userProfile.reviewSent'));
            setShowReview(false);
            loadProfile();
        } catch (err) {
            setMessage(err.message || t('userProfile.error'));
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

    if (!profile) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center pt-16">
                <div className="glass-card p-8 text-center">
                    <p className="text-white/40">{t('userProfile.notFound')}</p>
                    <Link to="/search" className="text-neon text-sm mt-2 inline-block hover:underline">{t('userProfile.backToSearch')}</Link>
                </div>
            </div>
        );
    }

    const scoreBg = profile.matchScore >= 80 ? 'from-green-500/20 to-green-500/5 border-green-500/20 text-green-400'
        : profile.matchScore >= 60 ? 'from-neon/20 to-neon/5 border-neon/20 text-neon'
            : 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20 text-yellow-400';

    return (
        <div className="min-h-screen bg-dark pt-20 pb-12 bg-grid">
            <div className="absolute top-16 left-0 right-0 h-[200px] bg-glow-top pointer-events-none" />

            <div className="page-container relative z-10 max-w-3xl">
                {/* Back nav */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                    <Link to="/search" className="text-white/30 text-sm hover:text-white/50 transition-colors flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        {t('userProfile.backSearch')}
                    </Link>
                </motion.div>

                {/* Alert message */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-neon/10 border border-neon/20 text-neon px-4 py-3 rounded-xl text-sm mb-4 flex items-center justify-between"
                        >
                            {message}
                            <button onClick={() => setMessage('')} className="hover:text-white ml-2">✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 md:p-8 mb-6"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="w-20 h-20 rounded-2xl overflow-hidden bg-neon/10 border border-neon/20 flex items-center justify-center text-neon text-3xl font-bold"
                        >
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                profile.name?.charAt(0)
                            )}
                        </motion.div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="font-display text-2xl font-bold">{profile.name}</h1>
                                {profile.matchScore && (
                                    <span className={`px-3 py-1 rounded-lg bg-gradient-to-r ${scoreBg} text-xs font-bold border flex items-center gap-1`}>
                                        <SparklesIcon size={12} />
                                        {profile.matchScore}% match
                                    </span>
                                )}
                            </div>
                            <p className="text-white/30 text-sm flex items-center gap-1.5 mb-2">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                {profile.university}
                            </p>
                            {profile.bio && (
                                <p className="text-white/40 text-sm leading-relaxed">{profile.bio}</p>
                            )}
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-6 mt-6 pt-5 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map(s => (
                                <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= Math.round(profile.rating || 0) ? '#A3FF12' : 'none'} stroke="#A3FF12" strokeWidth="1.5">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            ))}
                            <span className="text-white/50 text-sm ml-1">{profile.rating?.toFixed(1)}</span>
                        </div>
                        <span className="text-white/15">|</span>
                        <span className="text-white/40 text-sm">{profile.sessionsCount || 0} {t('userProfile.sessionsCount')}</span>
                        <span className="text-white/15">|</span>
                        <span className="text-white/40 text-sm">{profile.reviewsCount || 0} {t('userProfile.reviewsCount')}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-5">
                        <button onClick={handleMessage} className="neon-btn px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                            <ChatIcon />
                            {t('userProfile.sendMessage')}
                        </button>
                        <button onClick={() => setShowReview(true)} className="neon-btn-outline px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                            <StarIcon size={16} />
                            {t('userProfile.leaveReview')}
                        </button>
                        <button onClick={() => setShowReport(true)} className="px-4 py-2.5 rounded-xl text-sm bg-red-500/5 text-red-400/60 border border-red-500/10 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                            <ShieldCheckIcon size={16} />
                            {t('userProfile.report')}
                        </button>
                    </div>
                </motion.div>

                {/* Match reason */}
                {profile.matchReason && (
                    <ScrollSection className="mb-6">
                        <motion.div variants={fadeUp} className="glass-card p-5 border-neon/10">
                            <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                                <SparklesIcon size={16} />
                                {t('userProfile.whyMatch')}
                            </h3>
                            <p className="text-white/40 text-sm">{profile.matchReason}</p>
                        </motion.div>
                    </ScrollSection>
                )}

                {/* Skills */}
                <ScrollSection className="grid md:grid-cols-2 gap-4 mb-6">
                    <motion.div variants={fadeUp} className="glass-card p-5">
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                            <TeachIcon />
                            {t('userProfile.canTeach')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(profile.teachSkills || []).map(s => (
                                <span key={s} className="badge-neon flex items-center gap-1.5 text-xs">
                                    <SkillIcon skill={s} size={14} />
                                    {s}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                    <motion.div variants={fadeUp} className="glass-card p-5">
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                            <LearnIcon />
                            {t('userProfile.wantLearn')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(profile.learnSkills || []).map(s => (
                                <span key={s} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 text-white/50 border border-white/8 flex items-center gap-1.5">
                                    <SkillIcon skill={s} size={14} />
                                    {s}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </ScrollSection>

                {/* Reviews */}
                <ScrollSection>
                    <motion.div variants={fadeUp}>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ChatIcon />
                            {t('userProfile.reviews')}
                        </h3>
                    </motion.div>
                    <div className="space-y-3">
                        {(profile.reviews || []).map((r, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i} className="glass-card p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm">{r.author}</span>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill={s <= r.rating ? '#A3FF12' : 'none'} stroke="#A3FF12" strokeWidth="1.5">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-white/40 text-sm">{r.text}</p>
                            </motion.div>
                        ))}
                        {(!profile.reviews || profile.reviews.length === 0) && (
                            <div className="glass-card p-6 text-center">
                                <p className="text-white/30 text-sm">{t('userProfile.noReviews')}</p>
                            </div>
                        )}
                    </div>
                </ScrollSection>
            </div>

            {/* Modals */}
            <AnimatePresence>

                {showReview && (
                    <Modal onClose={() => setShowReview(false)} title={t('userProfile.reviewTitle')}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-white/40 mb-2 block">{t('userProfile.ratingLabel')}</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <button key={s} onClick={() => setReviewRating(s)} className="focus:outline-none group">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill={s <= reviewRating ? '#A3FF12' : 'none'} stroke="#A3FF12" strokeWidth="1.5" className="transition-transform group-hover:scale-110">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-white/40 mb-1.5 block">{t('userProfile.reviewTextLabel')}</label>
                                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} className="input-dark resize-none text-sm" rows="3" placeholder={t('userProfile.reviewPh')} />
                            </div>
                            <button onClick={handleReview} className="neon-btn w-full py-3 rounded-xl text-sm">
                                {t('userProfile.sendReview')}
                            </button>
                        </div>
                    </Modal>
                )}

                {showReport && (
                    <Modal onClose={() => setShowReport(false)} title={t('userProfile.reportTitle')}>
                        <div className="space-y-3">
                            {[
                                t('userProfile.reportR1'),
                                t('userProfile.reportR2'),
                                t('userProfile.reportR3'),
                                t('userProfile.reportR4'),
                            ].map(reason => (
                                <button
                                    key={reason}
                                    onClick={() => setReportReason(reason)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${reportReason === reason
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {reason}
                                </button>
                            ))}
                            <button
                                onClick={handleReport}
                                disabled={!reportReason}
                                className="w-full py-3 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                            >
                                {t('userProfile.sendReport')}
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

function Modal({ children, onClose, title }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={e => e.stopPropagation()}
                className="glass-card p-6 w-full max-w-md"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">{title}</h3>
                    <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>
                {children}
            </motion.div>
        </motion.div>
    );
}

function CalendarIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

function ChatIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

function TeachIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function LearnIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    );
}

function getMockProfile() {
    return {
        id: '1',
        name: 'Айдана Касымова',
        university: 'КГТУ им. И. Раззакова',
        bio: 'Frontend разработчик с 3-летним опытом. Специализируюсь на Python и ML. Люблю делиться знаниями!',
        teachSkills: ['Python', 'Machine Learning', 'Data Science', 'SQL'],
        learnSkills: ['React', 'JavaScript', 'TypeScript'],
        rating: 4.8,
        sessionsCount: 15,
        reviewsCount: 12,
        matchScore: 92,
        matchReason: 'Может научить вас: Python, Machine Learning. Хочет изучить у вас: React. Идеальный бартер навыков!',
        reviews: [
            { author: 'Тимур Б.', rating: 5, text: 'Отличный преподаватель! Очень понятно объясняет Python.' },
            { author: 'Бекзат А.', rating: 5, text: 'Помогла разобраться с Machine Learning за одну сессию.' },
            { author: 'Эмир Т.', rating: 4, text: 'Хорошая сессия по Data Science, рекомендую.' },
        ],
    };
}
