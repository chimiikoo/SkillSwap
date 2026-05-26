import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Footer from './components/Footer';
import SubscriptionModal from './components/SubscriptionModal';
import TopUpModal from './components/TopUpModal';
import Rankings from './pages/Rankings';
import Pricing from './pages/Pricing';

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
    const location = useLocation();
    const [isSubModalOpen, setIsSubModalOpen] = React.useState(false);
    const [isTopUpOpen, setIsTopUpOpen] = React.useState(false);

    // Subscription modal now only opens via explicit user action (Navbar "Upgrade" button)
    // No auto-popups — they kill retention for a new product

    const handleProfileClickTrigger = () => {
        // No-op — removed aggressive TopUp popup triggers
    };

    return (
        <div id="app-root" className="flex flex-col min-h-screen">
            <Navbar onProfileClick={handleProfileClickTrigger} onUpgradeClick={() => setIsSubModalOpen(true)} />
            <div className="flex-grow">
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
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
            {location.pathname !== '/chat' && <Footer />}
            <SubscriptionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} />
            <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
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
