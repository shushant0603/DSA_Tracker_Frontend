import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import AddQuestion from './pages/AddQuestion';
import QuestionsList from './pages/QuestionsList';
import Revision from './pages/Revision';
import Profile from './pages/Profile';
import CodePlayground from './pages/CodePlayground';
import HomeRoute from './pages/HomeRoute';

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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                path="/verify-otp"
                element={
                  <PublicRoute>
                    <VerifyOTP />
                  </PublicRoute>
                }
              />
              {/* Playground - Separate full-screen route (outside Layout) */}
              <Route
                path="/app/playground"
                element={
                  <ProtectedRoute>
                    <CodePlayground />
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
                <Route path="add-question" element={<AddQuestion />} />
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
  );
}

export default App;