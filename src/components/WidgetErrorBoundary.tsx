import { Component, type ReactNode } from 'react';
import { Button, Paragraph, Spacing } from '@toss/tds-mobile';
import { css } from '@emotion/react';

const widgetStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background-color: var(--tds-color-surface);
  border: 1px solid var(--tds-color-grey200);
  border-radius: 12px;
  text-align: center;
`;

export function WidgetErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div css={widgetStyle}>
      <Paragraph typography="t6" fontWeight="bold" color="red500">요소를 불러오지 못했어요</Paragraph>
      <Spacing size={8} />
      <Button color="primary" variant="weak" size="small" onClick={resetErrorBoundary}>다시 시도</Button>
    </div>
  );
}

interface Props { children: ReactNode; }
interface State { error: Error | null; hasError: boolean; }

export class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { error: null, hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[WidgetErrorBoundary]', error);
  }

  resetErrorBoundary = () => {
    this.setState({ error: null, hasError: false });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <WidgetErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }
    return this.props.children;
  }
}
