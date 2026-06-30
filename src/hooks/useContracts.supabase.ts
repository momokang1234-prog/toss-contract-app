import { supabase } from '../api/supabase';
import { Contract, ContractService } from './useContracts.types';

export class SupabaseContractService implements ContractService {
  async fetchContracts(userKey: string, userRole: 'employer' | 'worker', phone?: string): Promise<Contract[]> {
    let query = supabase.from('contracts').select('*').order('created_at', { ascending: false });

    if (userRole === 'employer') {
      query = query.eq('employer_user_key', userKey);
    } else if (userRole === 'worker') {
      query = query.or(`worker_user_key.eq.${userKey},worker_phone.eq.${phone}`).neq('status', 'draft');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async getContract(id: string): Promise<Contract | null> {
    const { data, error } = await supabase.from('contracts').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  async createContract(input: Partial<Contract> & { business_id: string }, userKey: string): Promise<Contract> {
    // business_id 소유권 검증
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', input.business_id)
      .eq('owner_user_key', userKey)
      .single();
    if (!business) throw new Error('사업장을 찾을 수 없거나 접근 권한이 없습니다.');

    const { data, error } = await supabase
      .from('contracts')
      .insert({ ...input, employer_user_key: userKey, status: 'draft' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async inviteWorker(business_id: string, employerKey: string): Promise<Contract> {
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .eq('owner_user_key', employerKey)
      .single();
    if (!business) throw new Error('사업장을 찾을 수 없거나 접근 권한이 없습니다.');

    const { data, error } = await supabase
      .from('contracts')
      .insert({ business_id, employer_user_key: employerKey, status: 'invited' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async acceptInvite(id: string, workerInfo: { name: string; phone: string; ci?: string; ciHash?: string }): Promise<Contract> {
    const { data: existing, error: fetchError } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    if (existing.status !== 'invited') {
      throw new Error('초대된 계약서가 아닙니다.');
    }

    const { data, error } = await supabase
      .from('contracts')
      .update({
        status: 'connected',
        worker_name: workerInfo.name,
        worker_phone: workerInfo.phone,
        worker_ci: workerInfo.ci,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateContract(id: string, input: Partial<Contract>): Promise<Contract> {
    const { data: existing, error: fetchError } = await supabase
      .from('contracts')
      .select('status')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    if (existing.status !== 'draft' && existing.status !== 'rejected' && existing.status !== 'connected' && existing.status !== 'invited' && existing.status !== 'change_requested') {
      throw new Error('이 상태에서는 수정할 수 없습니다.');
    }

    const { data, error } = await supabase
      .from('contracts')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async sendContract(id: string): Promise<Contract> {
    const { data, error } = await supabase.functions.invoke('contracts-send', {
      body: { contractId: id },
    });
    if (error) throw error;
    return data;
  }

  async signContract(id: string, workerInfo: any): Promise<Contract> {
    const { data, error } = await supabase.functions.invoke('contracts-sign', {
      body: { contractId: id, workerInfo },
    });
    if (error) throw error;
    return data;
  }

  async completeContract(id: string, htmlStr?: string, pdfUrl?: string, employerSignatureData?: string): Promise<Contract> {
    const { data, error } = await supabase.functions.invoke('contracts-complete', {
      body: { contractId: id, contract_html: htmlStr, contract_pdf_url: pdfUrl, employer_signature_data: employerSignatureData },
    });
    if (error) throw error;
    return data;
  }

  async cancelContract(id: string): Promise<Contract> {
    const { data, error } = await supabase.functions.invoke('contracts-cancel', {
      body: { contractId: id },
    });
    if (error) throw error;
    return data;
  }

  async expireContract(id: string): Promise<Contract> {
    const { data, error } = await supabase.functions.invoke('contracts-expire', {
      body: { contractId: id },
    });
    if (error) throw error;
    return data;
  }

  async viewContract(id: string): Promise<Contract> {
    const { data, error } = await supabase.rpc('view_contract', {
      p_contract_id: id,
    });
    if (error) throw error;
    return data;
  }

  async markDocumentReceived(id: string, docType: 'parent_consent' | 'family_cert' | 'employment_permit'): Promise<Contract> {
    const { data, error } = await supabase.rpc('mark_document_received', {
      p_contract_id: id,
      p_doc_type: docType,
    });
    if (error) throw error;
    return data as Contract;
  }

  async rejectContract(id: string, reason?: string): Promise<Contract> {
    const { data, error } = await supabase.rpc('reject_contract', {
      p_contract_id: id,
      p_reason: reason,
    });
    if (error) throw error;
    return data;
  }

  async requestChangeContract(id: string, reason: string): Promise<Contract> {
    const { data, error } = await supabase.rpc('request_change_contract', {
      p_contract_id: id,
      p_reason: reason,
    });
    if (error) throw error;
    return data;
  }

  async getHistory(contractId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('contract_history')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}
