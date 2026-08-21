import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStorageItem('sv_user', null));
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getStorageItem('sv_auth_token', false));
  const [sessions, setSessions] = useState(() => getStorageItem('sv_sessions', []));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setStorageItem('sv_user', user);
    } else {
      removeStorageItem('sv_user');
    }
  }, [user]);

  useEffect(() => {
    setStorageItem('sv_sessions', sessions);
  }, [sessions]);

  // Check current session from API on mount
  useEffect(() => {
    const token = getStorageItem('sv_auth_token', null);
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    authService.getMe()
      .then(userData => {
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          removeStorageItem('sv_auth_token');
          removeStorageItem('sv_user');
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
        removeStorageItem('sv_auth_token');
        removeStorageItem('sv_user');
      });

    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      setUser(null);
      removeStorageItem('sv_auth_token');
      removeStorageItem('sv_user');
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
