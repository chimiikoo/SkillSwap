import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveFileUrl } from '../utils/resolveFileUrl';

export default function CommunityDetail() {
    const { id } = useParams();
    const { apiFetch, user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [community, setCommunity] = useState(null);
    const [members, setMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isMember, setIsMember] = useState(false);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msgText, setMsgText] = useState('');
    const [sending, setSending] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [editData, setEditData] = useState({ name: '', description: '', category: '', color: '#A3FF12' });
    const [activeView, setActiveView] = useState('chat');

    const chatEndRef = useRef(null);
    const pollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        loadCommunity();
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [id]);

    useEffect(() => {
        if (isMember) {
            loadMessages();
            pollRef.current = setInterval(loadMessages, 5000);
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [isMember]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadCommunity = async () => {
        try {
            const data = await apiFetch(`/communities/${id}`);
            setCommunity(data.community);
            setMembers(data.members);
            setIsMember(data.isMember);
            setRole(data.role);
            setEditData({
                name: data.community.name,
                description: data.community.description || '',
                category: data.community.category || '',
                color: data.community.color || '#A3FF12'
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const data = await apiFetch(`/communities/${id}/messages`);
            setMessages(data?.messages || []);
        } catch { }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!msgText.trim() || sending) return;
        setSending(true);
        try {
            const data = await apiFetch(`/communities/${id}/messages`, {
                method: 'POST',
                body: JSON.stringify({ text: msgText.trim() })
            });
            if (data?.message) {
                setMessages(prev => [...prev, data.message]);
            }
            setMsgText('');
            inputRef.current?.focus();
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const handleJoin = async () => {
        try {
            await apiFetch(`/communities/${id}/join`, { method: 'POST' });
            loadCommunity();
        } catch (err) { alert(err.message); }
    };

    const handleLeave = async () => {
        if (!confirm(t('communities.leaveConfirm') || 'Покинуть сообщество?')) return;
        try {
            await apiFetch(`/communities/${id}/leave`, { method: 'POST' });
            loadCommunity();
        } catch (err) { alert(err.message); }
    };

    const handleKick = async (userId) => {
        if (!confirm(t('communities.kickConfirm') || 'Удалить участника?')) return;
        try {
            await apiFetch(`/communities/${id}/kick/${userId}`, { method: 'POST' });
            loadCommunity();
        } catch (err) { alert(err.message); }
    };

    const handleDelete = async () => {
        if (!confirm(t('communities.deleteConfirm') || 'Удалить сообщество? Это действие необратимо!')) return;
        try {
            await apiFetch(`/communities/${id}`, { method: 'DELETE' });
            navigate('/communities');
        } catch (err) { alert(err.message); }
    };

    const handleUpdate = async () => {
        try {
            await apiFetch(`/communities/${id}`, {
                method: 'PUT',
                body: JSON.stringify(editData)
            });
            setShowSettings(false);
            loadCommunity();
        } catch (err) { alert(err.message); }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const today = now.toDateString() === d.toDateString();
        if (today) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark pt-24 flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="min-h-screen bg-dark pt-24 flex flex-col items-center justify-center text-white/40">
                <p className="text-lg mb-4">{t('communities.notFound') || 'Сообщество не найдено'}</p>
                <Link to="/communities" className="text-neon hover:underline">← {t('communities.back') || 'Назад'}</Link>
            </div>
        );
    }

    const themeColor = community.color || '#A3FF12';

    return (
        <div className="min-h-screen bg-dark pt-20 flex flex-col">
            {/* Top Bar */}
            <div className="border-b border-white/[0.06] bg-dark-card/50 backdrop-blur-lg">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
                    <Link to="/communities" className="text-white/40 hover:text-white transition-colors">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <polyline points="15,18 9,12 15,6" />
                        </svg>
                    </Link>

                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 border"
                        style={{ backgroundColor: themeColor + '15', borderColor: themeColor + '30', color: themeColor }}>
                        {community.avatarUrl ? (
                            <img src={resolveFileUrl(community.avatarUrl)} alt="" className="w-full h-full rounded-xl object-cover" />
                        ) : community.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="text-white font-semibold truncate">{community.name}</h2>
                        <p className="text-white/40 text-xs">{community.memberCount} {t('communities.membersCount') || 'участников'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isMember && (
                            <>
                                <button onClick={() => setActiveView(activeView === 'chat' ? 'members' : 'chat')}
                                    className={`p-2 rounded-lg transition-all ${activeView === 'members' ? 'bg-neon/10 text-neon' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </button>
                                {role === 'ceo' && (
                                    <button onClick={() => setShowSettings(true)}
                                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
                                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="3" />
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                    </button>
                                )}
                                {role !== 'ceo' && (
                                    <button onClick={handleLeave}
                                        className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all">
                                        {t('communities.leave') || 'Выйти'}
                                    </button>
                                )}
                            </>
                        )}
                        {!isMember && (
                            <button onClick={handleJoin}
                                className="px-4 py-2 bg-neon text-dark rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
                                {t('communities.join') || 'Вступить'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {!isMember ? (
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold mb-6 border-2"
                        style={{ backgroundColor: themeColor + '15', borderColor: themeColor + '30', color: themeColor }}>
                        {community.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{community.name}</h2>
                    <p className="text-white/40 text-center max-w-md mb-2">{community.description}</p>
                    {community.category && (
                        <span className="px-3 py-1 rounded-lg text-xs bg-white/5 text-white/50 border border-white/10 mb-4">{community.category}</span>
                    )}
                    <p className="text-white/30 text-sm mb-6">{community.memberCount} {t('communities.membersCount') || 'участников'}</p>
                    <button onClick={handleJoin}
                        className="px-8 py-3 bg-neon text-dark rounded-xl font-semibold hover:brightness-110 transition-all">
                        {t('communities.joinChannel') || 'Вступить в сообщество'}
                    </button>
                </div>
            ) : activeView === 'members' ? (
                /* Members List */
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-2xl mx-auto px-4 py-6">
                        <h3 className="text-white font-semibold mb-4">{t('communities.membersList') || 'Участники'} ({members.length})</h3>
                        <div className="space-y-2">
                            {members.map(m => (
                                <div key={m.userId} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all">
                                    <Link to={`/user/${m.userId}`} className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-neon/10 border border-neon/20 flex items-center justify-center text-neon font-bold flex-shrink-0">
                                            {m.avatarUrl ? (
                                                <img src={resolveFileUrl(m.avatarUrl)} alt="" className="w-full h-full object-cover" />
                                            ) : m.name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium truncate">{m.name}</span>
                                                {m.role === 'ceo' && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neon/10 text-neon border border-neon/20">
                                                        ⭐ CEO
                                                    </span>
                                                )}
                                            </div>
                                            {m.university && <p className="text-white/30 text-xs truncate">{m.university}</p>}
                                        </div>
                                    </Link>
                                    {role === 'ceo' && m.role !== 'ceo' && (
                                        <button onClick={() => handleKick(m.userId)}
                                            className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                                            title={t('communities.kick') || 'Удалить'}>
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3,6 5,6 21,6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Chat */
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        <div className="max-w-3xl mx-auto space-y-1">
                            {messages.length === 0 && (
                                <div className="text-center py-20 text-white/20">
                                    <svg className="mx-auto mb-3" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <p>{t('communities.noMessages') || 'Напишите первое сообщение!'}</p>
                                </div>
                            )}
                            {messages.map((m, i) => {
                                const isMe = m.senderId === user?.id;
                                const isCeo = m.senderRole === 'ceo';
                                const showAvatar = i === 0 || messages[i - 1]?.senderId !== m.senderId;

                                return (
                                    <div key={m.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''} ${showAvatar ? 'mt-4' : 'mt-0.5'}`}>
                                        {/* Avatar */}
                                        <div className="w-8 flex-shrink-0">
                                            {showAvatar && !isMe && (
                                                <Link to={`/user/${m.senderId}`}>
                                                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/40">
                                                        {m.senderAvatar ? (
                                                            <img src={resolveFileUrl(m.senderAvatar)} alt="" className="w-full h-full object-cover" />
                                                        ) : m.senderName?.charAt(0)}
                                                    </div>
                                                </Link>
                                            )}
                                        </div>

                                        {/* Bubble */}
                                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            {showAvatar && (
                                                <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                                                    <span className={`text-xs font-medium ${isCeo ? 'text-neon' : 'text-white/50'}`}>
                                                        {isCeo && <span className="text-neon mr-1">⭐</span>}
                                                        {m.senderName}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`px-3.5 py-2 rounded-2xl text-sm break-words ${isMe
                                                    ? 'bg-neon/15 text-white rounded-tr-md border border-neon/20'
                                                    : isCeo
                                                        ? 'bg-neon/[0.08] text-white rounded-tl-md border border-neon/15'
                                                        : 'bg-white/[0.06] text-white/90 rounded-tl-md border border-white/[0.06]'
                                                }`}>
                                                {isCeo && !isMe && (
                                                    <span className="float-left mr-1.5 mt-0.5 text-neon text-base leading-none">★</span>
                                                )}
                                                {m.text}
                                                <span className={`text-[10px] ml-2 ${isMe ? 'text-white/30' : 'text-white/20'} float-right mt-1`}>
                                                    {formatTime(m.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    {/* Input */}
                    <div className="border-t border-white/[0.06] bg-dark-card/50 backdrop-blur-lg px-4 py-3">
                        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-2">
                            <input ref={inputRef} type="text" value={msgText}
                                onChange={e => setMsgText(e.target.value)}
                                placeholder={t('communities.messagePh') || 'Написать сообщение...'}
                                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-neon/30" />
                            <button type="submit" disabled={!msgText.trim() || sending}
                                className="px-4 py-2.5 bg-neon text-dark rounded-xl font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-30">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowSettings(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-dark-card border border-white/10 rounded-2xl p-6"
                            onClick={e => e.stopPropagation()}>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#A3FF12" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                {t('communities.settings') || 'Настройки сообщества'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white/60 text-sm mb-1.5">{t('communities.nameLabel') || 'Название'}</label>
                                    <input type="text" value={editData.name}
                                        onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-neon/40" />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm mb-1.5">{t('communities.descLabel') || 'Описание'}</label>
                                    <textarea value={editData.description}
                                        onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-neon/40 resize-none" />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-sm mb-1.5">{t('communities.colorLabel') || 'Цвет'}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['#A3FF12', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#EA5455', '#7C5CFC', '#00D2D3', '#F368E0'].map(color => (
                                            <button key={color} onClick={() => setEditData(p => ({ ...p, color }))}
                                                className={`w-8 h-8 rounded-lg transition-all ${editData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-card scale-110' : 'hover:scale-105'}`}
                                                style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowSettings(false)}
                                    className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                                    {t('communities.cancelBtn') || 'Отмена'}
                                </button>
                                <button onClick={handleUpdate}
                                    className="flex-1 py-2.5 bg-neon text-dark rounded-xl text-sm font-semibold hover:brightness-110 transition-all">
                                    {t('communities.saveBtn') || 'Сохранить'}
                                </button>
                            </div>

                            <button onClick={handleDelete}
                                className="w-full mt-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all">
                                {t('communities.deleteCommunity') || 'Удалить сообщество'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
