import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DocumentProvider } from './context/DocumentContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/common/Toast';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { SharedViewerPage } from './pages/public/SharedViewerPage';

// Authenticated App Pages
import { DashboardPage } from './pages/app/DashboardPage';
import { DocumentsPage } from './pages/app/DocumentsPage';
import { DocumentDetailsPage } from './pages/app/DocumentDetailsPage';
import { FoldersPage } from './pages/app/FoldersPage';
import { SharedPage } from './pages/app/SharedPage';
import { NotificationsPage } from './pages/app/NotificationsPage';
import { ProfilePage } from './pages/app/ProfilePage';
import { SettingsPage } from './pages/app/SettingsPage';

// Protected Route Guard (Mock Auth aware)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <DocumentProvider>
            <NotificationProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/share/:token" element={<SharedViewerPage />} />
                  <Route path="/shared/:token" element={<SharedViewerPage />} />

                  {/* Authenticated Dashboard routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="documents" element={<DocumentsPage />} />
                    <Route path="documents/:id" element={<DocumentDetailsPage />} />
                    <Route path="folders" element={<FoldersPage />} />
                    <Route path="shared" element={<SharedPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </DocumentProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
