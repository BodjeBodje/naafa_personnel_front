// App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';

// Routes par rôle
import AdminRoutes from './routes/AdminRoutes';
import RhRoutes from './routes/RhRoutes';
import EmployeeRoutes from './routes/EmployeeRoutes';
import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Déterminer le dashboard selon le rôle
  const getDashboardPath = (role?: string) => {
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'rh':
      case 'manager':
        return '/manager-dashboard';
      case 'employee':
        return '/employee-dashboard';
      default:
        return '/login';
    }
  };

  // Redirection automatique après authentification
  useEffect(() => {
    if (loading) return;

    // Si authentifié et sur login → rediriger vers dashboard
    if (isAuthenticated && location.pathname === '/login') {
      navigate(getDashboardPath(user?.role), { replace: true });
      return;
    }

    // Si authentifié et sur / → rediriger vers dashboard
    if (isAuthenticated && location.pathname === '/') {
      navigate(getDashboardPath(user?.role), { replace: true });
      return;
    }

    // Si doit changer mot de passe et pas sur la page change-password
    if (isAuthenticated && user?.mustChangePassword && location.pathname !== '/change-password') {
      navigate('/change-password', { replace: true });
      return;
    }

    // Si a changé son mot de passe et est sur change-password → rediriger vers dashboard
    if (isAuthenticated && !user?.mustChangePassword && location.pathname === '/change-password') {
      navigate(getDashboardPath(user?.role), { replace: true });
    }
  }, [isAuthenticated, user, location.pathname, navigate, loading]);

  // Affichage d'un loader uniquement au premier chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Routes publiques (non authentifié)
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Routes pour changement de mot de passe obligatoire
  if (user?.mustChangePassword) {
    return (
      <Routes>
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="*" element={<Navigate to="/change-password" replace />} />
      </Routes>
    );
  }

  // Routes protégées (authentifié)
  return (
    <Layout
      currentPage={location.pathname.replace('/', '') || 'dashboard'}
      onNavigate={(page) => navigate(`/${page}`)}
    >
      <Routes>
        {/* Routes par rôle */}
        {AdminRoutes()}
        {RhRoutes()}
        {EmployeeRoutes()}

        {/* Catch-all → redirection vers dashboard selon rôle */}
        <Route path="*" element={<Navigate to={getDashboardPath(user?.role)} replace />} />
      </Routes>
    </Layout>
  );
};

export default App;