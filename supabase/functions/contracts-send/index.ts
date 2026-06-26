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

    const { contractId } = await req.json();
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

    // NOTE: 실제 근로자 도달은 사장님이 프론트 공유 시트(share API)로 직접 수행.
    // 근로자는 아직 userKey가 없어 스마트메시지 API로 도달 불가하므로, 이 함수는
    // 상태를 'sent'로 표시 + 이력/deliveries 기록 역할만 담당한다. (MVP 결정사항)

    // 전달 이력 생성
    const { data: delivery } = await supabase
      .from('deliveries')
      .insert({
        id: `delivery-${contractId}-${Date.now()}`,
        contract_id: contractId,
        method: 'share',
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
        details: { method: 'share', delivery_id: delivery?.id },
      });

    return new Response(
      JSON.stringify({ success: true, deliveryId: delivery?.id, method: 'share' }),
      { headers: { ...corsHeaders(req.headers.get('origin') || ''), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders(req.headers.get('origin') || '') }
    );
  }
});
