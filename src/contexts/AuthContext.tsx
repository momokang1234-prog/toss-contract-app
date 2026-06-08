import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type UserRole = 'employer' | 'worker' | null;

export interface UserProfile {
  userKey: string;
  name: string;
  phone?: string;
  ci: string;
}

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole;
  isLoading: boolean;
  userName: string | null;
  ci: string | null;
  userProfile: UserProfile | null;
  login: () => Promise<void>;
  logout: () => void;
  setRole: (role: 'employer' | 'worker') => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [ci, setCi] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const login = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Phase 2에서 실제 토스 인증 연동
      // 임시 목업: 1초 대기 후 로그인 처리
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsAuthenticated(true);
      setUserName('테스트 사장님');
      setCi('mock-ci-value');
      setUserRole('employer');
      setUserProfile({
        userKey: 'mock-employer-key',
        name: '테스트 사장님',
        phone: '01012345678',
        ci: 'mock-ci-value',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);
    setCi(null);
    setUserProfile(null);
  }, []);

  const setRole = useCallback(async (role: 'employer' | 'worker') => {
    setUserRole(role);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        isLoading,
        userName,
        ci,
        userProfile,
        login,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
