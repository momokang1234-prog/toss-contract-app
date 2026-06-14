import { appLogin } from '@apps-in-toss/web-framework';
import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://bossimclockedin-api.fly.dev';

export interface TossUserInfo {
  userKey: number;
  scope: string;
  agreedTerms: string[];
  name: string | null;
  phone: string | null;
  birthday: string | null;
  ci: string | null;
  gender: string | null;
  nationality: string | null;
  email: string | null;
}

interface TokenResponse {
  resultType: string;
  success: {
    accessToken: string;
    refreshToken: string;
    scope: string;
    tokenType: string;
    expiresIn: number;
  };
}

/**
 * 전체 토스 로그인 흐름
 * appLogin() → 인가코드 → Node.js 백엔드(/auth/toss) → Custom JWT + UserInfo
 */
export async function tossLogin(): Promise<{ customToken: string, user: TossUserInfo }> {
  // 1. 클라이언트에서 인가코드 획득
  const { authorizationCode, referrer } = await appLogin();

  // 2. Node.js 백엔드 호출 (mTLS 인증서가 세팅된 서버)
  const response = await fetch(`${API_BASE}/auth/toss`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorizationCode, referrer }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(`Token exchange failed: ${data.error || 'Unknown error'} (Status: ${response.status})`);
  }

  return { customToken: data.customToken, user: data.user as TossUserInfo };
}
