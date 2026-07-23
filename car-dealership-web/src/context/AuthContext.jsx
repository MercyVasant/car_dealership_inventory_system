/* eslint-disable react-refresh/only-export-components, no-unused-vars, no-empty, react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect } from 'react';
import apiClient, { setToken as setApiToken } from '../api/apiClient';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // API returns { accessToken, user } — verified from authService.js
    const response = await authApi.login({ email, password });
    const { accessToken, user: userData } = response.data;
    setToken(accessToken);
    setApiToken(accessToken);
    setUser(userData);
    return userData;
  };

  const register = async (username, email, password) => {
    await authApi.register({ username, email, password });
    return login(email, password); // auto-login after register
  };

  const logout = async () => {
    try { await authApi.logout(); } catch (_) {}
    setUser(null);
    setToken(null);
    setApiToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);