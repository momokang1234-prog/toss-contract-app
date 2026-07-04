/**
 * Quick Actions Component
 *
 * Role-based quick actions for dashboard
 * Dynamically shows actions based on user role and preferences
 *
 * @module components/dashboard/QuickActions
 */

import { useNavigate } from 'react-router-dom';
import { Flex, Button, Card, Text } from '@toss/tds-mobile';
import { useIsEmployer, useIsWorker } from '@/hooks/useUserId';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  onClick: () => void;
  count?: number;
  variant?: 'primary' | 'secondary' | 'ghost';
  visible?: boolean;
}

interface QuickActionsProps {
  /** User role */
  role: 'employer' | 'worker';
  /** Device type */
  deviceType?: 'mobile' | 'desktop';
  /** Custom actions */
  customActions?: QuickAction[];
  /** Simplified UI for mobile */
  simplified?: boolean;
}

/**
 * Default quick actions for employers
 */
const employerActions: QuickAction[] = [
  {
    id: 'create-contract',
    label: '계약서 작성',
    icon: '➕',
    description: '새 근로계약서',
    variant: 'primary',
    visible: true,
  },
  {
    id: 'view-pending',
    label: '대기 계약',
    icon: '⏳',
    description: '서명 대기 중',
    variant: 'secondary',
    visible: true,
  },
  {
    id: 'view-all',
    label: '전체 계약',
    icon: '📋',
    description: '모든 계약서',
    variant: 'secondary',
    visible: true,
  },
  {
    id: 'send-reminders',
    label: '알림 보내기',
    icon: '🔔',
    description: '서명 독촉',
    variant: 'ghost',
    visible: true,
  },
  {
    id: 'view-analytics',
    label: '분석',
    icon: '📊',
    description: '계약 통계',
    variant: 'ghost',
    visible: true, // Only show if user has 10+ contracts
  },
];

/**
 * Default quick actions for workers
 */
const workerActions: QuickAction[] = [
  {
    id: 'view-pending',
    label: '대기 계약',
    icon: '📋',
    description: '서명 대기 중',
    variant: 'primary',
    visible: true,
  },
  {
    id: 'sign-contract',
    label: '계약 서명',
    icon: '✍️',
    description: '계약 검토 및 서명',
    variant: 'secondary',
    visible: true,
  },
  {
    id: 'contract-history',
    label: '계약 이력',
    icon: '📂',
    description: '지난 계약',
    variant: 'secondary',
    visible: true,
  },
  {
    id: 'update-profile',
    label: '내 정보',
    icon: '👤',
    description: '개인정보 관리',
    variant: 'ghost',
    visible: true,
  },
];

/**
 * Quick actions component with role-based display
 */
export function QuickActions({
  role,
  deviceType = 'desktop',
  customActions,
  simplified = false,
}: QuickActionsProps) {
  const navigate = useNavigate();
  const isEmployer = useIsEmployer();
  const isWorker = useIsWorker();

  // Select actions based on role
  let actions: QuickAction[] = role === 'employer' ? employerActions : workerActions;

  // Add navigation handlers
  actions = actions.map(action => ({
    ...action,
    onClick: () => {
      switch (action.id) {
        case 'create-contract':
          navigate('/employer/contract-form');
          break;
        case 'view-pending':
          role === 'employer'
            ? navigate('/employer/contracts?status=pending')
            : navigate('/worker/contracts?status=pending');
          break;
        case 'view-all':
          navigate('/employer/contracts');
          break;
        case 'send-reminders':
          navigate('/employer/reminders');
          break;
        case 'view-analytics':
          navigate('/employer/analytics');
          break;
        case 'sign-contract':
          navigate('/worker/contracts?status=pending');
          break;
        case 'contract-history':
          navigate('/worker/contracts?status=completed');
          break;
        case 'update-profile':
          navigate('/worker/profile');
          break;
        default:
          console.warn('Unknown action:', action.id);
      }
    },
  }));

  // Use custom actions if provided
  if (customActions) {
    actions = customActions;
  }

  // Filter visible actions
  const visibleActions = actions.filter(action => action.visible !== false);

  // Simplified UI for mobile
  if (simplified || deviceType === 'mobile') {
    return (
      <Flex direction="column" gap={8}>
        {visibleActions.map(action => (
          <Button
            key={action.id}
            size="large"
            variant={action.variant || 'secondary'}
            onClick={action.onClick}
            leftIcon={action.icon}
            right={action.count ? `${action.count}건` : undefined}
          >
            <Flex direction="column" style={{ alignItems: 'flex-start' }}>
              <Text typo="body1" bold>
                {action.label}
              </Text>
              <Text typo="body2" color="grey-600">
                {action.description}
              </Text>
            </Flex>
          </Button>
        ))}
      </Flex>
    );
  }

  // Grid UI for desktop
  return (
    <Flex gap={12} wrap="wrap">
      {visibleActions.map(action => (
        <Card
          key={action.id}
          spacing={16}
          style={{
            flex: '1 1 calc(25% - 24px)',
            minWidth: 140,
            cursor: 'pointer',
          }}
          onClick={action.onClick}
        >
          <Flex direction="column" gap={8}>
            <Text typo="h3">{action.icon}</Text>
            <Text typo="body1" bold>
              {action.label}
            </Text>
            <Text typo="body2" color="grey-600">
              {action.description}
            </Text>
            {action.count !== undefined && action.count > 0 && (
              <Card spacing={4} backgroundColor="red-50">
                <Text typo="caption1" color="red-700" bold>
                  {action.count}건 대기
                </Text>
              </Card>
            )}
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}

/**
 * Quick action button (standalone)
 */
export function QuickActionButton({ action }: { action: QuickAction }) {
  return (
    <Button
      size={action.variant === 'primary' ? 'large' : 'medium'}
      variant={action.variant || 'secondary'}
      onClick={action.onClick}
      leftIcon={action.icon}
      right={action.count ? `${action.count}건` : undefined}
    >
      {action.label}
    </Button>
  );
}

/**
 * Quick actions bar (horizontal scrollable)
 */
export function QuickActionBar({
  role,
  actions,
}: {
  role: 'employer' | 'worker';
  actions?: QuickAction[];
}) {
  return (
    <Flex
      gap={8}
      style={{
        overflowX: 'auto',
        paddingBottom: 8,
      }}
    >
      <QuickActions role={role} customActions={actions} simplified />
    </Flex>
  );
}
