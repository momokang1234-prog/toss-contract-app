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

    // contractId는 body 또는 URL path에서 추출
    let contractId: string | undefined;
    if (req.method === 'GET') {
      const url = new URL(req.url);
      contractId = url.pathname.split('/').pop();
    } else {
      const body = await req.json();
      contractId = body.contractId;
    }
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
    let phone: string | undefined;

    try {
      const { payload } = await jose.jwtVerify(token, secret);
      userKey = payload.user_key ? String(payload.user_key) : undefined;
      phone = payload.phone ? String(payload.phone) : undefined;
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token', details: err.message }), { status: 401, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    if (!userKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing userKey in token claims' }), { status: 401, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    // 계약 조회 (근로자 권한)
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .or(`worker_user_key.eq.${userKey},worker_phone.eq.${phone}`)
      .single();

    if (error || !contract) {
      return new Response(JSON.stringify({ error: 'Contract not found' }), { status: 404, headers: corsHeaders(req.headers.get('origin') || '') });
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
          id: `view-${contractId}-${Date.now()}`,
          contract_id: contractId,
          action: 'viewed',
          actor_role: 'worker',
          actor_user_key: userKey,
        });
    }

    return new Response(
      JSON.stringify({ contract: { ...contract, status: contract.status === 'sent' ? 'viewed' : contract.status } }),
      { headers: { ...corsHeaders(req.headers.get('origin') || ''), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders(req.headers.get('origin') || '') }
    );
  }
});
