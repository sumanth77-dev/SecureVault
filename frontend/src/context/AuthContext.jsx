import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 'usr-default-01',
  name: 'Sumanth Rao',
  email: 'sumanth@example.com',
  phone: '+1 (555) 234-5678',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  twoFactorEnabled: true,
  securityScore: 94,
  joinedDate: '2025-01-15',
  authProvider: 'LOCAL',
  plan: 'Pro Security Vault',
  storageUsed: '4.2 GB',
  storageLimit: '10 GB'
};

const DEFAULT_SESSIONS = [
  {
    id: 'sess-1',
    device: 'MacBook Pro 16" (Current)',
    location: 'San Francisco, CA, USA',
    ip: '192.168.1.104',
    lastActive: 'Just now',
    current: true,
    browser: 'Chrome 122.0'
  },
  {
    id: 'sess-2',
    device: 'iPhone 15 Pro Max',
    location: 'San Jose, CA, USA',
    ip: '172.56.21.89',
    lastActive: '2 hours ago',
    current: false,
    browser: 'Mobile Safari'
  },
  {
    id: 'sess-3',
    device: 'iPad Pro 12.9"',
    location: 'San Francisco, CA, USA',
    ip: '192.168.1.112',
    lastActive: '3 days ago',
    current: false,
    browser: 'Mobile Safari'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStorageItem('sv_user', DEFAULT_USER));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getStorageItem('sv_auth_token', true));
  const [sessions, setSessions] = useState(() => getStorageItem('sv_sessions', DEFAULT_SESSIONS));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setStorageItem('sv_user', user);
    }
  }, [user]);

  useEffect(() => {
    setStorageItem('sv_sessions', sessions);
  }, [sessions]);

  // Check current session from API on mount
  useEffect(() => {
    authService.getMe()
      .then(userData => {
        if (userData) {
          setUser(prev => ({
            ...DEFAULT_USER,
            ...prev,
            ...userData,
            authProvider: userData.authProvider || prev.authProvider || 'LOCAL'
          }));
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        // Unauthenticated session
      });

    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      removeStorageItem('sv_auth_token');
    };

    window.addEventListener('sv_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('sv_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result?.accessToken) {
        setStorageItem('sv_auth_token', result.accessToken);
        const loggedUser = {
          ...DEFAULT_USER,
          ...result.user,
          authProvider: result.user?.authProvider || 'LOCAL',
          securityScore: result.user?.twoFactorEnabled ? 94 : 65
        };
        setUser(loggedUser);
        setIsAuthenticated(true);
        return { success: true, user: loggedUser };
      }
      throw new Error(result?.message || 'Login failed');
    } catch (err) {
      console.warn('API login error:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password, phone }) => {
    setLoading(true);
    try {
      const result = await authService.register({ name, email, password, phone });
      if (result?.accessToken) {
        setStorageItem('sv_auth_token', result.accessToken);
        const newUser = {
          ...DEFAULT_USER,
          ...result.user,
          authProvider: 'LOCAL',
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setUser(newUser);
        setIsAuthenticated(true);
        return { success: true, user: newUser };
      }
      throw new Error(result?.message || 'Registration failed');
    } catch (err) {
      console.warn('API register error:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Real Google OAuth 2.0 Initiation
   */
  const initiateGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/google`;
  };

  /**
   * Handle OAuth success and store token for cross-origin API authorization
   */
  const handleOAuthSuccess = async (token) => {
    setLoading(true);
    try {
      if (token) {
        setStorageItem('sv_auth_token', token);
      }
      const userData = await authService.getMe();
      if (userData) {
        const loggedUser = {
          ...DEFAULT_USER,
          ...userData,
          authProvider: userData.authProvider || 'GOOGLE',
          securityScore: userData.twoFactorEnabled ? 94 : 75
        };
        setUser(loggedUser);
        setIsAuthenticated(true);
        return { success: true, user: loggedUser };
      }
      return { success: true };
    } catch (err) {
      console.warn('OAuth session validation error:', err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore
    }
    setIsAuthenticated(false);
    removeStorageItem('sv_auth_token');
    removeStorageItem('sv_user');
  };

  const updateProfile = async (updatedFields) => {
    try {
      const updated = await userService.updateProfile(updatedFields);
      setUser(prev => ({
        ...prev,
        ...updated
      }));
    } catch (err) {
      setUser(prev => ({
        ...prev,
        ...updatedFields
      }));
    }
  };

  const toggleTwoFactor = async (enabled) => {
    try {
      await userService.updateProfile({ twoFactorEnabled: enabled });
      setUser(prev => ({
        ...prev,
        twoFactorEnabled: enabled,
        securityScore: enabled ? 94 : 65
      }));
    } catch (err) {
      setUser(prev => ({
        ...prev,
        twoFactorEnabled: enabled,
        securityScore: enabled ? 94 : 65
      }));
    }
  };

  const revokeSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        initiateGoogleLogin,
        handleOAuthSuccess,
        logout,
        updateProfile,
        toggleTwoFactor,
        sessions,
        revokeSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
