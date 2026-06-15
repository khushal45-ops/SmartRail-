import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthUser } from '../components/LoginPage';
import { setAuthToken } from '../../api';

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        // In a real app with httpOnly cookies, this endpoint validates the session
        // and returns the user info.
        const response = await fetch('http://localhost:8000/api/auth/me', {
          method: 'GET',
          // credentials: 'include' // Un-comment this for real httpOnly cookies
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    validateSession();
  }, []);

  const login = (newUser: AuthUser, token: string) => {
    setAuthToken(token);
    setUser(newUser);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
