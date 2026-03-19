import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CoinIcon, SparklesIcon, RocketIcon } from './Icons';

export default function TopUpModal({ isOpen, onClose }) {
    const { t } = useLanguage();
    const { apiFetch, user } = useAuth();
    const [amount, setAmount] = useState('100');
    const [loading, setLoading] = useState(false);

    const presetAmounts = ['50', '100', '250', '500', '1000'];

    const handleTopUp = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('/wallet/topup', {
                method: 'POST',
                body: JSON.stringify({ amount: parseInt(amount) })
            });

            if (data.url) {
                window.location.href = data.url;
            } else {
                // Mock success for development
                alert(`Успешно! Ваш баланс пополнен на ${amount} SkillCoins. (Mock mode)`);
                onClose();
                window.location.reload();
            }
        } catch (err) {
            alert('Ошибка: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-dark-200 border border-white/10 rounded-2xl p-6 glass-card shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <CoinIcon size={24} className="text-neon" />
                                {t('wallet.topUpTitle') || 'Пополнение баланса'}
                            </h2>
                            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                <p className="text-white/30 text-xs uppercase tracking-widest mb-1">{t('wallet.currentBalance') || 'Текущий баланс'}</p>
                                <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                    {user?.skillCoins || 0}
                                    <CoinIcon size={20} className="text-neon/60" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-white/40 mb-3">{t('wallet.selectAmount') || 'Выберите или введите сумму (СОМ)'}</label>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {presetAmounts.map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val)}
                                            className={`py-2 rounded-lg text-sm font-bold transition-all ${amount === val
                                                ? 'bg-neon text-dark shadow-neon/20 shadow-lg'
                                                : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="input-dark pl-4 pr-16 py-3"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-xs font-bold uppercase">СОМ</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-neon/10 border border-neon/20 flex items-start gap-3">
                                <SparklesIcon size={18} className="text-neon flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-neon/80 leading-relaxed">
                                    {t('wallet.rateInfo') || 'Курс: 1 СОМ = 1 SkillCoin. SkillCoins можно использовать для оплаты занятий с менторами.'}
                                </p>
                            </div>

                            <button
                                onClick={handleTopUp}
                                disabled={loading || !amount || parseInt(amount) <= 0}
                                className="neon-btn w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 group"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <RocketIcon size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        {t('wallet.payBtn') || 'Оплатить'}
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-white/20 italic">
                                {t('wallet.secureNote') || '* Безопасная оплата через Stripe/Visa/MasterCard'}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
