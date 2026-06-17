
import { Top, Text, Button, Spacing, TextField } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';
export default function FormVariantB() {
  return (
    <div style={{ background: '#f2f4f6', minHeight: '100vh', position: 'relative', maxWidth: 480, margin: '0 auto' }}>
      <CommentBoundary name="폼-헤더">
        <Top title="계약서 작성" />
        <div style={{ padding: '0 24px', opacity: 0.5 }}>
          <div style={{ background: '#fff', borderRadius: 16, height: 200, marginBottom: 16 }} />
          <div style={{ background: '#fff', borderRadius: 16, height: 100 }} />
        </div>
      </CommentBoundary>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)' }} />
      <CommentBoundary name="폼-필드">
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '32px 24px 24px' }}>
          <Text typography="t4" fontWeight="bold">근무할 장소를 입력해주세요</Text>
          <Spacing size={24} />
          <TextField variant="line" placeholder="예: 토스카페 강남점" autoFocus />
          <Spacing size={32} />
          <Button size="large" display="block">다음</Button>
        </div>
      </CommentBoundary>
    </div>
  );
}