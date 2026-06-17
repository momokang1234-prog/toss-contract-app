import { Top, Paragraph, Spacing, Button } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';

export default function WorkerVariantE() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: 24, display: 'flex', flexDirection: 'column' }}>
      <CommentBoundary name="인사말">
        <Top title="진행 중인 과제" subtitle="E: 퍼널 (단계별 진행)" />
      </CommentBoundary>
      
      <CommentBoundary name="상태카드">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: 64, height: 64, background: '#f2f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 24 }}>
            📄
          </div>
          <Paragraph typography="t3" fontWeight="bold" textAlign="center">
            다음 단계: 근로계약서 서명
          </Paragraph>
          <Spacing size={12} />
          <Paragraph typography="t5" color="grey-600" textAlign="center">
            현재 토스커피(강남점)에 입사하기 위해<br />
            마지막 단계인 서명만 남았어요.
          </Paragraph>
        </div>
      </CommentBoundary>

      <CommentBoundary name="CTA버튼">
        <div style={{ padding: 24 }}>
          <Button size="large" display="block">계약서 확인하고 서명하기</Button>
        </div>
      </CommentBoundary>
    </div>
  );
}
