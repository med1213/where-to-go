'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStorage } from '../lib/api';
import { LoginDto, RegisterDto, User } from '../types/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial user from local storage or verify with /me
    const storedUser = tokenStorage.getUser();
    const token = tokenStorage.getAccessToken();

    if (token) {
      if (storedUser) {
        setUser(storedUser);
      }
      api.auth
        .me()
        .then((freshUser) => {
          setUser(freshUser);
          tokenStorage.setUser(freshUser);
        })
        .catch(() => {
          tokenStorage.clearTokens();
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (dto: LoginDto) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(dto);
      tokenStorage.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      tokenStorage.setUser(response.user);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (dto: RegisterDto) => {
    setIsLoading(true);
    try {
      const response = await api.auth.register(dto);
      tokenStorage.setTokens(response.tokens.accessToken, response.tokens.refreshToken);
      tokenStorage.setUser(response.user);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // ignore
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
