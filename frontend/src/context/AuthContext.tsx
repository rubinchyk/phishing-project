/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

/**
 * Authentication context shape used across the frontend.
 */
interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * React provider that exposes authentication helpers and guards.
 * ⚠️ Sensitive: Avoid logging email/password arguments to prevent credential leakage.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // ⚠️ Sensitive: Do not log credentials here.
    const response = await authAPI.login(email, password);
    localStorage.setItem('token', response.data.accessToken);
    setIsAuthenticated(true);
  };

  const register = async (email: string, password: string) => {
    // ⚠️ Sensitive: Do not log credentials here.
    const response = await authAPI.register(email, password);
    localStorage.setItem('token', response.data.accessToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
