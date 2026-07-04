import { Button, Paragraph, Spacing } from '@toss/tds-mobile';

interface NetworkErrorFallbackProps {
  message?: string;
  submessage?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: string;
}

export function NetworkErrorFallback({
  message = '데이터를 불러오지 못했어요',
  submessage = '네트워크 연결을 확인하고 다시 시도해주세요',
  onRetry,
  retryText = '다시 시도',
  icon = 'https://static.toss.im/2d-emojis/png/4x/u1F514.png'
}: NetworkErrorFallbackProps) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <img
        src={icon}
        alt=""
        style={{ width: 72, height: 72, marginBottom: 16 }}
      />
      <Spacing size={16} />
      <Paragraph typography="t5" color="grey-600" fontWeight="bold">
        {message}
      </Paragraph>
      <Spacing size={8} />
      <Paragraph typography="t7" color="grey-500">
        {submessage}
      </Paragraph>
      {onRetry && (
        <>
          <Spacing size={24} />
          <Button color="primary" variant="weak" size="large" onClick={onRetry}>
            {retryText}
          </Button>
        </>
      )}
    </div>
  );
}
