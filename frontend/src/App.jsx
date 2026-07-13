import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { SearchProvider, useSearch } from './context/SearchContext';
import { AIProvider, useAI } from './context/AIContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Layouts
import AuthLayout from './components/layout/AuthLayout';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';

// Shared
import PageLoader from './components/shared/PageLoader';
import NotFoundPage from './pages/NotFoundPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProfilePage from './pages/ProfilePage';
import KanbanPage from './pages/KanbanPage';
import ChatPage from './pages/ChatPage';
import FilesPage from './pages/FilesPage';

// Global Overlays
import GlobalSearch from './components/search/GlobalSearch';
import AIPanel from './components/ai/AIPanel';

// Simple Auth Guard
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Simple Guest Guard (prevents logged-in users from seeing login page)
const GuestRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <PageLoader />;
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Wrapper for global overlays that need router context
const GlobalOverlays = () => {
  const { isOpen: isSearchOpen } = useSearch();
  const { isOpen: isAIOpen } = useAI();
  
  return (
    <>
      {isSearchOpen && <GlobalSearch />}
      {isAIOpen && <AIPanel />}
    </>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>
              <NotificationProvider>
                <SearchProvider>
                  <AIProvider>
                    <ProjectProvider>
                      <TaskProvider>
                        <Router>
                          <Routes>
                            {/* Public Routes with AuthLayout */}
                            <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
                              <Route path="/login" element={<LoginPage />} />
                              <Route path="/register" element={<RegisterPage />} />
                              <Route path="/verify-email" element={<VerifyEmailPage />} />
                              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                              <Route path="/auth/callback" element={<OAuthCallbackPage />} />
                            </Route>
                            
                            {/* Protected Routes with AppLayout */}
                            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                              <Route path="/" element={<DashboardPage />} />
                              <Route path="/dashboard" element={<Navigate to="/" replace />} />
                              <Route path="/orgs/:orgId/projects" element={<ProjectsPage />} />
                              <Route path="/projects/:projectId/kanban" element={<KanbanPage />} />
                              <Route path="/projects/:projectId/chat" element={<ChatPage />} />
                              <Route path="/projects/:projectId/files" element={<FilesPage />} />
                              <Route path="/profile" element={<ProfilePage />} />
                            </Route>

                            {/* 404 Fallback */}
                            <Route path="*" element={<NotFoundPage />} />
                          </Routes>
                          <GlobalOverlays />
                        </Router>
                      </TaskProvider>
                    </ProjectProvider>
                  </AIProvider>
                </SearchProvider>
              </NotificationProvider>
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
