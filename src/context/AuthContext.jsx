import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('skillswap_token'));
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (token) {
            fetchProfile();
            fetchUnreadCount();
        } else {
            setLoading(false);
        }
    }, [token]);

    // Background polling for unread messages every 15 seconds
    useEffect(() => {
        if (!token) return;

        // Request notification permission if not asked yet
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const interval = setInterval(fetchUnreadCount, 15000);
        return () => clearInterval(interval);
    }, [token]);

    const handleResponse = async (res) => {
        const contentType = res.headers.get('content-type');
        let data = null;
        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        }

        if (!res.ok) {
            // If it's HTML, we'll get a syntax error if we don't check
            // We already checked contentType above
            throw new Error(data?.error || `Server error: ${res.status}`);
        }
        return data;
    };

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await handleResponse(res);
            if (data) {
                setUser(data.user);
            }
        } catch (err) {
            console.error('Auth error:', err);
            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/chat/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await handleResponse(res);
            if (data) {
                setUnreadCount(prevCount => {
                    // Show notification if we got a new message and page is backgrounded
                    if (data.count > prevCount && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
                        new Notification('SkillSwap AI', {
                            body: 'У вас новое сообщение!',
                            icon: '/vite.svg'
                        });
                    }
                    return data.count;
                });
            }
        } catch (err) {
            console.error('Unread count fetch error:', err);
        }
    };

    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await handleResponse(res);

        localStorage.setItem('skillswap_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await handleResponse(res);

        // Only login if token is provided (backward compatibility or full registration)
        if (data && data.token) {
            localStorage.setItem('skillswap_token', data.token);
            setToken(data.token);
            setUser(data.user);
        }
        return data;
    };

    const verifyAccount = async (email, code) => {
        const res = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const data = await handleResponse(res);

        localStorage.setItem('skillswap_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('skillswap_token');
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (updates) => {
        const res = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });
        const data = await handleResponse(res);
        if (data && data.user) {
            setUser(data.user);
        }
        return data;
    };

    const apiFetch = async (url, options = {}) => {
        const res = await fetch(`${API_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...options.headers,
            }
        });

        return await handleResponse(res);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            token,
            login,
            register,
            verifyAccount,
            logout,
            updateProfile,
            apiFetch,
            unreadCount,
            refreshUnreadCount: fetchUnreadCount,
            isAdmin: user?.role === 'admin',
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
