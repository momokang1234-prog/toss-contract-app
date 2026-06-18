import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

const ALLOWED_ORIGINS = [
  'https://bossimclockedin.private-apps.tossmini.com',
  'http://localhost:5173',
];

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req.headers.get('origin') || '') });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { contractId, workerInfo } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders(req.headers.get('origin') || '') });
    }
    const token = authHeader.replace('Bearer ', '');

    const jwtSecret = Deno.env.get('CUSTOM_JWT_SECRET') || Deno.env.get('SUPABASE_AUTH_JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT Secret is not configured.');
    }
    const secret = new TextEncoder().encode(jwtSecret);

    let userKey: string | undefined;

    try {
      const { payload } = await jose.jwtVerify(token, secret);
      userKey = payload.user_key ? String(payload.user_key) : undefined;
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token', details: err.message }), { status: 401, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    if (!userKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing userKey in token claims' }), { status: 401, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    // sign_contract RPC 호출 (SECURITY DEFINER 함수)
    const { error } = await supabase.rpc('sign_contract', {
      p_contract_id: contractId,
      p_signature_data: workerInfo.signatureData,
      p_worker_user_key: userKey,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    // Update worker info (RPC already set status, worker_signed_at, worker_signature_data, worker_user_key)
    const { error: workerInfoError } = await supabase
      .from('contracts')
      .update({
        worker_phone: workerInfo.phone,
        worker_address: workerInfo.address,
        worker_account: workerInfo.account,
        worker_name: workerInfo.name,
        worker_ci: workerInfo.ci,
      })
      .eq('id', contractId)
      .eq('worker_user_key', userKey); // ownership check

    // 계약 이력 추가 (서명 완료)
    await supabase
      .from('contract_history')
      .insert({
        id: `sign-${contractId}-${Date.now()}`,
        contract_id: contractId,
        action: 'signed',
        actor_role: 'worker',
        actor_user_key: userKey,
      });

    // 계약 이력 추가 (계약 완료)
    await supabase
      .from('contract_history')
      .insert({
        id: `complete-${contractId}-${Date.now()}`,
        contract_id: contractId,
        action: 'completed',
        actor_role: 'system',
      });

    // ----------------------------------------------------
    // [Apps-in-Toss Smart Message — mTLS]
    // 사장님(userKey 보유)에게 "서명 완료" 알림 발송.
    // 스펙: BaseURL https://apps-in-toss-api.toss.im
    //       POST /api-partner/v1/apps-in-toss/messenger/send-message
    //       인증 = mTLS (클라이언트 인증서). Bearer 아님.
    //       수신자 식별 = 헤더 x-toss-user-key (사장님 userKey).
    //       본문 = { templateSetCode, context: {...} }.
    // (근로자는 userKey 없어 스마트메시지 불가 → 별도 share API로 처리됨.)
    // ----------------------------------------------------
    const TOSS_MTLS_CERT_B64 = Deno.env.get('TOSS_MTLS_CERT_B64'); // PEM 인증서(smart_public.crt) Base64
    const TOSS_MTLS_KEY_B64 = Deno.env.get('TOSS_MTLS_KEY_B64');   // PEM 개인키(smart_private.key) Base64
    const TOSS_TEMPLATE_SIGN_COMPLETE = Deno.env.get('TOSS_TEMPLATE_SIGN_COMPLETE') || 'bossimclockedin-contract_sign_complete';

    // 사장님 user_key 조회
    const { data: contract } = await supabase
      .from('contracts')
      .select('employer_user_key, worker_name')
      .eq('id', contractId)
      .single();

    const employerUserKey = contract?.employer_user_key;
    if (!employerUserKey) {
      console.log('[NOTIFY SKIP] 사장님 user_key 없음 — 서명 완료 알림 발송 생략');
    } else if (!TOSS_MTLS_CERT_B64 || !TOSS_MTLS_KEY_B64) {
      console.log(`[MOCK NOTIFY] 사장님(userKey: ${employerUserKey})에게 서명 완료 알림 (mTLS 인증서 미설정)`);
    } else {
      try {
        // PEM 문자열 복원 (Base64 → 멀티라인 PEM)
        const certPem = atob(TOSS_MTLS_CERT_B64);
        const keyPem = atob(TOSS_MTLS_KEY_B64);

        // Deno mTLS: createHttpClient 옵션은 cert/key (certChain/privateKey 아님).
        const httpClient = Deno.createHttpClient({ cert: certPem, key: keyPem });

        const workerName = workerInfo.name || contract?.worker_name || '근로자';
        const contractUrl = `https://bossimclockedin.private-apps.tossmini.com/contract/${contractId}`;

        const response = await fetch(
          'https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/messenger/send-message',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-toss-user-key': employerUserKey,
            },
            body: JSON.stringify({
              templateSetCode: TOSS_TEMPLATE_SIGN_COMPLETE,
              context: {
                이름: workerName,
                링크: contractUrl,
              },
            }),
            // @ts-expect-error — Deno fetch는 client 옵션을 받지만 DOM lib의 fetch 타입에는 없음
            client: httpClient,
          }
        );

        if (!response.ok) {
          console.error(`[SMART MESSAGE ERROR] ${response.status}`, await response.text());
        } else {
          console.log(`[SMART MESSAGE OK] 사장님(userKey: ${employerUserKey})에게 서명 완료 알림 발송`);
        }
      } catch (err) {
        // 알림 실패가 서명 자체를 실패시키지 않도록 격리
        console.error(`[SMART MESSAGE EXCEPTION]`, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders(req.headers.get('origin') || ''), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders(req.headers.get('origin') || '') }
    );
  }
});
