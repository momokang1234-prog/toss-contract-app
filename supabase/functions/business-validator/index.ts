import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { businessNumber } = await req.json()
    if (!businessNumber) {
      throw new Error('사업자등록번호가 필요합니다.')
    }

    const cleanNumber = businessNumber.replace(/-/g, '');
    const API_KEY = Deno.env.get('NTS_API_KEY');

    // 💡 환경변수가 등록되지 않은 경우 더미(Mock) 로직으로 동작
    if (!API_KEY) {
      let result = {};
      if (cleanNumber === '0000000000') {
        result = { success: false, status: 'INVALID', message: '국세청에 등록되지 않은 유효하지 않은 사업자등록번호입니다.' };
      } else if (cleanNumber === '1234567890') {
        result = { success: false, status: 'CLOSED', message: '휴/폐업 상태인 사업자등록번호입니다.' };
      } else {
        result = { success: true, status: 'ACTIVE', companyName: '토스(더미)', message: '정상 사업자입니다.' };
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 실제 API 호출 로직
    const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${API_KEY}`;
    
    const ntsRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        b_no: [cleanNumber]
      })
    });

    const data = await ntsRes.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('국세청 응답이 유효하지 않습니다.');
    }

    const statusObj = data.data[0];
    const taxType = statusObj.b_stt_cd;

    let result = {};
    if (taxType === "01") {
      result = { success: true, status: 'ACTIVE', message: '정상 사업자입니다.' };
    } else if (taxType === "02" || taxType === "03") {
      result = { success: false, status: 'CLOSED', message: '휴/폐업 상태인 사업자등록번호입니다.' };
    } else {
      result = { success: false, status: 'INVALID', message: '국세청에 등록되지 않은 사업자등록번호입니다.' };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
