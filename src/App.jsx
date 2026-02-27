import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import AdminPanel from './pages/AdminPanel';
import Chat from './pages/Chat';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import SubscriptionModal from './components/SubscriptionModal';
import Rankings from './pages/Rankings';

function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" />;
    if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;
    return children;
}

function AppRoutes() {
    const { isAuthenticated } = useAuth();
    const [isSubModalOpen, setIsSubModalOpen] = React.useState(false);

    React.useEffect(() => {
        if (isAuthenticated) {
            // 1. First login trigger
            const hasSeenSub = localStorage.getItem('hasSeenSubscriptionFirstLogin');
            if (!hasSeenSub) {
                setTimeout(() => {
                    setIsSubModalOpen(true);
                    localStorage.setItem('hasSeenSubscriptionFirstLogin', 'true');
                }, 1500); // Small delay for better UX
            }

            // 2. 2-minute timer trigger
            const timer = setTimeout(() => {
                setIsSubModalOpen(true);
            }, 120000); // 120000 ms = 2 minutes

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    // Function to trigger modal from other components (via event or prop drilling)
    const triggerSubscription = () => setIsSubModalOpen(true);

    return (
        <div id="app-root">
            <Navbar onProfileClick={triggerSubscription} />
            <Routes>
                <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
                <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/user/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
                <Route path="/community/:id" element={<ProtectedRoute><CommunityDetail /></ProtectedRoute>} />
                <Route path="/rankings" element={<ProtectedRoute><Rankings /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <LanguageProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </LanguageProvider>
        </BrowserRouter>
    );
}
