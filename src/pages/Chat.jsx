import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { RocketIcon, SendIcon, MicIcon, PaperclipIcon, ImageIcon, FileIcon, PlayIcon, PauseIcon, PencilIcon, TrashIcon } from '../components/Icons';

export default function Chat() {
    const { user, apiFetch, refreshUnreadCount } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null); // partnerId
    const [activePartner, setActivePartner] = useState(null); // partner object
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [barterStatus, setBarterStatus] = useState(null); // null, 'offered', 'active', 'completed'
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);
    const chatInterval = useRef(null);
    const mediaRecorder = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [audioPlaying, setAudioPlaying] = useState(null); // ID of playing message
    const [editingId, setEditingId] = useState(null);
    const [editingText, setEditingText] = useState('');

    const [showBarterModal, setShowBarterModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    // Initial load: get conversations and check if we came from a profile
    useEffect(() => {
        loadConversations();

        // If coming from profile with partnerId
        if (location.state?.partnerId) {
            initChat(location.state.partnerId);
        }

        return () => {
            if (chatInterval.current) clearInterval(chatInterval.current);
        };
    }, []);

    const scrollContainerRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(true);

    const scrollToBottom = (force = false) => {
        if (force || shouldScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        // If user is within 100px of bottom, mark as should scroll
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShouldScroll(isAtBottom);
    };

    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        const isMe = lastMsg?.senderId === user.id;
        // Scroll if I sent it, or if we were already at bottom
        scrollToBottom(isMe);
    }, [messages]);

    // Polling for messages when chat is active
    useEffect(() => {
        if (activeChat) {
            // Initial fetch
            loadHistory(activeChat);

            // Poll every 3 seconds
            chatInterval.current = setInterval(() => {
                loadHistory(activeChat, true); // silent update
            }, 3000);
        } else {
            if (chatInterval.current) clearInterval(chatInterval.current);
        }

        return () => {
            if (chatInterval.current) clearInterval(chatInterval.current);
        };
    }, [activeChat]);

    const loadConversations = async () => {
        try {
            const data = await apiFetch('/chat/conversations');
            setConversations(data.conversations);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const initChat = async (partnerId) => {
        setActiveChat(partnerId);

        // Try to find partner in existing conversations
        // We need to fetch partner info if not in list
        // Let's verify via API if we don't have it
        try {
            // We can just fetch history - if empty, we still need partner name
            // Let's fetch user details
            const data = await apiFetch(`/users/${partnerId}`);
            setActivePartner(data.user);
        } catch (err) {
            console.error(err);
        }
    };

    const loadHistory = async (partnerId, silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await apiFetch(`/chat/history/${partnerId}`);
            setMessages(data.messages);

            // If there were unread messages, refresh global count
            if (data.messages.some(m => m.receiverId === user.id && !m.isRead)) {
                refreshUnreadCount();
                // Also refresh conversations list to clear local dots
                loadConversations();
            }

            // Update barter status
            if (data.activeSession) {
                // Determine status based on confirmation
                // status can be 'offered', 'active', 'pending'
                // If 'offered':
                //   if requesterConfirmed && !providerConfirmed -> I started it (waiting) OR partner started it (needs action)
                //   We need to know WHO is requester

                const s = data.activeSession;
                let status = s.status;

                // Refine status for UI
                if (status === 'offered' || status === 'pending') {
                    const isRequester = s.requesterId === user.id;
                    const isConfirmedByMe = isRequester ? s.requesterConfirmed : s.providerConfirmed;

                    if (isConfirmedByMe) {
                        status = 'waiting_partner';
                    } else {
                        status = 'needs_acceptance';
                    }
                }

                setBarterStatus(status);
            } else {
                setBarterStatus(null);
            }

            if (!silent) setLoading(false);
        } catch (err) {
            console.error(err);
            if (!silent) setLoading(false);
        }
    };

    const deleteMessage = async (id) => {
        if (!window.confirm(t('chat.deleteConfirm'))) return;
        try {
            await apiFetch(`/chat/messages/${id}`, { method: 'DELETE' });
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            alert(t('chat.deleteError') + err.message);
        }
    };

    const startEditing = (m) => {
        setEditingId(m.id);
        setEditingText(m.text);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditingText('');
    };

    const saveEdit = async () => {
        if (!editingText.trim() || !editingId) return;
        try {
            await apiFetch(`/chat/messages/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify({ text: editingText })
            });
            setMessages(prev => prev.map(m => m.id === editingId ? { ...m, text: editingText, isEdited: 1 } : m));
            setEditingId(null);
            setEditingText('');
        } catch (err) {
            alert(t('chat.editError') + err.message);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const text = newMessage;
            setNewMessage(''); // optimistic clear

            const res = await apiFetch('/chat/send', {
                method: 'POST',
                body: JSON.stringify({ receiverId: activeChat, text })
            });

            // Add locally immediately or wait for poll? Best to add locally
            setMessages(prev => [...prev, res.message]);

            // Refresh conversations list to update last message
            loadConversations();
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file || !activeChat) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const API_BASE = import.meta.env.VITE_API_URL || '/api';
            const res = await fetch(`${API_BASE}/chat/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('skillswap_token')}`
                },
                body: formData
            });

            if (!res.ok) {
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Upload failed');
                }
                throw new Error(t('chat.serverError').replace('{status}', res.status));
            }

            const uploadData = await res.json();

            // Send the actual message
            const msgRes = await apiFetch('/chat/send', {
                method: 'POST',
                body: JSON.stringify({
                    receiverId: activeChat,
                    type: uploadData.type,
                    fileUrl: uploadData.fileUrl,
                    fileName: uploadData.fileName,
                    fileSize: uploadData.fileSize
                })
            });

            setMessages(prev => [...prev, msgRes.message]);
            loadConversations();
        } catch (err) {
            alert(t('chat.uploadError') + err.message);
        } finally {
            setUploading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.current.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const file = new File([blob], 'voice_message.webm', { type: 'audio/webm' });
                handleFileUpload(file);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            const interval = setInterval(() => setRecordingTime(t => t + 1), 1000);
            return () => clearInterval(interval);
        } catch (err) {
            alert(t('chat.micUnavailable'));
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleBarterAction = async () => {
        if (!barterStatus || barterStatus === 'cancelled') {
            setShowBarterModal(true);
            return;
        }

        if (barterStatus === 'needs_acceptance') {
            // Find the session ID from messages
            const proposal = messages.find(m => m.type === 'barter_offer' && m.receiverId === user.id);
            if (!proposal) return;

            try {
                await apiFetch('/barter/accept', {
                    method: 'POST',
                    body: JSON.stringify({ sessionId: proposal.fileName })
                });
                loadHistory(activeChat);
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const proposeBarter = async () => {
        if (!selectedDate) return alert(t('chat.selectDate'));
        try {
            await apiFetch('/barter/propose', {
                method: 'POST',
                body: JSON.stringify({
                    partnerId: activeChat,
                    date: selectedDate,
                    time: selectedTime
                })
            });
            setShowBarterModal(false);
            loadHistory(activeChat);
        } catch (err) {
            alert(err.message);
        }
    };

    const cancelBarter = async (sessionId) => {
        if (!window.confirm(t('chat.cancelOffer') + '?')) return;
        try {
            await apiFetch('/barter/reject', {
                method: 'POST',
                body: JSON.stringify({ sessionId })
            });
            loadHistory(activeChat);
        } catch (err) {
            alert(err.message);
        }
    };

    const selectChat = (c) => {
        setActiveChat(c.partner.id);
        setActivePartner(c.partner);
    };

    return (
        <div className="fixed inset-0 bg-dark pt-16 md:pt-20 px-0 md:px-8 flex flex-col">
            <div className="max-w-7xl mx-auto w-full flex-1 flex md:gap-6 overflow-hidden mt-2 mb-4 md:h-[calc(100vh-120px)]">

                {/* Conversations List (Left) */}
                <div className={`w-full md:w-80 lg:w-96 glass-card md:rounded-2xl rounded-none border-x-0 md:border-x flex flex-col flex-shrink-0 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h2 className="font-display font-bold text-xl">{t('chat.title')}</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading && !conversations.length ? (
                            <div className="text-center py-10 text-white/30">{t('chat.loadingText')}</div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-10 text-white/30">
                                <p>{t('chat.noChats')}</p>
                                <p className="text-xs mt-2">{t('chat.noChatsHint')}</p>
                            </div>
                        ) : (
                            conversations.map(c => (
                                <button
                                    key={c.partner.id}
                                    onClick={() => selectChat(c)}
                                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${activeChat === c.partner.id
                                        ? 'bg-neon/10 border border-neon/30'
                                        : 'hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-bold border border-white/10">
                                        {c.partner.avatarUrl ? (
                                            <img src={c.partner.avatarUrl} alt={c.partner.name} className="w-full h-full object-cover" />
                                        ) : (
                                            c.partner.name[0]
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className={`font-medium truncate ${activeChat === c.partner.id ? 'text-white' : 'text-white/80'}`}>
                                                {c.partner.name}
                                            </span>
                                            {c.unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-neon"></span>}
                                        </div>
                                        <p className="text-xs text-white/40 truncate">{c.lastMessage}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Active Chat (Right) */}
                <div className={`w-full md:w-2/3 glass-card md:rounded-2xl rounded-none border-x-0 md:border-x flex flex-col relative ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
                    {!activeChat ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/30 p-8">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 mb-4 flex items-center justify-center">
                                <SendIcon size={32} />
                            </div>
                            <p>{t('chat.selectChat')}</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="p-3 md:p-4 border-b border-white/10 flex items-center justify-between bg-dark/40 backdrop-blur-xl z-10 md:rounded-t-2xl flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <button
                                        className="md:hidden p-1 -ml-1 text-white/50 hover:text-white transition-colors"
                                        onClick={() => setActiveChat(null)}
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                    </button>
                                    <Link
                                        to={`/user/${activeChat}`}
                                        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group"
                                    >
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gradient-to-br from-neon/20 to-purple-500/20 flex items-center justify-center font-bold border border-neon/30 text-xs md:text-base group-hover:border-neon transition-colors">
                                            {activePartner?.avatarUrl ? (
                                                <img src={activePartner.avatarUrl} alt={activePartner.name} className="w-full h-full object-cover" />
                                            ) : (
                                                activePartner?.name?.[0]
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-sm md:text-base truncate group-hover:text-neon transition-colors">{activePartner?.name}</h3>
                                            <p className="text-[10px] md:text-xs text-white/40 truncate hidden sm:block">{activePartner?.university}</p>
                                        </div>
                                    </Link>
                                </div>

                                {/* Barter Action Button */}
                                <div>
                                    {barterStatus === 'active' ? (
                                        <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] md:text-sm font-medium flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="hidden xs:inline">{t('chat.barterActive')}</span>
                                            <span className="xs:hidden">{t('chat.active')}</span>
                                        </div>
                                    ) : barterStatus === 'waiting_partner' ? (
                                        <div className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] md:text-sm font-medium opacity-70 cursor-not-allowed">
                                            <span className="hidden xs:inline">{t('chat.waiting')}</span>
                                            <span className="xs:hidden">⌛</span>
                                        </div>
                                    ) : barterStatus === 'needs_acceptance' ? (
                                        <button
                                            onClick={handleBarterAction}
                                            className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-neon text-dark font-bold text-[10px] md:text-sm shadow-lg shadow-neon/20 animate-pulse hover:scale-105 transition-transform flex items-center gap-2"
                                        >
                                            <RocketIcon size={14} className="md:w-4 md:h-4" />
                                            <span>{t('chat.accept')}</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleBarterAction}
                                            className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl bg-neon/10 border border-neon/50 text-neon hover:bg-neon hover:text-dark transition-all text-[10px] md:text-sm font-medium flex items-center gap-2"
                                        >
                                            <RocketIcon size={14} className="md:w-4 md:h-4" />
                                            <span>{t('chat.startBarter')}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div
                                ref={scrollContainerRef}
                                onScroll={handleScroll}
                                className="flex-1 overflow-y-auto pt-4 pb-4 px-4 space-y-4 scroll-smooth"
                            >
                                {messages.map((m) => {
                                    const isMe = m.senderId === user.id;

                                    if (m.type === 'barter_offer' || m.type === 'barter_status') {
                                        const isProposal = m.type === 'barter_offer';
                                        return (
                                            <div key={m.id} className="flex justify-center my-4">
                                                <div className={`glass-card p-4 text-center max-w-sm border-dashed ${isProposal ? 'border-neon/40 bg-neon/5' : 'border-white/10 bg-white/5'}`}>
                                                    <RocketIcon size={24} className="mx-auto mb-2 text-neon" />
                                                    <p className="text-sm font-medium mb-3">{m.text}</p>
                                                    {isProposal && m.receiverId === user.id && barterStatus === 'needs_acceptance' && (
                                                        <div className="flex gap-2 justify-center">
                                                            <button
                                                                onClick={() => handleBarterAction()}
                                                                className="px-4 py-1.5 bg-neon text-dark text-xs font-bold rounded-lg hover:scale-105 transition-transform"
                                                            >
                                                                {t('chat.accept')}
                                                            </button>
                                                            <button
                                                                onClick={() => cancelBarter(m.fileName)}
                                                                className="px-4 py-1.5 bg-white/10 text-white/60 text-xs font-bold rounded-lg hover:bg-white/20 transition-colors"
                                                            >
                                                                {t('chat.decline')}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {isProposal && m.senderId === user.id && (
                                                        <button
                                                            onClick={() => cancelBarter(m.fileName)}
                                                            className="text-[10px] text-white/30 hover:text-red-400 font-bold tracking-widest uppercase"
                                                        >
                                                            {t('chat.cancelOffer')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[85%] md:max-w-[75%] px-3 py-2 md:px-4 md:py-3 rounded-2xl text-[13px] md:text-sm leading-relaxed relative group ${isMe
                                                    ? 'bg-neon/10 border border-neon/20 text-white rounded-tr-sm'
                                                    : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                                                    }`}
                                            >
                                                {/* Edit/Delete Actions */}
                                                {isMe && !editingId && (
                                                    <div className="absolute -top-7 md:-top-8 right-0 flex gap-1 md:gap-2 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity bg-dark/80 backdrop-blur-md p-1 rounded-lg border border-white/10 scale-90 md:scale-100 origin-bottom-right z-20">
                                                        <button onClick={() => startEditing(m)} className="p-1 hover:text-neon text-white/50 transition-colors">
                                                            <PencilIcon size={12} className="md:w-[14px] md:h-[14px]" />
                                                        </button>
                                                        <button onClick={() => deleteMessage(m.id)} className="p-1 hover:text-red-500 text-white/50 transition-colors">
                                                            <TrashIcon size={12} className="md:w-[14px] md:h-[14px]" />
                                                        </button>
                                                    </div>
                                                )}

                                                {editingId === m.id ? (
                                                    <div className="space-y-2 min-w-[200px] md:min-w-[300px]">
                                                        <textarea
                                                            value={editingText}
                                                            onChange={(e) => setEditingText(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:border-neon/50 outline-none resize-none"
                                                            rows={window.innerWidth < 768 ? 3 : 2}
                                                            autoFocus
                                                        />
                                                        <div className="flex justify-end gap-3 px-1">
                                                            <button onClick={cancelEditing} className="text-[10px] md:text-xs text-white/40 hover:text-white uppercase font-bold tracking-wider">{t('chat.cancel')}</button>
                                                            <button onClick={saveEdit} className="text-[10px] md:text-xs text-neon hover:text-white uppercase font-bold tracking-wider">ОК</button>
                                                        </div>
                                                    </div>
                                                ) : m.type === 'image' ? (
                                                    <div className="space-y-2">
                                                        <img src={m.fileUrl} alt="Attached" className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(m.fileUrl)} />
                                                        {m.text && <p>{m.text}</p>}
                                                    </div>
                                                ) : m.type === 'voice' ? (
                                                    <div className="flex items-center gap-3 py-1 min-w-[120px]">
                                                        <button
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${isMe ? 'bg-neon text-dark' : 'bg-neon/20 text-neon'}`}
                                                            onClick={() => {
                                                                const audio = document.getElementById(`audio-${m.id}`);
                                                                if (audio.paused) {
                                                                    audio.play();
                                                                    setAudioPlaying(m.id);
                                                                } else {
                                                                    audio.pause();
                                                                    setAudioPlaying(null);
                                                                }
                                                            }}
                                                        >
                                                            {audioPlaying === m.id ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                                                        </button>
                                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className={`h-full ${isMe ? 'bg-white/40' : 'bg-neon'}`}
                                                                initial={{ width: 0 }}
                                                                animate={{ width: audioPlaying === m.id ? '100%' : '0%' }}
                                                                transition={{ duration: 10, ease: 'linear' }} // Mocking duration for now
                                                            />
                                                        </div>
                                                        <audio id={`audio-${m.id}`} src={m.fileUrl} onEnded={() => setAudioPlaying(null)} className="hidden" />
                                                    </div>
                                                ) : m.type === 'file' ? (
                                                    <a href={m.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5">
                                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/60">
                                                            <FileIcon size={20} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate text-xs">{m.fileName}</p>
                                                            <p className="text-[10px] opacity-40 uppercase">{formatFileSize(m.fileSize)}</p>
                                                        </div>
                                                    </a>
                                                ) : (
                                                    m.text
                                                )}
                                                <div className={`text-[10px] mt-1.5 opacity-30 flex items-center gap-1 ${isMe ? 'justify-end' : ''}`}>
                                                    {m.isEdited === 1 && <span>{t('chat.edited')}</span>}
                                                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-white/10 bg-dark/20 backdrop-blur-md rounded-b-2xl flex-shrink-0">
                                <form onSubmit={sendMessage} className="flex gap-2 items-center">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={e => handleFileUpload(e.target.files[0])}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 text-white/40 hover:text-neon transition-colors"
                                    >
                                        <PaperclipIcon size={20} />
                                    </button>

                                    {isRecording ? (
                                        <div className="flex-1 flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 overflow-hidden">
                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                                            <span className="flex-1 font-mono text-xs md:text-sm truncate">{formatTime(recordingTime)}</span>
                                            <button type="button" onClick={() => { stopRecording(); }} className="text-[10px] md:text-xs font-bold px-1 text-white/40 hover:text-white transition-colors">{t('chat.cancel')}</button>
                                            <button type="button" onClick={stopRecording} className="bg-red-500 text-white px-2 py-1 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-bold shrink-0">{t('chat.stop')}</button>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder={uploading ? t('chat.uploadingPh') : t('chat.messagePh')}
                                            disabled={uploading}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon/50 transition-colors disabled:opacity-50"
                                        />
                                    )}

                                    {newMessage.trim() || uploading ? (
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || uploading}
                                            className="p-3 bg-neon text-dark rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity"
                                        >
                                            <SendIcon size={20} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={startRecording}
                                            className="p-3 bg-white/5 text-white/60 hover:text-neon rounded-xl transition-all"
                                        >
                                            <MicIcon size={20} />
                                        </button>
                                    )}
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {/* Barter Offer Modal */}
            <AnimatePresence>
                {showBarterModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card p-6 w-full max-w-sm"
                        >
                            <h3 className="text-xl font-bold mb-4">{t('chat.barterTitle')}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-white/40 mb-1 tracking-widest uppercase font-bold">{t('chat.dateLabel')}</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="input-dark"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-white/40 mb-1 tracking-widest uppercase font-bold">{t('chat.timeLabel')}</label>
                                    <input
                                        type="time"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="input-dark"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowBarterModal(false)}
                                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white/60 font-bold hover:bg-white/10 transition-colors"
                                    >
                                        {t('chat.cancelBtn')}
                                    </button>
                                    <button
                                        onClick={proposeBarter}
                                        className="flex-1 px-4 py-3 rounded-xl bg-neon text-dark font-bold hover:shadow-neon/20 transition-all shadow-lg"
                                    >
                                        {t('chat.proposeBtn')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
