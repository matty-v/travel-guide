import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAdmin: localStorage.getItem('isAdmin') === 'true',
    loading: false,
  });

  const login = useCallback(async (password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminToken', password);
        setAuthState({ isAdmin: true, loading: false });
        return true;
      }

      setAuthState({ isAdmin: false, loading: false });
      return false;
    } catch {
      setAuthState({ isAdmin: false, loading: false });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminToken');
    setAuthState({ isAdmin: false, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
