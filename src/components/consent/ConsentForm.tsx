/**
 * Consent Form Component
 *
 * Onboarding consent selection for PIPA compliance
 * Users must explicitly opt-in to personalization and analytics
 *
 * @module components/consent/ConsentForm
 */

import { useState } from 'react';
import { Button, Spacing, BottomSheet, Paragraph, Top, TextButton } from '@toss/tds-mobile';
import { consentManager, type ConsentScope } from '@/lib/consent-manager';

interface ConsentFormProps {
  /** Initial consent values */
  initialValues?: Partial<ConsentScope>;
  /** Callback when consent is submitted */
  onSubmit?: (consent: ConsentScope) => void;
  /** Callback when consent is skipped */
  onSkip?: () => void;
  /** Show skip button */
  showSkip?: boolean;
  /** Current consent version */
  version?: string;
}

/**
 * PIPA-compliant consent form
 */
export function ConsentForm({
  initialValues = {},
  onSubmit,
  onSkip,
  showSkip = true,
  version = '1.0',
}: ConsentFormProps) {
  const [consents, setConsents] = useState<ConsentScope>({
    personalization: initialValues.personalization || false,
    analytics: initialValues.analytics || false,
    marketing: initialValues.marketing || false,
  });

  const [loading, setLoading] = useState(false);

  /**
   * Toggle consent
   */
  const toggleConsent = (key: keyof ConsentScope) => {
    setConsents(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  /**
   * Handle accept all
   */
  const handleAcceptAll = async () => {
    setLoading(true);
    const allAccepted: ConsentScope = {
      personalization: true,
      analytics: true,
      marketing: false,
    };

    try {
      onSubmit?.(allAccepted);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle submit with current selection
   */
  const handleSubmit = async () => {
    setLoading(true);
    onSubmit?.(consents);
  };

  /**
   * Handle skip (use default experience)
   */
  const handleSkip = () => {
    onSkip?.();
  };

  return (
    <>
      <Top title="개인정보 처리 동의" left={<Button onClick={onSkip}>×</Button>} />

      <div style={{ padding: 20 }}>
        <Paragraph color="grey" typography="p2" style={{ marginBottom: 24 }}>
          개인정보보호법(PIPA)에 따라 아래 항목에 대한 동의를 받습니다.
          <br />
          모두 동의하지 않아도 기본 서비스를 이용하실 수 있습니다.
        </Paragraph>

        {/* Personalization Consent */}
        <div style={{
          padding: 16,
          backgroundColor: '#f9f9f9',
          borderRadius: 12,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>[필수] 개인화 서비스</div>
              <div style={{ fontSize: 14, color: '#666' }}>역할(사장님/근로자)에 맞춘 서비스 제공</div>
            </div>
            <Button
              size="small"
              variant={consents.personalization ? 'primary' : 'weak'}
              onClick={() => toggleConsent('personalization')}
            >
              {consents.personalization ? '동의' : '거부'}
            </Button>
          </div>

          {consents.personalization && (
            <div style={{ padding: 12, backgroundColor: '#fff', borderRadius: 8, fontSize: 13, color: '#666' }}>
              <div>• 역할에 따른 대시보드 구성</div>
              <div>• 자주 사용하는 기능 빠른 접근</div>
              <div>• 모바일 최적화 UI</div>
            </div>
          )}
        </div>

        {/* Analytics Consent */}
        <div style={{
          padding: 16,
          backgroundColor: '#f9f9f9',
          borderRadius: 12,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>[필수] 서비스 개선을 위한 데이터 분석</div>
              <div style={{ fontSize: 14, color: '#666' }}>오류 감지, 성능 개선, 기능 개선</div>
            </div>
            <Button
              size="small"
              variant={consents.analytics ? 'primary' : 'weak'}
              onClick={() => toggleConsent('analytics')}
            >
              {consents.analytics ? '동의' : '거부'}
            </Button>
          </div>

          {consents.analytics && (
            <div style={{ padding: 12, backgroundColor: '#fff', borderRadius: 8, fontSize: 13, color: '#666' }}>
              <div>• 앱 오류 감지 및 수정</div>
              <div>• 서비스 성능 모니터링</div>
              <div>• 사용자 경험 개선</div>
            </div>
          )}
        </div>

        {/* Marketing Consent (Optional) */}
        <div style={{
          padding: 16,
          backgroundColor: '#f9f9f9',
          borderRadius: 12,
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>[선택] 마케팅 정보 수신</div>
              <div style={{ fontSize: 14, color: '#666' }}>새로운 기능, 업데이트 안내</div>
            </div>
            <Button
              size="small"
              variant={consents.marketing ? 'primary' : 'weak'}
              onClick={() => toggleConsent('marketing')}
            >
              {consents.marketing ? '동의' : '동의 안 함'}
            </Button>
          </div>

          {consents.marketing && (
            <div style={{ padding: 12, backgroundColor: '#fff', borderRadius: 8, fontSize: 13, color: '#666' }}>
              <div>• 이메일 알림</div>
              <div>• 푸시 알림</div>
              <div>• SMS 알림</div>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div style={{
          padding: 16,
          backgroundColor: '#E3F2FD',
          borderRadius: 8,
          marginBottom: 24,
          fontSize: 13,
          color: '#1565C0'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>🔒 개인정보 보호</div>
          <div>• 동의하신 내용은 언제든지 설정에서 변경 가능합니다</div>
          <div>• 수집된 데이터는 암호화하여 안전하게 보관합니다</div>
          <div>• 동의하지 않은 항목은 해당 서비스만 제한됩니다</div>
        </div>

        {/* Version Info */}
        <div style={{ textAlign: 'center', fontSize: 12, color: '#999' }}>
          개인정보 처리방침 버전: {version} | 최종 업데이트: 2026-07-04
        </div>
      </div>

      {/* Footer Buttons */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTop: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        <Button
          size="large"
          variant="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={!consents.personalization && !consents.analytics}
          display="block"
        >
          선택하고 계속하기
        </Button>

        <Button
          size="large"
          variant="weak"
          onClick={handleAcceptAll}
          loading={loading}
          display="block"
        >
          모두 동의하고 계속하기
        </Button>

        {showSkip && (
          <TextButton
            onClick={handleSkip}
            disabled={loading}
            display="block"
            textAlign="center"
          >
            지금 하지 않기
          </TextButton>
        )}
      </div>
    </>
  );
}

/**
 * Minimal consent form (for settings page)
 */
export function ConsentFormMinimal({
  values,
  onSave,
}: {
  values: ConsentScope;
  onSave: (values: ConsentScope) => void;
}) {
  const [consents, setConsents] = useState<ConsentScope>(values);

  const toggleConsent = (key: keyof ConsentScope) => {
    setConsents(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div style={{ padding: 20 }}>
      <Paragraph typography="h5" style={{ marginBottom: 16 }}>
        개인정보 처리 동의 설정
      </Paragraph>

      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #eee'
        }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>개인화 서비스</div>
            <div style={{ fontSize: 14, color: '#666' }}>역할에 맞춘 서비스 제공</div>
          </div>
          <Button
            size="small"
            variant={consents.personalization ? 'primary' : 'weak'}
            onClick={() => toggleConsent('personalization')}
          >
            {consents.personalization ? 'ON' : 'OFF'}
          </Button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: '1px solid #eee'
        }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>데이터 분석</div>
            <div style={{ fontSize: 14, color: '#666' }}>서비스 개선 및 오류 감지</div>
          </div>
          <Button
            size="small"
            variant={consents.analytics ? 'primary' : 'weak'}
            onClick={() => toggleConsent('analytics')}
          >
            {consents.analytics ? 'ON' : 'OFF'}
          </Button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 0'
        }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>마케팅 정보</div>
            <div style={{ fontSize: 14, color: '#666' }}>새로운 기능 안내</div>
          </div>
          <Button
            size="small"
            variant={consents.marketing ? 'primary' : 'weak'}
            onClick={() => toggleConsent('marketing')}
          >
            {consents.marketing ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      <Button
        size="large"
        variant="primary"
        onClick={() => onSave(consents)}
        display="block"
      >
        저장하기
      </Button>
    </div>
  );
}
