import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { SKILL_CATEGORIES } from '../data/skills';
import { SkillIcon, CoinIcon, StarIcon, RocketIcon, SparklesIcon, CameraIcon } from '../components/Icons';
import { UNIVERSITIES } from '../data/universities';

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
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
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
                    <div className="text-center md:text-left">
                        <h1 className="font-display text-3xl font-bold">
                            {t('profile.title')} <span className="neon-text">{t('profile.titleHL')}</span>
                        </h1>
                        <p className="text-white/40 mt-1">{t('profile.subtitle')}</p>
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

                {/* Basic info */}
                <ScrollSection>
                    <motion.div variants={fadeUp} className="glass-card p-6 mb-6 space-y-4">
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
                    </motion.div>
                </ScrollSection>

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

function UserIcon({ size = 18 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
