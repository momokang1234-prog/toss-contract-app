import { useState, useEffect, useCallback } from 'react';
import { supabase, IS_MOCK } from '../api/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Contract,
  DocStatus,
  getAge,
  needsParentConsent,
  isYoungWorker,
  isUnderMinimumAge
} from './useContracts.types';
import { SupabaseContractService } from './useContracts.supabase';
import { MockContractService } from './useContracts.service';

export { getAge, needsParentConsent, isYoungWorker, isUnderMinimumAge };
export type { Contract, DocStatus };

const contractService = IS_MOCK ? new MockContractService() : new SupabaseContractService();

export function useContracts() {
  const { userProfile, userRole } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContracts = useCallback(async () => {
    if (!userProfile || !userRole) return;
    setLoading(true);
    setError(null);
    try {
      const data = await contractService.fetchContracts(userProfile.userKey, userRole, userProfile.phone);
      setContracts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch contracts'));
      // Analytics tracking for contract fetch errors
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('contracts_fetch_error', {
          error_message: err instanceof Error ? err.message : 'Unknown error',
          user_role: userRole
        });
      }
    } finally {
      setLoading(false);
    }
  }, [userProfile, userRole]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  // Supabase Realtime 구독 — UPDATE + INSERT (Real 모드에서만)
  useEffect(() => {
    if (IS_MOCK) return;
    const channelId = `contract-changes-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contracts' },
        () => { fetchContracts(); }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'contracts' },
        () => { fetchContracts(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchContracts]);

  const getContract = useCallback(async (id: string) => {
    return contractService.getContract(id);
  }, []);

  const createContract = async (input: Partial<Contract> & { business_id: string }) => {
    if (!userProfile) throw new Error('Not authenticated');
    const data = await contractService.createContract(input, userProfile.userKey);
    await fetchContracts();
    return data;
  };

  const inviteWorker = async (business_id: string) => {
    if (!userProfile) throw new Error('Not authenticated');
    const data = await contractService.inviteWorker(business_id, userProfile.userKey);
    await fetchContracts();
    return data;
  };

  const acceptInvite = async (id: string, workerInfo: { name: string; phone: string; ci?: string; ciHash?: string }) => {
    const data = await contractService.acceptInvite(id, workerInfo);
    await fetchContracts();
    return data;
  };

  const updateContract = async (id: string, input: Partial<Contract>) => {
    const data = await contractService.updateContract(id, input);
    await fetchContracts();
    return data;
  };

  const sendContract = async (id: string) => {
    const data = await contractService.sendContract(id);
    await fetchContracts();
    return data;
  };

  const signContract = async (
    id: string,
    workerInfo: {
      phone: string;
      address: string;
      account: string;
      signatureData: string;
      userKey?: string;
      name?: string;
      ci?: string;
      worker_birth_date?: string;
      is_minor?: boolean;
      is_young_worker?: boolean;
      parent_consent_data?: string;
      doc_parent_consent_status?: DocStatus;
      doc_family_cert_status?: DocStatus;
      doc_employment_permit_status?: DocStatus;
    }
  ) => {
    const data = await contractService.signContract(id, workerInfo);
    await fetchContracts();
    return data;
  };

  const completeContract = async (id: string, htmlStr?: string, pdfUrl?: string, employerSignatureData?: string) => {
    const data = await contractService.completeContract(id, htmlStr, pdfUrl, employerSignatureData);
    await fetchContracts();
    return data;
  };

  const cancelContract = async (id: string) => {
    const data = await contractService.cancelContract(id);
    await fetchContracts();
    return data;
  };

  const expireContract = async (id: string) => {
    const data = await contractService.expireContract(id);
    await fetchContracts();
    return data;
  };

  const viewContract = async (id: string) => {
    const data = await contractService.viewContract(id);
    await fetchContracts();
    return data;
  };

  const markDocumentReceived = async (id: string, docType: 'parent_consent' | 'family_cert' | 'employment_permit') => {
    const data = await contractService.markDocumentReceived(id, docType);
    await fetchContracts();
    return data;
  };

  const rejectContract = async (id: string, reason?: string) => {
    const data = await contractService.rejectContract(id, reason);
    await fetchContracts();
    return data;
  };

  const requestChangeContract = async (id: string, reason: string) => {
    const data = await contractService.requestChangeContract(id, reason);
    await fetchContracts();
    return data;
  };

  return {
    contracts,
    loading,
    error,
    getContract,
    createContract,
    inviteWorker,
    acceptInvite,
    updateContract,
    sendContract,
    signContract,
    completeContract,
    cancelContract,
    expireContract,
    getHistory: (contractId: string) => contractService.getHistory(contractId),
    viewContract,
    rejectContract,
    requestChangeContract,
    markDocumentReceived,
    refetch: fetchContracts,
  };
}
