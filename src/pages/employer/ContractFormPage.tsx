import { useEffect } from 'react';
import { useFunnel } from '@use-funnel/browser';
import { useContractForm } from './contract-form/hooks/useContractForm';
import { Button, Paragraph, Spacing } from '@toss/tds-mobile';
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
  const {
    form,
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
  } = useContractForm();

  const isDevMock = sessionStorage.getItem('force_mock') === 'true';
  const searchParams = new URLSearchParams(window.location.search);
  const requestedStep = searchParams.get('contract-form-wizard') as ContractFormStep | null;
  const initialStep = (isDevMock && requestedStep && STEP_ORDER.includes(requestedStep)) 
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

  const goNext = (nextStep: ContractFormStep) => {
    if (!validateStep(currentStep)) return;
    funnel.history.push(nextStep as 'basicInfo');
  };

  const goBack = () => {
    funnel.history.back();
  };

  const onValidationRun = () => {
    if (validateStep('finalChecklist')) {
      funnel.history.push('preview');
    }
  };
  const onSubmit = async () => {
    const contract = await handleSubmit();
    if (!contract) return;
    navigate(`/employer/contracts/${contract.id}`, { state: { justCreated: true } });
  };

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div style={{ paddingTop: 20 }}>
          <Paragraph typography="st3" fontWeight="bold">근로계약서 작성</Paragraph>
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
                } else {
                  goNext(effectiveSteps[currentIndex + 1]);
                }
              }}
            >
              {isValidationStep ? '검증 실행' : '다음'}
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
    </div>
  );
}
