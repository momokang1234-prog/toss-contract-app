import { css } from '@emotion/react';
import { Button, Paragraph, Spacing } from '@toss/tds-mobile';

const fullScreenStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 24px;
  background-color: var(--tds-color-background);
  text-align: center;
`;

const pageStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  background-color: var(--tds-color-background);
  text-align: center;
`;

export function GlobalErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div css={fullScreenStyle}>
      <Paragraph typography="t2" fontWeight="bold">앗, 문제가 발생했어요</Paragraph>
      <Spacing size={16} />
      <Paragraph typography="t5" color="grey600">앱을 초기화하거나 다시 시도해 주세요.</Paragraph>
      <Spacing size={32} />
      <Button color="primary" onClick={resetErrorBoundary}>다시 시도</Button>
    </div>
  );
}

export function PageErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div css={pageStyle}>
      <Paragraph typography="t4" fontWeight="bold">페이지를 불러오지 못했어요</Paragraph>
      <Spacing size={12} />
      <Paragraph typography="t6" color="grey600">일시적인 오류일 수 있어요.</Paragraph>
      <Spacing size={24} />
      <Button color="primary" variant="weak" size="small" onClick={resetErrorBoundary}>다시 시도</Button>
    </div>
  );
}
