import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuestionsList from './pages/QuestionsList';
import Profile from './pages/Profile';
import HomeRoute from './pages/HomeRoute';
import Revision from './pages/Revision';
import NotesWorkspace from './pages/NotesWorkspace';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/app/dashboard" />;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '799155792066-aa600l6md03tov4orkag4ki6fhv4akdq.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="app-root min-h-screen">
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                  },
                }}
              />
              <Routes>
                {/* Landing Page (sabko visible) */}
                <Route path="/" element={<HomeRoute />} />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/app/notes/:noteId?"
                  element={
                    <ProtectedRoute>
                      <NotesWorkspace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/app"
                  element={
                     <ProtectedRoute>
                      <Layout />
                   </ProtectedRoute> 
                  }
                >
                   {/* Default child route */}
                  <Route index element={<Navigate to="/app/dashboard" replace/>} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="books" element={<QuestionsList />} />
                  <Route path="questions" element={<QuestionsList />} />
                  <Route path="revision" element={<Revision />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                {/* Catch-all for undefined routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;