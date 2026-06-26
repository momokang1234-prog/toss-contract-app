// Solapi Messages API v4 클라이언트 — 알림톡(ATA) + SMS 폴백
//
// 인증: HMAC-SHA256 (apiKey + apiSecret + date + salt)
//   Authorization: HMAC-SHA256 apiKey={key}, date={date}, salt={salt}, signature={signature}
//   signature = HmacSHA256(apiSecret, date + salt) hex
// 공식: https://solapi.com/developers
//
// 사용 전 Supabase Secrets (supabase secrets set):
//   SOLAPI_API_KEY, SOLAPI_API_SECRET

const SOLAPI_BASE = 'https://api.solapi.com';

export interface AlimTalkParams {
  /** 수신번호 (숫자만, 예: 01012345678) */
  to: string;
  /** 발신번호 (KISA 사전등록 + Solapi 발신번호 등록 필수) */
  from: string;
  /** 카카오 발신 프로필 ID (채널) */
  pfId: string;
  /** 알림톡 템플릿 ID (심사 완료) */
  templateId: string;
  /** 템플릿 변수 #{변수명} 치환 — Solapi 콘솔 템플릿 확정 후 키 매핑 확인 필요 */
  variables: Record<string, string>;
  /** 알림톡 실패/미설치 시 자동 SMS 폴백 본문 (미제공 시 폴백 안 함) */
  fallbackText?: string;
}

export interface SmsParams {
  to: string;
  from: string;
  text: string;
}

export interface SendResult {
  /** Solapi 메시지 식별자 (deliveries.provider_message_id 저장용) */
  messageId: string | null;
  status: 'sent' | 'failed';
  errorCode?: string;
  errorMessage?: string;
}

function getRequiredEnv(key: string): string {
  const v = Deno.env.get(key);
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

/** HMAC-SHA256(secret, message) → hex */
async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomSalt(len = 32): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Solapi v4 인증 헤더 (Authorization + Date) */
async function authHeaders(): Promise<{ Authorization: string; Date: string }> {
  const apiKey = getRequiredEnv('SOLAPI_API_KEY');
  const apiSecret = getRequiredEnv('SOLAPI_API_SECRET');
  const date = new Date().toISOString();
  const salt = randomSalt();
  const signature = await hmacHex(apiSecret, date + salt);
  return {
    Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
    Date: date,
  };
}

/** POST /messages/v4/send 공통 호출 */
async function postSend(payload: unknown): Promise<SendResult> {
  const auth = await authHeaders();
  const res = await fetch(`${SOLAPI_BASE}/messages/v4/send`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  // 실패: HTTP 에러 또는 { errorCode, errorMessage }
  if (!res.ok || data.errorCode) {
    return {
      messageId: null,
      status: 'failed',
      errorCode: data.errorCode ?? `HTTP_${res.status}`,
      errorMessage: data.errorMessage ?? `Solapi request failed`,
    };
  }

  // 단건 발송 응답 식별자 (필드명은 응답 형태에 따라 상이 → 안전 추출)
  const messageId =
    data.messageId ??
    data.groupId ??
    (Array.isArray(data.messageIds) ? data.messageIds[0] : null) ??
    null;

  return { messageId, status: 'sent' };
}

/**
 * 알림톡(ATA) 발송.
 * 알림톡 실패(미설치/수신거부/템플릿 불일치) 시 fallbackText 가 있으면 SMS로 자동 폴백.
 */
export async function sendAlimTalk(params: AlimTalkParams): Promise<SendResult> {
  const payload = {
    message: {
      to: params.to,
      from: params.from,
      text: '',
      type: 'ATA',
      kakaoOptions: {
        pfId: params.pfId,
        templateId: params.templateId,
        variables: params.variables,
        // Solapi는 kakaoOptions.disableSms=false 일 때 알림톡 실패 시 자동 SMS 대체 지원.
        // 여기선 직접 폴백 제어를 위해 disableSms=true 로 두고, 실패 시 sendSMS() 로 명시적 폴백.
        disableSms: true,
      },
    },
  };

  const result = await postSend(payload);
  if (result.status === 'sent') return result;

  if (params.fallbackText) {
    const sms = await sendSMS({
      to: params.to,
      from: params.from,
      text: params.fallbackText,
    });
    if (sms.status === 'sent') {
      return {
        ...sms,
        errorMessage: `alimtalk_failed(${result.errorCode}) → sent via SMS`,
      };
    }
    return {
      ...result,
      errorMessage: `alimtalk:${result.errorCode}; sms:${sms.errorMessage}`,
    };
  }

  return result;
}

/** SMS/LMS 발송 (본문 길이에 따라 자동 분기) */
export async function sendSMS(params: SmsParams): Promise<SendResult> {
  const byteLen = new TextEncoder().encode(params.text).length;
  const payload = {
    message: {
      to: params.to,
      from: params.from,
      text: params.text,
      type: byteLen > 90 ? 'LMS' : 'SMS', // SMS 90바이트(한글~45자) 초과 시 LMS
    },
  };
  return postSend(payload);
}
