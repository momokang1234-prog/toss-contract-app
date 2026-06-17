
import { Top, Text, Button, Spacing, TextField } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';
export default function FormVariantA() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', padding: '0 24px' }}>
      <CommentBoundary name="폼-헤더">
        <Top title="" style={{ marginLeft: -24, marginRight: -24 }} />
      </CommentBoundary>
      <CommentBoundary name="폼-필드">
        <div style={{ paddingTop: 24, flex: 1 }}>
          <Text typography="t3" fontWeight="bold">근무할 장소의<br/>이름을 알려주세요</Text>
          <Spacing size={8} />
          <Text typography="t6" color="grey-600">예: 토스카페 강남점</Text>
          <Spacing size={32} />
          <TextField variant="line" placeholder="사업장명 입력" autoFocus />
        </div>
      </CommentBoundary>
      <CommentBoundary name="폼-제출">
        <div style={{ paddingBottom: 24 }}>
          <Button size="large" display="block">다음</Button>
        </div>
      </CommentBoundary>
    </div>
  );
}