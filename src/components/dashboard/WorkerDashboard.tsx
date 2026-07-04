/**
 * Worker Dashboard Component
 *
 * Role-based dashboard for workers with:
 * - Pending contracts (highlighted)
 * - Contract history
 * - Quick actions
 * - Payment status
 *
 * @module components/dashboard/WorkerDashboard
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flex,
  Text,
  Button,
  Card,
  Spacing,
  Divider,
  List,
  ListItem,
} from '@toss/tds-mobile';
import { personalizationEngine, type PersonalizationResult } from '@/lib/personalization-engine';
import { useIsWorker, useUserId } from '@/hooks/useUserId';

interface Contract {
  id: string;
  title: string;
  employer_name: string;
  status: 'sent' | 'viewed' | 'signed' | 'completed';
  sent_at: string;
  deadline?: string;
}

/**
 * Worker dashboard with simplified UI
 */
export function WorkerDashboard() {
  const navigate = useNavigate();
  const userId = useUserId();
  const isWorker = useIsWorker();

  const [personalization, setPersonalization] = useState<PersonalizationResult | null>(null);
  const [pendingContracts, setPendingContracts] = useState<Contract[]>([]);
  const [contractHistory, setContractHistory] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !isWorker) return;

    // Load personalization
    personalizationEngine.apply(userId).then(setPersonalization);

    // Load dashboard data
    loadDashboardData();
  }, [userId, isWorker]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch pending contracts
      const pendingData: Contract[] = [
        { id: '1', title: '단기 근로계약서', employer_name: '토스사장', status: 'sent', sent_at: '2026-07-04', deadline: '2026-07-10' },
        { id: '2', title: '시급 근로계약서', employer_name: '스타트업사장', status: 'viewed', sent_at: '2026-07-03', deadline: '2026-07-09' },
      ];
      setPendingContracts(pendingData);

      // Fetch contract history
      const historyData: Contract[] = [
        { id: '3', title: '정규직 근로계약서', employer_name: '이전사장', status: 'completed', sent_at: '2026-06-01' },
        { id: '4', title: '계약직 근로계약서', employer_name: '또다른사장', status: 'completed', sent_at: '2026-05-15' },
      ];
      setContractHistory(historyData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quick actions for workers
   */
  const quickActions = [
    {
      id: 'view-pending',
      label: '대기 계약',
      icon: '📋',
      description: '서명 대기 중인 계약',
      count: pendingContracts.length,
      onClick: () => navigate('/worker/contracts?status=pending'),
    },
    {
      id: 'sign-contract',
      label: '계약 서명',
      icon: '✍️',
      description: '계약서 검토 및 서명',
      onClick: () => pendingContracts.length > 0
        ? navigate(`/worker/contracts/${pendingContracts[0].id}`)
        : navigate('/worker/contracts'),
    },
    {
      id: 'contract-history',
      label: '계약 이력',
      icon: '📂',
      description: '지난 계약서 보기',
      onClick: () => navigate('/worker/contracts?status=completed'),
    },
    {
      id: 'update-profile',
      label: '내 정보',
      icon: '👤',
      description: '개인정보 관리',
      onClick: () => navigate('/worker/profile'),
    },
  ];

  /**
   * Status badge styles
   */
  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'sent': return 'yellow';
      case 'viewed': return 'blue';
      case 'signed': return 'green';
      case 'completed': return 'grey';
      default: return 'grey';
    }
  };

  const getStatusLabel = (status: Contract['status']) => {
    switch (status) {
      case 'sent': return '서명 요청';
      case 'viewed': return '확인 중';
      case 'signed': return '서명 완료';
      case 'completed': return '계약 완료';
      default: return status;
    }
  };

  if (!isWorker) {
    return (
      <Flex direction="column" gap={16} padding={20} align="center">
        <Text typo="h3" bold color="grey-700">
          근로자 전용 대시보드입니다
        </Text>
        <Button onClick={() => navigate('/')}>
          홉으로 이동
        </Button>
      </Flex>
    );
  }

  if (loading) {
    return (
      <Flex direction="column" padding={20} align="center">
        <Text typo="body1" color="grey-600">
          불러오는 중...
        </Text>
      </Flex>
    );
  }

  const highlightPending = personalization?.actions.includes('highlight-pending-contracts') || false;
  const showPaymentStatus = personalization?.dashboard.showPaymentStatus || false;
  const simplifyUI = personalization?.actions.includes('simplify-ui') || false;

  return (
    <Flex direction="column" gap={20}>
      {/* Header */}
      <Flex justify="space-between" align="center" padding={20}>
        <Flex direction="column" gap={4}>
          <Text typo="h2" bold>
            안녕하세요, 근로자님 👷
          </Text>
          <Text typo="body2" color="grey-600">
            받은 계약서를 확인하세요
          </Text>
        </Flex>
      </Flex>

      {/* Pending Contracts Alert (if any) */}
      {pendingContracts.length > 0 && highlightPending && (
        <Card spacing={16} backgroundColor="yellow-50" padding={20}>
          <Flex direction="column" gap={12}>
            <Flex justify="space-between" align="center">
              <Text typo="t5" bold color="yellow-800">
                🔔 서명 대기 중인 계약
              </Text>
              <Card spacing={4} backgroundColor="yellow-200">
                <Text typo="caption1" color="yellow-900" bold>
                  {pendingContracts.length}건
                </Text>
              </Card>
            </Flex>

            {pendingContracts.map(contract => (
              <Card key={contract.id} spacing={12} backgroundColor="white">
                <Flex direction="column" gap={8}>
                  <Flex justify="space-between" align="center">
                    <Text typo="body1" bold>
                      {contract.title}
                    </Text>
                    <Card spacing={4} backgroundColor={`${getStatusColor(contract.status)}-50`}>
                      <Text typo="caption1" color={`${getStatusColor(contract.status)}-700`} bold>
                        {getStatusLabel(contract.status)}
                      </Text>
                    </Card>
                  </Flex>

                  <Text typo="body2" color="grey-700">
                    사장님: {contract.employer_name}
                  </Text>

                  {contract.deadline && (
                    <Text typo="caption1" color="red-600">
                      ⏰ 마감: {contract.deadline}
                    </Text>
                  )}

                  <Button
                    size="small"
                    variant="primary"
                    onClick={() => navigate(`/worker/contracts/${contract.id}`)}
                  >
                    계약서 확인하고 서명하기
                  </Button>
                </Flex>
              </Card>
            ))}
          </Flex>
        </Card>
      )}

      {/* Quick Actions */}
      <Flex direction="column" gap={12} padding={20}>
        <Text typo="t5" bold>
          ⚡ 빠른 시작
        </Text>

        {simplifyUI ? (
          // Simplified UI for mobile
          <Flex direction="column" gap={8}>
            {quickActions.map(action => (
              <Button
                key={action.id}
                size="large"
                variant="secondary"
                onClick={action.onClick}
                leftIcon={action.icon}
                right={action.count && action.count > 0 ? `${action.count}건` : undefined}
              >
                <Flex direction="column">
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
        ) : (
          // Grid layout for desktop
          <Flex gap={12} wrap="wrap">
            {quickActions.map(action => (
              <Card
                key={action.id}
                spacing={16}
                style={{
                  flex: '1 1 calc(50% - 24px)',
                  minWidth: 150,
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
        )}
      </Flex>

      {/* Payment Status (if enabled) */}
      {showPaymentStatus && (
        <>
          <Divider />
          <Flex direction="column" gap={12} padding={20}>
            <Text typo="t5" bold>
              💰 급여 정보
            </Text>

            <Card spacing={16} backgroundColor="green-50">
              <Flex direction="column" gap={8}>
                <Text typo="body1" bold color="green-800">
                  최근 급여 지급 내역
                </Text>
                <Text typo="body2" color="green-700">
                  2026년 6월: ₩1,500,000 (지급 완료)
                </Text>
                <Button size="small" variant="ghost" onClick={() => navigate('/worker/payments')}>
                  전체 내역 보기
                </Button>
              </Flex>
            </Card>
          </Flex>
        </>
      )}

      <Divider />

      {/* Contract History */}
      <Flex direction="column" gap={12} padding={20}>
        <Flex justify="space-between" align="center">
          <Text typo="t5" bold>
            📂 계약 이력
          </Text>
          <Button size="small" variant="ghost" onClick={() => navigate('/worker/contracts')}>
            더보기
          </Button>
        </Flex>

        {contractHistory.length > 0 ? (
          <List>
            {contractHistory.map(contract => (
              <ListItem
                key={contract.id}
                text={contract.title}
                sub={contract.employer_name}
                right={
                  <Card spacing={4} backgroundColor={`${getStatusColor(contract.status)}-50`}>
                    <Text typo="caption1" color={`${getStatusColor(contract.status)}-700`} bold>
                      {getStatusLabel(contract.status)}
                    </Text>
                  </Card>
                }
                onClick={() => navigate(`/worker/contracts/${contract.id}`)}
              />
            ))}
          </List>
        ) : (
          <Card spacing={20} backgroundColor="grey-50">
            <Flex direction="column" gap={12} align="center">
              <Text typo="body1" color="grey-600">
                계약 이력이 없습니다
              </Text>
            </Flex>
          </Card>
        )}
      </Flex>

      <Spacing size={20} />
    </Flex>
  );
}

/**
 * Ultra-simplified worker dashboard (for first-time users)
 */
export function WorkerDashboardWelcome() {
  const navigate = useNavigate();

  return (
    <Flex direction="column" padding={20} gap={16} align="center">
      <Text typo="h3">👋</Text>
      <Text typo="h3" bold align="center">
        계약서를 기다리고 있어요
      </Text>
      <Text typo="body2" color="grey-600" align="center">
        사장님이 계약서를 보내면<br />
        알림을 통해 안내드릴게요
      </Text>
      <Button size="large" variant="primary" onClick={() => navigate('/worker/contracts')}>
        내 계약서 보기
      </Button>
    </Flex>
  );
}
