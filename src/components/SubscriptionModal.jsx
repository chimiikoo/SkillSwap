import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const plans = [
    {
        id: 'weekly',
        name: 'Weekly',
        nameRu: 'Недельная',
        price: '2.49',
        period: 'week',
        periodRu: 'неделя',
        features: [
            { ru: 'Расширенная AI поддержка', en: 'Extended AI support' },
            { ru: 'Специальный стикерпак', en: 'Special sticker pack' },
            { ru: 'Приоритет в рекомендациях (для репетиторов)', en: 'Priority in recommendations (for tutors)' },
            { ru: 'Неограниченное число сессий (для студентов)', en: 'Unlimited sessions (for students)' }
        ],
        color: 'from-blue-500 to-indigo-600',
        glow: 'shadow-blue-500/20'
    },
    {
        id: 'monthly',
        name: 'Monthly',
        nameRu: 'Месячная',
        price: '4.99',
        period: 'month',
        periodRu: 'месяц',
        features: [
            { ru: 'Расширенная AI поддержка', en: 'Extended AI support' },
            { ru: 'Специальный стикерпак', en: 'Special sticker pack' },
            { ru: 'Приоритет в рекомендациях (для репетиторов)', en: 'Priority in recommendations (for tutors)' },
            { ru: 'Неограниченное число сессий (для студентов)', en: 'Unlimited sessions (for students)' },
            { ru: 'AI рекомендации', en: 'AI recommendations' }
        ],
        popular: true,
        color: 'from-neon to-emerald-500',
        glow: 'shadow-neon/20'
    },
    {
        id: 'yearly',
        name: 'Yearly',
        nameRu: 'Годовая',
        price: '47.99',
        period: 'year',
        periodRu: 'год',
        features: [
            { ru: 'Расширенная AI поддержка', en: 'Extended AI support' },
            { ru: 'Специальный стикерпак', en: 'Special sticker pack' },
            { ru: 'Приоритет в рекомендациях (для репетиторов)', en: 'Priority in recommendations (for tutors)' },
            { ru: 'Неограниченное число сессий (для студентов)', en: 'Unlimited sessions (for students)' },
            { ru: 'AI рекомендации', en: 'AI recommendations' },
            { ru: 'Экономия 20%', en: 'Save 20%' }
        ],
        color: 'from-purple-500 to-pink-600',
        glow: 'shadow-purple-500/20'
    }
];

export default function SubscriptionModal({ isOpen, onClose }) {
    const { language } = useLanguage();
    const { apiFetch, user } = useAuth();
    const isRu = language === 'ru';
    const [loading, setLoading] = React.useState(null);

    const handleSubscribe = async (planId) => {
        setLoading(planId);
        try {
            const data = await apiFetch('/stripe/create-checkout-session', {
                method: 'POST',
                body: JSON.stringify({ planId })
            });

            if (data.mockSuccess) {
                // Testing locally without real Stripe
                alert(isRu ? 'Оплата прошла (Mock mode)' : 'Payment successful (Mock mode)');
                onClose();
                window.location.reload();
            } else if (data.url) {
                // Redirect user to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err) {
            console.error('Subscription error:', err);
            alert(isRu ? 'Ошибка при оформлении подписки' : 'Error subscribing');
        } finally {
            setLoading(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 md:py-10 pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-dark/90 backdrop-blur-md pointer-events-auto"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-5xl max-h-full overflow-y-auto bg-dark-200 border border-white/10 rounded-2xl md:rounded-3xl glass-card shadow-2xl pointer-events-auto scrollbar-hide"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-30"
                        >
                            <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-6 md:p-10 relative z-20">
                            <div className="text-center mb-6 md:mb-10">
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <span className="px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-neon/10 text-neon text-xs md:text-sm font-bold tracking-wider uppercase mb-3 md:mb-4 inline-block mt-4 md:mt-0">
                                        SkillSwap Premium
                                    </span>
                                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white mb-2 md:mb-4 leading-tight">
                                        {isRu ? 'Раскрой свой потенциал' : 'Unlock Your Potential'}
                                    </h2>
                                    <p className="text-white/60 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
                                        {isRu
                                            ? 'Присоединяйтесь к премиум сообществу и получите доступ к эксклюзивным функциям SkillSwap AI.'
                                            : 'Join the premium community and get access to exclusive SkillSwap AI features.'}
                                    </p>
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {plans.map((plan, index) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        className={`relative group p-6 md:p-8 rounded-xl md:rounded-2xl border transition-all duration-300 ${plan.popular
                                            ? 'bg-white/[0.03] border-neon/50 md:scale-105 shadow-2xl shadow-neon/10'
                                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-neon text-dark text-xs font-bold rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(163,255,18,0.5)]">
                                                {isRu ? 'Популярный' : 'Popular'}
                                            </div>
                                        )}

                                        <div className="mb-5 md:mb-8">
                                            <h3 className="text-lg md:text-xl font-bold text-white/90 mb-1 md:mb-2">
                                                {isRu ? plan.nameRu : plan.name}
                                            </h3>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl md:text-4xl font-display font-bold text-white">${plan.price}</span>
                                                <span className="text-white/40 text-sm md:text-base">/{isRu ? plan.periodRu : plan.period}</span>
                                            </div>
                                        </div>

                                        <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                                            {plan.features.map((feature, fIndex) => (
                                                <li key={fIndex} className="flex gap-3 text-sm text-white/60 group-hover:text-white/80 transition-colors">
                                                    <svg className="w-5 h-5 text-neon flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {isRu ? feature.ru : feature.en}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleSubscribe(plan.id)}
                                            disabled={loading === plan.id}
                                            className={`w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all duration-300 transform active:scale-95 ${plan.popular
                                                ? 'bg-neon text-dark hover:shadow-neon shadow-[0_0_20px_rgba(163,255,18,0.3)]'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                                }`}>
                                            {loading === plan.id ? (isRu ? 'Оформление...' : 'Processing...') : (isRu ? 'Выбрать тариф' : 'Get Started')}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>

                            <p className="mt-6 md:mt-10 text-center text-white/30 text-xs md:text-sm">
                                {isRu
                                    ? 'Оплата производится безопасно. Вы можете отменить подписку в любое время.'
                                    : 'Payments are secure. You can cancel your subscription at any time.'}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
