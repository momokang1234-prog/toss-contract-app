/**
 * Consent Preferences Page
 *
 * Full consent management page for users to update their consent choices
 *
 * @module pages/user/ConsentPreferencesPage
 */

import { useState, useEffect } from 'react';
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
  Switch,
} from '@toss/tds-mobile';
import { consentManager, type ConsentScope } from '@/lib/consent-manager';
import { ConsentFormMinimal } from '@/components/consent/ConsentForm';
import { useUserId } from '@/hooks/useUserId';

interface ConsentHistory {
  version: string;
  timestamp: Date;
  changes: Partial<ConsentScope>;
}

/**
 * Consent preferences page with full management capabilities
 */
export function ConsentPreferencesPage() {
  const navigate = useNavigate();
  const userId = useUserId();

  const [consents, setConsents] = useState<ConsentScope | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<ConsentHistory[]>([]);

  useEffect(() => {
    if (!userId) return;

    loadConsent();
  }, [userId]);

  const loadConsent = async () => {
    setLoading(true);
    try {
      const consent = await consentManager.getConsent(userId);
      setConsents(consent);

      // Load consent history (mock for now)
      const historyData: ConsentHistory[] = [
        {
          version: '1.0',
          timestamp: new Date('2026-07-04'),
          changes: { personalization: true, analytics: true },
        },
      ];
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load consent:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle consent update
   */
  const handleSaveConsent = async (newConsents: ConsentScope) => {
    setSaving(true);
    try {
      await consentManager.updateConsent(userId, newConsents);
      setConsents(newConsents);
    } catch (error) {
      console.error('Failed to update consent:', error);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle data export
   */
  const handleExportData = async () => {
    try {
      // Mock data export
      const userData = {
        userId,
        consents,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-${userId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  /**
   * Handle data deletion request
   */
  const handleRequestDeletion = () => {
    navigate('/user/data-deletion');
  };

  if (loading) {
    return (
      <Flex direction="column" padding={20} align="center">
        <Text typo="body1" color="grey-600">
          불러오는 중...
        </Text>
      </Flex>
    );
  }

  if (!consents) {
    return (
      <Flex direction="column" padding={20} align="center">
        <Text typo="body1" color="grey-600">
          동의 정보를 불러올 수 없습니다
        </Text>
        <Button onClick={() => navigate(-1)}>뒤로</Button>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap={20}>
      {/* Header */}
      <Flex justify="space-between" align="center" padding={20}>
        <Flex direction="column" gap={4}>
          <Text typo="h2" bold>
            개인정보 설정
          </Text>
          <Text typo="body2" color="grey-600">
            동의 내용을 관리할 수 있습니다
          </Text>
        </Flex>
        <Button size="small" variant="ghost" onClick={() => navigate(-1)}>
          뒤로
        </Button>
      </Flex>

      {/* Consent Form */}
      <Flex direction="column" padding={20} gap={16}>
        <Text typo="t5" bold>
          동의 설정
        </Text>

        <ConsentFormMinimal
          values={consents}
          onSave={handleSaveConsent}
        />
      </Flex>

      <Divider />

      {/* Consent History */}
      <Flex direction="column" padding={20} gap={16}>
        <Text typo="t5" bold>
          📜 동의 이력
        </Text>

        {history.length > 0 ? (
          <List>
            {history.map((item, index) => (
              <ListItem
                key={index}
                text={`버전 ${item.version}`}
                sub={new Date(item.timestamp).toLocaleString('ko-KR')}
                right={
                  <Flex direction="column" gap={4} align="flex-end">
                    {item.changes.personalization && (
                      <Text typo="caption1" color="green-700">
                        개인화: 동의
                      </Text>
                    )}
                    {item.changes.analytics && (
                      <Text typo="caption1" color="green-700">
                        분석: 동의
                      </Text>
                    )}
                  </Flex>
                }
              />
            ))}
          </List>
        ) : (
          <Text typo="body2" color="grey-600">
            동의 이력이 없습니다
          </Text>
        )}
      </Flex>

      <Divider />

      {/* Data Management */}
      <Flex direction="column" padding={20} gap={16}>
        <Text typo="t5" bold>
          💾 데이터 관리
        </Text>

        <Card spacing={16}>
          <Flex direction="column" gap={12}>
            <Text typo="body1" bold>
              데이터 내보내기
            </Text>
            <Text typo="body2" color="grey-600">
              개인정보 및 활동 내역을 다운로드할 수 있습니다
            </Text>
            <Button size="medium" variant="secondary" onClick={handleExportData}>
              데이터 내보내기
            </Button>
          </Flex>
        </Card>

        <Card spacing={16} backgroundColor="red-50">
          <Flex direction="column" gap={12}>
            <Text typo="body1" bold color="red-800">
              데이터 삭제 요청
            </Text>
            <Text typo="body2" color="red-700">
              모든 데이터를 삭제하고 계정을 종료합니다
            </Text>
            <Button size="medium" variant="ghost" onClick={handleRequestDeletion}>
              삭제 요청하기
            </Button>
          </Flex>
        </Card>
      </Flex>

      <Divider />

      {/* Privacy Notice */}
      <Flex direction="column" padding={20} gap={12}>
        <Text typo="t5" bold>
          🔒 개인정보 보호
        </Text>

        <Flex direction="column" gap={8}>
          <Text typo="body2" color="grey-700">
            • 수집된 데이터는 암호화하여 안전하게 보관합니다
          </Text>
          <Text typo="body2" color="grey-700">
            • 동의하지 않은 항목은 해당 서비스만 제한됩니다
          </Text>
          <Text typo="body2" color="grey-700">
            • 언제든지 동의를 철회할 수 있습니다
          </Text>
          <Text typo="body2" color="grey-700">
            • 데이터 보관 기간: 1년 (최소 30일)
          </Text>
        </Flex>

        <Button
          size="medium"
          variant="ghost"
          onClick={() => window.open('/privacy', '_blank')}
        >
          전체 개인정보 처리방침 보기
        </Button>
      </Flex>

      <Spacing size={20} />
    </Flex>
  );
}

/**
 * Consent preferences summary (for settings page)
 */
export function ConsentPreferencesSummary() {
  const userId = useUserId();
  const [consents, setConsents] = useState<ConsentScope | null>(null);

  useEffect(() => {
    if (!userId) return;

    consentManager.getConsent(userId).then(setConsents);
  }, [userId]);

  if (!consents) {
    return null;
  }

  const activeCount = Object.values(consents).filter(Boolean).length;

  return (
    <Card spacing={16}>
      <Flex justify="space-between" align="center">
        <Flex direction="column" gap={4}>
          <Text typo="body1" bold>
            개인정보 동의
          </Text>
          <Text typo="caption1" color="grey-600">
            {activeCount}개 항목 동의 중
          </Text>
        </Flex>
        <Text typo="body2" color="blue-700">
          {activeCount > 0 ? '동의함' : '미동의'}
        </Text>
      </Flex>
    </Card>
  );
}
