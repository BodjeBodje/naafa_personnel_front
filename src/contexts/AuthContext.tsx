// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api/AppApi';
import { useIdleTimer } from '../hooks/useIdleTimer';


interface AuthContextType {
  user: User | null;
  setUser?: React.Dispatch<React.SetStateAction<User | null>>;
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return false;
    }

    try {
      const response = await authAPI.getCurrentUser();
      const userData: User = {
        ...response.data,
        mustChangePassword: response.data.must_change_password === 1, // booléen
      };
      setUser(userData);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const login = async (login: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authAPI.login({ login, password });
      if (response.data?.token && response.data.user) {
        const userWithFlag: User = {
          ...response.data.user,
          mustChangePassword: response.data.user.must_change_password === 1,
        };

        localStorage.setItem('token', response.data.token);
        setUser(userWithFlag);

        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  useIdleTimer(logout);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
