import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getProfileApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          const response = await getProfileApi();
          setUser(response.data);
        } catch (err) {
          console.error('Failed to restore user session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [token]);

  const login = async (email, password, role) => {
    setError(null);
    try {
      const response = await loginApi({ email, password, role });
      const userData = response.data;
      
      localStorage.setItem('token', userData.token);
      setToken(userData.token);
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please verify credentials.';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        isAdmin: user?.role === 'Admin',
        isEmployee: user?.role === 'Employee',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
