'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFromStrapi } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLoggingOut = useRef(false);
  const router = useRouter();

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken =
          localStorage.getItem('learnova_token') || sessionStorage.getItem('learnova_token');
        if (!storedToken) {
          setLoading(false);
          return;
        }

        // Validate token against Strapi
        const me = await fetchFromStrapi('/users/me?populate=role', { token: storedToken });
        if (me && (me.id || me._id)) {
          setUser(me);
          setToken(storedToken);
        } else {
          localStorage.removeItem('learnova_token');
          sessionStorage.removeItem('learnova_token');
          localStorage.removeItem('learnova_user');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('Session restoration failed:', err.message);
        localStorage.removeItem('learnova_token');
        sessionStorage.removeItem('learnova_token');
        localStorage.removeItem('learnova_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (identifier, password) => {
    const data = await fetchFromStrapi('/auth/local', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    if (data.jwt && data.user) {
      localStorage.setItem('learnova_token', data.jwt);
      localStorage.setItem('learnova_user', JSON.stringify(data.user));
      setToken(data.jwt);

      try {
        const fullUser = await fetchFromStrapi('/users/me?populate=role', { token: data.jwt });
        const finalUser = fullUser || data.user;
        setUser(finalUser);
        return { ...data, user: finalUser };
      } catch {
        setUser(data.user);
        return data;
      }
    } else {
      throw new Error(data?.error?.message || 'Login failed');
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    const data = await fetchFromStrapi('/auth/local/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (data.jwt && data.user) {
      localStorage.setItem('learnova_token', data.jwt);
      localStorage.setItem('learnova_user', JSON.stringify(data.user));
      setToken(data.jwt);
      setUser(data.user);
      return data;
    } else {
      throw new Error(data?.error?.message || 'Registration failed');
    }
  };

  // Logout handler: Set flag first, clear storage, and instantly replace URL with root '/'
  const logout = useCallback(() => {
    isLoggingOut.current = true;

    localStorage.removeItem('learnova_token');
    localStorage.removeItem('learnova_user');
    sessionStorage.removeItem('learnova_token');
    sessionStorage.removeItem('learnova_user');

    // Perform atomic redirect
    window.location.replace('/');
  }, []);

  // Dynamic Dashboard Path Resolver
  const getDashboardPath = (roleObj) => {
    const roleString =
      roleObj?.name || roleObj?.type || user?.role?.name || user?.role?.type || user?.username || '';
    const normalized = roleString.toLowerCase().replace(/[\s-_]+/g, '');

    if (normalized.includes('admin')) return '/admin';
    if (normalized.includes('content') || normalized.includes('manager')) return '/content-manager';
    return '/dashboard';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggingOut: isLoggingOut.current,
        login,
        register,
        logout,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);