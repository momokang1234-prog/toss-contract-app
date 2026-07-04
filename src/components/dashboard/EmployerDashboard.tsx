/**
 * Employer Dashboard Component
 *
 * Role-based dashboard for employers with:
 * - Contract analytics overview
 * - Quick actions
 * - Recent contracts
 * - Performance metrics
 *
 * @module components/dashboard/EmployerDashboard
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
  Icon,
  List,
  ListItem,
} from '@toss/tds-mobile';
import { personalizationEngine, type PersonalizationResult } from '@/lib/personalization-engine';
import { useIsEmployer, useUserId } from '@/hooks/useUserId';

interface Contract {
  id: string;
  title: string;
  worker_name: string;
  status: 'draft' | 'sent' | 'signed' | 'completed';
  created_at: string;
}

interface DashboardMetrics {
  totalContracts: number;
  pendingContracts: number;
  signedContracts: number;
  completionRate: number;
  averageTimeToSign: number; // in hours
}

/**
 * Employer dashboard with analytics and quick actions
 */
export function EmployerDashboard() {
  const navigate = useNavigate();
  const userId = useUserId();
  const isEmployer = useIsEmployer();

  const [personalization, setPersonalization] = useState<PersonalizationResult | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalContracts: 0,
    pendingContracts: 0,
    signedContracts: 0,
    completionRate: 0,
    averageTimeToSign: 0,
  });
  const [recentContracts, setRecentContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !isEmployer) return;

    // Load personalization
    personalizationEngine.apply(userId).then(setPersonalization);

    // Load dashboard data
    loadDashboardData();
  }, [userId, isEmployer]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch metrics (mock for now, replace with actual API)
      const metricsData: DashboardMetrics = {
        totalContracts: 12,
        pendingContracts: 3,
        signedContracts: 8,
        completionRate: 85,
        averageTimeToSign: 24,
      };
      setMetrics(metricsData);

      // Fetch recent contracts
      const contractsData: Contract[] = [
        { id: '1', title: '정규직 근로계약서', worker_name: '김알바', status: 'signed', created_at: '2026-07-01' },
        { id: '2', title: '계약직 근로계약서', worker_name: '이직원', status: 'pending', created_at: '2026-06-28' },
        { id: '3', title: '단기 근로계약서', worker_name: '박파트', status: 'completed', created_at: '2026-06-25' },
      ];
      setRecentContracts(contractsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Quick actions for employers
   */
  const quickActions = [
    {
      id: 'create-contract',
      label: '계약서 작성',
      icon: '➕',
      description: '새 근로계약서 생성',
      onClick: () => navigate('/employer/contract-form'),
    },
    {
      id: 'view-pending',
      label: '대기 계약',
      icon: '⏳',
      description: '서명 대기 중인 계약',
      count: metrics.pendingContracts,
      onClick: () => navigate('/employer/contracts?status=pending'),
    },
    {
      id: 'view-all',
      label: '전체 계약',
      icon: '📋',
      description: '모든 계약서 보기',
      onClick: () => navigate('/employer/contracts'),
    },
    {
      id: 'send-reminders',
      label: '알림 보내기',
      icon: '🔔',
      description: '서명 독촉 알림',
      onClick: () => navigate('/employer/reminders'),
    },
  ];

  /**
   * Status badge styles
   */
  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'signed': return 'green';
      case 'pending': return 'yellow';
      case 'draft': return 'grey';
      case 'completed': return 'blue';
      default: return 'grey';
    }
  };

  const getStatusLabel = (status: Contract['status']) => {
    switch (status) {
      case 'signed': return '서명 완료';
      case 'pending': return '서명 대기';
      case 'draft': return '작성 중';
      case 'completed': return '계약 완료';
      default: return status;
    }
  };

  if (!isEmployer) {
    return (
      <Flex direction="column" gap={16} padding={20} align="center">
        <Text typo="h3" bold color="grey-700">
          사장님 전용 대시보드입니다
        </Text>
        <Button onClick={() => navigate('/')}>
          홈으로 이동
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

  const showAnalytics = personalization?.dashboard.showAnalytics || false;

  return (
    <Flex direction="column" gap={20}>
      {/* Header */}
      <Flex justify="space-between" align="center" padding={20}>
        <Flex direction="column" gap={4}>
          <Text typo="h2" bold>
            안녕하세요, 사장님 👔
          </Text>
          <Text typo="body2" color="grey-600">
            계약 관리를 시작해보세요
          </Text>
        </Flex>
      </Flex>

      {/* Metrics Cards (if analytics enabled) */}
      {showAnalytics && (
        <>
          <Flex direction="column" gap={12} padding={20}>
            <Text typo="t5" bold>
              📊 계약 현황
            </Text>

            <Flex gap={12} wrap="wrap">
              <Card
                spacing={16}
                style={{ flex: 1, minWidth: 140 }}
              >
                <Flex direction="column" gap={8}>
                  <Text typo="body2" color="grey-600">
                    전체 계약
                  </Text>
                  <Text typo="h3" bold color="blue-700">
                    {metrics.totalContracts}
                  </Text>
                </Flex>
              </Card>

              <Card
                spacing={16}
                style={{ flex: 1, minWidth: 140 }}
              >
                <Flex direction="column" gap={8}>
                  <Text typo="body2" color="grey-600">
                    서명 대기
                  </Text>
                  <Text typo="h3" bold color="yellow-700">
                    {metrics.pendingContracts}
                  </Text>
                </Flex>
              </Card>

              <Card
                spacing={16}
                style={{ flex: 1, minWidth: 140 }}
              >
                <Flex direction="column" gap={8}>
                  <Text typo="body2" color="grey-600">
                    완료율
                  </Text>
                  <Text typo="h3" bold color="green-700">
                    {metrics.completionRate}%
                  </Text>
                </Flex>
              </Card>
            </Flex>

            {metrics.totalContracts >= 10 && (
              <Card spacing={16} backgroundColor="blue-50">
                <Flex direction="column" gap={8}>
                  <Text typo="body3" color="blue-800" bold>
                    🎉 축하합니다!
                  </Text>
                  <Text typo="body3" color="blue-700">
                    10건 이상의 계약을 생성하여 고급 분석 기능이 활성화되었습니다.
                  </Text>
                </Flex>
              </Card>
            )}
          </Flex>

          <Divider />
        </>
      )}

      {/* Quick Actions */}
      <Flex direction="column" gap={12} padding={20}>
        <Text typo="t5" bold>
          ⚡ 빠른 시작
        </Text>

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
      </Flex>

      <Divider />

      {/* Recent Contracts */}
      <Flex direction="column" gap={12} padding={20}>
        <Flex justify="space-between" align="center">
          <Text typo="t5" bold>
            📝 최근 계약
          </Text>
          <Button size="small" variant="ghost" onClick={() => navigate('/employer/contracts')}>
            더보기
          </Button>
        </Flex>

        {recentContracts.length > 0 ? (
          <List>
            {recentContracts.map(contract => (
              <ListItem
                key={contract.id}
                text={contract.title}
                sub={contract.worker_name}
                right={
                  <Card spacing={4} backgroundColor={`${getStatusColor(contract.status)}-50`}>
                    <Text typo="caption1" color={`${getStatusColor(contract.status)}-700`} bold>
                      {getStatusLabel(contract.status)}
                    </Text>
                  </Card>
                }
                onClick={() => navigate(`/employer/contracts/${contract.id}`)}
              />
            ))}
          </List>
        ) : (
          <Card spacing={20} backgroundColor="grey-50">
            <Flex direction="column" gap={12} align="center">
              <Text typo="body1" color="grey-600">
                아직 계약서가 없습니다
              </Text>
              <Button size="medium" variant="primary" onClick={() => navigate('/employer/contract-form')}>
                첫 계약서 작성하기
              </Button>
            </Flex>
          </Card>
        )}
      </Flex>

      <Spacing size={20} />
    </Flex>
  );
}

/**
 * Simplified employer dashboard (for mobile or basic view)
 */
export function EmployerDashboardSimple() {
  return (
    <Flex direction="column" padding={20} gap={16}>
      <Text typo="h3" bold>
        사장님 대시보드
      </Text>
      <Text typo="body2" color="grey-600">
        전체 기능을 보려면 데스크탱에서 이용해주세요.
      </Text>
    </Flex>
  );
}
