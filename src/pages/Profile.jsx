import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { SKILL_CATEGORIES } from '../data/skills';
import { SkillIcon, CoinIcon, StarIcon, RocketIcon, SparklesIcon, CameraIcon, HeartIcon, UserIcon } from '../components/Icons';
import { VerifiedBadge, PremiumBadge } from '../components/VerifiedBadge';
import { UNIVERSITIES } from '../data/universities';
import { resolveFileUrl } from '../utils/resolveFileUrl';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
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

export default function Profile() {
    const { user, updateProfile } = useAuth();
    const { t } = useLanguage();
    const [form, setForm] = useState({
        name: user?.name || '',
        university: user?.university || '',
        bio: user?.bio || '',
        teachSkills: user?.teachSkills || [],
        learnSkills: user?.learnSkills || [],
    });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('teach');
    const [activeCategory, setActiveCategory] = useState(0);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);

    const toggleSkill = (type, skill) => {
        setForm(prev => ({
            ...prev,
            [type]: prev[type].includes(skill)
                ? prev[type].filter(s => s !== skill)
                : [...prev[type], skill]
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile(form);
            setSaved(true);
            setIsEditing(false);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const API_BASE = import.meta.env.VITE_API_URL || '/api';
            const res = await fetch(`${API_BASE}/users/avatar`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('skillswap_token')}`
                },
                body: formData
            });

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(t('profile.serverError').replace('{status}', res.status));
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');

            // Update user in context by calling updateProfile with the new URL
            await updateProfile({ avatarUrl: data.avatarUrl });
        } catch (err) {
            alert(t('profile.uploadError') + err.message);
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark pt-20 pb-12 bg-grid">
            <div className="absolute top-16 left-0 right-0 h-[200px] bg-glow-top pointer-events-none" />

            <div className="page-container relative z-10 max-w-3xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-neon/20 bg-white/5 shadow-neon/10 group-hover:border-neon transition-all duration-300">
                            {user?.avatarUrl ? (
                                <img src={resolveFileUrl(user.avatarUrl)} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neon/5">
                                    <UserIcon size={40} />
                                </div>
                            )}
                            {uploadingAvatar && (
                                <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-neon text-dark opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-neon"
                        >
                            <CameraIcon size={16} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarUpload}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <div className="text-center md:text-left flex-1 relative">
                        <div className="flex items-center justify-between gap-4">
                            <h1 className="font-display text-3xl font-bold flex items-center gap-2 flex-wrap">
                                <span className="text-neon">{user?.name}</span>
                                {user?.userType === 'tutor' && <VerifiedBadge size={22} />}
                                {user?.isPremium && <PremiumBadge size={22} />}
                            </h1>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`p-2 rounded-xl transition-all ${isEditing ? 'bg-neon text-dark' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                title="Настройки"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                            </button>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <p className="text-white/40 text-sm flex items-center gap-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                                <span className="text-white font-bold">{user?.followersCount || 0}</span> {t('userProfile.followers')}
                            </p>
                            <span className="w-1 h-1 rounded-full bg-neon/30 shadow-[0_0_5px_rgba(163,255,18,0.5)]" />
                            <p className="text-white/40 text-sm flex items-center gap-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                                <span className="text-white font-bold">{user?.followingCount || 0}</span> {t('userProfile.following')}
                            </p>
                        </div>
                        <p className="text-white/20 text-xs mt-2 uppercase tracking-widest">{t('profile.subtitle')}</p>
                    </div>
                </motion.div>

                {/* Stats overview */}
                <ScrollSection className="grid grid-cols-3 gap-3 mb-8">
                    <motion.div variants={fadeUp} className="glass-card p-4 text-center group">
                        <CoinIcon size={20} className="mx-auto mb-2" />
                        <div className="text-xl font-bold">{user?.skillCoins || 0}</div>
                        <div className="text-white/30 text-xs">SkillCoins</div>
                    </motion.div>
                    <motion.div variants={fadeUp} className="glass-card p-4 text-center group">
                        <StarIcon size={20} className="mx-auto mb-2" />
                        <div className="text-xl font-bold">{user?.rating?.toFixed(1) || '—'}</div>
                        <div className="text-white/30 text-xs">{t('profile.ratingLabel')}</div>
                    </motion.div>
                    <motion.div variants={fadeUp} className="glass-card p-4 text-center group">
                        <RocketIcon size={20} className="mx-auto mb-2" />
                        <div className="text-xl font-bold">{user?.sessionsCount || 0}</div>
                        <div className="text-white/30 text-xs">{t('profile.sessionsLabel')}</div>
                    </motion.div>
                </ScrollSection>

                {/* Basic info (Editable or View mode) */}
                <AnimatePresence mode="wait">
                    {isEditing ? (
                        <motion.div
                            key="edit-info"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass-card p-6 mb-6 space-y-4 overflow-hidden"
                        >
                            <h3 className="font-bold flex items-center gap-2 mb-1">
                                <UserIcon />
                                {t('profile.basicInfo')}
                            </h3>
                            <div>
                                <label className="text-sm text-white/40 mb-1.5 block">{t('profile.nameLabel')}</label>
                                <input type="text" value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setSaved(false); }} className="input-dark" />
                            </div>
                            <div>
                                <label className="text-sm text-white/40 mb-1.5 block">{t('profile.universityLabel')}</label>
                                <select
                                    value={form.university}
                                    onChange={e => { setForm({ ...form, university: e.target.value }); setSaved(false); }}
                                    className="input-dark"
                                >
                                    <option value="">{t('profile.universityPh')}</option>
                                    {UNIVERSITIES.map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-white/40 mb-1.5 block">{t('profile.bioLabel')}</label>
                                <textarea value={form.bio} onChange={e => { setForm({ ...form, bio: e.target.value }); setSaved(false); }} className="input-dark resize-none" rows="3" />
                            </div>

                            {user?.isPremium && (
                                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                    <h4 className="text-purple-400 text-sm font-bold mb-3 flex items-center gap-2">
                                        ✨ Premium Sticker Pack
                                    </h4>
                                    <div className="flex gap-4">
                                        {['🔥', '🚀', '🧠', '💎'].map(sticker => (
                                            <button key={sticker} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl hover:bg-purple-500/20 hover:border-purple-500/30 transition-all">
                                                {sticker}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-white/20 text-[10px] mt-2">Pick a sticker to display next to your name.</p>
                                </div>
                            )}
                            <div className="flex gap-3 mt-4">
                                <button onClick={() => setIsEditing(false)} className="neon-btn-outline flex-1 py-2 rounded-xl text-sm">
                                    Отмена
                                </button>
                                <button onClick={handleSave} className="neon-btn flex-1 py-2 rounded-xl text-sm">
                                    {t('profile.save')}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="view-info"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="glass-card p-6 border-neon/5 bg-neon/[0.02]">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-neon/10 text-neon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 0 1 .665 6.479A11.952 11.952 0 0 0 12 20.083c-2.455 0-4.79-.738-6.825-2.026a12.083 12.083 0 0 1 .665-6.479L12 14z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">{t('profile.universityLabel')}</p>
                                            <p className="text-white font-medium">{user?.university || 'Не указано'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-neon/10 text-neon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">{t('profile.bioLabel')}</p>
                                            <p className="text-white/80 leading-relaxed italic">{user?.bio || 'Привет! Я использую SkillSwap для обучения.'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Skills */}
                <ScrollSection>
                    <motion.div variants={fadeUp} className="glass-card p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <SparklesIcon size={18} />
                            <h3 className="font-bold">{t('profile.skills')}</h3>
                        </div>

                        {/* Teach / Learn Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setActiveTab('teach')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'teach'
                                    ? 'bg-neon/15 text-neon border border-neon/25'
                                    : 'bg-white/5 text-white/40 border border-transparent'
                                    }`}
                            >
                                {t('profile.canTeach')} ({form.teachSkills.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('learn')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'learn'
                                    ? 'bg-neon/15 text-neon border border-neon/25'
                                    : 'bg-white/5 text-white/40 border border-transparent'
                                    }`}
                            >
                                {t('profile.wantLearn')} ({form.learnSkills.length})
                            </button>
                        </div>

                        {/* Selected skills */}
                        {(activeTab === 'teach' ? form.teachSkills : form.learnSkills).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                {(activeTab === 'teach' ? form.teachSkills : form.learnSkills).map(s => (
                                    <span key={s} className="px-2.5 py-1 rounded-lg text-xs bg-neon/10 text-neon/80 border border-neon/15 flex items-center gap-1.5">
                                        <SkillIcon skill={s} size={12} />
                                        {s}
                                        <button onClick={() => toggleSkill(activeTab === 'teach' ? 'teachSkills' : 'learnSkills', s)} className="hover:text-neon ml-0.5">×</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Category tabs */}
                        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                            {SKILL_CATEGORIES.map((cat, i) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setActiveCategory(i)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCategory === i
                                        ? 'bg-neon/10 text-neon border border-neon/20'
                                        : 'bg-white/5 text-white/35 border border-transparent hover:text-white/50'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                            {SKILL_CATEGORIES[activeCategory].skills.map(skill => {
                                const type = activeTab === 'teach' ? 'teachSkills' : 'learnSkills';
                                const isActive = form[type].includes(skill);
                                return (
                                    <button
                                        key={skill}
                                        onClick={() => toggleSkill(type, skill)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5 ${isActive
                                            ? 'bg-neon/20 text-neon border border-neon/30 shadow-sm shadow-neon/10'
                                            : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <SkillIcon skill={skill} size={14} />
                                        {skill}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </ScrollSection>

                {/* Save */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3"
                >
                    <button onClick={handleSave} disabled={loading} className="neon-btn px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50">
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
                                {t('profile.saving')}
                            </>
                        ) : (
                            <>
                                <CheckIcon />
                                {t('profile.save')}
                            </>
                        )}
                    </button>
                    {saved && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-neon text-sm flex items-center gap-1"
                        >
                            <CheckIcon /> {t('profile.saved')}
                        </motion.span>
                    )}
                </motion.div>
            </div>
        </div>
    );
}


function CheckIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
