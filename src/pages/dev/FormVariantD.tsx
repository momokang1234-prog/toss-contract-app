
import { Top, Text, Button, Spacing, TextField } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';
export default function FormVariantD() {
  return (
    <div style={{ background: '#f2f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <CommentBoundary name="폼-헤더">
        <Top title="계약서 작성 챗봇" />
      </CommentBoundary>
      <CommentBoundary name="폼-필드">
        <div style={{ padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Spacing size={24} />
          <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: 4, maxWidth: '80%' }}>
            <Text typography="t6">사장님, 안녕하세요! 👋</Text>
          </div>
          <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: 4, maxWidth: '80%' }}>
            <Text typography="t6">첫 번째로, <b>어떤 사업장</b>에서 일하게 되나요?</Text>
          </div>
        </div>
      </CommentBoundary>
      <CommentBoundary name="폼-제출">
        <div style={{ padding: '16px 24px 24px', background: '#fff', borderTop: '1px solid #e5e8eb' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <TextField variant="line" placeholder="답변 입력..." style={{ flex: 1 }} />
            <Button size="medium">전송</Button>
          </div>
        </div>
      </CommentBoundary>
    </div>
  );
}