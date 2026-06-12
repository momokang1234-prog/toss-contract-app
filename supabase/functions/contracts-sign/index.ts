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

    const { contractId, signatureData } = await req.json();
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    const userKey = user.user_metadata?.user_key;

    // sign_contract RPC 호출 (SECURITY DEFINER 함수)
    const { error } = await supabase.rpc('sign_contract', {
      p_contract_id: contractId,
      p_signature_data: signatureData,
      p_worker_user_key: userKey,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    // Auto-complete the contract since worker signed
    const now = new Date().toISOString();
    await supabase
      .from('contracts')
      .update({
        status: 'completed',
        employer_signed_at: now,
        updated_at: now,
      })
      .eq('id', contractId);

    // 계약 이력 추가 (서명 완료)
    await supabase
      .from('contract_history')
      .insert({
        contract_id: contractId,
        action: 'signed',
        actor_role: 'worker',
        actor_user_key: userKey,
      });

    // 계약 이력 추가 (계약 완료)
    await supabase
      .from('contract_history')
      .insert({
        contract_id: contractId,
        action: 'completed',
        actor_role: 'system',
      });

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
