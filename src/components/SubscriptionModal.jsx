import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
    SparklesIcon,
    PaletteIcon,
    StarIcon,
    RocketIcon,
    BrainIcon,
    CoinIcon
} from '../components/Icons';

export default function SubscriptionModal({ isOpen, onClose }) {
    const { language } = useLanguage();
    const { apiFetch, user } = useAuth();
    const isRu = language === 'ru';
    const [loading, setLoading] = React.useState(null);

    const baseFeaturesStudent = [
        { icon: SparklesIcon, ru: '1 Месяц БЕСПЛАТНО', en: '1 Month FREE' },
        { icon: StarIcon, ru: 'ИИ-подбор репетиторов', en: 'AI tutor matching' },
        { icon: PaletteIcon, ru: 'Специальный набор стикеров', en: 'Special sticker pack' },
        { icon: RocketIcon, ru: 'Без рекламы', en: 'Ad-free experience' },
        { icon: BrainIcon, ru: 'Приоритетная поддержка', en: 'Priority support' }
    ];

    const baseFeaturesTutor = [
        { icon: SparklesIcon, ru: '1 Месяц БЕСПЛАТНО', en: '1 Month FREE' },
        { icon: StarIcon, ru: 'Приоритет в поиске учеников', en: 'Priority student search' },
        { icon: RocketIcon, ru: 'Неограниченное число сессий', en: 'Unlimited sessions' },
        { icon: BrainIcon, ru: 'AI рекомендации', en: 'AI growth recommendations' },
        { icon: PaletteIcon, ru: 'Значок Verified', en: 'Verified badge' }
    ];

    const baseFeaturesSchool = [
        { icon: SparklesIcon, ru: '1 Месяц БЕСПЛАТНО', en: '1 Month FREE' },
        { icon: StarIcon, ru: 'Безлимитное размещение курсов', en: 'Unlimited course listings' },
        { icon: RocketIcon, ru: 'Студенты от нейросети', en: 'AI student leads' },
        { icon: PaletteIcon, ru: 'Брендированная страница', en: 'Branded profile page' },
        { icon: BrainIcon, ru: 'Аналитика популярности', en: 'Popularity analytics' }
    ];

    const userType = user?.userType || 'student';
    let monthlyPrice = '199';
    let yearlyPrice = '1990';
    let activeFeatures = baseFeaturesStudent;
    let planDescRu = '1 месяц БЕСПЛАТНО';
    let planDescEn = '1 Month FREE';
    let planNameRu = 'Студент';
    let planNameEn = 'Student';

    if (userType === 'tutor') {
        monthlyPrice = '399';
        yearlyPrice = '3990';
        activeFeatures = baseFeaturesTutor;
        planNameRu = 'Репетитор';
        planNameEn = 'Tutor';
    } else if (userType === 'school') {
        monthlyPrice = '990';
        yearlyPrice = '9990';
        activeFeatures = baseFeaturesSchool;
        planNameRu = 'Школа / Курс';
        planNameEn = 'School / Course';
    }

    const plans = [
        {
            id: 'monthly',
            name: `${planNameEn} Monthly`,
            nameRu: `${planNameRu} (Месяц)`,
            price: monthlyPrice,
            period: 'month',
            periodRu: 'месяц',
            currency: 'СОМ',
            features: activeFeatures,
            popular: true,
            descRu: planDescRu,
            descEn: planDescEn
        },
        {
            id: 'yearly',
            name: `${planNameEn} Yearly`,
            nameRu: `${planNameRu} (Год)`,
            price: yearlyPrice,
            period: 'year',
            periodRu: 'год',
            currency: 'СОМ',
            features: [
                ...activeFeatures,
                { icon: CoinIcon, ru: '2 месяца бесплатно', en: '2 months free' }
            ],
            popular: false,
            descRu: 'Выгодное предложение',
            descEn: 'Best value'
        }
    ];

    const handleSubscribe = async (planId) => {
        setLoading(planId);
        try {
            const data = await apiFetch('/stripe/create-checkout-session', {
                method: 'POST',
                body: JSON.stringify({ planId, userType })
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
                                            ? '1 месяц БЕСПЛАТНО пробная версия для всех тарифов. Затем списывается ежемесячная плата. Отмените в любой момент.'
                                            : '1 month FREE trial for all plans. Then billed monthly. Cancel anytime.'}
                                    </p>
                                </motion.div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                                {plans.map((plan, index) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        className={`relative group p-6 md:p-8 rounded-xl md:rounded-2xl border transition-all duration-300 flex flex-col h-full ${plan.popular
                                            ? 'bg-white/[0.03] border-neon/50 md:scale-105 shadow-2xl shadow-neon/10'
                                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-neon text-dark text-xs font-bold rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(163,255,18,0.5)]">
                                                {isRu ? 'Популярный' : 'Popular'}
                                            </div>
                                        )}

                                        <div className="mb-5 md:mb-8 min-h-[140px] flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg md:text-xl font-bold text-white/90 mb-1 md:mb-2">
                                                    {isRu ? plan.nameRu : plan.name}
                                                </h3>
                                                <div className="flex flex-col gap-1">
                                                    {plan.originalPrice && (
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-white/30 line-through text-sm md:text-base">{plan.originalPrice} {plan.currency}</span>
                                                            <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                                                                -{plan.discount}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl md:text-4xl font-display font-bold text-white">{plan.price} {plan.currency}</span>
                                                        <span className="text-white/40 text-sm md:text-base">/{isRu ? plan.periodRu : plan.period}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="mt-2 py-1.5 px-3 bg-neon/10 border border-neon/30 rounded-lg text-[10px] md:text-xs text-neon font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
                                                    <SparklesIcon size={12} />
                                                    {isRu ? plan.descRu : plan.descEn}
                                                </div>
                                            </div>
                                        </div>

                                        <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-grow">
                                            {plan.features.map((feature, fIndex) => (
                                                <li key={fIndex} className="flex gap-3 text-sm text-white/60 group-hover:text-white/80 transition-colors">
                                                    {feature.icon ? (
                                                        <feature.icon size={18} className="text-neon flex-shrink-0" />
                                                    ) : (
                                                        <svg className="w-5 h-5 text-neon flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
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
