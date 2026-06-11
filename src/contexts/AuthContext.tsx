
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { IS_MOCK } from '../api/supabase';
import { tossLogin } from '../api/toss-auth';
const MOCK_AUTH_DELAY_MS = 500;

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
  login: (role?: 'employer' | 'worker') => Promise<void>;
  logout: () => void;
  setRole: (role: 'employer' | 'worker') => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const MOCK_PROFILES: Record<string, UserProfile & { role: UserRole }> = {
  employer: {
    userKey: 'mock-employer-key',
    name: '테스트 사장님',
    phone: '01012345678',
    ci: 'mock-ci-employer',
    role: 'employer',
  },
  worker: {
    userKey: 'mock-worker-key',
    name: '김알바',
    phone: '01098765432',
    ci: 'mock-ci-worker',
    role: 'worker',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [ci, setCi] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // 로그인 페이지에서 명시적으로 역할 선택 — 자동 로그인 없음
  useEffect(() => {
    if (IS_MOCK) {
      const savedRole = sessionStorage.getItem('mock_role') as 'employer' | 'worker' | null;
      if (savedRole) {
        const p = MOCK_PROFILES[savedRole];
        if (p) {
          setIsAuthenticated(true);
          setUserName(p.name);
          setCi(p.ci);
          setUserRole(p.role);
          setUserProfile({ userKey: p.userKey, name: p.name, phone: p.phone, ci: p.ci });
        }
      }
    }
  }, []);

  const login = useCallback(async (role?: 'employer' | 'worker') => {
    setIsLoading(true);
    try {
      if (IS_MOCK) {
        await new Promise(r => setTimeout(r, MOCK_AUTH_DELAY_MS));
        const selectedRole = role ?? 'employer';
        const p = MOCK_PROFILES[selectedRole];
        if (!p) throw new Error('Invalid role');
        sessionStorage.setItem('mock_role', selectedRole);
        setIsAuthenticated(true);
        setUserName(p.name);
        setCi(p.ci);
        setUserRole(p.role);
        setUserProfile({ userKey: p.userKey, name: p.name, phone: p.phone, ci: p.ci });
        return;
      }

      // Real Toss Login: appLogin() → Fly.io API → 사용자 정보
      const user = await tossLogin();
      const selectedRole = role ?? 'worker';

      sessionStorage.setItem('user_role', selectedRole);
      setIsAuthenticated(true);
      setUserName(user.name ?? '사용자');
      setCi(user.ci);
      setUserRole(selectedRole);
      setUserProfile({
        userKey: String(user.userKey),
        name: user.name ?? '사용자',
        phone: user.phone ?? undefined,
        ci: user.ci ?? '',
      });
    } catch (err) {
      console.error('[Auth] login failed', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('mock_role');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);
    setCi(null);
    setUserProfile(null);
  }, []);

  const setRole = useCallback(async (role: 'employer' | 'worker') => {
    setUserRole(role);
    if (IS_MOCK) {
      sessionStorage.setItem('mock_role', role);
    }
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
