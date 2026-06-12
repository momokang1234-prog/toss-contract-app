import { useState } from 'react';
import { Paragraph, Button } from '@toss/tds-mobile';
import { overlay } from 'overlay-kit';

export interface SendContractSheetProps {
  contractTitle: string;
  contractId: string;
  deepLink: string;
}

interface ViewProps extends SendContractSheetProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
function SendContractSheetView({ contractTitle, contractId, deepLink, onConfirm, onCancel }: ViewProps) {
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = `https://bossimclockedin.private-apps.tossmini.com/contract/${contractId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      alert('링크가 복사되었습니다');
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
    try { navigator.vibrate?.(10); } catch {}
    await new Promise(r => setTimeout(r, 800));
    setSending(false);
    onConfirm();
  };

  return (
    <div style={{ padding: '24px 24px 32px', backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
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

    </div>
  );
}

export async function openSendContractSheet(props: SendContractSheetProps): Promise<boolean> {
  return overlay.openAsync<boolean>(({ isOpen, close }) => (
    <SendContractSheetView
      isOpen={isOpen}
      {...props}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  ));
}
