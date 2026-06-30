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
  template_name?: string;
  start_date: string;
  end_date?: string;
  workplace: string;
  job_description: string;
  wage_type: string;
  base_wage: number;
  wage_payment_date: string;
  wage_payment_method: string;
  work_days: string[];
  work_schedule?: Record<string, { start: string; end: string; break_start: string; break_end: string }>;
  schedule_mode?: 'same' | 'perDay';
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
  employer_signature_data?: string;
  worker_signed_at?: string;
  worker_signature_data?: string;
  worker_birth_date?: string;
  is_minor?: boolean;
  is_young_worker?: boolean;
  parent_consent_data?: string;
  doc_parent_consent_status?: DocStatus;
  doc_family_cert_status?: DocStatus;
  doc_employment_permit_status?: DocStatus;
  doc_received_at?: string;
  contract_html?: string;
  rejection_reason?: string;
  contract_pdf_url?: string;
  other_conditions?: string;
  created_at: string;
  updated_at: string;
}

export type DocStatus = 'not_required' | 'required' | 'received';

/** 만 나이 계산 (생년월일 기준) */
export function getAge(birthDate: string | undefined): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/** 친권자 동의 필요 여부 — 만 19세 미만 (민법 미성년자) */
export function needsParentConsent(birthDate: string | undefined): boolean {
  const age = getAge(birthDate);
  return age !== null && age < 19;
}

/** 연소근로자 보호규정 적용 — 만 18세 미만 (근로기준법) */
export function isYoungWorker(birthDate: string | undefined): boolean {
  const age = getAge(birthDate);
  return age !== null && age < 18;
}

/** 만 13세 미만 — 고용 불가 (차단) */
export function isUnderMinimumAge(birthDate: string | undefined): boolean {
  const age = getAge(birthDate);
  return age !== null && age < 13;
}

export interface ContractService {
  fetchContracts(userKey: string, userRole: 'employer' | 'worker', phone?: string): Promise<Contract[]>;
  getContract(id: string): Promise<Contract | null>;
  createContract(input: Partial<Contract> & { business_id: string }, userKey: string): Promise<Contract>;
  inviteWorker(business_id: string, employerKey: string): Promise<Contract>;
  acceptInvite(id: string, workerInfo: { name: string; phone: string; ci?: string; ciHash?: string }): Promise<Contract>;
  updateContract(id: string, input: Partial<Contract>): Promise<Contract>;
  sendContract(id: string): Promise<Contract>;
  signContract(id: string, workerInfo: any): Promise<Contract>;
  completeContract(id: string, htmlStr?: string, pdfUrl?: string, employerSignatureData?: string): Promise<Contract>;
  cancelContract(id: string): Promise<Contract>;
  expireContract(id: string): Promise<Contract>;
  viewContract(id: string): Promise<Contract>;
  markDocumentReceived(id: string, docType: 'parent_consent' | 'family_cert' | 'employment_permit'): Promise<Contract>;
  rejectContract(id: string, reason?: string): Promise<Contract>;
  requestChangeContract(id: string, reason: string): Promise<Contract>;
  getHistory(contractId: string): Promise<any[]>;
}
