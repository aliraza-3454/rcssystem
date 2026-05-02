/* eslint-disable */
import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('rcs_user');
    const token = localStorage.getItem('rcs_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('rcs_token', data.token);
    localStorage.setItem('rcs_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    // Only create the account — do NOT auto-login
    // User must go to login page and sign in manually
    const { data } = await API.post('/auth/register', formData);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('rcs_token');
    localStorage.removeItem('rcs_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);