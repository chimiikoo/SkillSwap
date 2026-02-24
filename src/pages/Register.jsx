import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SKILL_CATEGORIES } from '../data/skills';
import { SKILL_CAT_KEYS } from '../i18n/translations';
import { UNIVERSITIES } from '../data/universities';
import { SkillIcon } from '../components/Icons';

export default function Register() {
    const { register, verifyAccount } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Translate skill name — programming langs stay untranslated
    const ts = (skill) => {
        const translated = t(`skillNames.${skill}`);
        return translated === `skillNames.${skill}` ? skill : translated;
    };

    // Translate category name
    const tc = (catName) => {
        const key = SKILL_CAT_KEYS[catName];
        return key ? t(`skillCats.${key}`) : catName;
    };
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);
    const [code, setCode] = useState('');
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        university: '',
        bio: '',
        teachSkills: [],
        learnSkills: [],
    });

    const [emailFailed, setEmailFailed] = useState(false);

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        if (step === 3) {
            try {
                const result = await register(form);
                // If server returned the code (email failed), auto-fill it
                if (result?.code) {
                    setCode(result.code);
                    setEmailFailed(true);
                }
                setStep(4);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } else if (step === 4) {
            try {
                await verifyAccount(form.email, code);
                navigate('/dashboard');
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleSkill = (type, skill) => {
        setForm(prev => {
            const arr = prev[type];
            return {
                ...prev,
                [type]: arr.includes(skill) ? arr.filter(s => s !== skill) : [...arr, skill]
            };
        });
    };

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-20 bg-grid">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-neon/5 to-transparent blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl font-bold mb-2">{t('register.title')}</h1>
                    <p className="text-white/40">{t('register.stepOf').replace('{step}', step)}</p>
                    {/* Progress bar */}
                    <div className="flex gap-2 mt-4 max-w-xs mx-auto">
                        {[1, 2, 3, 4].map(s => (
                            <motion.div
                                key={s}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-neon shadow-neon' : 'bg-white/10'
                                    }`}
                                layout
                            />
                        ))}
                    </div>
                </div>

                <div className="glass-card p-8">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Step 1: Basic Info */}
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">{t('register.name')}</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="input-dark"
                                        placeholder={t('register.namePh')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">{t('register.email')}</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="input-dark"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">{t('register.password')}</label>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="input-dark"
                                        placeholder={t('register.passwordPh')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">{t('register.university')}</label>
                                    <select
                                        value={form.university}
                                        onChange={e => setForm({ ...form, university: e.target.value })}
                                        className="input-dark"
                                    >
                                        <option value="">{t('register.universityPh')}</option>
                                        {UNIVERSITIES.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">{t('register.bio')}</label>
                                    <textarea
                                        value={form.bio}
                                        onChange={e => setForm({ ...form, bio: e.target.value })}
                                        className="input-dark resize-none"
                                        rows="3"
                                        placeholder={t('register.bioPh')}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (!form.name || !form.email || !form.password) {
                                            setError(t('register.fillRequired'));
                                            return;
                                        }
                                        setError('');
                                        setStep(2);
                                    }}
                                    className="neon-btn w-full py-3.5 rounded-xl"
                                >
                                    {t('register.next')}
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: Teach Skills */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{t('register.teachTitle')} <span className="neon-text">{t('register.teachTitleHL')}</span>?</h3>
                                    <p className="text-white/40 text-sm mb-4">{t('register.teachSubtitle')}</p>

                                    {/* Category tabs */}
                                    <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                                        {SKILL_CATEGORIES.map((cat, i) => (
                                            <button
                                                key={cat.name}
                                                onClick={() => setActiveCategory(i)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCategory === i
                                                    ? 'bg-neon/15 text-neon border border-neon/25'
                                                    : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'
                                                    }`}
                                            >
                                                {tc(cat.name)}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-2">
                                        {SKILL_CATEGORIES[activeCategory].skills.map(skill => (
                                            <button
                                                key={skill}
                                                onClick={() => toggleSkill('teachSkills', skill)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${form.teachSkills.includes(skill)
                                                    ? 'bg-neon/20 text-neon border border-neon/30 shadow-sm shadow-neon/10'
                                                    : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <SkillIcon skill={skill} size={14} />
                                                {ts(skill)}
                                            </button>
                                        ))}
                                    </div>

                                    {form.teachSkills.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-3 flex flex-wrap gap-1.5"
                                        >
                                            <span className="text-neon/50 text-xs mr-1">{t('register.selected')} ({form.teachSkills.length}):</span>
                                            {form.teachSkills.map(s => (
                                                <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-neon/10 text-neon/70 border border-neon/15 flex items-center gap-1">
                                                    <SkillIcon skill={s} size={10} />
                                                    {ts(s)}
                                                    <button onClick={() => toggleSkill('teachSkills', s)} className="ml-0.5 hover:text-neon">×</button>
                                                </span>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="neon-btn-outline flex-1 py-3 rounded-xl">
                                        ← Назад
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (form.teachSkills.length === 0) {
                                                setError(t('register.selectSkill'));
                                                return;
                                            }
                                            setError('');
                                            setActiveCategory(0);
                                            setStep(3);
                                        }}
                                        className="neon-btn flex-1 py-3 rounded-xl"
                                    >
                                        {t('register.next')}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Learn Skills */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{t('register.learnTitle')} <span className="neon-text">{t('register.learnTitleHL')}</span>?</h3>
                                    <p className="text-white/40 text-sm mb-4">{t('register.learnSubtitle')}</p>

                                    {/* Category tabs */}
                                    <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                                        {SKILL_CATEGORIES.map((cat, i) => (
                                            <button
                                                key={cat.name}
                                                onClick={() => setActiveCategory(i)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCategory === i
                                                    ? 'bg-neon/15 text-neon border border-neon/25'
                                                    : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'
                                                    }`}
                                            >
                                                {tc(cat.name)}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-2">
                                        {SKILL_CATEGORIES[activeCategory].skills.map(skill => (
                                            <button
                                                key={skill}
                                                onClick={() => toggleSkill('learnSkills', skill)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${form.learnSkills.includes(skill)
                                                    ? 'bg-neon/20 text-neon border border-neon/30 shadow-sm shadow-neon/10'
                                                    : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <SkillIcon skill={skill} size={14} />
                                                {ts(skill)}
                                            </button>
                                        ))}
                                    </div>

                                    {form.learnSkills.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-3 flex flex-wrap gap-1.5"
                                        >
                                            <span className="text-neon/50 text-xs mr-1">{t('register.selected')} ({form.learnSkills.length}):</span>
                                            {form.learnSkills.map(s => (
                                                <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-neon/10 text-neon/70 border border-neon/15 flex items-center gap-1">
                                                    <SkillIcon skill={s} size={10} />
                                                    {ts(s)}
                                                    <button onClick={() => toggleSkill('learnSkills', s)} className="ml-0.5 hover:text-neon">×</button>
                                                </span>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(2)} className="neon-btn-outline flex-1 py-3 rounded-xl">
                                        ← Назад
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || form.learnSkills.length === 0}
                                        className="neon-btn flex-1 py-3 rounded-xl disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
                                                {t('register.creating')}
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /></svg>
                                                {t('register.createAccount')}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Verification */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6 text-center"
                            >
                                <div className="w-16 h-16 bg-neon/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon/20">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-neon" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{t('register.checkEmail')}</h3>
                                    <p className="text-white/40 text-sm">
                                        {t('register.codeSent')} <span className="text-white">{form.email}</span>
                                    </p>
                                </div>

                                {emailFailed && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-xl text-sm">
                                        ⚠️ Email не был доставлен. Код подтверждения подставлен автоматически — просто нажмите «Подтвердить».
                                    </div>
                                )}

                                <div className="max-w-[200px] mx-auto">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        value={code}
                                        onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="input-dark text-center text-2xl tracking-[0.5em] font-mono h-14"
                                        placeholder="000000"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && code.length === 6) handleSubmit();
                                        }}
                                    />
                                </div>

                                <p className="text-white/20 text-xs">
                                    {t('register.checkSpam')}
                                </p>

                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setStep(3)} className="neon-btn-outline flex-1 py-3 rounded-xl">
                                        ← Назад
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || code.length !== 6}
                                        className="neon-btn flex-1 py-3 rounded-xl disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
                                                {t('register.verifying')}
                                            </span>
                                        ) : (
                                            t('register.verify')
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-6 text-center">
                    <span className="text-white/30 text-sm">{t('register.hasAccount')} </span>
                    <Link to="/login" className="text-neon text-sm font-medium hover:underline">
                        {t('nav.login')}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
