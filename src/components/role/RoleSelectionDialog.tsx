/**
 * Role Selection Dialog Component
 *
 * Modal for users to select their role (employer or worker)
 * Required for role-based personalization
 *
 * @module components/role/RoleSelectionDialog
 */

import { useState } from 'react';
import { Button, Spacing, BottomSheet, Top, Paragraph } from '@toss/tds-mobile';

export type UserRole = 'employer' | 'worker';

interface RoleSelectionDialogProps {
  /** Callback when role is selected */
  onSelect: (role: UserRole) => void;
  /** Callback when dialog is dismissed */
  onDismiss?: () => void;
  /** Initial role (for pre-selection) */
  initialRole?: UserRole;
  /** Show skip option */
  showSkip?: boolean;
  /** Custom title */
  title?: string;
}

/**
 * Role selection with clear descriptions
 */
export function RoleSelectionDialog({
  onSelect,
  onDismiss,
  initialRole,
  showSkip = true,
  title = '역할을 선택해주세요',
}: RoleSelectionDialogProps) {
  const [selected, setSelected] = useState<UserRole | undefined>(initialRole);
  const [loading, setLoading] = useState(false);

  /**
   * Handle role selection
   */
  const handleSelect = async (role: UserRole) => {
    setSelected(role);
    setLoading(true);

    try {
      // Simulate API call for role update
      await new Promise(r => setTimeout(r, 300));
      onSelect(role);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle skip
   */
  const handleSkip = () => {
    onDismiss?.();
  };

  const roleNames = {
    employer: '사장님',
    worker: '근로자',
  };

  return (
    <>
      <Top title={title} left={<Button onClick={handleSkip}>×</Button>} />

      <div style={{ padding: 20 }}>
        <Paragraph color="grey" typography="p2" style={{ marginBottom: 24 }}>
          서비스 이용을 위해 본인의 역할을 선택해주세요.
          선택한 역할에 따라 맞춤형 서비스를 제공합니다.
        </Paragraph>

        {/* Employer Role Option */}
        <div
          onClick={() => !loading && handleSelect('employer')}
          style={{
            padding: 20,
            backgroundColor: selected === 'employer' ? '#E3F2FD' : '#f9f9f9',
            borderRadius: 16,
            border: selected === 'employer' ? '2px solid #4C6FFF' : '2px solid transparent',
            marginBottom: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                👔 사장님 (고용주)
              </div>
              {selected === 'employer' && (
                <div style={{ fontSize: 14, color: '#4C6FFF' }}>✓ 선택됨</div>
              )}
            </div>
          </div>

          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>
            <div>• 근로자 계약서 생성 및 관리</div>
            <div>• 계약 완료 현황 확인</div>
            <div>• 고용 관리 대시보드</div>
            <div>• 근로자에게 계약 공유 및 알림</div>
          </div>

          {selected === 'employer' && (
            <Button
              size="medium"
              variant="primary"
              onClick={() => handleSelect('employer')}
              loading={loading}
              style={{ marginTop: 12 }}
            >
              사장님으로 시작하기
            </Button>
          )}
        </div>

        {/* Worker Role Option */}
        <div
          onClick={() => !loading && handleSelect('worker')}
          style={{
            padding: 20,
            backgroundColor: selected === 'worker' ? '#E3F2FD' : '#f9f9f9',
            borderRadius: 16,
            border: selected === 'worker' ? '2px solid #4C6FFF' : '2px solid transparent',
            marginBottom: 16,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                👷 근로자
              </div>
              {selected === 'worker' && (
                <div style={{ fontSize: 14, color: '#4C6FFF' }}>✓ 선택됨</div>
              )}
            </div>
          </div>

          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>
            <div>• 받은 계약서 확인 및 검토</div>
            <div>• 전자 서명 (계약 체결)</div>
            <div>• 계약 이력 및 서류 관리</div>
            <div>• 급여 및 근무 일정 확인</div>
          </div>

          {selected === 'worker' && (
            <Button
              size="medium"
              variant="primary"
              onClick={() => handleSelect('worker')}
              loading={loading}
              style={{ marginTop: 12 }}
            >
              근로자로 시작하기
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div style={{
          padding: 16,
          backgroundColor: '#f9f9f9',
          borderRadius: 8,
          fontSize: 13,
          color: '#666',
          lineHeight: 1.8
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>💡 역할 안내</div>
          <div>• 사장님: 직원을 고용하여 계약서를 작성하는 분</div>
          <div>• 근로자: 사장님으로부터 계약서를 받는 분</div>
          <div>• 역할은 설정에서 언제든지 변경 가능합니다</div>
        </div>
      </div>

      {/* Footer Button */}
      {showSkip && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          backgroundColor: '#fff',
          borderTop: '1px solid #eee'
        }}>
          <Button
            size="large"
            variant="weak"
            onClick={handleSkip}
            disabled={loading}
            display="block"
          >
            나중에 선택하기
          </Button>
        </div>
      )}
    </>
  );
}

/**
 * Compact role selection (for inline use)
 */
export function RoleSelectionCompact({
  onSelect,
  selected,
}: {
  onSelect: (role: UserRole) => void;
  selected?: UserRole;
}) {
  return (
    <div style={{ padding: 20 }}>
      <Paragraph typography="h5" style={{ marginBottom: 16 }}>
        역할 선택
      </Paragraph>

      <div style={{ display: 'flex', gap: 12 }}>
        <Button
          size="medium"
          variant={selected === 'employer' ? 'primary' : 'weak'}
          onClick={() => onSelect('employer')}
        >
          👔 사장님
        </Button>

        <Button
          size="medium"
          variant={selected === 'worker' ? 'primary' : 'weak'}
          onClick={() => onSelect('worker')}
        >
          👷 근로자
        </Button>
      </div>
    </div>
  );
}

/**
 * Role confirmation dialog (for role change)
 */
export function RoleChangeConfirmDialog({
  currentRole,
  newRole,
  onConfirm,
  onCancel,
}: {
  currentRole: UserRole;
  newRole: UserRole;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const roleNames = {
    employer: '사장님',
    worker: '근로자',
  };

  return (
    <>
      <Top title="역할 변경 확인" left={<Button onClick={onCancel}>×</Button>} />

      <div style={{ padding: 20 }}>
        <Paragraph typography="p1" style={{ marginBottom: 24 }}>
          역할을 <span style={{ color: '#4C6FFF', fontWeight: 'bold' }}>{roleNames[currentRole]}</span>에서{' '}
          <span style={{ color: '#4C6FFF', fontWeight: 'bold' }}>{roleNames[newRole]}</span>로 변경하시겠습니까?
        </Paragraph>

        <Paragraph typography="p2" color="grey" style={{ marginBottom: 24 }}>
          변경 후 대시보드 및 기능이 새로운 역할에 맞춰 변경됩니다.
        </Paragraph>

        <div style={{
          padding: 16,
          backgroundColor: '#FFF8E1',
          borderRadius: 8,
          marginBottom: 24,
          fontSize: 13,
          color: '#F57C00'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>⚠️ 주의사항</div>
          <div>• 현재 역할로 생성된 데이터는 유지됩니다</div>
          <div>• 언제든지 다시 역할을 변경할 수 있습니다</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button size="large" variant="primary" onClick={onConfirm} display="block">
            변경하기
          </Button>
          <Button size="large" variant="weak" onClick={onCancel} display="block">
            취소
          </Button>
        </div>
      </div>
    </>
  );
}
