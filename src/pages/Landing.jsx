import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Landing() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/register');
    };

    return (
        <div className="min-h-screen bg-[#0F0F11] text-white font-sans selection:bg-[#A3FF12] selection:text-black overflow-x-hidden">
            
            {/* BACKGROUND GLOWS */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#A3FF12]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#A3FF12]/5 blur-[100px] rounded-full pointer-events-none" />

            {/* 1. HERO SECTION */}
            <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center z-10">
                <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        Подберем тебе лучший способ обучения за 5 минут — <span className="text-[#A3FF12]">бесплатно</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Найди наставника или курс по английскому, дизайну или программированию без долгих поисков.
                    </p>
                    
                    <button 
                        onClick={handleStart}
                        className="w-full sm:w-auto bg-[#A3FF12] text-black text-lg font-bold py-5 px-10 rounded-2xl hover:bg-[#b0ff2e] transform hover:scale-[1.02] transition-all active:scale-95 shadow-[0_0_30px_rgba(163,255,18,0.3)]"
                    >
                        Начать подбор
                    </button>
                    
                    <div className="mt-5 text-sm text-white/40 flex flex-wrap items-center justify-center gap-2">
                        <span>Бесплатно</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        <span>Без обязательств</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        <span>Ответ в течение 10 минут</span>
                    </div>
                </motion.div>
            </section>

            {/* 2. HOW IT WORKS */}
            <section className="py-20 px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-12">Как это работает?</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-[#A3FF12]/10 text-[#A3FF12] flex items-center justify-center text-xl font-bold mb-6">1</div>
                            <h3 className="text-xl font-bold mb-3">Регистрация</h3>
                            <p className="text-white/50 text-sm">Создай аккаунт и укажи свои цели обучения.</p>
                        </div>
                        
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-[#A3FF12]/10 text-[#A3FF12] flex items-center justify-center text-xl font-bold mb-6">2</div>
                            <h3 className="text-xl font-bold mb-3">Подбор ИИ</h3>
                            <p className="text-white/50 text-sm">Наш алгоритм найдет лучшего ментора или курс под твой бюджет.</p>
                        </div>
                        
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-[#A3FF12]/10 text-[#A3FF12] flex items-center justify-center text-xl font-bold mb-6">3</div>
                            <h3 className="text-xl font-bold mb-3">Обучение</h3>
                            <p className="text-white/50 text-sm">Приступай к занятиям и достигай результатов.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. SOCIAL PROOF */}
            <section className="py-20 px-4 bg-white/[0.01] border-y border-white/5 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                        Уже <span className="text-[#A3FF12]">100+</span> студентов нашли обучение через SkillSwap
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-white/[0.03] rounded-3xl p-8 border border-white/5">
                            <div className="flex gap-1 mb-4 text-[#A3FF12]">★★★★★</div>
                            <p className="text-white/80 italic mb-6">«Подобрали крутого ментора по дизайну за 1 день. Раньше сам искал неделями.»</p>
                            <div className="font-bold text-sm">— Азамат</div>
                        </div>

                        <div className="bg-white/[0.03] rounded-3xl p-8 border border-white/5">
                            <div className="flex gap-1 mb-4 text-[#A3FF12]">★★★★★</div>
                            <p className="text-white/80 italic mb-6">«Нашел курс по английскому дешевле и лучше, чем искал сам. Спасибо!»</p>
                            <div className="font-bold text-sm">— Бектур</div>
                        </div>

                        <div className="bg-white/[0.03] rounded-3xl p-8 border border-white/5 sm:col-span-2 md:col-span-1">
                            <div className="flex gap-1 mb-4 text-[#A3FF12]">★★★★★</div>
                            <p className="text-white/80 italic mb-6">«Очень удобно — не нужно серфить по разным агрегаторам и сайтам.»</p>
                            <div className="font-bold text-sm">— Алина</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. FINAL CTA */}
            <section className="py-32 px-4 text-center relative z-10">
                <div className="max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-8">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Осталось 20 бесплатных подборов на сегодня
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-bold mb-10">Начни обучение уже сегодня</h2>
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
