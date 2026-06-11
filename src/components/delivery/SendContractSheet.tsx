import { useState } from 'react';
import { Paragraph, Spacing, Button } from '@toss/tds-mobile';

interface Props {
  contractTitle: string;
  deepLink: string;
  onSend: () => void;
  onCancel: () => void;
}

export default function SendContractSheet({ contractTitle, deepLink, onSend, onCancel }: Props) {
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(deepLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '근로계약서 확인',
          text: `${contractTitle}님의 근로계약서가 도착했습니다.`,
          url: deepLink,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  const handleSend = async () => {
    setSending(true);
    // Haptic feedback
    try { navigator.vibrate?.(10); } catch {}
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    onSend();
  };

  return (
    <div style={{ padding: '24px 24px 32px' }}>
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 8 }}>
        계약서 전송
      </Paragraph>
      <Paragraph typography="st7" color="grey-500" style={{ marginBottom: 24 }}>
        {contractTitle}님에게 전송 방법을 선택하세요
      </Paragraph>

      <Button
        color="primary" variant="fill" display="block" size="xlarge"
        loading={sending} onClick={handleSend}
        style={{ marginBottom: 12 }}
      >
        {sending ? '전송 중...' : '📨 스마트 메시지로 전송'}
      </Button>

      <Button
        color="light" variant="weak" display="block" size="large"
        onClick={handleShare}
        style={{ marginBottom: 12 }}
      >
        📤 공유하기
      </Button>

      <Button
        color="light" variant="weak" display="block" size="large"
        onClick={handleCopyLink}
        style={{ marginBottom: 24 }}
      >
        {copied ? '✅ 복사 완료' : '🔗 링크 복사'}
      </Button>

      <Button color="light" variant="weak" display="block" size="large" onClick={onCancel}>
        취소
      </Button>

      <Spacing size={8} />
      <Paragraph typography="st8" color="grey-400" style={{ textAlign: 'center' }}>
        토스 스마트 메시지로 Push·SMS·인박스 발송
      </Paragraph>
    </div>
  );
}
