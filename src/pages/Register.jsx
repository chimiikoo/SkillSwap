import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SKILL_CATEGORIES } from '../data/skills';
import { SKILL_CAT_KEYS } from '../i18n/translations';
import { SkillIcon, GraduationIcon, UsersIcon, GlobeIcon, MapPinIcon, RocketIcon, EyeIcon, EyeOffIcon } from '../components/Icons';
import { normalizeEmail } from '../utils/email';

export default function Register() {
    const { register } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const ts = (skill) => {
        const translated = t(`skillNames.${skill}`);
        return translated === `skillNames.${skill}` ? skill : translated;
    };

    const tc = (catName) => {
        const key = SKILL_CAT_KEYS[catName];
        return key ? t(`skillCats.${key}`) : catName;
    };

    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        userType: '', // 'student' or 'tutor'
        name: '',
        email: '',
        password: '',
        bio: '',
        teachSkills: [],
        learnSkills: [],
        experience: '',
        city: '',
        teachingFormat: '',
        hourlyRate: '',
        phone: '',
        portfolioUrl: '',
        verificationDocFile: null,
    });

    const totalSteps = 5; // role -> info -> teach -> learn/tutor-details -> verify
    const isTutor = form.userType === 'tutor' || form.userType === 'school';
    const isSchool = form.userType === 'school';

    const handleSubmit = async () => {
        setError('');
        setLoading(true);

        if (step === 4) {
            try {
                const payload = {
                    ...form,
                    email: normalizeEmail(form.email) || `fake-${Date.now()}@skillswap.local`,
                    name: form.name.trim() || 'Новый пользователь',
                    bio: form.bio.trim(),
                    city: form.city.trim(),
                    phone: form.phone.trim(),
                    portfolioUrl: form.portfolioUrl.trim(),
                };
                const result = await register(payload);
                if (result?.token) {
                    navigate('/dashboard');
                    return;
                }
                setStep(5);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } else if (step === 5) {
            navigate('/dashboard');
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
                    <p className="text-white/40">{t('register.stepOf').replace('{step}', step > totalSteps ? totalSteps : step).replace('4', totalSteps)}</p>
                    {/* Progress bar */}
                    <div className="flex gap-2 mt-4 max-w-xs mx-auto">
                        {[1, 2, 3, 4, 5].map(s => (
                            <motion.div
                                key={s}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-neon shadow-neon' : 'bg-white/10'}`}
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

                    <AnimatePresence mode="wait">
                        {/* ========== Step 1: Role Selection ========== */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-1">{t('register.roleTitle') || 'Кто вы?'}</h3>
                                    <p className="text-white/40 text-sm">{t('register.roleSubtitle') || 'Выберите свою роль на платформе'}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Student Card */}
                                    <button
                                        onClick={() => setForm(p => ({ ...p, userType: 'student' }))}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 group relative overflow-hidden ${form.userType === 'student'
                                            ? 'border-neon/50 bg-neon/5 shadow-lg shadow-neon/10'
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                                            }`}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neon/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 border transition-all duration-300 ${form.userType === 'student'
                                                ? 'bg-neon/15 border-neon/30 shadow-lg shadow-neon/10'
                                                : 'bg-white/5 border-white/10 group-hover:border-white/20'
                                                }`}>
                                                <GraduationIcon size={32} />
                                            </div>
                                            <h4 className={`text-lg font-bold mb-1 transition-colors ${form.userType === 'student' ? 'text-neon' : 'text-white'}`}>
                                                {t('register.roleStudent') || 'Студент'}
                                            </h4>
                                            <p className="text-white/40 text-sm leading-relaxed">
                                                {t('register.roleStudentDesc') || 'Хочу обмениваться навыками с другими студентами'}
                                            </p>
                                            {form.userType === 'student' && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-neon flex items-center justify-center"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3"><polyline points="20,6 9,17 4,12" /></svg>
                                                </motion.div>
                                            )}
                                        </div>
                                    </button>

                                    {/* Tutor Card */}
                                    <button
                                        onClick={() => setForm(p => ({ ...p, userType: 'tutor' }))}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 group relative overflow-hidden ${form.userType === 'tutor'
                                            ? 'border-neon/50 bg-neon/5 shadow-lg shadow-neon/10'
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                                            }`}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neon/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 border transition-all duration-300 ${form.userType === 'tutor'
                                                ? 'bg-neon/15 border-neon/30 shadow-lg shadow-neon/10'
                                                : 'bg-white/5 border-white/10 group-hover:border-white/20'
                                                }`}>
                                                <UsersIcon size={32} />
                                            </div>
                                            <h4 className={`text-lg font-bold mb-1 transition-colors ${form.userType === 'tutor' ? 'text-neon' : 'text-white'}`}>
                                                {t('register.roleTutor') || 'Репетитор'}
                                            </h4>
                                            <p className="text-white/40 text-sm leading-relaxed">
                                                {t('register.roleTutorDesc') || 'Хочу преподавать и делиться своими знаниями'}
                                            </p>
                                            {form.userType === 'tutor' && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-neon flex items-center justify-center"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3"><polyline points="20,6 9,17 4,12" /></svg>
                                                </motion.div>
                                            )}
                                        </div>
                                    </button>

                                    {/* School Card */}
                                    <button
                                        onClick={() => setForm(p => ({ ...p, userType: 'school' }))}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 group relative overflow-hidden ${form.userType === 'school'
                                            ? 'border-neon/50 bg-neon/5 shadow-lg shadow-neon/10'
                                            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                                            }`}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-neon/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 border transition-all duration-300 ${form.userType === 'school'
                                                ? 'bg-neon/15 border-neon/30 shadow-lg shadow-neon/10'
                                                : 'bg-white/5 border-white/10 group-hover:border-white/20'
                                                }`}>
                                                <RocketIcon size={32} />
                                            </div>
                                            <h4 className={`text-lg font-bold mb-1 transition-colors ${form.userType === 'school' ? 'text-neon' : 'text-white'}`}>
                                                {t('register.roleSchool') || 'Школа / Курсы'}
                                            </h4>
                                            <p className="text-white/40 text-sm leading-relaxed">
                                                {t('register.roleSchoolDesc') || 'Мы предлагаем профессиональные курсы и обучение'}
                                            </p>
                                            {form.userType === 'school' && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-neon flex items-center justify-center"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="3"><polyline points="20,6 9,17 4,12" /></svg>
                                                </motion.div>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        if (!form.userType) {
                                            setError(t('register.selectRole') || 'Выберите роль');
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

                        {/* ========== Step 2: Basic Info ========== */}
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
                                    <label className="block text-sm text-white/50 mb-2">
                                        {form.userType === 'school' ? (t('register.nameSchool') || 'Название школы/курса') : t('register.name')}
                                    </label>
                                    <input type="text" value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="input-dark" placeholder={form.userType === 'school' ? 'SkillSwap Academy' : t('register.namePh')} required />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">{t('register.email')}</label>
                                    <input type="text" value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="input-dark" placeholder="skillswap@local" required />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">{t('register.password')}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className="input-dark pr-12"
                                            placeholder={t('register.passwordPh')}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-neon transition-colors"
                                        >
                                            {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">{t('register.bio')}</label>
                                    <textarea value={form.bio}
                                        onChange={e => setForm({ ...form, bio: e.target.value })}
                                        className="input-dark resize-none" rows="3" 
                                        placeholder={form.userType === 'school' 
                                            ? (t('register.bioSchoolPh') || 'Расскажите об истории вашей школы, успехах и методиках обучения') 
                                            : t('register.bioPh')} />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="neon-btn-outline flex-1 py-3 rounded-xl">
                                        ← {t('register.back') || 'Назад'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!form.name || !form.email || !form.password) {
                                                setError(t('register.fillRequired'));
                                                return;
                                            }
                                            setError('');
                                            setStep(3);
                                        }}
                                        className="neon-btn flex-1 py-3 rounded-xl"
                                    >
                                        {t('register.next')}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ========== Step 3: Teach Skills ========== */}
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
                                    <h3 className="text-lg font-bold mb-1">
                                        {isTutor
                                            ? (t('register.tutorTeachTitle') || 'Что вы преподаёте?')
                                            : (<>{t('register.teachTitle')} <span className="neon-text">{t('register.teachTitleHL')}</span>?</>)
                                        }
                                    </h3>
                                    <p className="text-white/40 text-sm mb-4">
                                        {isTutor
                                            ? (t('register.tutorTeachSubtitle') || 'Выберите области которые вы преподаёте')
                                            : t('register.teachSubtitle')
                                        }
                                    </p>

                                    <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                                        {SKILL_CATEGORIES.map((cat, i) => (
                                            <button key={cat.name} onClick={() => setActiveCategory(i)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCategory === i
                                                    ? 'bg-neon/15 text-neon border border-neon/25'
                                                    : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'
                                                    }`}>
                                                {tc(cat.name)}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-2">
                                        {SKILL_CATEGORIES[activeCategory].skills.map(skill => (
                                            <button key={skill} onClick={() => toggleSkill('teachSkills', skill)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${form.teachSkills.includes(skill)
                                                    ? 'bg-neon/20 text-neon border border-neon/30 shadow-sm shadow-neon/10'
                                                    : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                                                    }`}>
                                                <SkillIcon skill={skill} size={14} />
                                                {ts(skill)}
                                            </button>
                                        ))}
                                    </div>

                                    {form.teachSkills.length > 0 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex flex-wrap gap-1.5">
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
                                    <button onClick={() => setStep(2)} className="neon-btn-outline flex-1 py-3 rounded-xl">
                                        ← {t('register.back') || 'Назад'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (form.teachSkills.length === 0) {
                                                setError(t('register.selectSkill'));
                                                return;
                                            }
                                            setError('');
                                            setActiveCategory(0);
                                            setStep(4);
                                        }}
                                        className="neon-btn flex-1 py-3 rounded-xl"
                                    >
                                        {t('register.next')}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ========== Step 4: Learn Skills (Student) OR Tutor Details ========== */}
                        {step === 4 && !isTutor && (
                            <motion.div
                                key="step4-student"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <div>
                                    <h3 className="text-lg font-bold mb-1">{t('register.learnTitle')} <span className="neon-text">{t('register.learnTitleHL')}</span>?</h3>
                                    <p className="text-white/40 text-sm mb-4">{t('register.learnSubtitle')}</p>

                                    <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                                        {SKILL_CATEGORIES.map((cat, i) => (
                                            <button key={cat.name} onClick={() => setActiveCategory(i)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeCategory === i
                                                    ? 'bg-neon/15 text-neon border border-neon/25'
                                                    : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'
                                                    }`}>
                                                {tc(cat.name)}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-2">
                                        {SKILL_CATEGORIES[activeCategory].skills.map(skill => (
                                            <button key={skill} onClick={() => toggleSkill('learnSkills', skill)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${form.learnSkills.includes(skill)
                                                    ? 'bg-neon/20 text-neon border border-neon/30 shadow-sm shadow-neon/10'
                                                    : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                                                    }`}>
                                                <SkillIcon skill={skill} size={14} />
                                                {ts(skill)}
                                            </button>
                                        ))}
                                    </div>

                                    {form.learnSkills.length > 0 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex flex-wrap gap-1.5">
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
                                    <button onClick={() => setStep(3)} className="neon-btn-outline flex-1 py-3 rounded-xl">
                                        ← {t('register.back') || 'Назад'}
                                    </button>
                                    <button onClick={handleSubmit}
                                        disabled={loading || form.learnSkills.length === 0}
                                        className="neon-btn flex-1 py-3 rounded-xl disabled:opacity-50">
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
                                                {t('register.creating')}
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <RocketIcon size={18} />
                                                {t('register.createAccount')}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ========== Step 4: Tutor Details ========== */}
                        {step === 4 && isTutor && (
                            <motion.div
                                key="step4-tutor"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                <div className="text-center mb-2">
                                    <h3 className="text-lg font-bold mb-1">
                                        {form.userType === 'school'
                                            ? (t('register.schoolDetailsTitle') || 'Информация о школе/курсах')
                                            : (t('register.tutorDetailsTitle') || 'Расскажите о себе как о репетиторе')}
                                    </h3>
                                    <p className="text-white/40 text-sm">
                                        {t('register.tutorDetailsSubtitle') || 'Эта информация поможет студентам найти вас'}
                                    </p>
                                </div>

                                {/* Experience */}
                                <div>
                                     <label className="block text-sm text-white/50 mb-2">
                                        {form.userType === 'school'
                                            ? (t('register.marketYearsLabel') || 'Лет на рынке')
                                            : (t('register.experienceLabel') || 'Опыт преподавания (лет)')}
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {['0-1', '1-3', '3-5', '5-10', '10+'].map(opt => (
                                            <button key={opt}
                                                onClick={() => setForm(p => ({ ...p, experience: opt }))}
                                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${form.experience === opt
                                                    ? 'bg-neon/15 text-neon border-neon/30 shadow-sm shadow-neon/10'
                                                    : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20'
                                                    }`}>
                                                {opt} {t('register.years') || 'лет'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">
                                        {t('register.cityLabel') || 'Город'}
                                    </label>
                                    <input type="text" value={form.city}
                                        onChange={e => setForm({ ...form, city: e.target.value })}
                                        className="input-dark"
                                        placeholder={t('register.cityPh') || 'Например: Бишкек'} />
                                </div>

                                {/* Teaching Format */}
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">
                                        {t('register.formatLabel') || 'Формат обучения'}
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'online', label: t('register.formatOnline') || 'Онлайн', icon: '🌐' },
                                            { value: 'offline', label: t('register.formatOffline') || 'Офлайн', icon: '🏫' },
                                            { value: 'both', label: t('register.formatBoth') || 'Оба', icon: '🔀' },
                                        ].map(opt => (
                                            <button key={opt.value}
                                                type="button"
                                                onClick={() => setForm(p => ({ ...p, teachingFormat: opt.value }))}
                                                className={`p-3 rounded-xl text-center transition-all border ${form.teachingFormat === opt.value
                                                    ? 'bg-neon/15 text-neon border-neon/30 shadow-sm shadow-neon/10'
                                                    : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20'
                                                    }`}>
                                                <div className="text-2xl mb-1 flex justify-center">
                                                    {opt.value === 'online' ? <GlobeIcon size={24} /> : opt.value === 'offline' ? <MapPinIcon size={24} /> : <UsersIcon size={24} />}
                                                </div>
                                                <div className="text-xs font-medium">{opt.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Телефон для связи *</label>
                                    <input type="tel" value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        className="input-dark"
                                        placeholder="+996 555 123 456" />
                                </div>

                                {/* Portfolio */}
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Ссылка на портфолио / LinkedIn *</label>
                                    <input type="url" value={form.portfolioUrl}
                                        onChange={e => setForm({ ...form, portfolioUrl: e.target.value })}
                                        className="input-dark"
                                        placeholder="https://linkedin.com/in/..." />
                                </div>

                                {/* Verification document */}
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">Документ (диплом / сертификат) — опционально</label>
                                    <input type="file" accept="image/*,.pdf"
                                        onChange={e => setForm({ ...form, verificationDocFile: e.target.files?.[0] || null })}
                                        className="input-dark file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-neon/20 file:text-neon text-sm" />
                                    <p className="text-white/30 text-xs mt-1">Профиль будет проверен модератором в течение 24–48 часов</p>
                                </div>

                                {/* Hourly Rate */}
                                <div>
                                    <label className="block text-sm text-white/50 mb-2">
                                        {form.userType === 'school'
                                            ? (t('register.courseRateLabel') || 'Стоимость курса (сом)')
                                            : (t('register.hourlyRateLabel') || 'Стоимость часа (сом)')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={form.hourlyRate}
                                            onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
                                            className="input-dark pl-12"
                                            placeholder={form.userType === 'school' ? 'Например: 15000' : (t('register.hourlyRatePh') || 'Например: 500')}
                                        />
                                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-medium">
                                            SOM
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setStep(3)} className="neon-btn-outline flex-1 py-3 rounded-xl">
                                        ← {t('register.back') || 'Назад'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!form.experience) {
                                                setError(t('register.fillExperience') || 'Укажите опыт');
                                                return;
                                            }
                                            if (!form.city.trim()) {
                                                setError(t('register.fillCity') || 'Укажите город');
                                                return;
                                            }
                                            if (!form.teachingFormat) {
                                                setError(t('register.fillFormat') || 'Выберите формат');
                                                return;
                                            }
                                            if (!form.hourlyRate) {
                                                setError(t('register.fillHourlyRate') || 'Укажите стоимость');
                                                return;
                                            }
                                            if (!form.phone?.trim()) {
                                                setError('Укажите телефон');
                                                return;
                                            }
                                            if (!form.portfolioUrl?.trim()) {
                                                setError('Укажите ссылку на портфолио');
                                                return;
                                            }
                                            setError('');
                                            handleSubmit();
                                        }}
                                        disabled={loading}
                                        className="neon-btn flex-1 py-3 rounded-xl disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
                                                {t('register.creating')}
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                {form.userType === 'school' ? '🏫' : '👨‍🏫'}
                                                {form.userType === 'school'
                                                    ? (t('register.createSchoolAccount') || 'Создать аккаунт школы')
                                                    : (t('register.createTutorAccount') || 'Создать аккаунт репетитора')}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ========== Step 5: Verification ========== */}
                        {step === 5 && (
                            <motion.div
                                key="step5"
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
                                    <input type="text" maxLength="6" value={code}
                                        onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="input-dark text-center text-2xl tracking-[0.5em] font-mono h-14"
                                        placeholder="000000" autoFocus
                                        onKeyDown={(e) => { if (e.key === 'Enter' && code.length === 6) handleSubmit(); }} />
                                </div>

                                <p className="text-white/20 text-xs">{t('register.checkSpam')}</p>

                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setStep(4)} className="neon-btn-outline flex-1 py-3 rounded-xl">
                                        ← {t('register.back') || 'Назад'}
                                    </button>
                                    <button onClick={handleSubmit} disabled={loading || code.length !== 6}
                                        className="neon-btn flex-1 py-3 rounded-xl disabled:opacity-50">
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></div>
                                                {t('register.verifying')}
                                            </span>
                                        ) : t('register.verify')}
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
