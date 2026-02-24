import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveFileUrl } from '../utils/resolveFileUrl';

const COMMUNITY_CATEGORIES = [
    'Programming', 'UI/UX Design', 'Data Science', 'Machine Learning',
    'Web Development', 'Mobile Development', 'DevOps', 'Cybersecurity',
    'Marketing', 'Languages', 'Music', 'Art & Design', 'Business',
    'Science', 'Mathematics', 'Other'
];

const COLOR_OPTIONS = [
    '#A3FF12', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#FF8A5C', '#EA5455', '#7C5CFC',
    '#00D2D3', '#F368E0', '#48DBFB', '#FF9FF3', '#54A0FF'
];

const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function Communities() {
    const { apiFetch, user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [tab, setTab] = useState('all');
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [catDropdownOpen, setCatDropdownOpen] = useState(false);
    const [newCommunity, setNewCommunity] = useState({
        name: '', description: '', category: '', color: '#A3FF12'
    });

    useEffect(() => { loadCommunities(); }, [tab]);

    const loadCommunities = async () => {
        setLoading(true);
        try {
            const endpoint = tab === 'my' ? '/communities/my' :
                tab === 'recommended' ? '/communities/recommended' : '/communities';
            const data = await apiFetch(endpoint);
            setCommunities(data?.communities || []);
        } catch (err) {
            console.error('Load communities error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newCommunity.name.trim()) return;
        setCreating(true);
        try {
            await apiFetch('/communities/create', {
                method: 'POST',
                body: JSON.stringify(newCommunity)
            });
            setShowCreate(false);
            setNewCommunity({ name: '', description: '', category: '', color: '#A3FF12' });
            loadCommunities();
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleJoin = async (communityId, e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            await apiFetch(`/communities/${communityId}/join`, { method: 'POST' });
            loadCommunities();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: 'all', label: t('communities.all') || 'Все' },
        { id: 'my', label: t('communities.my') || 'Мои' },
        { id: 'recommended', label: t('communities.recommended') || '⚡ AI' }
    ];

    return (
        <div className="min-h-screen bg-dark pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon/10 border border-neon/20 text-neon text-xs font-medium mb-4">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Communities
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {t('communities.title') || 'Сообщества'} <span className="text-neon">{t('communities.titleHL') || 'студентов'}</span>
                    </h1>
                    <p className="text-white/50 max-w-lg mx-auto">
                        {t('communities.subtitle') || 'Находите единомышленников, обменивайтесь знаниями и растите вместе'}
                    </p>
                </motion.div>

                {/* Tabs + Search + Create */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-8">
                    <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-neon text-dark' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 flex-1 md:flex-initial">
                        <div className="flex-1 md:w-64 relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input type="text" placeholder={t('communities.searchPh') || 'Поиск сообществ...'}
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-neon/40" />
                        </div>
                        <button onClick={() => setShowCreate(true)}
                            className="px-5 py-2.5 bg-neon text-dark rounded-xl font-semibold text-sm hover:brightness-110 transition-all flex items-center gap-2 whitespace-nowrap">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            {t('communities.create') || 'Создать'}
                        </button>
                    </div>
                </motion.div>

                {/* Communities Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="spinner"></div>
                    </div>
                ) : filteredCommunities.length === 0 ? (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-20">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-white/20">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <p className="text-white/40 mb-2">{t('communities.empty') || 'Сообществ пока нет'}</p>
                        <button onClick={() => setShowCreate(true)} className="text-neon text-sm hover:underline">
                            {t('communities.createFirst') || 'Создайте первое!'}
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCommunities.map((c, i) => (
                            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05, duration: 0.4 }}>
                                <Link to={`/community/${c.id}`}
                                    className="block p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 hover:bg-white/[0.05] transition-all duration-300 group">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold flex-shrink-0 border"
                                            style={{ backgroundColor: c.color + '15', borderColor: c.color + '30', color: c.color }}>
                                            {c.avatarUrl ? (
                                                <img src={resolveFileUrl(c.avatarUrl)} alt="" className="w-full h-full rounded-xl object-cover" />
                                            ) : (
                                                c.name?.charAt(0)?.toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-semibold text-lg truncate group-hover:text-neon transition-colors">
                                                {c.name}
                                            </h3>
                                            <p className="text-white/40 text-sm line-clamp-2 mt-1">
                                                {c.description || t('communities.noDesc') || 'Без описания'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {c.category && (
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 text-white/50 border border-white/5">
                                                    {c.category}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-xs text-white/40">
                                                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                    <circle cx="9" cy="7" r="4" />
                                                </svg>
                                                {c.memberCount || 0}
                                            </span>
                                        </div>

                                        {c.isMember ? (
                                            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-neon/10 text-neon border border-neon/20">
                                                {c.role === 'ceo' ? '⭐ CEO' : '✓ ' + (t('communities.member') || 'Участник')}
                                            </span>
                                        ) : (
                                            <button onClick={(e) => handleJoin(c.id, e)}
                                                className="px-3 py-1 rounded-lg text-xs font-medium bg-neon text-dark hover:brightness-110 transition-all">
                                                {t('communities.join') || 'Вступить'}
                                            </button>
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Community Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowCreate(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-dark-card border border-white/10 rounded-2xl p-6"
                            onClick={e => e.stopPropagation()}>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-neon/10 flex items-center justify-center">
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#A3FF12" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </span>
                                {t('communities.createTitle') || 'Создать сообщество'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white/60 text-sm mb-1.5">{t('communities.nameLabel') || 'Название'} *</label>
                                    <input type="text" value={newCommunity.name}
                                        onChange={e => setNewCommunity(p => ({ ...p, name: e.target.value }))}
                                        placeholder={t('communities.namePh') || 'напр. UI/UX Design Gang'}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-neon/40" />
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm mb-1.5">{t('communities.descLabel') || 'Описание'}</label>
                                    <textarea value={newCommunity.description}
                                        onChange={e => setNewCommunity(p => ({ ...p, description: e.target.value }))}
                                        placeholder={t('communities.descPh') || 'О чём ваше сообщество...'}
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-neon/40 resize-none" />
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm mb-1.5">{t('communities.categoryLabel') || 'Категория'}</label>
                                    <div className="relative">
                                        <button type="button"
                                            onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-left focus:outline-none focus:border-neon/40 flex items-center justify-between"
                                            style={{ color: newCommunity.category ? '#fff' : 'rgba(255,255,255,0.25)' }}>
                                            <span>{newCommunity.category || t('communities.selectCategory') || 'Выберите категорию'}</span>
                                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.4)" strokeWidth="2"
                                                className={`transition-transform ${catDropdownOpen ? 'rotate-180' : ''}`}>
                                                <polyline points="6,9 12,15 18,9" />
                                            </svg>
                                        </button>
                                        {catDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setCatDropdownOpen(false)} />
                                                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden shadow-xl max-h-52 overflow-y-auto">
                                                    <button type="button"
                                                        onClick={() => { setNewCommunity(p => ({ ...p, category: '' })); setCatDropdownOpen(false); }}
                                                        className="w-full px-4 py-2.5 text-left text-sm text-white/40 hover:bg-white/5 transition-colors">
                                                        {t('communities.selectCategory') || 'Выберите категорию'}
                                                    </button>
                                                    {COMMUNITY_CATEGORIES.map(cat => (
                                                        <button key={cat} type="button"
                                                            onClick={() => { setNewCommunity(p => ({ ...p, category: cat })); setCatDropdownOpen(false); }}
                                                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${newCommunity.category === cat ? 'bg-neon/10 text-neon' : 'text-white hover:bg-white/5'}`}>
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm mb-1.5">{t('communities.colorLabel') || 'Цвет темы'}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {COLOR_OPTIONS.map(color => (
                                            <button key={color} onClick={() => setNewCommunity(p => ({ ...p, color }))}
                                                className={`w-8 h-8 rounded-lg transition-all ${newCommunity.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-dark scale-110' : 'hover:scale-105'}`}
                                                style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowCreate(false)}
                                    className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                                    {t('communities.cancelBtn') || 'Отмена'}
                                </button>
                                <button onClick={handleCreate} disabled={creating || !newCommunity.name.trim()}
                                    className="flex-1 py-2.5 bg-neon text-dark rounded-xl text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-40">
                                    {creating ? '...' : (t('communities.createBtn') || 'Создать')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
