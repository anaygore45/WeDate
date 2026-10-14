import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { SocketProvider } from './contexts/SocketContext.jsx';

import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { VerifyEmailPage } from './pages/VerifyEmailPage.jsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './pages/ResetPasswordPage.jsx';
import { OnboardingPage } from './pages/OnboardingPage.jsx';
import { DiscoveryPage } from './pages/DiscoveryPage.jsx';
import { MatchesPage } from './pages/MatchesPage.jsx';
import { ChatPage } from './pages/ChatPage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { TermsPage } from './pages/TermsPage.jsx';
import { PrivacyPage } from './pages/PrivacyPage.jsx';

// Guard for routes requiring authenticated session
const ProtectedRoute = ({ children, requireComplete = true }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '80vh',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite'
          }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If email is not verified, redirect to verify-email
  if (!user.isVerified && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }

  // If profile is incomplete, send to onboarding
  if (
    requireComplete &&
    (!profile || !profile.isCompleted) &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Guard for login/register when already authenticated
const PublicRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  if (user && user.isVerified && profile?.isCompleted) {
    return <Navigate to="/discover" replace />;
  }

  return children;
};

const LayoutWrapper = () => {
  const location = useLocation();
  const isChat = location.pathname.startsWith('/chat');

  return (
    <>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* Authenticated Onboarding Route */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireComplete={false}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Authenticated Completed Profile Routes */}
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <DiscoveryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <MatchesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:matchId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isChat && <Footer />}
    </>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <LayoutWrapper />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
