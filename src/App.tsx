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

// Import toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    if (isAuthenticated && location.pathname === '/login') {
      navigate(getDashboardPath(user?.role), { replace: true });
      return;
    }

    if (isAuthenticated && location.pathname === '/') {
      navigate(getDashboardPath(user?.role), { replace: true });
      return;
    }

    if (isAuthenticated && user?.mustChangePassword && location.pathname !== '/change-password') {
      navigate('/change-password', { replace: true });
      return;
    }

    if (isAuthenticated && !user?.mustChangePassword && location.pathname === '/change-password') {
      navigate(getDashboardPath(user?.role), { replace: true });
    }
  }, [isAuthenticated, user, location.pathname, navigate, loading]);

  // Loader au démarrage
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  // Routes publiques
  if (!isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer /> {/* Même sur login, au cas où */}
      </>
    );
  }

  // Forcer changement de mot de passe
  if (user?.mustChangePassword) {
    return (
      <>
        <Routes>
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="*" element={<Navigate to="/change-password" replace />} />
        </Routes>
        <ToastContainer />
      </>
    );
  }

  // Utilisateur authentifié normalement
  return (
    <>
      <Layout
        currentPage={location.pathname.replace('/', '') || 'dashboard'}
        onNavigate={(page) => navigate(`/${page}`)}
      >
        <Routes>
          {AdminRoutes()}
          {RhRoutes()}
          {EmployeeRoutes()}
          <Route path="*" element={<Navigate to={getDashboardPath(user?.role)} replace />} />
        </Routes>
      </Layout>

      {/* ToastContainer global – une seule fois dans l’app */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-xl shadow-lg border border-gray-200"
        bodyClassName="font-medium text-gray-800"
        progressClassName="bg-blue-500"
        style={{ zIndex: 9999 }}
      />
    </>
  );
};

export default App;