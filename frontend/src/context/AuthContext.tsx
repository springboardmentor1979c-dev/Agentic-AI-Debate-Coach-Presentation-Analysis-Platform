import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../api/client';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  userId: number | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));
  const [userId, setUserId] = useState<number | null>(
    localStorage.getItem('user_id') ? Number(localStorage.getItem('user_id')) : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI
        .me()
        .then((res) => {
          setUser(res.data);
          setRole(res.data.role);
          setUserId(res.data.id);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user_role');
          localStorage.removeItem('user_id');
          setToken(null);
          setUser(null);
          setRole(null);
          setUserId(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const data = res.data;
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('user_id', String(data.user_id));
    setToken(data.access_token);
    setRole(data.role);
    setUserId(data.user_id);
    // Fetch user profile
    const userRes = await authAPI.me();
    setUser(userRes.data);
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    await authAPI.register({ name, email, password, role });
    // Auto-login after registration
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    setToken(null);
    setUser(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, userId, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

