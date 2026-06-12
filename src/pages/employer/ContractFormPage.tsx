import { useFunnel } from '@use-funnel/browser';
import { useContractForm } from './contract-form/hooks/useContractForm';
import { Button, Paragraph, Spacing } from '@toss/tds-mobile';
import styles from './ContractFormPage.module.css';
import { type ContractFormStep, STEP_LABELS, STEP_ORDER, TOTAL_STEPS } from './contract-form/types';
import Step1BasicInfo from './contract-form/steps/Step1BasicInfo';
import Step2WorkConditions from './contract-form/steps/Step2WorkConditions';
import Step3WorkSchedule from './contract-form/steps/Step3WorkSchedule';
import Step4WageInsurance from './contract-form/steps/Step4WageInsurance';
import Step5LegalValidation from './contract-form/steps/Step5LegalValidation';
import Step6Preview from './contract-form/steps/Step6Preview';

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
    validateStep,
    handleSubmit,
    computeBreakMinutes,
    formatWagePaymentDate,
    navigate,
  } = useContractForm();

  const funnel = useFunnel<{
    basicInfo: NonNullable<unknown>;
    workConditions: NonNullable<unknown>;
    workSchedule: NonNullable<unknown>;
    wageInsurance: NonNullable<unknown>;
    legalValidation: NonNullable<unknown>;
    preview: NonNullable<unknown>;
  }>({
    id: 'contract-form-wizard',
    initial: { step: 'basicInfo', context: {} },
  });

  const currentStep = funnel.step as ContractFormStep;
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const progressPct = ((currentIndex + 1) / TOTAL_STEPS) * 100;
  const isLastStep = currentIndex === TOTAL_STEPS - 1;
  const isValidationStep = currentStep === 'legalValidation';

  const goNext = (nextStep: ContractFormStep) => {
    if (!validateStep(currentStep)) return;
    funnel.history.push(nextStep);
  };

  const goBack = () => {
    funnel.history.back();
  };

  const onValidationRun = () => {
    if (validateStep('legalValidation')) {
      funnel.history.push('preview');
    }
  };
  const onSubmit = async () => {
    const contract = await handleSubmit();
    if (!contract) return;
    navigate(`/employer/contracts/${contract.id}`);
  };

  return (
    <div className={styles.page}>
      <div style={{ position: 'relative', marginBottom: 8, overflow: 'hidden' }}>
        <img src="https://static.toss.im/lotties/point-blue2.png" alt=""
          style={{ position: 'absolute', top: -30, right: -10, width: 160, height: 160, opacity: 0.3, pointerEvents: 'none' }}
        />
        <img src="https://static.toss.im/lotties/point-green2.png" alt=""
          style={{ position: 'absolute', top: -10, right: 20, width: 120, height: 120, opacity: 0.25, pointerEvents: 'none' }}
        />
        <Paragraph typography="st3" fontWeight="bold">근로계약서 작성</Paragraph>
      </div>
      <Spacing size={8} />
      <Paragraph typography="st7" color="grey-500">
        {STEP_LABELS[currentStep]} ({currentIndex + 1}/{TOTAL_STEPS})
      </Paragraph>
      <Spacing size={12} />
      <div style={{ height: 4, borderRadius: 2, backgroundColor: '#E5E8EB', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: 2, backgroundColor: '#3182F6', transition: 'width 0.3s ease' }} />
      </div>

      {/* Step content */}
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
          />
        )}
        wageInsurance={() => (
          <Step4WageInsurance form={form} errors={errors} handleChange={handleChange} />
        )}
        legalValidation={() => (
          <Step5LegalValidation validationResult={validationResult} warnings={warnings} />
        )}
        preview={() => (
          <Step6Preview
            form={form}
            warnings={warnings}
            computeBreakMinutes={computeBreakMinutes}
            formatWagePaymentDate={formatWagePaymentDate}
          />
        )}
      />

      {/* Navigation */}
      <Spacing size={48} />
      <div style={{ display: 'flex', gap: 12 }}>
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
              disabled={currentStep === 'workSchedule' && form.work_days.length === 0}
              onClick={() => {
                if (isValidationStep) {
                  onValidationRun();
                } else {
                  goNext(STEP_ORDER[currentIndex + 1]);
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
              {submitting ? '저장 중...' : '계약서 저장'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
