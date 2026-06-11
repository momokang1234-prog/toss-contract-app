import { appLogin } from '@apps-in-toss/web-framework';

const API_BASE = 'https://bossimclockedin-api.fly.dev';

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
 * appLogin() → 인가코드 → Fly.io /api/auth/token → AccessToken → /api/user/me → 사용자 정보
 */
export async function tossLogin(): Promise<TossUserInfo> {
  // 1. 클라이언트에서 인가코드 획득
  const { authorizationCode, referrer } = await appLogin();

  // 2. 서버에서 AccessToken 교환
  const tokenRes = await fetch(`${API_BASE}/api/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorizationCode, referrer }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.json().catch(() => ({}));
    throw new Error(`Token exchange failed: ${tokenRes.status} ${JSON.stringify(err)}`);
  }

  const tokenData: TokenResponse = await tokenRes.json();
  if (tokenData.resultType !== 'SUCCESS') {
    throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
  }

  // 3. AccessToken으로 사용자 정보 조회 (서버에서 복호화까지 처리)
  const userRes = await fetch(`${API_BASE}/api/user/me`, {
    headers: { Authorization: `Bearer ${tokenData.success.accessToken}` },
  });

  if (!userRes.ok) {
    throw new Error(`User info failed: ${userRes.status}`);
  }

  const userData: TossUserInfo = await userRes.json();
  return userData;
}
