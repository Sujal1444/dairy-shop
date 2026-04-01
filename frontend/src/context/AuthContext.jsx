import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useToast } from './ToastContext';
import * as api from '../services/api'; // Or just directly from axios interceptors

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.setAuthToken(token);
      loadUser();
    } else {
      localStorage.removeItem('token');
      api.setAuthToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await api.authAPI.get('/me');
      setUser(res.data.data);
    } catch (error) {
      console.error(error);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.authAPI.post('/register', { name, email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      addToast('Registration successful!');
      return true;
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.authAPI.post('/login', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      addToast('Welcome back!');
      return true;
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    addToast('Logged out successfully');
  };

  const forgotPassword = async (email) => {
    try {
      await api.authAPI.post('/forgotpassword', { email });
      addToast('Password reset email sent!');
      return true;
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send reset email', 'error');
      return false;
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const res = await api.authAPI.put(`/resetpassword/${resetToken}`, { password });
      setToken(res.data.token);
      addToast('Password reset successful!');
      return true;
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reset password', 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, forgotPassword, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
