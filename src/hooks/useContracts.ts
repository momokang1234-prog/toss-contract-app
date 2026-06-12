import { useState, useEffect, useCallback } from 'react';
import { supabase, IS_MOCK } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Contract {
  id: string;
  business_id: string;
  employer_user_key: string;
  worker_name: string;
  worker_phone: string;
  worker_user_key?: string;
  worker_address?: string;
  worker_account?: string;
  worker_ci?: string;
  contract_type: string;
  status: string;
  start_date: string;
  end_date?: string;
  workplace: string;
  job_description: string;
  wage_type: string;
  base_wage: number;
  wage_payment_date: string;
  wage_payment_method: string;
  work_days: string[];
  start_time: string;
  end_time: string;
  break_start_time: string;
  break_end_time: string;
  weekly_holiday?: string;
  paid_leave_clause: boolean;
  pension: boolean;
  health_insurance: boolean;
  employment_insurance: boolean;
  accident_insurance: boolean;
  social_insurance_clause: boolean;
  severance_clause: boolean;
  employer_signed_at?: string;
  worker_signed_at?: string;
  worker_signature_data?: string;
  contract_html?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// Mock 데이터 — 온보딩용 빈 상태
const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'mock-1',
    business_id: 'biz-001',
    employer_user_key: 'mock-employer-key',
    worker_name: '박민수',
    worker_phone: '01011112222',
    contract_type: 'fullTime',
    status: 'draft',
    start_date: '2026-06-01',
    workplace: '강남구 논현동 123-4',
    job_description: '카페 매장 관리 및 고객 응대, 음료 제조',
    wage_type: 'monthly',
    base_wage: 2500000,
    wage_payment_date: '10',
    wage_payment_method: 'bankTransfer',
    work_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start_time: '09:00',
    end_time: '18:00',
    break_start_time: '12:00',
    break_end_time: '13:00',
    weekly_holiday: 'sun',
    paid_leave_clause: true,
    pension: true,
    health_insurance: true,
    employment_insurance: true,
    accident_insurance: true,
    social_insurance_clause: true,
    severance_clause: true,
    created_at: '2026-06-01T09:00:00Z',
    updated_at: '2026-06-01T09:00:00Z',
  },
  {
    id: 'mock-2',
    business_id: 'biz-002',
    employer_user_key: 'mock-employer-key',
    worker_user_key: 'mock-worker-key',
    worker_name: '김알바',
    worker_phone: '01098765432',
    contract_type: 'partTime',
    status: 'sent',
    start_date: '2026-05-20',
    workplace: '서초구 서초대로 77길 55',
    job_description: '주방 보조 및 설거지, 식자재 정리',
    wage_type: 'hourly',
    base_wage: 12000,
    wage_payment_date: '25',
    wage_payment_method: 'bankTransfer',
    work_days: ['tue', 'wed', 'thu', 'fri', 'sat'],
    start_time: '17:00',
    end_time: '22:00',
    break_start_time: '19:00',
    break_end_time: '19:30',
    weekly_holiday: 'mon',
    paid_leave_clause: false,
    pension: false,
    health_insurance: false,
    employment_insurance: false,
    accident_insurance: false,
    social_insurance_clause: false,
    severance_clause: false,
    created_at: '2026-05-15T14:30:00Z',
    updated_at: '2026-05-15T14:30:00Z',
  },
  {
    id: 'mock-3',
    business_id: 'biz-003',
    employer_user_key: 'mock-employer-key',
    worker_user_key: 'worker-user-3',
    worker_name: '이지은',
    worker_phone: '01033334444',
    contract_type: 'fixedTerm',
    status: 'viewed',
    start_date: '2026-04-10',
    workplace: '마포구 와우산로 94',
    job_description: '편집 디자인 및 SNS 콘텐츠 제작, 인쇄물 관리',
    wage_type: 'monthly',
    base_wage: 2200000,
    wage_payment_date: '5',
    wage_payment_method: 'bankTransfer',
    work_days: ['mon', 'tue', 'wed', 'thu'],
    start_time: '10:00',
    end_time: '19:00',
    break_start_time: '13:00',
    break_end_time: '14:00',
    weekly_holiday: 'fri',
    paid_leave_clause: true,
    pension: true,
    health_insurance: true,
    employment_insurance: true,
    accident_insurance: true,
    social_insurance_clause: true,
    severance_clause: false,
    created_at: '2026-04-10T09:00:00Z',
    updated_at: '2026-04-11T15:30:00Z',
  },
  {
    id: 'mock-4',
    business_id: 'biz-004',
    employer_user_key: 'mock-employer-key',
    worker_user_key: 'worker-user-4',
    worker_name: '최재훈',
    worker_phone: '01055556666',
    contract_type: 'fullTime',
    status: 'signed',
    start_date: '2026-03-02',
    workplace: '송파구 올림픽로 300 롯데월드타워 76층',
    job_description: '백엔드 개발 및 API 설계, 데이터베이스 운영 관리',
    wage_type: 'monthly',
    base_wage: 4500000,
    wage_payment_date: '25',
    wage_payment_method: 'bankTransfer',
    work_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start_time: '10:00',
    end_time: '19:00',
    break_start_time: '14:00',
    break_end_time: '15:00',
    weekly_holiday: 'sat,sun',
    paid_leave_clause: true,
    pension: true,
    health_insurance: true,
    employment_insurance: true,
    accident_insurance: true,
    social_insurance_clause: true,
    severance_clause: true,
    created_at: '2026-03-02T09:00:00Z',
    updated_at: '2026-03-03T11:00:00Z',
  },
  {
    id: 'mock-5',
    business_id: 'biz-005',
    employer_user_key: 'mock-employer-key',
    worker_user_key: 'worker-user-5',
    worker_name: '한소희',
    worker_phone: '01077778888',
    contract_type: 'fixedTerm',
    status: 'completed',
    start_date: '2025-12-01',
    workplace: '용산구 이태원로 27길 18',
    job_description: '영상 촬영 및 편집, 유튜브 채널 콘텐츠 기획·운영',
    wage_type: 'monthly',
    base_wage: 5000000,
    wage_payment_date: '15',
    wage_payment_method: 'bankTransfer',
    work_days: ['mon', 'wed', 'fri'],
    start_time: '13:00',
    end_time: '21:00',
    break_start_time: '17:00',
    break_end_time: '18:00',
    weekly_holiday: 'sat,sun',
    paid_leave_clause: false,
    pension: false,
    health_insurance: false,
    employment_insurance: false,
    accident_insurance: false,
    social_insurance_clause: false,
    severance_clause: false,
    created_at: '2025-12-01T09:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
];

// 근로계약서 HTML 생성 헬퍼 (Mock 모드용)
function generateContractHtml(contract: Contract): string {
  const workDaysLabels: Record<string, string> = {
    mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일',
  };
  const workDaysStr = contract.work_days.map(d => workDaysLabels[d] ?? d).join(', ');
  const wageLabel = contract.wage_type === 'monthly' ? `월 ${contract.base_wage.toLocaleString()}원`
    : contract.wage_type === 'hourly' ? `시급 ${contract.base_wage.toLocaleString()}원`
    : `${contract.base_wage.toLocaleString()}원`;

  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><title>근로계약서</title>
<style>body{font-family:'Noto Sans KR',sans-serif;max-width:720px;margin:0 auto;padding:40px 20px;color:#111;line-height:1.8}
h1{text-align:center;font-size:24px;margin-bottom:32px;border-bottom:2px solid #333;padding-bottom:16px}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
th,td{border:1px solid #ddd;padding:10px 14px;text-align:left;font-size:14px}
th{background:#f7f7f7;width:140px;font-weight:600}
.section-title{font-size:16px;font-weight:700;margin:28px 0 12px;border-left:4px solid #333;padding-left:10px}
.signature-area{display:flex;justify-content:space-between;margin-top:48px;padding-top:24px;border-top:1px solid #999}
.signature-box{text-align:center;width:45%}
.signature-box .name{font-size:18px;font-weight:600;margin-bottom:8px}
.signature-box .date{font-size:13px;color:#666}
</style></head>
<body>
<h1>근 로 계 약 서</h1>
<div class="section-title">근로자 정보</div>
<table><tr><th>성명</th><td>${contract.worker_name}</td></tr>
<tr><th>연락처</th><td>${contract.worker_phone}</td></tr>
<tr><th>주소</th><td>${contract.worker_address ?? '-'}</td></tr></table>
<div class="section-title">근로 조건</div>
<table>
<tr><th>근무 장소</th><td>${contract.workplace}</td></tr>
<tr><th>업무 내용</th><td>${contract.job_description}</td></tr>
<tr><th>계약 기간</th><td>${contract.start_date}${contract.end_date ? ' ~ ' + contract.end_date : ' (기간의 정함 없음)'}</td></tr>
<tr><th>근무일</th><td>${workDaysStr}${contract.weekly_holiday ? ' (주휴일: ' + contract.weekly_holiday + ')' : ''}</td></tr>
<tr><th>근무 시간</th><td>${contract.start_time} ~ ${contract.end_time} (휴게 ${contract.break_start_time} ~ ${contract.break_end_time})</td></tr>
<tr><th>임금</th><td>${wageLabel}</td></tr>
<tr><th>임금 지급일</th><td>매월 ${contract.wage_payment_date}일</td></tr>
<tr><th>연차 유급 휴가</th><td>${contract.paid_leave_clause ? '적용' : '미적용'}</td></tr>
<tr><th>국민연금</th><td>${contract.pension ? '적용' : '미적용'}</td></tr>
<tr><th>건강보험</th><td>${contract.health_insurance ? '적용' : '미적용'}</td></tr>
<tr><th>고용보험</th><td>${contract.employment_insurance ? '적용' : '미적용'}</td></tr>
<tr><th>산재보험</th><td>${contract.accident_insurance ? '적용' : '미적용'}</td></tr>
<tr><th>퇴직금</th><td>${contract.severance_clause ? '적용' : '미적용'}</td></tr>
</table>
<div class="signature-area">
<div class="signature-box"><div class="name">사용자(갑)</div><div class="date">${new Date().toISOString().split('T')[0]}</div></div>
<div class="signature-box"><div class="name">근로자(을)</div><div class="date">서명일</div></div>
</div>
</body></html>`;
}

let mockContractStore = [...MOCK_CONTRACTS];

export function useContracts() {
  const { userProfile, userRole } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);

    if (IS_MOCK) {
      let filtered = mockContractStore;
      if (userRole === 'employer') {
        filtered = filtered.filter(c => c.employer_user_key === userProfile.userKey);
      }
      // Mock 모드: 근로자는 모든 계약서를 볼 수 있음 (프로덕션: worker_user_key 필터)
      setContracts(filtered);
      setLoading(false);
      return;
    }

    let query = supabase.from('contracts').select('*').order('created_at', { ascending: false });

    if (userRole === 'employer') {
      query = query.eq('employer_user_key', userProfile.userKey);
    } else if (userRole === 'worker') {
      query = query.or(`worker_user_key.eq.${userProfile.userKey},worker_phone.eq.${userProfile.phone}`);
    }

    const { data } = await query;
    setContracts(data ?? []);
    setLoading(false);
  }, [userProfile, userRole]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  // Task 25: Supabase Realtime 구독 — UPDATE + INSERT (Real 모드에서만)
  useEffect(() => {
    if (IS_MOCK) return;
    const channel = supabase
      .channel('contract-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contracts' },
        (payload) => {
          setContracts(prev => {
            const exists = prev.some(c => c.id === payload.new.id);
            return exists ? prev : [payload.new as Contract, ...prev];
          });
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'contracts' },
        (payload) => {
          setContracts(prev => prev.map(c =>
            c.id === payload.new.id ? { ...c, ...payload.new as Contract } : c
          ));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const getContract = useCallback(async (id: string) => {
    if (IS_MOCK) {
      const c = mockContractStore.find(x => x.id === id);
      if (!c) return null;
      // Auto-expire: sent/viewed + 30일 경과 → expired
      const now = new Date();
      const updated = new Date(c.updated_at);
      const daysSinceUpdate = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
      if ((c.status === 'sent' || c.status === 'viewed') && daysSinceUpdate > 30) {
        c.status = 'expired';
        c.updated_at = now.toISOString();
      }
      return { ...c };
    }
    const { data } = await supabase.from('contracts').select('*').eq('id', id).single();
    return data;
  }, []);

  const createContract = async (input: Partial<Contract> & { business_id: string }) => {
    if (!userProfile) throw new Error('Not authenticated');

    if (IS_MOCK) {
      const newContract: Contract = {
        id: `mock-contract-${Date.now()}`,
        business_id: input.business_id,
        employer_user_key: userProfile.userKey,
        worker_name: input.worker_name ?? '',
        worker_phone: input.worker_phone ?? '',
        contract_type: input.contract_type ?? 'partTime',
        status: 'draft',
        start_date: input.start_date ?? '',
        end_date: input.end_date,
        workplace: input.workplace ?? '',
        job_description: input.job_description ?? '',
        wage_type: input.wage_type ?? 'hourly',
        base_wage: input.base_wage ?? 0,
        wage_payment_date: input.wage_payment_date ?? '',
        wage_payment_method: input.wage_payment_method ?? 'bankTransfer',
        work_days: input.work_days ?? [],
        start_time: input.start_time ?? '',
        end_time: input.end_time ?? '',
        break_start_time: input.break_start_time ?? '',
        break_end_time: input.break_end_time ?? '',
        weekly_holiday: input.weekly_holiday,
        paid_leave_clause: input.paid_leave_clause ?? true,
        pension: input.pension ?? true,
        health_insurance: input.health_insurance ?? true,
        employment_insurance: input.employment_insurance ?? true,
        accident_insurance: input.accident_insurance ?? true,
        social_insurance_clause: input.social_insurance_clause ?? true,
        severance_clause: input.severance_clause ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockContractStore = [newContract, ...mockContractStore];
      await fetchContracts();
      return newContract;
    }

    // Task 15: server-side validation — business_id 소유권 검증
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', input.business_id)
      .eq('owner_id', userProfile.userKey)
      .single();
    if (!business) throw new Error('사업장을 찾을 수 없거나 접근 권한이 없습니다.');

    const { data, error } = await supabase
      .from('contracts')
      .insert({ ...input, employer_user_key: userProfile.userKey, status: 'draft' })
      .select()
      .single();
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  const updateContract = async (id: string, input: Partial<Contract>) => {
    if (IS_MOCK) {
      mockContractStore = mockContractStore.map(c => c.id === id ? { ...c, ...input, updated_at: new Date().toISOString() } : c);
      await fetchContracts();
      return mockContractStore.find(c => c.id === id)!;
    }

    // Task 15: draft 상태일 때만 수정 허용
    const { data: existing, error: fetchError } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    if (existing.status !== 'draft' && existing.status !== 'rejected') throw new Error('이 상태에서는 수정할 수 없습니다.');

    const { data, error } = await supabase
      .from('contracts')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  const sendContract = async (id: string) => {
    if (IS_MOCK) {
      return updateContract(id, { status: 'sent' });
    }
    const { data, error } = await supabase.functions.invoke('contracts-send', {
      body: { contractId: id },
    });
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  const signContract = async (id: string, workerInfo: { phone: string; address: string; account: string; signatureData: string; userKey?: string; name?: string; ci?: string }) => {
    if (IS_MOCK) {
      const contract = mockContractStore.find(c => c.id === id);
      const html = contract ? generateContractHtml(contract) : undefined;
      return updateContract(id, {
        status: 'completed',
        worker_phone: workerInfo.phone,
        worker_address: workerInfo.address,
        worker_account: workerInfo.account,
        worker_user_key: workerInfo.userKey,
        worker_name: workerInfo.name || contract?.worker_name || '이름 없음',
        worker_ci: workerInfo.ci,
        worker_signature_data: workerInfo.signatureData,
        worker_signed_at: new Date().toISOString(),
        employer_signed_at: new Date().toISOString(),
        contract_html: html,
      });
    }
    const { data, error } = await supabase.functions.invoke('contracts-sign', {
      body: { contractId: id, workerInfo },
    });
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  // Task 8 + 11: completeContract — employer_signed_at + contract_html + contract_pdf_url
  const completeContract = async (id: string) => {
    if (IS_MOCK) {
      const contract = mockContractStore.find(c => c.id === id);
      if (!contract) throw new Error('계약서를 찾을 수 없습니다.');
      const html = generateContractHtml(contract);
      return updateContract(id, {
        status: 'completed',
        employer_signed_at: new Date().toISOString(),
        contract_html: html,
      });
    }
    // Real: contracts-complete Edge Function이 서버 측에서 employer_signed_at, HTML/PDF 생성 처리
    const { data, error } = await supabase.functions.invoke('contracts-complete', {
      body: { contractId: id },
    });
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  // Task 14: cancelContract → contracts-cancel Edge Function
  const cancelContract = async (id: string) => {
    if (IS_MOCK) {
      return updateContract(id, { status: 'cancelled' });
    }
    const { data, error } = await supabase.functions.invoke('contracts-cancel', {
      body: { contractId: id },
    });
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  // Task 14: expireContract → contracts-expire Edge Function
  const expireContract = async (id: string) => {
    if (IS_MOCK) {
      return updateContract(id, { status: 'expired' });
    }
    const { data, error } = await supabase.functions.invoke('contracts-expire', {
      body: { contractId: id },
    });
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  // Task 13: viewContract → contracts-view Edge Function
  const viewContract = async (id: string) => {
    if (IS_MOCK) {
      return updateContract(id, { status: 'viewed' });
    }
    const { data, error } = await supabase.functions.invoke('contracts-view', {
      body: { contractId: id },
    });
    if (error) throw error;
    return data;
  };

  // Task 21: rejectContract → contracts-reject Edge Function
  const rejectContract = async (id: string, reason?: string) => {
    if (IS_MOCK) {
      return updateContract(id, { status: 'rejected' });
    }
    const { data, error } = await supabase.functions.invoke('contracts-reject', {
      body: { contractId: id, rejection_reason: reason },
    });
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  return {
    contracts,
    loading,
    getContract,
    createContract,
    updateContract,
    sendContract,
    signContract,
    completeContract,
    cancelContract,
    expireContract,
    getHistory,
    viewContract,
    rejectContract,
    refetch: fetchContracts,
  };
}

// getHistory is a standalone helper (not a hook)
async function getHistory(contractId: string) {
  if (IS_MOCK) {
    const histories: Record<string, Array<{id:string; contract_id:string; action:string; actor_role:string; created_at:string}>> = {
      'mock-contract-1': [
        { id:'h1-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-06-05T10:00:00+09:00' },
      ],
      'mock-contract-2': [
        { id:'h2-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-06-04T14:00:00+09:00' },
        { id:'h2-2', contract_id: contractId, action:'send', actor_role:'employer', created_at:'2026-06-08T09:00:00+09:00' },
      ],
      'mock-contract-3': [
        { id:'h3-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-05-28T16:00:00+09:00' },
        { id:'h3-2', contract_id: contractId, action:'send', actor_role:'employer', created_at:'2026-05-28T17:00:00+09:00' },
        { id:'h3-3', contract_id: contractId, action:'view', actor_role:'worker', created_at:'2026-06-01T11:30:00+09:00' },
      ],
      'mock-contract-4': [
        { id:'h4-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-05-10T09:00:00+09:00' },
        { id:'h4-2', contract_id: contractId, action:'send', actor_role:'employer', created_at:'2026-05-10T10:00:00+09:00' },
        { id:'h4-3', contract_id: contractId, action:'view', actor_role:'worker', created_at:'2026-05-12T14:00:00+09:00' },
        { id:'h4-4', contract_id: contractId, action:'sign', actor_role:'worker', created_at:'2026-05-20T14:00:00+09:00' },
      ],
      'mock-contract-5': [
        { id:'h5-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-03-25T10:00:00+09:00' },
        { id:'h5-2', contract_id: contractId, action:'send', actor_role:'employer', created_at:'2026-03-25T11:00:00+09:00' },
        { id:'h5-3', contract_id: contractId, action:'view', actor_role:'worker', created_at:'2026-03-26T09:00:00+09:00' },
        { id:'h5-4', contract_id: contractId, action:'sign', actor_role:'worker', created_at:'2026-04-08T11:00:00+09:00' },
        { id:'h5-5', contract_id: contractId, action:'complete', actor_role:'employer', created_at:'2026-04-10T17:00:00+09:00' },
      ],
    };
    return histories[contractId] || [];
  }

  const { data } = await supabase
    .from('contract_history')
    .select('*')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: false });
  return data ?? [];
}
