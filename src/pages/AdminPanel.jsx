import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { SkillIcon, UsersIcon, StarIcon, AlertTriangleIcon, CoinIcon, BrainIcon, TrashIcon } from '../components/Icons';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function AdminPanel() {
    const { apiFetch } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            const [usersData, reportsData, statsData] = await Promise.all([
                apiFetch('/admin/users'),
                apiFetch('/admin/reports'),
                apiFetch('/admin/stats'),
            ]);
            setUsers(usersData.users || []);
            setReports(reportsData.reports || []);
            setStats(statsData);
        } catch {
            setUsers(getMockUsers());
            setReports(getMockReports());
            setStats(getMockStats());
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId) => {
        try {
            await apiFetch(`/admin/users/${userId}/block`, { method: 'POST' });
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, blocked: !u.blocked } : u
            ));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(t('admin.deleteConfirm'))) return;
        try {
            await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
            setUsers(prev => prev.filter(u => u.id !== userId));
            alert(t('admin.deleteSuccess'));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleResolveReport = (reportId) => {
        setReports(prev => prev.map(r =>
            r.id === reportId ? { ...r, status: 'resolved' } : r
        ));
    };

    const tabs = [
        { id: 'overview', label: t('admin.overview'), icon: <ChartIcon /> },
        { id: 'users', label: t('admin.users'), icon: <UsersIcon size={16} /> },
        { id: 'reports', label: t('admin.reports'), icon: <AlertTriangleIcon size={16} /> },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center pt-16">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark pt-20 pb-12 bg-grid">
            <div className="absolute top-16 left-0 right-0 h-[200px] bg-glow-top pointer-events-none" />

            <div className="page-container relative z-10">
                {/* Header */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                        {t('admin.title')} <span className="neon-text">{t('admin.titleHL')}</span>
                    </h1>
                    <p className="text-white/40">{t('admin.subtitle')}</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-neon/10 text-neon border border-neon/20'
                                : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <span className="flex items-center gap-1.5">{tab.icon} {tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <StatCard label={t('admin.activeUsers')} value={stats?.activeUsers || 0} icon={<UsersIcon size={20} />} trend="+12%" />
                            <StatCard label={t('admin.totalSessions')} value={stats?.totalSessions || 0} icon={<BrainIcon size={20} />} trend="+8%" />
                            <StatCard label={t('admin.avgRating')} value={stats?.avgRating?.toFixed(1) || '—'} icon={<StarIcon size={20} />} />
                            <StatCard label={t('admin.reports')} value={stats?.pendingReports || 0} icon={<AlertTriangleIcon size={20} />} alert />
                        </div>

                        {/* Charts placeholder */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="glass-card p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><ChartIcon /> {t('admin.weekActivity')}</h3>
                                <div className="h-48 flex items-end gap-2">
                                    {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${h}%` }}
                                            transition={{ delay: i * 0.1, duration: 0.5 }}
                                            className="flex-1 bg-gradient-to-t from-neon/30 to-neon/5 rounded-t-lg relative group cursor-pointer"
                                        >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {h}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-white/30">
                                    {t('admin.weekDays').split(',').map((d, i) => <span key={i}>{d}</span>)}
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><TargetIcon /> {t('admin.topSkills')}</h3>
                                <div className="space-y-3">
                                    {[
                                        { name: 'Python', count: 45, pct: 90 },
                                        { name: 'React', count: 38, pct: 76 },
                                        { name: 'UI/UX Design', count: 32, pct: 64 },
                                        { name: 'JavaScript', count: 28, pct: 56 },
                                        { name: 'Machine Learning', count: 22, pct: 44 },
                                    ].map((skill, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-white/70 flex items-center gap-1.5"><SkillIcon skill={skill.name} size={14} /> {skill.name}</span>
                                                <span className="text-white/40">{skill.count}</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${skill.pct}%` }}
                                                    transition={{ delay: i * 0.1, duration: 0.5 }}
                                                    className="h-full bg-gradient-to-r from-neon/60 to-neon/30 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">{t('admin.userCol')}</th>
                                            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">{t('admin.uniCol')}</th>
                                            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">{t('admin.ratingCol')}</th>
                                            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">{t('admin.sessionsCol')}</th>
                                            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">{t('admin.reportsCol')}</th>
                                            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">{t('admin.statusCol')}</th>
                                            <th className="text-left px-4 py-3 text-xs text-white/40 font-medium">{t('admin.actionCol')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center text-neon text-sm font-bold">
                                                            {user.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{user.name}</p>
                                                            <p className="text-xs text-white/30">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-white/50 max-w-xs truncate" title={user.university}>{user.university}</td>
                                                <td className="px-4 py-3 text-sm">{user.rating?.toFixed(1)}</td>
                                                <td className="px-4 py-3 text-sm text-white/50">{user.sessionsCount}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-sm ${user.reportCount >= 3 ? 'text-red-400' : user.reportCount > 0 ? 'text-yellow-400' : 'text-white/30'}`}>
                                                        {user.reportCount}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`badge border text-xs ${user.blocked
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : 'bg-neon/10 text-neon border-neon/20'
                                                        }`}>
                                                        {user.blocked ? t('admin.blocked') : t('admin.activeStatus')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleBlockUser(user.id)}
                                                            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${user.blocked
                                                                ? 'bg-neon/10 text-neon hover:bg-neon/20'
                                                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                                }`}
                                                        >
                                                            {user.blocked ? t('admin.unblock') : t('admin.block')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-white/20 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                                                            title={t('admin.deleteUser')}
                                                        >
                                                            <TrashIcon size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Reports Tab */}
                {activeTab === 'reports' && (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
                        {reports.length === 0 ? (
                            <div className="glass-card p-8 text-center">
                                <p className="text-white/40">{t('admin.noReports')}</p>
                            </div>
                        ) : (
                            reports.map(report => (
                                <div key={report.id} className={`glass-card p-5 ${report.status === 'resolved' ? 'opacity-50' : ''
                                    }`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${report.status === 'resolved'
                                            ? 'bg-neon/10 border border-neon/20'
                                            : 'bg-red-500/10 border border-red-500/20'
                                            }`}>
                                            {report.status === 'resolved' ? <CheckIcon /> : <AlertTriangleIcon size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">{report.reporterName}</span>
                                                <span className="text-white/20">→</span>
                                                <span className="text-red-400/70 text-sm">{report.targetName}</span>
                                            </div>
                                            <p className="text-white/40 text-sm mb-2">{report.reason}</p>
                                            <p className="text-white/20 text-xs">{report.date}</p>
                                        </div>
                                        {report.status !== 'resolved' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleResolveReport(report.id)}
                                                    className="text-xs px-3 py-1.5 rounded-lg bg-neon/10 text-neon hover:bg-neon/20 transition-colors"
                                                >
                                                    {t('admin.resolved')}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleBlockUser(report.targetId);
                                                        handleResolveReport(report.id);
                                                    }}
                                                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                >
                                                    {t('admin.block')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, trend, alert }) {
    return (
        <div className={`glass-card-hover p-5 group ${alert ? 'border-red-500/10' : ''}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-neon/5 border border-neon/10 flex items-center justify-center group-hover:border-neon/30 group-hover:shadow-neon transition-all duration-500">
                    {icon}
                </div>
                {trend && <span className="text-neon text-xs font-medium">{trend}</span>}
            </div>
            <div className={`text-2xl font-bold ${alert ? 'text-red-400' : ''}`}>{value}</div>
            <div className="text-white/40 text-sm mt-1">{label}</div>
        </div>
    );
}

function ChartIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}

function TargetIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A3FF12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}

function getMockStats() {
    return { activeUsers: 523, totalSessions: 1247, avgRating: 4.6, pendingReports: 5 };
}

function getMockUsers() {
    return [
        { id: '1', name: 'Айдана Касымова', email: 'aidana@mail.kg', university: 'КГТУ им. И. Раззакова', rating: 4.8, sessionsCount: 15, reportCount: 0, blocked: false },
        { id: '2', name: 'Бекзат Алиев', email: 'bekzat@mail.kg', university: 'Американский Университет Центральной Азии (АУЦА)', rating: 4.5, sessionsCount: 8, reportCount: 1, blocked: false },
        { id: '3', name: 'Нурай Темирова', email: 'nuray@mail.kg', university: 'Кыргызско-Российский Славянский университет (КРСУ)', rating: 4.9, sessionsCount: 22, reportCount: 0, blocked: false },
        { id: '4', name: 'Тимур Батырканов', email: 'timur@mail.kg', university: 'КГТУ им. И. Раззакова', rating: 4.6, sessionsCount: 10, reportCount: 2, blocked: false },
        { id: '5', name: 'Марат Сатыбалдиев', email: 'marat@mail.kg', university: 'Бишкекский гуманитарный университет им. К. Карасаева (БГУ)', rating: 2.1, sessionsCount: 3, reportCount: 4, blocked: true },
        { id: '6', name: 'Асель Жумабекова', email: 'asel@mail.kg', university: 'Американский Университет Центральной Азии (АУЦА)', rating: 4.3, sessionsCount: 7, reportCount: 0, blocked: false },
    ];
}

function getMockReports() {
    return [
        { id: '1', reporterName: 'Тимур Б.', targetName: 'Марат С.', targetId: '5', reason: 'Не пришёл на сессию', date: '17 фев 2026', status: 'pending' },
        { id: '2', reporterName: 'Асель Ж.', targetName: 'Марат С.', targetId: '5', reason: 'Непрофессиональное поведение', date: '16 фев 2026', status: 'pending' },
        { id: '3', reporterName: 'Нурай Т.', targetName: 'Марат С.', targetId: '5', reason: 'Оскорбления', date: '15 фев 2026', status: 'resolved' },
        { id: '4', reporterName: 'Бекзат А.', targetName: 'Тимур Б.', targetId: '4', reason: 'Не пришёл на сессию', date: '14 фев 2026', status: 'pending' },
    ];
}
