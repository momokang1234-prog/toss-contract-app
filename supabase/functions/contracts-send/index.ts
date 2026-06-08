import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { contractId, method } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const userKey = user.user_metadata?.user_key;

    // 계약 조회
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .eq('employer_user_key', userKey)
      .single();

    if (contractError || !contract) {
      return new Response(JSON.stringify({ error: 'Contract not found' }), { status: 404, headers: corsHeaders });
    }

    // 전달 이력 생성
    const { data: delivery } = await supabase
      .from('deliveries')
      .insert({
        contract_id: contractId,
        method: method || 'sms',
        recipient_phone: contract.worker_phone,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    // 계약 상태 업데이트
    await supabase
      .from('contracts')
      .update({ status: 'sent' })
      .eq('id', contractId);

    // 계약 이력 추가
    await supabase
      .from('contract_history')
      .insert({
        contract_id: contractId,
        action: 'sent',
        actor_role: 'employer',
        actor_user_key: userKey,
        details: { method, delivery_id: delivery?.id },
      });

    // TODO: 실제 SMS/Push 발송 로직
    // Track A: SMS 게이트웨이 호출
    // Track B: 스마트 발송 API 호출
    // 현재는 mock

    return new Response(
      JSON.stringify({ success: true, deliveryId: delivery?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
