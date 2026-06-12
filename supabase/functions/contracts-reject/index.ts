import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { contractId, rejection_reason } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders(req.headers.get('origin') || ''),
      });
    }

    const userKey = user.user_metadata?.user_key;

    // 계약 조회 및 근로자 확인
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return new Response(JSON.stringify({ error: 'Contract not found' }), {
        status: 404,
        headers: corsHeaders(req.headers.get('origin') || ''),
      });
    }

    // 상태 검증: sent, viewed 상태에서만 거절 가능
    if (!['sent', 'viewed'].includes(contract.status)) {
      return new Response(
        JSON.stringify({ error: `현재 상태(${contract.status})에서는 거절할 수 없습니다.` }),
        { status: 400, headers: corsHeaders(req.headers.get('origin') || '') }
      );
    }

    const now = new Date().toISOString();

    // 거절 사유 포함 업데이트 (거절 사유 필드가 없으면 updated_at만)
    const updatePayload: Record<string, unknown> = {
      status: 'rejected',
      updated_at: now,
    };
    if (rejection_reason) {
      updatePayload.rejection_reason = rejection_reason;
    }

    const { data: updated, error: updateError } = await supabase
      .from('contracts')
      .update(updatePayload)
      .eq('id', contractId)
      .select()
      .single();

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: corsHeaders(req.headers.get('origin') || ''),
      });
    }

    // 계약 이력 추가
    await supabase
      .from('contract_history')
      .insert({
        contract_id: contractId,
        action: 'rejected',
        actor_role: 'worker',
        actor_user_key: userKey,
        details: rejection_reason ? { rejection_reason } : null,
      });

    return new Response(
      JSON.stringify({ success: true, ...updated }),
      { headers: { ...corsHeaders(req.headers.get('origin') || ''), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders(req.headers.get('origin') || '') }
    );
  }
});
