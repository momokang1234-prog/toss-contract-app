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
