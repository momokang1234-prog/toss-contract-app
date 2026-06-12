import { useState, useEffect, useCallback } from 'react';
import { supabase, IS_MOCK } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Business {
  id: string;
  owner_user_key: string;
  business_number: string;
  business_name: string;
  representative: string;
  address: string;
  phone?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Mock 데이터
const MOCK_BUSINESSES: Business[] = [
  {
    id: 'biz-001',
    owner_user_key: 'mock-employer-key',
    business_number: '123-45-67890',
    business_name: '샐러둡카페 강남점',
    representative: '박대표',
    address: '서울특별시 강남구 논현동 123-4',
    phone: '02-1234-5678',
    is_verified: true,
    created_at: '2026-06-01T09:00:00+09:00',
    updated_at: '2026-06-01T09:00:00+09:00',
  },
  {
    id: 'biz-002',
    owner_user_key: 'mock-employer-key',
    business_number: '234-56-78901',
    business_name: '맛있는 식당 강남본점',
    representative: '김식당',
    address: '서울특별시 서초구 서초대로 77길 55',
    phone: '02-9876-5432',
    is_verified: true,
    created_at: '2026-05-15T09:00:00+09:00',
    updated_at: '2026-05-15T09:00:00+09:00',
  },
  {
    id: 'biz-003',
    owner_user_key: 'mock-employer-key',
    business_number: '345-67-89012',
    business_name: '와우 스튜디오',
    representative: '이디자인',
    address: '서울특별시 마포구 와우산로 94',
    phone: '02-1111-2222',
    is_verified: true,
    created_at: '2026-04-10T09:00:00+09:00',
    updated_at: '2026-04-10T09:00:00+09:00',
  },
  {
    id: 'biz-004',
    owner_user_key: 'mock-employer-key',
    business_number: '456-78-90123',
    business_name: '토스랩스',
    representative: '최개발',
    address: '서울특별시 송파구 올림픽로 300 롯데월드타워 76층',
    phone: '02-3333-4444',
    is_verified: true,
    created_at: '2026-03-02T09:00:00+09:00',
    updated_at: '2026-03-02T09:00:00+09:00',
  },
  {
    id: 'biz-005',
    owner_user_key: 'mock-employer-key',
    business_number: '567-89-01234',
    business_name: '이태원 프로덕션',
    representative: '정영상',
    address: '서울특별시 용산구 이태원로 27길 18',
    phone: '02-5555-6666',
    is_verified: true,
    created_at: '2025-12-01T09:00:00+09:00',
    updated_at: '2025-12-01T09:00:00+09:00',
  },
];

let mockBusinessStore = [...MOCK_BUSINESSES];

export function useBusiness() {
  const { userProfile, userRole } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBusinesses = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);

    if (IS_MOCK) {
      await new Promise(r => setTimeout(r, 300));
      setBusinesses(
        userRole === 'employer'
          ? mockBusinessStore.filter(b => b.owner_user_key === userProfile.userKey)
          : mockBusinessStore
      );
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_user_key', userProfile.userKey)
      .order('created_at', { ascending: false });
    setBusinesses(data ?? []);
    setLoading(false);
  }, [userProfile]);

  useEffect(() => { fetchBusinesses(); }, [fetchBusinesses]);

  const createBusiness = async (input: Omit<Business, 'id' | 'owner_user_key' | 'is_verified' | 'created_at' | 'updated_at'>) => {
    if (!userProfile) throw new Error('Not authenticated');

    if (IS_MOCK) {
      const newBiz: Business = {
        ...input,
        id: `mock-biz-${Date.now()}`,
        owner_user_key: userProfile.userKey,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockBusinessStore = [newBiz, ...mockBusinessStore];
      await fetchBusinesses();
      return newBiz;
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert({ ...input, owner_user_key: userProfile.userKey })
      .select()
      .single();
    if (error) throw error;
    await fetchBusinesses();
    return data;
  };

  const updateBusiness = async (id: string, input: Partial<Business>) => {
    if (IS_MOCK) {
      mockBusinessStore = mockBusinessStore.map(b => b.id === id ? { ...b, ...input } : b);
      await fetchBusinesses();
      return mockBusinessStore.find(b => b.id === id)!;
    }

    const { data, error } = await supabase
      .from('businesses')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    await fetchBusinesses();
    return data;
  };

  return { businesses, loading, createBusiness, updateBusiness, refetch: fetchBusinesses };
}
