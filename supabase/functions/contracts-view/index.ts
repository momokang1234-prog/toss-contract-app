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

    const url = new URL(req.url);
    const contractId = url.pathname.split('/').pop();
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const userKey = user.user_metadata?.user_key;
    const phone = user.user_metadata?.phone;

    // 계약 조회 (근로자 권한)
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .or(`worker_user_key.eq.${userKey},worker_phone.eq.${phone}`)
      .single();

    if (error || !contract) {
      return new Response(JSON.stringify({ error: 'Contract not found' }), { status: 404, headers: corsHeaders });
    }

    // viewed 상태로 업데이트 (sent인 경우만)
    if (contract.status === 'sent') {
      await supabase
        .from('contracts')
        .update({ status: 'viewed' })
        .eq('id', contractId);

      await supabase
        .from('contract_history')
        .insert({
          contract_id: contractId,
          action: 'viewed',
          actor_role: 'worker',
          actor_user_key: userKey,
        });
    }

    return new Response(
      JSON.stringify({ contract: { ...contract, status: contract.status === 'sent' ? 'viewed' : contract.status } }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
