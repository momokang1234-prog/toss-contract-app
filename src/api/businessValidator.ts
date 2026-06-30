import { supabase, IS_MOCK } from './supabase';

export interface BusinessValidationResult {
  success: boolean;
  status: 'ACTIVE' | 'CLOSED' | 'INVALID';
  companyName?: string;
  message?: string;
}

export async function validateBusinessNumber(businessNumber: string): Promise<BusinessValidationResult> {
  const cleanNumber = businessNumber.replace(/-/g, '');

  if (cleanNumber.length !== 10) {
    return {
      success: false,
      status: 'INVALID',
      message: '사업자등록번호는 10자리 숫자여야 합니다.',
    };
  }

  const NTS_API_KEY = import.meta.env.VITE_NTS_API_KEY;

  if (NTS_API_KEY) {
    try {
      const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${NTS_API_KEY}`;
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

      if (taxType === "01") {
        return { success: true, status: 'ACTIVE', message: '정상 사업자입니다.' };
      } else if (taxType === "02" || taxType === "03") {
        return { success: false, status: 'CLOSED', message: '휴/폐업 상태인 사업자등록번호입니다.' };
      } else {
        return { success: false, status: 'INVALID', message: '국세청에 등록되지 않은 사업자등록번호입니다.' };
      }
    } catch (err) {
      console.error('NTS API Error:', err);
      // Fallback to mock logic if network fails, or return error
      return { success: false, status: 'INVALID', message: '국세청 서버와 통신할 수 없습니다.' };
    }
  }

  if (IS_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    if (cleanNumber === '0000000000') {
      return { success: false, status: 'INVALID', message: '테스트: 유효하지 않은 사업자등록번호' };
    }
    return { success: true, status: 'ACTIVE', companyName: '토스 테스트 매장' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('business-validator', {
      body: { businessNumber: cleanNumber },
    });

    if (error) throw error;
    
    return data;
    
  } catch (err: any) {
    console.error('Business Validation Error:', err);
    return {
      success: false,
      status: 'INVALID',
      message: '통신 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    };
  }
}
