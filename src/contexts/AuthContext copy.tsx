import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasAccess: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('nafaUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('nafaUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nafaUser');
  };

  const hasAccess = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;

    if (user.role === 'RH' || user.role === 'Directeur' || user.role === 'Manager') {
      return true;
    }

    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
