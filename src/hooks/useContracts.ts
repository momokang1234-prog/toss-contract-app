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
  break_minutes: number;
  weekly_holiday?: string;
  paid_leave_clause: boolean;
  social_insurance_clause: boolean;
  severance_clause: boolean;
  employer_signed_at?: string;
  worker_signed_at?: string;
  worker_signature_data?: string;
  contract_html?: string;
  created_at: string;
  updated_at: string;
}

// Mock 데이터
const MOCK_CONTRACTS: Contract[] = [
  {
    id: 'mock-contract-1',
    business_id: 'mock-biz-1',
    employer_user_key: 'mock-employer-key',
    worker_name: '김알바', worker_phone: '01098765432',
    contract_type: 'partTime', status: 'draft',
    start_date: '2026-07-01',
    workplace: '서울 강남구 테헤란로 123',
    job_description: '카페 서빙 및 음료 제조',
    wage_type: 'hourly', base_wage: 10030,
    wage_payment_date: '매월 10일', wage_payment_method: 'bankTransfer',
    work_days: ['mon','tue','wed','thu','fri'],
    start_time: '09:00', end_time: '18:00', break_minutes: 60,
    weekly_holiday: 'sun',
    paid_leave_clause: true, social_insurance_clause: true, severance_clause: true,
    created_at: '2026-06-05T10:00:00+09:00', updated_at: '2026-06-05T10:00:00+09:00',
  },
  {
    id: 'mock-contract-2',
    business_id: 'mock-biz-1',
    employer_user_key: 'mock-employer-key',
    worker_user_key: 'worker-key-001',
    contract_type: 'fullTime', status: 'sent',
    start_date: '2026-06-15',
    workplace: '서울 강남구 테헤란로 123',
    job_description: '매장 관리 및 고객 응대',
    wage_type: 'monthly', base_wage: 2500000,
    wage_payment_date: '매월 25일', wage_payment_method: 'bankTransfer',
    work_days: ['mon','tue','wed','thu','fri'],
    start_time: '10:00', end_time: '19:00', break_minutes: 60,
    paid_leave_clause: true, social_insurance_clause: true, severance_clause: true,
    created_at: '2026-06-04T14:00:00+09:00', updated_at: '2026-06-08T09:00:00+09:00',
  },
  {
    id: 'mock-contract-3',
    business_id: 'mock-biz-1',
    employer_user_key: 'mock-employer-key',
    worker_user_key: 'worker-key-001',
    contract_type: 'partTime', status: 'viewed',
    start_date: '2026-06-01',
    workplace: '서울 마포구 와우산로 45',
    job_description: '배달 및 주방 보조',
    wage_type: 'hourly', base_wage: 11000,
    wage_payment_date: '매월 5일', wage_payment_method: 'cash',
    work_days: ['tue','thu','sat'],
    start_time: '17:00', end_time: '22:00', break_minutes: 30,
    weekly_holiday: 'mon',
    paid_leave_clause: false, social_insurance_clause: false, severance_clause: false,
    created_at: '2026-05-28T16:00:00+09:00', updated_at: '2026-06-01T11:30:00+09:00',
  },
  {
    id: 'mock-contract-4',
    business_id: 'mock-biz-1',
    employer_user_key: 'mock-employer-key',
    worker_user_key: 'worker-key-001',
    contract_type: 'fullTime', status: 'signed',
    start_date: '2026-05-15',
    workplace: '서울 송파구 올림픽로 300',
    job_description: '오피스 어드민 및 회계 보조',
    wage_type: 'monthly', base_wage: 2800000,
    wage_payment_date: '매월 30일', wage_payment_method: 'bankTransfer',
    work_days: ['mon','tue','wed','thu','fri'],
    start_time: '09:00', end_time: '18:00', break_minutes: 60,
    weekly_holiday: 'sat',
    paid_leave_clause: true, social_insurance_clause: true, severance_clause: true,
    worker_signed_at: '2026-05-20T14:00:00+09:00',
    worker_signature_data: 'data:image/png;base64,iVBORw0KGgo=',
    created_at: '2026-05-10T09:00:00+09:00', updated_at: '2026-05-20T14:00:00+09:00',
  },
  {
    id: 'mock-contract-5',
    business_id: 'mock-biz-1',
    employer_user_key: 'mock-employer-key',
    worker_user_key: 'worker-key-001',
    contract_type: 'fullTime', status: 'completed',
    start_date: '2026-04-01',
    workplace: '서울 중구 을지로 100',
    job_description: '프론트엔드 개발',
    wage_type: 'monthly', base_wage: 3500000,
    wage_payment_date: '매월 25일', wage_payment_method: 'bankTransfer',
    work_days: ['mon','tue','wed','thu','fri'],
    start_time: '10:00', end_time: '19:00', break_minutes: 60,
    weekly_holiday: 'sun',
    paid_leave_clause: true, social_insurance_clause: true, severance_clause: true,
    employer_signed_at: '2026-04-10T17:00:00+09:00',
    worker_signed_at: '2026-04-08T11:00:00+09:00',
    worker_signature_data: 'data:image/png;base64,iVBORw0KGgo=',
    created_at: '2026-03-25T10:00:00+09:00', updated_at: '2026-04-10T17:00:00+09:00',
  },
];

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

  const getContract = async (id: string) => {
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
  };

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
        break_minutes: input.break_minutes ?? 0,
        weekly_holiday: input.weekly_holiday,
        paid_leave_clause: input.paid_leave_clause ?? true,
        social_insurance_clause: input.social_insurance_clause ?? true,
        severance_clause: input.severance_clause ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockContractStore = [newContract, ...mockContractStore];
      await fetchContracts();
      return newContract;
    }

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

  const signContract = async (id: string, signatureData: string) => {
    if (IS_MOCK) {
      return updateContract(id, {
        status: 'signed',
        worker_signature_data: signatureData,
        worker_signed_at: new Date().toISOString(),
      });
    }
    const { data, error } = await supabase.functions.invoke('contracts-sign', {
      body: { contractId: id, signatureData },
    });
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  const completeContract = async (id: string) => {
    if (IS_MOCK) {
      return updateContract(id, { status: 'completed' });
    }
    const { data, error } = await supabase.functions.invoke('contracts-complete', {
      body: { contractId: id },
    });
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  const cancelContract = async (id: string) => {
    if (IS_MOCK) {
      return updateContract(id, { status: 'cancelled' });
    }
    const { data, error } = await supabase
      .from('contracts')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .in('status', ['draft', 'signed'])
      .select()
      .single();
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  const expireContract = async (id: string) => {
    if (IS_MOCK) {
      return updateContract(id, { status: 'expired' });
    }
    const { data, error } = await supabase
      .from('contracts')
      .update({ status: 'expired' })
      .eq('id', id)
      .in('status', ['sent', 'viewed'])
      .select()
      .single();
    if (error) throw error;
    await fetchContracts();
    return data;
  };

  const viewContract = async (id: string) => {
    if (IS_MOCK) {
      return updateContract(id, { status: 'viewed' });
    }
    const { data, error } = await supabase
      .from('contracts')
      .update({ status: 'viewed' })
      .eq('id', id)
      .eq('status', 'sent')
      .select()
      .single();
    if (error) throw error;
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
