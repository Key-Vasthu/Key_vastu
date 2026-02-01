import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, AuthState } from '../types';
import { authApi } from '../utils/api';

interface RegisterResult {
  success: boolean;
  error?: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('keyvasthu_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('keyvasthu_user');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const response = await authApi.login(email, password);
    
    if (response.success && response.data) {
      const { user } = response.data;
      localStorage.setItem('keyvasthu_user', JSON.stringify(user));
      localStorage.setItem('keyvasthu_token', response.data.token);
      setState({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    
    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, phone?: string): Promise<RegisterResult> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    const response = await authApi.register(email, password, name, phone);
    
    setState(prev => ({ ...prev, isLoading: false }));
    return {
      success: response.success,
      error: response.error,
    };
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authApi.logout();
    localStorage.removeItem('keyvasthu_user');
    localStorage.removeItem('keyvasthu_token');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      email: 'guest@keyvasthu.com',
      name: 'Guest User',
      role: 'guest',
      createdAt: new Date().toISOString(),
    };
    setState({ user: guestUser, isAuthenticated: true, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

