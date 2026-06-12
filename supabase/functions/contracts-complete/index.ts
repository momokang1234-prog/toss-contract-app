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

    const { contractId } = await req.json();
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

    // 계약 조회 및 소유권 확인
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('employer_user_key', userKey)
      .single();

    if (contractError || !contract) {
      return new Response(JSON.stringify({ error: 'Contract not found' }), {
        status: 404,
        headers: corsHeaders(req.headers.get('origin') || ''),
      });
    }

    // 상태 검증: signed 상태에서만 완료 가능
    if (contract.status !== 'signed') {
      return new Response(
        JSON.stringify({ error: `현재 상태(${contract.status})에서는 확정할 수 없습니다.` }),
        { status: 400, headers: corsHeaders(req.headers.get('origin') || '') }
      );
    }

    const now = new Date().toISOString();

    // 상태 업데이트
    const { data: updated, error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'completed',
        employer_signed_at: now,
        updated_at: now,
      })
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
        action: 'completed',
        actor_role: 'employer',
        actor_user_key: userKey,
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
