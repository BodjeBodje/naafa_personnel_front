// services/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Pendant que l'authentification est en cours, on peut afficher un spinner ou rien
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié → redirection vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si authentifié → afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;
