import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api.js';
import { initSocket, disconnectSocket } from '../services/socket.js';

const AuthContext = createContext(null);

const normalizeUser = (u) =>
  u ? { ...u, id: u.id || u._id, _id: u._id || u.id } : null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('wedate_token') || null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(normalizeUser(res.data.user));
        setProfile(res.data.profile);
        const storedToken = localStorage.getItem('wedate_token');
        if (storedToken) {
          initSocket(storedToken);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('wedate_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success && res.data) {
      const { user: loggedInUser, profile: loggedInProfile, token: jwtToken } = res.data;
      setUser(normalizeUser(loggedInUser));
      setProfile(loggedInProfile);
      setToken(jwtToken);
      if (jwtToken) {
        localStorage.setItem('wedate_token', jwtToken);
        initSocket(jwtToken);
      }
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.data) {
      const { user: newUser, profile: newProfile, token: jwtToken } = res.data;
      setUser(normalizeUser(newUser));
      setProfile(newProfile);
      setToken(jwtToken);
      if (jwtToken) {
        localStorage.setItem('wedate_token', jwtToken);
        initSocket(jwtToken);
      }
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('[Logout Error]', err.message);
    } finally {
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem('wedate_token');
      disconnectSocket();
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.warn('[Profile Refresh Error]', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
