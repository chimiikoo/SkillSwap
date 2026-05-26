import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { SkillIcon, UsersIcon, StarIcon, AlertTriangleIcon, BrainIcon, TrashIcon } from '../components/Icons';
import { ALLOW_MOCKS } from '../utils/allowMocks';
import { resolveFileUrl } from '../utils/resolveFileUrl';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function AdminPanel() {
    const { apiFetch } = useAuth();
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAdminData();
    }, []);

    const loadAdminData = async () => {
        try {
            const [usersData, reportsData, statsData, appsData] = await Promise.all([
                apiFetch('/admin/users'),
                apiFetch('/admin/reports'),
                apiFetch('/admin/stats'),
                apiFetch('/admin/tutor-applications'),
            ]);
            setUsers(usersData.users || []);
            setReports(reportsData.reports || []);
            setStats(statsData);
            setApplications(appsData.applications || []);
        } catch (err) {
            if (ALLOW_MOCKS) {
                setUsers(getMockUsers());
                setReports(getMockReports());
                setStats(getMockStats());
            } else {
                console.error(err);
            }
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

    const handleResolveReport = async (reportId) => {
        try {
            await apiFetch(`/admin/reports/${reportId}/resolve`, { method: 'POST' });
            setReports(prev => prev.map(r =>
                r.id === reportId ? { ...r, status: 'resolved' } : r
            ));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleApproveTutor = async (userId) => {
        try {
            await apiFetch(`/admin/tutors/${userId}/approve`, { method: 'POST' });
            setApplications(prev => prev.filter(a => a.id !== userId));
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, tutorStatus: 'approved' } : u));
            loadAdminData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRejectTutor = async (userId) => {
        const reason = window.prompt('Причина отклонения:', 'Не соответствует требованиям');
        if (reason === null) return;
        try {
            await apiFetch(`/admin/tutors/${userId}/reject`, {
                method: 'POST',
                body: JSON.stringify({ reason }),
            });
            setApplications(prev => prev.filter(a => a.id !== userId));
            loadAdminData();
        } catch (err) {
            alert(err.message);
        }
    };

    const getFilteredUsers = (roleType) => {
        return users.filter(u => u.userType === roleType || (roleType === 'student' && !u.userType));
    };

    const isRu = language === 'ru';
    const tabs = [
        { id: 'overview', label: t('admin.overview'), icon: <ChartIcon /> },
        { id: 'applications', label: isRu ? `Заявки (${applications.length})` : `Applications (${applications.length})`, icon: <StarIcon size={18} /> },
        { id: 'students', label: isRu ? 'Студенты' : 'Students', icon: <UsersIcon size={18} /> },
        { id: 'tutors', label: isRu ? 'Репетиторы' : 'Tutors', icon: <StarIcon size={18} /> },
        { id: 'schools', label: isRu ? 'Школы / Курсы' : 'Schools / Courses', icon: <BrainIcon size={18} /> },
        { id: 'reports', label: t('admin.reports'), icon: <AlertTriangleIcon size={18} /> },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center pt-16">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-dark pt-16 pb-12 bg-grid flex">
            <div className="absolute top-16 left-0 right-0 h-[200px] bg-glow-top pointer-events-none" />

            <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 mt-4">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-6 md:mb-10">
                        <h1 className="font-display text-2xl md:text-3xl font-bold mb-1 md:mb-2">
                            {t('admin.title')} <span className="neon-text">{t('admin.titleHL')}</span>
                        </h1>
                        <p className="text-white/40 text-sm hidden md:block">{t('admin.subtitle')}</p>
                    </motion.div>
                    
                    <div className="glass-card p-3 md:sticky md:top-24 flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide">
                        <div className="hidden md:block px-4 py-3 mb-1 border-b border-white/5">
                            <h2 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Dashboard Menu</h2>
                        </div>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all text-left flex flex-shrink-0 items-center justify-start gap-3 ${activeTab === tab.id
                                    ? 'bg-neon/10 text-neon border border-neon/30 shadow-[0_0_15px_rgba(163,255,18,0.1)]'
                                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <span className={activeTab === tab.id ? 'text-neon' : 'text-white/40'}>{tab.icon}</span> 
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-x-hidden min-h-[500px]">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                            <StatCard label={t('admin.activeUsers')} value={stats?.activeUsers || 0} icon={<UsersIcon size={20} />} />
                            <StatCard label={isRu ? 'Студенты' : 'Students'} value={stats?.studentsCount || 0} icon={<UsersIcon size={20} />} />
                            <StatCard label={isRu ? 'Репетиторы ✓' : 'Tutors ✓'} value={stats?.tutorsApproved || 0} icon={<StarIcon size={20} />} />
                            <StatCard label={isRu ? 'На модерации' : 'Pending'} value={stats?.tutorsPending || 0} icon={<StarIcon size={20} />} alert={stats?.tutorsPending > 0} />
                            <StatCard label={isRu ? 'Сессий завершено' : 'Completed'} value={stats?.completedSessions || 0} icon={<BrainIcon size={20} />} />
                            <StatCard label={t('admin.reports')} value={stats?.pendingReports || 0} icon={<AlertTriangleIcon size={20} />} alert={stats?.pendingReports > 0} />
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

                {activeTab === 'applications' && (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">
                        {applications.length === 0 ? (
                            <div className="glass-card p-12 text-center text-white/40">Нет заявок на модерации</div>
                        ) : applications.map(app => (
                            <div key={app.id} className="glass-card p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{app.name}</h3>
                                        <p className="text-white/40 text-sm">{app.email} · {app.phone}</p>
                                        <p className="text-neon/70 text-sm mt-2">
                                            <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="underline">{app.portfolioUrl}</a>
                                        </p>
                                        <p className="text-white/50 text-sm mt-2">{app.city} · {app.teachingFormat} · {app.hourlyRate} сом/ч</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {app.teachSkills?.map(s => (
                                                <span key={s} className="text-xs px-2 py-0.5 rounded bg-neon/10 text-neon/80">{s}</span>
                                            ))}
                                        </div>
                                        {app.verificationDocUrl && (
                                            <a href={resolveFileUrl(app.verificationDocUrl)} target="_blank" rel="noopener noreferrer"
                                                className="inline-block mt-3 text-sm text-neon underline">Открыть документ</a>
                                        )}
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => handleApproveTutor(app.id)}
                                            className="px-4 py-2 rounded-xl bg-neon text-black font-bold text-sm hover:bg-neon/90">
                                            Одобрить
                                        </button>
                                        <button onClick={() => handleRejectTutor(app.id)}
                                            className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
                                            Отклонить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Users Tabs (Students, Tutors, Schools) */}
                {['students', 'tutors', 'schools'].includes(activeTab) && (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} key={activeTab}>
                        <div className="glass-card overflow-hidden !p-0">
                            <div className="px-6 py-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.01]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center text-neon">
                                        {tabs.find(t => t.id === activeTab)?.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white/90">
                                            {tabs.find(t => t.id === activeTab)?.label}
                                        </h2>
                                        <p className="text-xs text-white/40 mt-0.5">Управление пользователями</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1.5 rounded-full bg-white/5 text-white/50 text-xs font-bold uppercase tracking-widest border border-white/10 w-fit">
                                    {getFilteredUsers(activeTab === 'schools' ? 'school' : activeTab.slice(0, -1)).length} total
                                </span>
                            </div>
                            {getFilteredUsers(activeTab === 'schools' ? 'school' : activeTab.slice(0, -1)).length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/20">
                                        <UsersIcon size={24} />
                                    </div>
                                    <p className="text-white/40">{isRu ? 'Нет пользователей в данной категории' : 'No users in this category'}</p>
                                </div>
                            ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="text-left px-6 py-4 text-xs text-white/30 uppercase tracking-widest font-bold">{t('admin.userCol')}</th>
                                            <th className="text-left px-6 py-4 text-xs text-white/30 uppercase tracking-widest font-bold">{t('admin.uniCol')} / City</th>
                                            <th className="text-left px-6 py-4 text-xs text-white/30 uppercase tracking-widest font-bold">Premium</th>
                                            <th className="text-left px-6 py-4 text-xs text-white/30 uppercase tracking-widest font-bold">{t('admin.ratingCol')}</th>
                                            <th className="text-left px-6 py-4 text-xs text-white/30 uppercase tracking-widest font-bold">{t('admin.sessionsCol')}</th>
                                            <th className="text-left px-6 py-4 text-xs text-white/30 uppercase tracking-widest font-bold">{t('admin.reportsCol')}</th>
                                            <th className="text-left px-6 py-4 text-xs text-white/30 uppercase tracking-widest font-bold">{t('admin.statusCol')}</th>
                                            <th className="text-left px-6 py-4 text-xs text-white/30 uppercase tracking-widest font-bold text-right">{t('admin.actionCol')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getFilteredUsers(activeTab === 'schools' ? 'school' : activeTab.slice(0, -1)).map(user => (
                                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                                                            user.userType === 'school' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                                            user.userType === 'tutor' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                                            'bg-neon/10 text-neon border border-neon/20'
                                                        }`}>
                                                            {user.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white/90">{user.name}</p>
                                                            <p className="text-xs text-white/40 mt-0.5">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-white/50 max-w-[150px] truncate" title={user.university || user.city}>
                                                    {user.university || user.city || '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.isPremium ? (
                                                        <span className="text-neon text-[10px] font-black px-2.5 py-1 bg-neon/10 rounded-md border border-neon/20 uppercase tracking-widest">
                                                            PRO
                                                        </span>
                                                    ) : <span className="text-white/20 text-xs">—</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded w-max">
                                                        <StarIcon size={12} className="text-yellow-400" />
                                                        <span className="text-sm font-medium">{user.rating?.toFixed(1) || '0.0'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">{user.sessionsCount}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-medium px-2.5 py-1 rounded-md ${user.reportCount >= 3 ? 'bg-red-500/10 text-red-400' : user.reportCount > 0 ? 'bg-yellow-500/10 text-yellow-400' : 'text-white/30'}`}>
                                                        {user.reportCount}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${user.blocked ? 'bg-red-500' : 'bg-neon shadow-[0_0_8px_rgba(163,255,18,0.5)]'}`} />
                                                        <span className={`text-xs font-bold ${user.blocked ? 'text-red-400' : 'text-white/60'}`}>
                                                            {user.blocked ? t('admin.blocked') : t('admin.activeStatus')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => handleBlockUser(user.id)}
                                                            className={`text-xs px-3 py-2 rounded-xl transition-all font-medium ${user.blocked
                                                                ? 'bg-neon/10 text-neon hover:bg-neon/20 border border-neon/20'
                                                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                                                }`}
                                                        >
                                                            {user.blocked ? t('admin.unblock') : t('admin.block')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-white/20 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
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
                            )}
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
        { id: '1', name: 'Айдана Касымова', email: 'aidana@mail.kg', university: 'КГТУ им. И. Раззакова', rating: 4.8, sessionsCount: 15, reportCount: 0, blocked: false, userType: 'tutor', isPremium: true, city: 'Бишкек' },
        { id: '2', name: 'Бекзат Алиев', email: 'bekzat@mail.kg', university: 'АУЦА', rating: 4.5, sessionsCount: 8, reportCount: 1, blocked: false, userType: 'student', isPremium: false },
        { id: '3', name: 'Нурай Темирова', email: 'nuray@mail.kg', university: 'КРСУ', rating: 4.9, sessionsCount: 22, reportCount: 0, blocked: false, userType: 'student', isPremium: true },
        { id: '4', name: 'GeekBrains', email: 'info@geekbrains.kg', university: '', rating: 4.6, sessionsCount: 150, reportCount: 0, blocked: false, userType: 'school', isPremium: true, city: 'Бишкек' },
        { id: '5', name: 'Марат Сатыбалдиев', email: 'marat@mail.kg', university: 'БГУ', rating: 2.1, sessionsCount: 3, reportCount: 4, blocked: true, userType: 'tutor', isPremium: false },
        { id: '6', name: 'Асель Жумабекова', email: 'asel@mail.kg', university: 'АУЦА', rating: 4.3, sessionsCount: 7, reportCount: 0, blocked: false, userType: 'student', isPremium: false },
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
