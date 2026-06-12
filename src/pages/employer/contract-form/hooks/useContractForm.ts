import { useState, useEffect, useRef } from 'react';
import { josa } from 'es-hangul';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../../../hooks/useContracts';
import { useBusiness } from '../../../../hooks/useBusiness';
import { validateLaborContract, type ValidationWarning } from '../../../../domain/contract/validation';
import {
  type ContractFormData,
  type ContractFormStep,
  type ValidationResultData,
  DEFAULT_FORM,
} from '../types';

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

function wagePaymentDayLabel(day: string): string {
  return day === 'last' ? '말일' : `${day}일`;
}

function formatWagePaymentDate(day: string): string {
  return `매월 ${wagePaymentDayLabel(day)}`;
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

  // Set default workplace from business
  useEffect(() => {
    if (businesses.length > 0 && !form.workplace) {
      setForm(prev => ({ ...prev, workplace: businesses[0].address }));
    }
  }, [businesses, form.workplace]);

  // Session storage persistence
  useEffect(() => { sessionStorage.setItem('wiz_form', JSON.stringify(form)); }, [form]);

  // Restore from session on mount, or load from DB if editing
  const { id } = useParams();
  const { getContract, updateContract } = useContracts();
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    
    if (id) {
      getContract(id).then(c => {
        if (c) {
          setForm({
            worker_name: c.worker_name,
            worker_phone: c.worker_phone,
            worker_address: c.worker_address || '',
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
            start_time: c.start_time,
            end_time: c.end_time,
            break_start: c.break_start_time || '',
            break_end: c.break_end_time || '',
            weekly_holiday: c.weekly_holiday || '',
            paid_leave_clause: c.paid_leave_clause,
            pension: c.pension,
            health_insurance: c.health_insurance,
            employment_insurance: c.employment_insurance,
            accident_insurance: c.accident_insurance,
            severance_clause: c.severance_clause,
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

  // Beforeunload warning
  useEffect(() => {
    const hasData = form.worker_name || form.worker_phone || form.workplace || form.base_wage;
    if (submitting || !hasData) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [form.worker_name, form.worker_phone, form.workplace, form.base_wage, submitting]);

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      work_days: prev.work_days.includes(day)
        ? prev.work_days.filter(d => d !== day)
        : [...prev.work_days, day],
    }));
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
        if (!form.worker_phone.replace(/\D/g, '')) e.worker_phone = `${josa('전화번호', '을/를')} 입력해주세요`;
        else if (form.worker_phone.replace(/\D/g, '').length < 10) e.worker_phone = `${josa('올바른 전화번호', '을/를')} 입력해주세요`;
        break;
      case 'workConditions':
        if (!form.workplace.trim()) e.workplace = `${josa('근무 장소', '을/를')} 입력해주세요`;
        if (!form.job_description.trim()) e.job_description = `${josa('직무 내용', '을/를')} 입력해주세요`;
        if (!form.start_date) e.start_date = `${josa('시작일', '을/를')} 선택해주세요`;
        break;
      case 'workSchedule':
        if (form.work_days.length === 0) e.work_days = `${josa('근무 요일', '을/를')} 선택해주세요`;
        if (!form.start_time) e.start_time = `${josa('시작 시간', '을/를')} 입력해주세요`;
        if (!form.end_time) e.end_time = `${josa('종료 시간', '을/를')} 입력해주세요`;
        if (form.start_time && form.end_time && form.start_time >= form.end_time) {
          e.end_time = '종료 시간은 시작 시간보다 늦어야 합니다';
        }
        if (!form.weekly_holiday) e.weekly_holiday = '주휴일을 선택해주세요';
        break;
      case 'wageInsurance':
        if (!form.base_wage || Number(form.base_wage) <= 0) e.base_wage = `${josa('금액', '을/를')} 입력해주세요`;
        if (form.accident_insurance !== true) e.accident_insurance = '산재보험은 전 사업장 의무가입입니다';
        break;
      case 'legalValidation': {
        if (!businesses || businesses.length === 0) {
          alert('사업장 정보를 먼저 등록해주세요.');
          navigate('/employer/business/new');
          return false;
        }
        const business = businesses[0];
        const laborContract = {
          worker: { name: form.worker_name, phone: form.worker_phone, address: form.worker_address || undefined },
          employer: { businessNumber: business.business_number, businessName: business.business_name, representative: business.representative, address: business.address },
          contract: {
            contractType: form.contract_type, templateVersion: '1.0.0', status: 'draft' as const,
            startDate: form.start_date, endDate: form.end_date || undefined,
            workplace: form.workplace, jobDescription: form.job_description,
            wageType: form.wage_type, baseWage: Number(form.base_wage) || 0,
            wagePaymentDate: formatWagePaymentDate(form.wage_payment_day), wagePaymentMethod: form.wage_payment_method,
            workDays: form.work_days, startTime: form.start_time, endTime: form.end_time,
            breakMinutes: computeBreakMinutes(form.break_start, form.break_end),
            weeklyHoliday: form.weekly_holiday || undefined,
            paidLeaveClause: form.paid_leave_clause,
            socialInsuranceClause: form.pension || form.health_insurance || form.employment_insurance || form.accident_insurance,
            severanceClause: form.severance_clause,
          },
        };
        const result = validateLaborContract(laborContract);
        setValidationResult(result);
        setWarnings(result.warnings);
        if (!result.valid) {
          const fieldErrors: Record<string, string> = {};
          for (const err of result.errors) {
            const field = mapFieldPath(err.field);
            if (!fieldErrors[field]) fieldErrors[field] = err.message;
          }
          setErrors(fieldErrors);
          return false;
        }
        return true;
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
      const contractData = {
        business_id: businesses[0].id,
        worker_name: form.worker_name,
        worker_phone: form.worker_phone,
        contract_type: form.contract_type,
        workplace: form.workplace,
        job_description: form.job_description,
        start_date: form.start_date,
        end_date: form.end_date || undefined,
        wage_type: form.wage_type,
        base_wage: Number(form.base_wage) || 0,
        wage_payment_date: formatWagePaymentDate(form.wage_payment_day),
        wage_payment_method: form.wage_payment_method,
        work_days: form.work_days,
        start_time: form.start_time,
        end_time: form.end_time,
        break_start_time: form.break_start || '00:00',
        break_end_time: form.break_end || '00:00',
        weekly_holiday: form.weekly_holiday || undefined,
        paid_leave_clause: form.paid_leave_clause,
        pension: form.pension,
        health_insurance: form.health_insurance,
        employment_insurance: form.employment_insurance,
        accident_insurance: form.accident_insurance,
        social_insurance_clause: form.pension || form.health_insurance || form.employment_insurance || form.accident_insurance,
        severance_clause: form.severance_clause,
        status: 'draft',
      };
      
      if (id) {
        contract = await updateContract(id, contractData);
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

  return {
    form,
    errors,
    warnings,
    validationResult,
    submitting,
    businesses,
    handleChange,
    toggleDay,
    selectWeeklyHoliday,
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
