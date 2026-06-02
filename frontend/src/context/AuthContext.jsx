import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { clearAuth, getStoredUser, getToken, setAuth } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/me')
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.data);
          setAuth(token, res.data.data);
        }
      })
      .catch(() => {
        clearAuth();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    setAuth(token, userData);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // token hết hạn vẫn xóa local
    } finally {
      clearAuth();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải dùng trong AuthProvider');
  }
  return ctx;
}
