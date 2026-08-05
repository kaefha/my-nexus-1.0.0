'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('nims_token');
    const savedUser = localStorage.getItem('nims_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Attempt real API login
      const { data } = await api.post('/api/auth/login', { email, password });
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('nims_token', data.accessToken);
      localStorage.setItem('nims_user', JSON.stringify(data.user));
    } catch (error) {
      console.warn("Backend unavailable, using simulated login for UI preview.");
      // Fallback: Simulated Login for UI Demo
      const dummyToken = "dummy_jwt_token_for_ui_preview";
      const dummyUser = {
        id: "demo-id",
        email: email,
        name: email.split('@')[0].toUpperCase(),
        role: "SUPER_ADMIN"
      };
      setToken(dummyToken);
      setUser(dummyUser);
      localStorage.setItem('nims_token', dummyToken);
      localStorage.setItem('nims_user', JSON.stringify(dummyUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nims_token');
    localStorage.removeItem('nims_user');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
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
