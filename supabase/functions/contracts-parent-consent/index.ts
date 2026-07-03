import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { sendSMS } from '../_shared/solapi.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const record = payload.record;

    if (!record || !record.parent_phone) {
      throw new Error('Invalid payload or missing parent_phone')
    }

    const { id: contractId, parent_phone, worker_name } = record;

    // 1. 딥링크 생성
    const deepLink = `supertoss://toss-contract-app/consent/${contractId}`;
    const webLink = `https://toss.im/toss-contract-app/consent/${contractId}`;

    // 2. SMS 발송 (Solapi)
    const message = `[토스 근로계약] ${worker_name}님의 근로계약서에 부모님 동의가 필요합니다. 링크를 눌러 확인해주세요. ${webLink}`;

    const smsResult = await sendSMS({
      to: parent_phone.replace(/\D/g, ''), // 숫자만 추출
      from: Deno.env.get('SOLAPI_SENDER_NUMBER') || '01000000000',
      text: message,
    });

    if (smsResult.status === 'failed') {
      console.error('[SMS SEND FAILED]', smsResult.errorMessage);
      throw new Error(`SMS 발송 실패: ${smsResult.errorMessage}`);
    }

    console.log('[SMS SEND SUCCESS]', {
      contractId,
      to: parent_phone,
      messageId: smsResult.messageId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Parent consent SMS sent successfully',
        messageId: smsResult.messageId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing webhook:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
