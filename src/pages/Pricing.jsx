import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Pricing() {
    return (
        <div className="min-h-screen bg-dark pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="font-display text-3xl font-bold mb-2">Тарифы SkillSwap</h1>
                    <p className="text-white/40 mb-10">Прозрачная модель для бета-запуска</p>

                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h2 className="font-bold text-neon mb-2">Студенты</h2>
                            <p className="text-3xl font-bold mb-2">0 сом</p>
                            <p className="text-white/50 text-sm">Поиск, подбор, чат и запись — бесплатно. Оплата урока — репетитору (в бете — по договорённости в чате).</p>
                        </div>
                        <div className="glass-card p-6">
                            <h2 className="font-bold text-neon mb-2">Репетиторы</h2>
                            <p className="text-white/50 text-sm mb-3">Комиссия платформы с урока (после подключения оплаты):</p>
                            <p className="text-3xl font-bold mb-2">15%</p>
                            <p className="text-white/40 text-xs">Пример: урок 1000 сом → 850 репетитору, 150 платформе</p>
                            <p className="text-white/50 text-sm mt-4">Premium: 299–999 сом/мес — приоритет в выдаче</p>
                            <p className="text-white/50 text-sm">Продвижение профиля: от 500 сом / 7 дней</p>
                        </div>
                        <div className="glass-card p-6 opacity-70">
                            <h2 className="font-bold mb-2">Школы и курсы</h2>
                            <p className="text-white/50 text-sm">Скоро: публикация курса от 2000 сом/мес</p>
                        </div>
                    </div>

                    <Link to="/register" className="neon-btn inline-block mt-10 px-8 py-4 rounded-xl font-bold">
                        Начать бесплатно
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
