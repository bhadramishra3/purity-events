import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Axios instance with base URL and automatic JWT injection
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach JWT to every request if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('purity_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 responses
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('purity_token');
      localStorage.removeItem('purity_user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('purity_token');
    const savedUser = localStorage.getItem('purity_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Validate token with backend
        api.get('/auth/me')
          .then(res => setUser(res.data.user))
          .catch(() => logout())
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for auto-logout events
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem('purity_token', token);
    localStorage.setItem('purity_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('purity_token');
    localStorage.removeItem('purity_user');
    setUser(null);
  }, []);

  // Google OAuth — sends credential to backend
  const loginWithGoogle = useCallback(async (credential) => {
    const res = await api.post('/auth/google', { credential });
    login(res.data.token, res.data.user);
    return res.data.user;
  }, [login]);

  // Facebook OAuth — sends access token to backend
  const loginWithFacebook = useCallback(async (accessToken, userID) => {
    const res = await api.post('/auth/facebook', { accessToken, userID });
    login(res.data.token, res.data.user);
    return res.data.user;
  }, [login]);

  // Admin email/password login
  const loginAdmin = useCallback(async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    login(res.data.token, res.data.user);
    return res.data.user;
  }, [login]);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('purity_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      loginWithGoogle,
      loginWithFacebook,
      loginAdmin,
      updateUser,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin || false
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
