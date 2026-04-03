import { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from './ToastContext';
import apiClient, { authAPI, setAuthToken } from '../services/api';

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
      setAuthToken(token);
      loadUser();
    } else {
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      setUser(res.data.data);
    } catch (error) {
      console.error(error);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, dairyName, email, password) => {
    try {
      const res = await apiClient.post('/auth/register', { name, dairyName, email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      addToast('Registration successful!');
      return { ok: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      addToast(message, 'error');
      return { ok: false, message };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
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
      await apiClient.post('/auth/forgotpassword', { email });
      addToast('Password reset email sent!');
      return true;
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send reset email', 'error');
      return false;
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const res = await apiClient.put(`/auth/resetpassword/${resetToken}`, { password });
      setToken(res.data.token);
      addToast('Password reset successful!');
      return true;
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reset password', 'error');
      return false;
    }
  };

  const updateProfile = async (payload) => {
    try {
      const res = await authAPI.put('/me', payload);
      setUser(res.data.user);
      addToast(res.data.message || 'Profile updated successfully');
      return { ok: true, user: res.data.user };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile';
      addToast(message, 'error');
      return { ok: false, message };
    }
  };

  const deleteAccount = async () => {
    try {
      await authAPI.delete('/me');
      setToken(null);
      setUser(null);
      addToast('Account deleted successfully');
      return true;
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete account', 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, forgotPassword, resetPassword, updateProfile, deleteAccount }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
