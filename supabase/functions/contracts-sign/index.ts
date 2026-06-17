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
    // [Toss Smart Message Integration]
    // ----------------------------------------------------
    const TOSS_SMART_MESSAGE_API_KEY = Deno.env.get('TOSS_SMART_MESSAGE_API_KEY'); 
    const TOSS_CAMPAIGN_ID_SIGN_COMPLETE = Deno.env.get('TOSS_CAMPAIGN_ID_SIGN_COMPLETE'); // 콘솔에서 생성한 서명완료 캠페인 ID
    
    // 사장님의 user_key 조회
    const { data: contract } = await supabase
      .from('contracts')
      .select('employer_user_key, worker_name')
      .eq('id', contractId)
      .single();

    if (contract?.employer_user_key) {
      if (TOSS_SMART_MESSAGE_API_KEY && TOSS_CAMPAIGN_ID_SIGN_COMPLETE) {
        try {
          const response = await fetch(`https://api.toss.im/smart-message/v1/campaigns/${TOSS_CAMPAIGN_ID_SIGN_COMPLETE}/send`, {
             method: 'POST',
             headers: { 
               'Content-Type': 'application/json', 
               'Authorization': `Bearer ${TOSS_SMART_MESSAGE_API_KEY}` 
             },
             body: JSON.stringify({ 
               audience: { userKey: contract.employer_user_key },
               variables: {
                 이름: workerInfo.name || contract.worker_name || '근로자',
                 링크: `https://bossimclockedin.private-apps.tossmini.com/contract/${contractId}`
               }
             })
          });
          if (!response.ok) {
            console.error(`[TOSS PUSH ERROR] API 응답 실패: ${response.status}`, await response.text());
          } else {
            console.log(`[TOSS PUSH SUCCESS] 사장님(userKey: ${contract.employer_user_key})에게 서명 완료 푸시 발송 완료`);
          }
        } catch (err) {
          console.error(`[TOSS PUSH EXCEPTION] 푸시 발송 중 에러:`, err);
        }
      } else {
        console.log(`[MOCK NOTIFY] 사장님(userKey: ${contract.employer_user_key})에게 서명 완료 알림 발송 (API 키 없음)`);
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
