import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';

interface User {
  id: number;
  fullName: string;
  name?: string;
  email: string;
  phone?: string;
  grade?: string;
  goals?: string;
  isPremium: boolean;
  profileCompletion?: number;
  subjects?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          if (response.success) {
            setUser(response.user);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('learner_current');
            localStorage.removeItem('learnerData');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('learner_current');
          localStorage.removeItem('learnerData');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        // Keep compatibility with existing localStorage checks
        localStorage.setItem('learner_current', JSON.stringify({ email: response.user.email }));
        localStorage.setItem('learnerData', JSON.stringify(response.user));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        setUser(response.user);
        // Keep compatibility with existing localStorage checks
        localStorage.setItem('learner_current', JSON.stringify({ email: response.user.email }));
        localStorage.setItem('learnerData', JSON.stringify(response.user));
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      const response = await authAPI.googleLogin(idToken);
      
      if (response.success) {
        setUser(response.user);
        // Keep compatibility with existing localStorage checks
        localStorage.setItem('learner_current', JSON.stringify({ email: response.user.email }));
        localStorage.setItem('learnerData', JSON.stringify(response.user));
      } else {
        throw new Error(response.message || 'Google login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('learner_current');
      localStorage.removeItem('learnerData');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
    
    // Update localStorage for compatibility
    const current = localStorage.getItem('learnerData');
    if (current) {
      const parsed = JSON.parse(current);
      localStorage.setItem('learnerData', JSON.stringify({ ...parsed, ...userData }));
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('learnerData', JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};






