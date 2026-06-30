import { useState, useEffect, useRef } from 'react';
import { josa } from 'es-hangul';
import { useNavigate, useParams } from 'react-router-dom';
import { useContracts } from '../../../../hooks/useContracts';
import { useBusiness } from '../../../../hooks/useBusiness';
import { validateLaborContract, type ValidationWarning, calcWeeklyHoursFromSchedule } from '../../../../domain/contract/validation';
import {
  type ContractFormData,
  type ContractFormStep,
  type ValidationResultData,
  type DaySchedule,
  DEFAULT_FORM,
  DEFAULT_DAY_SCHEDULE,
  buildDefaultWorkSchedule,
  DAY_LABELS,
} from '../types';
import {
  buildContractData,
  formatWagePaymentDate,
  wagePaymentDayLabel,
} from '../buildContractData';
import { buildContractData as buildDomainContractData } from '../../../../domain/contract/buildContractData';

function mapFieldPath(path: string): string {
  const parts = path.split('.');
  const last = parts[parts.length - 1];
  return last.replace(/[A-Z]/g, m => '_' + m.toLowerCase());
}

function computeBreakMinutes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.max(0, mins);
}

/** 레거시 단일 시간 컬럼을 요일별 스케줄로 변환 (구 데이터 호환) */
function buildLegacySchedule(
  days: string[],
  start: string,
  end: string,
  breakStart: string,
  breakEnd: string,
): Record<string, DaySchedule> {
  const schedule: Record<string, DaySchedule> = {};
  for (const d of days) {
    schedule[d] = { start, end, break_start: breakStart, break_end: breakEnd };
  }
  return schedule;
}

export function useContractForm() {
  const navigate = useNavigate();
  const { createContract } = useContracts();
  const { businesses } = useBusiness();
  const [form, setForm] = useState<ContractFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResultData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [insurancePristine, setInsurancePristine] = useState(true);

  // Set default workplace from business
  useEffect(() => {
    if (businesses.length > 0 && !form.workplace) {
      setForm(prev => ({ ...prev, workplace: businesses[0].address }));
    }
  }, [businesses, form.workplace]);

  // Restore from session on mount, or load from DB if editing/template
  const { id } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const templateId = searchParams.get('templateId');
  const { getContract, updateContract } = useContracts();
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    
    if (id || templateId) {
      const loadId = id || templateId!;
      getContract(loadId).then(c => {
        if (c) {
          if (id && c.status !== 'draft' && c.status !== 'rejected' && c.status !== 'change_requested' && c.status !== 'template') {
            alert('발송되었거나 서명이 완료된 계약은 수정할 수 없습니다.');
            navigate(`/employer/contracts/${c.id}`, { replace: true });
            return;
          }
          
          const isTemplate = !!templateId || c.status === 'template';
          
          setForm({
            worker_name: isTemplate ? '' : c.worker_name,
            worker_phone: isTemplate ? '' : c.worker_phone,
            worker_address: isTemplate ? '' : (c.worker_address || ''),
            contract_type: c.contract_type as any,
            workplace: c.workplace,
            job_description: c.job_description,
            start_date: c.start_date,
            end_date: c.end_date || '',
            wage_type: c.wage_type as any,
            base_wage: c.base_wage.toString(),
            wage_payment_day: c.wage_payment_date.replace(/[^0-9]/g, '') || 'last',
            wage_payment_method: c.wage_payment_method as any,
            work_days: c.work_days,
            work_schedule: c.work_schedule ?? buildLegacySchedule(c.work_days, c.start_time, c.end_time, c.break_start_time || '', c.break_end_time || ''),
            schedule_mode: (c.schedule_mode as ContractFormData['schedule_mode']) ?? 'same',
            weekly_holiday: c.weekly_holiday || '',
            paid_leave_clause: c.paid_leave_clause,
            pension: c.pension,
            health_insurance: c.health_insurance,
            employment_insurance: c.employment_insurance,
            accident_insurance: c.accident_insurance,
            severance_clause: c.severance_clause,
            checklist_agreed: isTemplate ? false : false,
            other_conditions: c.other_conditions || '',
            employer_signature_data: c.employer_signature_data,
          });
        }
      });
    } else {
      const savedForm = sessionStorage.getItem('wiz_form');
      if (savedForm !== null) {
        try { setForm(prev => ({ ...prev, ...JSON.parse(savedForm) })); } catch { /* ignore */ }
      }
    }
  }, [id, getContract]);

  // Session storage persistence (only after initial load)
  useEffect(() => { 
    if (mounted.current) {
      sessionStorage.setItem('wiz_form', JSON.stringify(form)); 
    }
  }, [form]);

  // Beforeunload warning
  useEffect(() => {
    const hasData = form.worker_name || form.worker_phone || form.workplace || form.base_wage;
    if (submitting || !hasData) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form.worker_name, form.worker_phone, form.workplace, form.base_wage, submitting]);

  // Auto-sync insurances based on conditions if not manually edited
  useEffect(() => {
    if (!insurancePristine) return;
    
    const weeklyHours = calcWeeklyHoursFromSchedule(form.work_schedule);

    const start = new Date(form.start_date);
    let monthsDuration = 999;
    if (form.end_date) {
      const end = new Date(form.end_date);
      monthsDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    }

    const isEmpRequired = weeklyHours >= 15 || monthsDuration >= 3;
    const isHealthRequired = weeklyHours >= 15 && monthsDuration >= 1;

    setForm(prev => {
      if (
        prev.employment_insurance === isEmpRequired &&
        prev.health_insurance === isHealthRequired &&
        prev.pension === isHealthRequired
      ) {
        return prev;
      }
      return {
        ...prev,
        accident_insurance: true, // Always true
        employment_insurance: isEmpRequired,
        health_insurance: isHealthRequired,
        pension: isHealthRequired
      };
    });
  }, [
    form.work_schedule,
    form.start_date, form.end_date,
    insurancePristine
  ]);

  const handleChange = (field: string, value: string | boolean | string[]) => {
    if (['employment_insurance', 'health_insurance', 'pension', 'accident_insurance'].includes(field)) {
      setInsurancePristine(false);
    }
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleDay = (day: string) => {
    setForm(prev => {
      const isOn = prev.work_days.includes(day);
      const nextDays = isOn ? prev.work_days.filter(d => d !== day) : [...prev.work_days, day];
      const nextSchedule = { ...prev.work_schedule };
      if (!isOn && !nextSchedule[day]) {
        // 신규 요일: 기존 요일 값 복사, 없으면 기본값
        const ref = Object.values(prev.work_schedule)[0] ?? DEFAULT_DAY_SCHEDULE;
        nextSchedule[day] = { ...ref };
      }
      return { ...prev, work_days: nextDays, work_schedule: nextSchedule };
    });
  };

  /** 요일 스케줄 필드 갱신 — 'same' 모드면 모든 근무요일에 동일 적용 */
  const updateDaySchedule = (day: string, field: keyof DaySchedule, value: string) => {
    setForm(prev => {
      const days = prev.schedule_mode === 'same' ? prev.work_days : [day];
      const nextSchedule = { ...prev.work_schedule };
      for (const d of days) {
        nextSchedule[d] = { ...(nextSchedule[d] ?? DEFAULT_DAY_SCHEDULE), [field]: value };
      }
      return { ...prev, work_schedule: nextSchedule };
    });
  };

  const setScheduleMode = (mode: ContractFormData['schedule_mode']) => {
    setForm(prev => {
      if (mode === 'same' && prev.work_days.length > 0) {
        // 'same' 전환 시 첫 근무요일 기준으로 모두 동기화
        const ref = prev.work_schedule[prev.work_days[0]] ?? Object.values(prev.work_schedule)[0] ?? DEFAULT_DAY_SCHEDULE;
        const nextSchedule: Record<string, DaySchedule> = {};
        for (const d of prev.work_days) nextSchedule[d] = { ...ref };
        return { ...prev, schedule_mode: mode, work_schedule: nextSchedule };
      }
      return { ...prev, schedule_mode: mode };
    });
  };

  const selectWeeklyHoliday = (day: string) => {
    setForm(prev => ({ ...prev, weekly_holiday: day }));
    setErrors(prev => ({ ...prev, weekly_holiday: '' }));
  };

  const validateStep = (step: ContractFormStep): boolean => {
    const e: Record<string, string> = {};
    switch (step) {
      case 'basicInfo':
        if (!form.worker_name.trim()) e.worker_name = `${josa('이름', '을/를')} 입력해주세요`;
        if (!form.worker_phone || form.worker_phone.length < 10) e.worker_phone = '정확한 전화번호를 입력해주세요';
        break;
      case 'workConditions':
        if (!form.contract_type) e.contract_type = '계약 유형을 선택해주세요';
        if (!form.workplace.trim()) e.workplace = `${josa('근무 장소', '을/를')} 입력해주세요`;
        if (!form.job_description.trim()) e.job_description = `${josa('직무 내용', '을/를')} 입력해주세요`;
        if (!form.start_date) e.start_date = `${josa('시작일', '을/를')} 선택해주세요`;
        break;
      case 'workSchedule':
        if (form.work_days.length === 0) e.work_days = `${josa('근무 요일', '을/를')} 선택해주세요`;
        if (!form.weekly_holiday) e.weekly_holiday = '주휴일을 선택해주세요';
        for (const d of form.work_days) {
          const s = form.work_schedule[d];
          if (!s || !s.start || !s.end) {
            e.workSchedule = `${DAY_LABELS[d] ?? d}요일의 근무시간을 입력해주세요`;
            break;
          }
          if (s.start >= s.end) {
            e.workSchedule = `${DAY_LABELS[d] ?? d}요일 종료 시간은 시작 시간보다 늦어야 합니다`;
            break;
          }
        }
        break;
      case 'wageInsurance':
        if (!form.base_wage || Number(form.base_wage) <= 0) e.base_wage = `${josa('금액', '을/를')} 입력해주세요`;
        if (!form.wage_payment_day) e.wage_payment_day = '지급일을 선택해주세요';
        if (form.accident_insurance !== true) e.accident_insurance = '산재보험은 전 사업장 의무가입입니다';
        break;
      case 'otherConditions':
        break;
      case 'finalChecklist': {
        if (!businesses || businesses.length === 0) {
          alert('사업장 정보를 먼저 등록해주세요.');
          navigate('/employer/business/new');
          return false;
        }
        
        const contractData = buildDomainContractData(form);
        const vr = validateLaborContract(contractData);
        if (!vr.valid && vr.errors.length > 0) {
          e.checklist_agreed = '법적 기준에 미달하는 항목이 있습니다. 위 안내된 항목을 수정해주세요.';
        } else if (!form.checklist_agreed) {
          e.checklist_agreed = '체크리스트 확인에 동의해주세요';
        }
        break;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (businesses.length === 0) { alert('먼저 사업장을 등록해주세요.'); return null; }
    setSubmitting(true);
    try {
      let contract;
      const contractData = buildContractData(form, businesses[0].id);

      if (id) {
        contract = await updateContract(id, { ...contractData, status: 'draft', rejection_reason: "" });
      } else {
        contract = await createContract(contractData);
      }
      return contract;
    } catch (err) {
      console.error(err);
      alert('계약서 저장에 실패했습니다.');
      return null;
    } finally {
      setSubmitting(false);
    }
  };
  const saveAsTemplate = async (templateName: string) => {
    if (businesses.length === 0) { alert('먼저 사업장을 등록해주세요.'); return null; }
    setSubmitting(true);
    try {
      let contract;
      const contractData = buildContractData(form, businesses[0].id);

      if (id) {
        contract = await updateContract(id, { ...contractData, status: 'template', template_name: templateName, rejection_reason: "" });
      } else {
        contract = await createContract({ ...contractData, status: 'template', template_name: templateName });
      }
      return contract;
    } catch (err) {
      console.error(err);
      alert('템플릿 저장에 실패했습니다.');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    form,
    saveAsTemplate,
    errors,
    warnings,
    validationResult,
    submitting,
    businesses,
    handleChange,
    toggleDay,
    selectWeeklyHoliday,
    updateDaySchedule,
    setScheduleMode,
    validateStep,
    handleSubmit,
    setValidationResult,
    setWarnings,
    setErrors,
    computeBreakMinutes,
    formatWagePaymentDate,
    wagePaymentDayLabel,
    navigate,
  };
}
