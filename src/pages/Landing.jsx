import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { VerifiedBadge, isTutorVerified } from '../components/VerifiedBadge';
import { SkillIcon } from '../components/Icons';
import { resolveFileUrl } from '../utils/resolveFileUrl';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Landing() {
    const navigate = useNavigate();
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/users/featured`)
            .then(r => r.json())
            .then(d => setFeatured(d.tutors || []))
            .catch(() => setFeatured([]));
    }, []);

    const handleStart = () => navigate('/register');

    return (
        <div className="min-h-screen bg-[#0F0F11] text-white font-sans selection:bg-[#A3FF12] selection:text-black overflow-x-hidden">
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#A3FF12]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#A3FF12]/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-radial from-[#A3FF12]/5 to-transparent blur-3xl pointer-events-none opacity-50" />

            <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center z-10">
                <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-white/50 text-sm mb-8">
                        Прозрачные отзывы · Проверенные репетиторы
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight font-display">
                        Подберем тебе лучший способ обучения за 5 минут — <span className="text-[#A3FF12]">бесплатно</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Найди проверенного наставника по английскому, дизайну или программированию — без долгих поисков в Telegram.
                    </p>

                    <button
                        onClick={handleStart}
                        className="w-full sm:w-auto bg-[#A3FF12] text-black text-lg font-bold py-5 px-10 rounded-2xl hover:bg-[#b0ff2e] transform hover:scale-[1.02] transition-all active:scale-95 shadow-[0_0_30px_rgba(163,255,18,0.3)]"
                    >
                        Начать подбор
                    </button>

                    <div className="mt-5 text-sm text-white/40 flex flex-wrap items-center justify-center gap-2">
                        <span>Бесплатно для студентов</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <span>Проверенные репетиторы</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <span>Ответ в течение 24 ч</span>
                    </div>
                </motion.div>
            </section>

            <section className="py-16 px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Как это работает?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { n: '1', title: 'Регистрация', desc: 'Укажи навыки, которые хочешь изучать.' },
                            { n: '2', title: 'Умный подбор', desc: 'Алгоритм найдёт репетиторов под твой бюджет и цели.' },
                            { n: '3', title: 'Занятия', desc: 'Запишись и договорись о времени в чате.' },
                        ].map(step => (
                            <div key={step.n} className="glass-card p-8 flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-[#A3FF12]/10 text-[#A3FF12] flex items-center justify-center text-xl font-bold mb-6">{step.n}</div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-white/50 text-sm">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {featured.length > 0 && (
                <section className="py-16 px-4 border-y border-white/5 bg-white/[0.01] relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold">Топ репетиторы</h2>
                                <p className="text-white/40 text-sm mt-1">Проверены модерацией SkillSwap</p>
                            </div>
                            <Link to="/login" className="text-[#A3FF12] text-sm font-medium hover:underline">
                                Смотреть всех →
                            </Link>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featured.map(t => (
                                <div key={t.id} className="glass-card-hover p-5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center text-neon font-bold overflow-hidden">
                                            {t.avatarUrl ? (
                                                <img src={resolveFileUrl(t.avatarUrl)} alt="" className="w-full h-full object-cover" />
                                            ) : t.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold flex items-center gap-1.5 text-sm">
                                                {t.name}
                                                {isTutorVerified(t) && <VerifiedBadge size={14} />}
                                            </h3>
                                            <p className="text-white/40 text-xs">{t.city} · ★ {t.rating?.toFixed(1)}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {t.teachSkills?.slice(0, 3).map(s => (
                                            <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-neon/5 text-neon/70 border border-neon/10 flex items-center gap-1">
                                                <SkillIcon skill={s} size={10} />{s}
                                            </span>
                                        ))}
                                    </div>
                                    {t.hourlyRate > 0 && (
                                        <p className="text-neon text-sm font-bold">{t.hourlyRate} сом/час</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="py-20 px-4 bg-white/[0.01] relative z-10">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                        Уже <span className="text-[#A3FF12]">100+</span> студентов нашли обучение через SkillSwap
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {[
                            { text: '«Подобрали крутого ментора по дизайну за 1 день. Раньше сам искал неделями.»', author: 'Азамат' },
                            { text: '«Нашел репетитора по английскому с отзывами — намного удобнее Telegram.»', author: 'Бектур' },
                            { text: '«Прозрачно и безопасно — видно рейтинг и опыт преподавателя.»', author: 'Алина' },
                        ].map((r, i) => (
                            <div key={i} className="glass-card p-8">
                                <div className="flex gap-1 mb-4 text-[#A3FF12]">★★★★★</div>
                                <p className="text-white/80 italic mb-6">{r.text}</p>
                                <div className="font-bold text-sm">— {r.author}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-32 px-4 text-center relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon/10 border border-neon/20 text-neon text-sm font-medium mb-8">
                        <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                        Бета-запуск — регистрируйтесь бесплатно
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-10 font-display">Начни обучение уже сегодня</h2>
                    <button
                        onClick={handleStart}
                        className="w-full sm:w-auto bg-[#A3FF12] text-black text-xl font-bold py-6 px-12 rounded-2xl hover:bg-[#b0ff2e] transform hover:scale-[1.02] transition-all active:scale-95 shadow-[0_0_40px_rgba(163,255,18,0.3)]"
                    >
                        Начать сейчас
                    </button>
                </div>
            </section>
        </div>
    );
}
