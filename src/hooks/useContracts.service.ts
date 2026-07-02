import { Contract, DocStatus, ContractService } from './useContracts.types';
import { MOCK_CONTRACTS, generateContractHtml } from './useContracts.mock';

let initialStore = [...MOCK_CONTRACTS];
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('MOCK_CONTRACTS_STORE');
  if (saved) {
    try { 
      const parsed = JSON.parse(saved) as Contract[]; 
      // Merge templates if they are missing
      const templates = MOCK_CONTRACTS.filter(c => c.status === 'template');
      const missingTemplates = templates.filter(t => !parsed.some(p => p.id === t.id));
      initialStore = [...missingTemplates, ...parsed];
    } catch (e) {}
  } else {
    localStorage.setItem('MOCK_CONTRACTS_STORE', JSON.stringify(initialStore));
  }
}

export let mockContractStore = initialStore;

export function setMockContractStore(newStore: Contract[]) {
  mockContractStore = newStore;
  if (typeof window !== 'undefined') {
    localStorage.setItem('MOCK_CONTRACTS_STORE', JSON.stringify(mockContractStore));
  }
}

/** Mock 계약서 신규 조립 로직 */
export function buildNewMockContract(
  input: Partial<Contract> & { business_id: string },
  employerUserKey: string
): Contract {
  return {
    id: `mock-contract-${Date.now()}`,
    business_id: input.business_id,
    employer_user_key: employerUserKey,
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
    work_schedule: input.work_schedule,
    schedule_mode: input.schedule_mode,
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
    employer_signature_data: input.employer_signature_data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/** Mock 근로자 서명 주입 데이터 빌더 */
export function buildSignedMockContract(
  contract: Contract,
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
): Partial<Contract> {
  const html = generateContractHtml(contract);
  return {
    status: 'signed',
    worker_phone: workerInfo.phone,
    worker_address: workerInfo.address,
    worker_account: workerInfo.account,
    worker_user_key: workerInfo.userKey,
    worker_name: workerInfo.name || contract.worker_name || '이름 없음',
    worker_ci: workerInfo.ci,
    worker_signature_data: workerInfo.signatureData,
    worker_signed_at: new Date().toISOString(),
    contract_html: html,
    worker_birth_date: workerInfo.worker_birth_date,
    is_minor: workerInfo.is_minor,
    is_young_worker: workerInfo.is_young_worker,
    parent_consent_data: workerInfo.parent_consent_data,
    doc_parent_consent_status: workerInfo.doc_parent_consent_status,
    doc_family_cert_status: workerInfo.doc_family_cert_status,
    doc_employment_permit_status: workerInfo.doc_employment_permit_status,
  };
}

export class MockContractService implements ContractService {
  async fetchContracts(userKey: string, userRole: 'employer' | 'worker', phone?: string): Promise<Contract[]> {
    let filtered = mockContractStore;
    if (userRole === 'employer') {
      filtered = filtered.filter(c => c.employer_user_key === userKey);
    }
    return filtered;
  }

  async getContract(id: string): Promise<Contract | null> {
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

  async createContract(input: Partial<Contract> & { business_id: string }, userKey: string): Promise<Contract> {
    const newContract = buildNewMockContract(input, userKey);
    setMockContractStore([newContract, ...mockContractStore]);
    return newContract;
  }

  async inviteWorker(business_id: string, employerKey: string): Promise<Contract> {
    const newContract: Contract = {
      id: `mock-contract-${Date.now()}`,
      business_id,
      employer_user_key: employerKey,
      worker_name: '',
      worker_phone: '',
      contract_type: 'fullTime',
      status: 'invited',
      start_date: '',
      workplace: '',
      job_description: '',
      wage_type: 'hourly',
      base_wage: 0,
      wage_payment_date: '',
      wage_payment_method: 'bankTransfer',
      work_days: [],
      start_time: '',
      end_time: '',
      break_start_time: '',
      break_end_time: '',
      paid_leave_clause: true,
      pension: true,
      health_insurance: true,
      employment_insurance: true,
      accident_insurance: true,
      social_insurance_clause: true,
      severance_clause: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setMockContractStore([newContract, ...mockContractStore]);
    return newContract;
  }

  async acceptInvite(id: string, workerInfo: { name: string; phone: string; ci?: string; ciHash?: string }): Promise<Contract> {
    const contract = mockContractStore.find(c => c.id === id);
    if (!contract) throw new Error('초대장을 찾을 수 없습니다.');
    return this.updateContract(id, { 
      status: 'connected',
      worker_name: workerInfo.name,
      worker_phone: workerInfo.phone,
      worker_ci: workerInfo.ci,
    });
  }

  async updateContract(id: string, input: Partial<Contract>): Promise<Contract> {
    setMockContractStore(mockContractStore.map(c => c.id === id ? { ...c, ...input, updated_at: new Date().toISOString() } : c));
    return mockContractStore.find(c => c.id === id)!;
  }

  async sendContract(id: string): Promise<Contract> {
    return this.updateContract(id, { status: 'sent' });
  }

  async signContract(id: string, workerInfo: any): Promise<Contract> {
    const contract = mockContractStore.find(c => c.id === id);
    if (!contract) throw new Error('계약서를 찾을 수 없습니다.');
    const patch = buildSignedMockContract(contract, workerInfo);
    return this.updateContract(id, patch);
  }

  async completeContract(id: string, htmlStr?: string, pdfUrl?: string, employerSignatureData?: string): Promise<Contract> {
    const contract = mockContractStore.find(c => c.id === id);
    if (!contract) throw new Error('계약서를 찾을 수 없습니다.');
    const html = generateContractHtml(contract);
    return this.updateContract(id, {
      status: 'completed',
      employer_signed_at: new Date().toISOString(),
      employer_signature_data: employerSignatureData || contract.employer_signature_data,
      contract_html: htmlStr || html,
      contract_pdf_url: pdfUrl,
    });
  }

  async cancelContract(id: string): Promise<Contract> {
    return this.updateContract(id, { status: 'cancelled' });
  }

  async expireContract(id: string): Promise<Contract> {
    return this.updateContract(id, { status: 'expired' });
  }

  async viewContract(id: string): Promise<Contract> {
    return this.updateContract(id, { status: 'viewed' });
  }

  async markDocumentReceived(id: string, docType: 'parent_consent' | 'family_cert' | 'employment_permit'): Promise<Contract> {
    const patch: Partial<Contract> = docType === 'parent_consent'
      ? { doc_parent_consent_status: 'received', doc_received_at: new Date().toISOString() }
      : docType === 'family_cert'
      ? { doc_family_cert_status: 'received', doc_received_at: new Date().toISOString() }
      : { doc_employment_permit_status: 'received', doc_received_at: new Date().toISOString() };
    return this.updateContract(id, patch);
  }

  async rejectContract(id: string, reason?: string): Promise<Contract> {
    return this.updateContract(id, { status: 'rejected', rejection_reason: reason });
  }

  async requestChangeContract(id: string, reason: string): Promise<Contract> {
    return this.updateContract(id, { status: 'change_requested', rejection_reason: reason });
  }

  async getHistory(contractId: string): Promise<any[]> {
    const histories: Record<string, Array<{id:string; contract_id:string; action:string; actor_role:string; created_at:string}>> = {
      'mock-1': [
        { id:'h1-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-06-05T10:00:00+09:00' },
      ],
      'mock-2': [
        { id:'h2-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-06-04T14:00:00+09:00' },
        { id:'h2-2', contract_id: contractId, action:'send', actor_role:'employer', created_at:'2026-06-08T09:00:00+09:00' },
      ],
      'mock-3': [
        { id:'h3-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-05-28T16:00:00+09:00' },
        { id:'h3-2', contract_id: contractId, action:'send', actor_role:'employer', created_at:'2026-05-28T17:00:00+09:00' },
        { id:'h3-3', contract_id: contractId, action:'view', actor_role:'worker', created_at:'2026-06-01T11:30:00+09:00' },
      ],
      'mock-4': [
        { id:'h4-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-05-10T09:00:00+09:00' },
        { id:'h4-2', contract_id: contractId, action:'send', actor_role:'employer', created_at:'2026-05-10T10:00:00+09:00' },
        { id:'h4-3', contract_id: contractId, action:'view', actor_role:'worker', created_at:'2026-05-12T14:00:00+09:00' },
        { id:'h4-4', contract_id: contractId, action:'sign', actor_role:'worker', created_at:'2026-05-20T14:00:00+09:00' },
      ],
      'mock-5': [
        { id:'h5-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-03-25T10:00:00+09:00' },
        { id:'h5-2', contract_id: contractId, action:'send', actor_role:'employer', created_at:'2026-03-25T11:00:00+09:00' },
        { id:'h5-3', contract_id: contractId, action:'view', actor_role:'worker', created_at:'2026-03-26T09:00:00+09:00' },
        { id:'h5-4', contract_id: contractId, action:'sign', actor_role:'worker', created_at:'2026-04-08T11:00:00+09:00' },
        { id:'h5-5', contract_id: contractId, action:'complete', actor_role:'employer', created_at:'2026-04-10T17:00:00+09:00' },
      ],
      'mock-6': [
        { id:'h6-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2025-12-20T09:00:00+09:00' },
        { id:'h6-2', contract_id: contractId, action:'cancel', actor_role:'employer', created_at:'2026-01-05T10:00:00+09:00' },
      ],
      'mock-7': [
        { id:'h7-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-01-10T09:00:00+09:00' },
        { id:'h7-2', contract_id: contractId, action:'send', actor_role:'employer', created_at:'2026-01-11T10:00:00+09:00' },
        { id:'h7-3', contract_id: contractId, action:'expire', actor_role:'system', created_at:'2026-02-15T10:00:00+09:00' },
      ],
      'mock-8': [
        { id:'h8-1', contract_id: contractId, action:'create', actor_role:'employer', created_at:'2026-06-24T09:00:00+09:00' },
        { id:'h8-2', contract_id: contractId, action:'send', actor_role:'employer', created_at:'2026-06-24T10:00:00+09:00' },
        { id:'h8-3', contract_id: contractId, action:'view', actor_role:'worker', created_at:'2026-06-25T09:00:00+09:00' },
        { id:'h8-4', contract_id: contractId, action:'sign', actor_role:'worker', created_at:'2026-06-25T10:00:00+09:00' },
      ],
    };
    return histories[contractId] || [];
  }
}
