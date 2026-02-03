import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import LandingPage from './LandingPage';
import Layout from '../components/Layout';

const HomeRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Agar login hai → dashboard layout, nahi → landing page
  return isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <LandingPage />;
};

export default HomeRoute;