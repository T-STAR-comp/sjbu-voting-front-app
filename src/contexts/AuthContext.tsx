// web/src/contexts/AuthContext.tsx

import * as React from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  login: () => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'sjbu-voter-authenticated';
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (isAuthenticated) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [isAuthenticated]);

  const login = React.useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const logout = React.useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const value = React.useMemo<AuthContextType>(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      login,
      logout,
    }),
    [isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
