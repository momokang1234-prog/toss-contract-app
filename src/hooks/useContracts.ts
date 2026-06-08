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
    worker_name: '김알바',
    worker_phone: '01098765432',
    contract_type: 'partTime',
    status: 'draft',
    start_date: '2026-07-01',
    workplace: '서울특별시 강남구 테헤란로 123',
    job_description: '카페 서빙 및 음료 제조',
    wage_type: 'hourly',
    base_wage: 10030,
    wage_payment_date: '매월 10일',
    wage_payment_method: 'bankTransfer',
    work_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start_time: '09:00',
    end_time: '18:00',
    break_minutes: 60,
    weekly_holiday: 'sun',
    paid_leave_clause: true,
    social_insurance_clause: true,
    severance_clause: true,
    created_at: '2026-06-05T10:00:00+09:00',
    updated_at: '2026-06-05T10:00:00+09:00',
  },
  {
    id: 'mock-contract-2',
    business_id: 'mock-biz-1',
    employer_user_key: 'mock-employer-key',
    worker_name: '이파트',
    worker_phone: '01011112222',
    contract_type: 'partTime',
    status: 'sent',
    start_date: '2026-06-15',
    workplace: '서울특별시 강남구 테헤란로 123',
    job_description: '매장 관리 및 고객 응대',
    wage_type: 'hourly',
    base_wage: 11000,
    wage_payment_date: '매월 15일',
    wage_payment_method: 'bankTransfer',
    work_days: ['sat', 'sun'],
    start_time: '10:00',
    end_time: '20:00',
    break_minutes: 60,
    weekly_holiday: undefined,
    paid_leave_clause: true,
    social_insurance_clause: true,
    severance_clause: true,
    created_at: '2026-06-04T14:00:00+09:00',
    updated_at: '2026-06-04T14:00:00+09:00',
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
      await new Promise(r => setTimeout(r, 300));
      let filtered = mockContractStore;
      if (userRole === 'employer') {
        filtered = filtered.filter(c => c.employer_user_key === userProfile.userKey);
      } else if (userRole === 'worker') {
        filtered = filtered.filter(c => c.worker_user_key === userProfile.userKey || c.worker_phone === userProfile.phone);
      }
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
      return mockContractStore.find(c => c.id === id) ?? null;
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

  return {
    contracts,
    loading,
    getContract,
    createContract,
    updateContract,
    sendContract,
    signContract,
    completeContract,
    getHistory,
    refetch: fetchContracts,
  };
}

// getHistory is a standalone helper (not a hook)
async function getHistory(contractId: string) {
  if (IS_MOCK) {
    return [
      { id: 'hist-1', contract_id: contractId, action: 'created', actor_role: 'employer', created_at: '2026-06-05T10:00:00+09:00' },
    ];
  }

  const { data } = await supabase
    .from('contract_history')
    .select('*')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: false });
  return data ?? [];
}
