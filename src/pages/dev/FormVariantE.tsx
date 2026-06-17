
import { Top, Text, Button, Spacing, TextField } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';
export default function FormVariantE() {
  return (
    <div style={{ background: '#191f28', minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <CommentBoundary name="폼-헤더">
        <Top title="계약서 작성" style={{ background: '#191f28', color: '#fff' }} />
      </CommentBoundary>
      <CommentBoundary name="폼-필드">
        <div style={{ padding: '0 24px', flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ background: '#fff', width: '100%', borderRadius: 24, padding: '32px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <Text typography="t6" color="grey-500" fontWeight="bold">Step 1 of 7</Text>
              <Text typography="t6" color="blue" fontWeight="bold">건너뛰기</Text>
            </div>
            <Text typography="t3" fontWeight="bold">어디서 일하나요?</Text>
            <Spacing size={8} />
            <Text typography="t6" color="grey-600">근무 장소를 입력해주세요.</Text>
            <Spacing size={32} />
            <TextField variant="line" placeholder="사업장명" autoFocus />
            <Spacing size={32} />
            <CommentBoundary name="폼-제출">
              <Button size="large" display="block">다음 단계로</Button>
            </CommentBoundary>
          </div>
        </div>
      </CommentBoundary>
    </div>
  );
}