// 'use client';

// import { createContext, useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { authService } from '@/services/authService';

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // Helper to determine dashboard path based on role
//   const getDashboardPath = (roleName) => {
//     switch (roleName?.toLowerCase()) {
//       case 'admin':
//         return '/admin';
//       case 'instructor':
//         return '/instructor';
//       case 'content manager':
//         return '/content-manager';
//       case 'student':
//       default:
//         return '/dashboard';
//     }
//   };

//   // Restore session from localStorage on initial render
//   useEffect(() => {
//     const initAuth = async () => {
//       const storedToken = localStorage.getItem('learnova_token');
//       if (storedToken) {
//         try {
//           const userData = await authService.getMe(storedToken);
//           setUser(userData);
//           setToken(storedToken);
//         } catch (err) {
//           console.error('Session restoration failed:', err);
//           localStorage.removeItem('learnova_token');
//           setUser(null);
//           setToken(null);
//         }
//       }
//       setLoading(false);
//     };

//     initAuth();
//   }, []);

//   const login = async (identifier, password) => {
//     const data = await authService.login(identifier, password);
//     localStorage.setItem('learnova_token', data.jwt);
//     setToken(data.jwt);

//     // Fetch complete user profile with role populated
//     const fullUser = await authService.getMe(data.jwt);
//     setUser(fullUser);

//     const redirectPath = getDashboardPath(fullUser.role?.name);
//     router.push(redirectPath);
//     return fullUser;
//   };

//   const register = async (username, email, password) => {
//     const data = await authService.register(username, email, password);
//     localStorage.setItem('learnova_token', data.jwt);
//     setToken(data.jwt);

//     const fullUser = await authService.getMe(data.jwt);
//     setUser(fullUser);

//     router.push('/dashboard');
//     return fullUser;
//   };

//   const logout = () => {
//     localStorage.removeItem('learnova_token');
//     setUser(null);
//     setToken(null);
//     router.push('/login');
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         loading,
//         login,
//         register,
//         logout,
//         getDashboardPath,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper to determine dashboard path based on role
  const getDashboardPath = (roleObj) => {
    // roleObj হতে পারে স্ট্রিং অথবা অবজেক্ট { name: 'Content Manager', type: 'content-manager' }
    const roleString = typeof roleObj === 'string' 
      ? roleObj 
      : (roleObj?.name || roleObj?.type || '');

    const normalized = roleString.toLowerCase().replace(/[\s-_]+/g, '');

    if (normalized === 'admin') {
      return '/admin';
    }
    if (normalized === 'instructor') {
      return '/instructor';
    }
    if (normalized.includes('content')) {
      return '/content-manager';
    }

    return '/dashboard'; // Student / Default
  };

  // Restore session from localStorage on initial render
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('learnova_token');
      if (storedToken) {
        try {
          const userData = await authService.getMe(storedToken);
          setUser(userData);
          setToken(storedToken);
        } catch (err) {
          console.error('Session restoration failed:', err);
          localStorage.removeItem('learnova_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const data = await authService.login(identifier, password);
    localStorage.setItem('learnova_token', data.jwt);
    setToken(data.jwt);

    // Fetch complete user profile with role populated
    const fullUser = await authService.getMe(data.jwt);
    console.log('Logged in user data:', fullUser); // ব্রাউজার কনসোলে দেখার জন্য
    setUser(fullUser);

    const redirectPath = getDashboardPath(fullUser.role);
    router.push(redirectPath);
    return fullUser;
  };

  const register = async (username, email, password) => {
    const data = await authService.register(username, email, password);
    localStorage.setItem('learnova_token', data.jwt);
    setToken(data.jwt);

    const fullUser = await authService.getMe(data.jwt);
    setUser(fullUser);

    router.push('/dashboard');
    return fullUser;
  };

  const logout = () => {
    localStorage.removeItem('learnova_token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}