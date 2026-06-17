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

    const { contractId, method } = await req.json();
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

    // 계약 조회
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('employer_user_key', userKey)
      .single();

    if (contractError || !contract) {
      return new Response(JSON.stringify({ error: 'Contract not found' }), { status: 404, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    // 전달 이력 생성
    const { data: delivery } = await supabase
      .from('deliveries')
      .insert({
        id: `delivery-${contractId}-${Date.now()}`,
        contract_id: contractId,
        method: method || 'sms',
        recipient_phone: contract.worker_phone,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    // 계약 상태 업데이트 및 전송시각 기록
    await supabase
      .from('contracts')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', contractId);

    // 계약 이력 추가
    await supabase
      .from('contract_history')
      .insert({
        id: `send-${contractId}-${Date.now()}`,
        contract_id: contractId,
        action: 'sent',
        actor_role: 'employer',
        actor_user_key: userKey,
        details: { method, delivery_id: delivery?.id },
      });
    // ----------------------------------------------------
    // [Toss Smart Message Integration]
    // ----------------------------------------------------
    const TOSS_SMART_MESSAGE_API_KEY = Deno.env.get('TOSS_SMART_MESSAGE_API_KEY'); // 토스 디벨로퍼스에서 발급받은 API Key
    const TOSS_CAMPAIGN_ID_SEND = Deno.env.get('TOSS_CAMPAIGN_ID_SEND'); // 콘솔에서 생성한 캠페인 ID (계약서 전송 알림)

    if (TOSS_SMART_MESSAGE_API_KEY && TOSS_CAMPAIGN_ID_SEND) {
      try {
        // [참고] 스마트 발송 직접 API 연동 예시
        // 토스에게 발송을 직접 요청하여, 즉각적이고 확실한 실시간 알림을 보냅니다.
        const response = await fetch(`https://api.toss.im/smart-message/v1/campaigns/${TOSS_CAMPAIGN_ID_SEND}/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TOSS_SMART_MESSAGE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // 대상자 지정 (전화번호 또는 토스 userKey)
            // 토스 앱인토스에서는 주로 userKey나 phone을 지원합니다 (실제 API 스펙 문서 참조)
            audience: { 
              phone: contract.worker_phone 
            },
            // 변수 처리 (콘솔에서 #{이름} 이라고 설정했다면 아래와 같이 매핑)
            variables: {
              이름: contract.worker_name || '근로자',
              링크: `https://bossimclockedin.private-apps.tossmini.com/contract/${contractId}`
            }
          })
        });

        if (!response.ok) {
          console.error(`[TOSS PUSH ERROR] API 응답 실패: ${response.status}`, await response.text());
        } else {
          console.log(`[TOSS PUSH SUCCESS] ${contract.worker_phone} 에게 계약서 전송 푸시 발송 완료`);
        }
      } catch (err) {
        console.error(`[TOSS PUSH EXCEPTION] 푸시 발송 중 에러:`, err);
      }
    } else {
      console.log(`[MOCK NOTIFY] ${contract.worker_phone} 번호로 계약서 도착 알림 발송 (API 키 없음)`);
    }

    return new Response(
      JSON.stringify({ success: true, deliveryId: delivery?.id }),
      { headers: { ...corsHeaders(req.headers.get('origin') || ''), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders(req.headers.get('origin') || '') }
    );
  }
});
