import { useState, useEffect } from 'react';
import { useFunnel } from '@use-funnel/browser';
import { useContractForm } from './contract-form/hooks/useContractForm';
import { useContracts } from '../../hooks/useContracts';
import { Button, Paragraph, Spacing, BottomSheet, TextField } from '@toss/tds-mobile';
import styles from './ContractFormPage.module.css';
import { type ContractFormStep, STEP_LABELS, STEP_ORDER, TOTAL_STEPS } from './contract-form/types';
import Step1BasicInfo from './contract-form/steps/Step1BasicInfo';
import Step2WorkConditions from './contract-form/steps/Step2WorkConditions';
import Step3WorkSchedule from './contract-form/steps/Step3WorkSchedule';
import Step4WageInsurance from './contract-form/steps/Step4WageInsurance';
import Step5OtherConditions from './contract-form/steps/Step5OtherConditions';
import { FinalChecklistStep } from './contract-form/steps/FinalChecklistStep';
import Step6Preview from './contract-form/steps/Step6Preview';
import { ContractFormProgress } from './contract-form/ContractFormProgress';

export default function ContractFormPage() {
  const [isLoadTemplateSheetOpen, setIsLoadTemplateSheetOpen] = useState(false);
  
  const { contracts } = useContracts();
  const templates = contracts.filter(c => c.status === 'template');
  
  const {
    form,
    saveAsTemplate,
    errors,
    warnings,
    validationResult,
    submitting,
    handleChange,
    toggleDay,
    selectWeeklyHoliday,
    updateDaySchedule,
    setScheduleMode,
    validateStep,
    handleSubmit,
    computeBreakMinutes,
    formatWagePaymentDate,
    navigate,
    clearForm,
  } = useContractForm();

  const isDevMock = sessionStorage.getItem('mock_role') !== null || sessionStorage.getItem('force_mock') === 'true';
  const searchParams = new URLSearchParams(window.location.search);
  const requestedStep = searchParams.get('contract-form-wizard') as ContractFormStep | null;
  
  // 운영 환경에서도 step 복구 허용하여 모바일 환경 탭 전환 및 새로고침 시 데이터 유실/초기화 방어
  const initialStep = (requestedStep && STEP_ORDER.includes(requestedStep)) 
    ? requestedStep 
    : 'basicInfo';

  const funnel = useFunnel<{
    basicInfo: NonNullable<unknown>;
    workConditions: NonNullable<unknown>;
    workSchedule: NonNullable<unknown>;
    wageInsurance: NonNullable<unknown>;
    otherConditions: NonNullable<unknown>;
    finalChecklist: NonNullable<unknown>;
    preview: NonNullable<unknown>;
  }>({
    id: 'contract-form-wizard',
    initial: { step: initialStep, context: {} },
  });

  const currentStep = funnel.step as ContractFormStep;
  const isValidStep = STEP_ORDER.includes(currentStep);
  const effectiveSteps = STEP_ORDER;
  const currentIndex = effectiveSteps.indexOf(currentStep);
  const isLastStep = currentIndex === effectiveSteps.length - 1;
  const isValidationStep = currentStep === 'finalChecklist';

  useEffect(() => {
    if (!isValidStep) {
      funnel.history.push('basicInfo');
    }
  }, [isValidStep, funnel.history]);

  useEffect(() => {
    if (isDevMock) {
      (window as any).__MOCK_SET_FORM_AGREED = () => {
        handleChange('checklist_agreed', true);
      };
    }
  }, [isDevMock, handleChange]);

  // 더블 클릭 및 다중 탭 방어를 위한 상태
  const [isPushing, setIsPushing] = useState(false);

  const goNext = (nextStep: ContractFormStep) => {
    if (isPushing) return;
    if (!validateStep(currentStep)) return;
    setIsPushing(true);
    funnel.history.push(nextStep as 'basicInfo');
    setTimeout(() => setIsPushing(false), 400);
  };

  const goBack = () => {
    funnel.history.back();
  };

  const onValidationRun = () => {
    if (isPushing) return;
    const passed = validateStep('finalChecklist');
    if (passed) {
      setIsPushing(true);
      funnel.history.push('preview');
      setTimeout(() => setIsPushing(false), 400);
    }
  };
  const onSubmit = async () => {
    const contract = await handleSubmit();
    if (!contract) return;
    
    // Auto-save template
    const autoTemplateName = form.job_description ? `${form.job_description} 양식` : '자동 저장 양식';
    saveAsTemplate(autoTemplateName).catch(console.error);

    clearForm(); // Clear storage on success

    navigate(`/employer/contracts/${contract.id}`, { state: { justCreated: true } });
  };

  const onExit = () => {
    if (window.confirm('작성 중인 내용을 취소하고 나가시겠습니까?')) {
      clearForm();
      navigate('/employer/dashboard', { replace: true });
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div style={{ paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Paragraph typography="st3" fontWeight="bold">근로계약서 작성</Paragraph>
          <div style={{ display: 'flex', gap: 8 }}>
            <div 
              onClick={() => setIsLoadTemplateSheetOpen(true)}
              style={{ color: 'var(--tds-color-grey600)', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '8px' }}
            >
              📄 양식
            </div>
            <div 
              onClick={onExit}
              style={{ color: 'var(--tds-color-red500)', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '8px' }}
            >
              ✕ 닫기
            </div>
          </div>
        </div>
        <Spacing size={16} />
      <ContractFormProgress
        currentIndex={currentIndex}
        labels={effectiveSteps.map((s) => STEP_LABELS[s])}
        onStepClick={(i) => {
          // 과거 단계로만 이동 허용. 과거 단계는 이미 검증을 통과했으므로 재검증 생략.
          if (i < currentIndex) funnel.history.push(effectiveSteps[i] as 'basicInfo');
        }}
      />
      <Spacing size={8} />

      {/* Step content */}
      {isValidStep && (
        <funnel.Render
          basicInfo={() => (
            <Step1BasicInfo form={form} errors={errors} handleChange={handleChange} />
          )}
          workConditions={() => (
            <Step2WorkConditions form={form} errors={errors} handleChange={handleChange} />
          )}
          workSchedule={() => (
            <Step3WorkSchedule
              form={form}
              errors={errors}
              handleChange={handleChange}
              toggleDay={toggleDay}
              selectWeeklyHoliday={selectWeeklyHoliday}
              updateDaySchedule={updateDaySchedule}
              setScheduleMode={setScheduleMode}
            />
          )}
          wageInsurance={() => (
            <Step4WageInsurance form={form} errors={errors} handleChange={handleChange} />
          )}
          otherConditions={() => (
            <Step5OtherConditions form={form} handleChange={handleChange} />
          )}
          finalChecklist={() => (
            <FinalChecklistStep 
              form={form} 
              onChange={handleChange}
              toggleDay={toggleDay}
              onNavigate={(step) => funnel.history.push(step as any)}
            />
          )}
          preview={() => (
            <div>
              <Spacing size={24} />
              <Step6Preview
                form={form}
                warnings={warnings}
                computeBreakMinutes={computeBreakMinutes}
                formatWagePaymentDate={formatWagePaymentDate}
              />
            </div>
          )}
        />
      )}
      </div>

      {/* Navigation */}
      <div className={styles.bottomCta}>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        {currentIndex > 0 && (
          <div style={{ flex: 1 }}>
            <Button color="light" variant="weak" display="block" size="xlarge" onClick={goBack}>
              이전
            </Button>
          </div>
        )}
        {!isLastStep ? (
          <div style={{ flex: currentIndex > 0 ? 2 : 1 }}>
            <Button
              color="primary"
              variant="fill"
              display="block"
              size="xlarge"
              disabled={(currentStep === 'workSchedule' && form.work_days.length === 0) || (isValidationStep && !form.checklist_agreed)}
              onClick={() => {
                if (isValidationStep) {
                  onValidationRun();
                } else if (searchParams.has('templateId') && currentStep === 'basicInfo') {
                  if (validateStep('basicInfo')) funnel.history.push('finalChecklist');
                } else {
                  goNext(effectiveSteps[currentIndex + 1]);
                }
              }}
            >
              {isValidationStep ? '검증 실행' : (searchParams.has('templateId') && currentStep === 'basicInfo') ? '작성 완료 및 확인' : '다음'}
            </Button>
          </div>
        ) : (
          <div style={{ flex: currentIndex > 0 ? 2 : 1 }}>
            <Button
              color="primary"
              variant="fill"
              display="block"
              size="xlarge"
              loading={submitting}
              onClick={onSubmit}
            >
              저장 및 다음
            </Button>
          </div>
        )}
        </div>
      </div>



      <BottomSheet
        open={isLoadTemplateSheetOpen}
        onClose={() => setIsLoadTemplateSheetOpen(false)}
        header={<BottomSheet.Header>양식 불러오기</BottomSheet.Header>}
      >
        <div style={{ padding: '0 24px 24px' }}>
          {templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Paragraph typography="t5" color="grey-600">저장된 양식이 없습니다.</Paragraph>
              <Spacing size={8} />
              <Paragraph typography="t7" color="grey-500">지금 작성 중인 계약서를 양식으로 저장해보세요.</Paragraph>
              <Spacing size={24} />
              <Button size="large" variant="fill" color="primary" onClick={() => setIsLoadTemplateSheetOpen(false)}>
                계속 작성하기
              </Button>
            </div>
          ) : (
            <div>
              <Paragraph typography="t6" color="grey-600" style={{ marginBottom: 16 }}>
                기존 양식을 불러오면 현재 작성 중인 내용은 모두 덮어씌워집니다.
              </Paragraph>
              {templates.map(t => (
                <Button
                  key={t.id}
                  size="large"
                  variant="weak"
                  color="dark"
                  style={{ width: '100%', marginBottom: 12, justifyContent: 'flex-start', paddingLeft: 20 }}
                  onClick={() => {
                    setIsLoadTemplateSheetOpen(false);
                    // 풀 리로드(window.location.href) 대신 SPA 라우팅 사용
                    navigate(`/employer/contracts/new?templateId=${t.id}`, { replace: true });
                    funnel.history.push('basicInfo');
                  }}
                >
                  <span style={{ fontSize: 20, marginRight: 12 }}>📄</span> {t.template_name || '이름 없는 양식'}
                </Button>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
