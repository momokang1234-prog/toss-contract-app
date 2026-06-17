
import { Top, Text, Button, Spacing, TextField, List, ListRow } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';
export default function FormVariantC() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <CommentBoundary name="폼-헤더">
        <Top title="계약서 작성 (1/7)" />
      </CommentBoundary>
      <CommentBoundary name="폼-필드">
        <List>
          <div style={{ padding: '0 24px 24px' }}>
            <Text typography="t4" fontWeight="bold" color="blue">1. 근무 장소</Text>
            <Spacing size={16} />
            <TextField variant="line" placeholder="예: 토스카페 강남점" autoFocus />
            <Spacing size={16} />
            <CommentBoundary name="폼-제출">
              <Button size="medium" display="inline-block">저장하고 다음</Button>
            </CommentBoundary>
          </div>
          <div style={{ height: 8, background: '#f2f4f6' }} />
          <ListRow contents={<Text typography="t5" color="grey-500">2. 계약 기간</Text>} right={<Text color="grey-400">대기</Text>} />
          <ListRow contents={<Text typography="t5" color="grey-500">3. 근무 요일 및 시간</Text>} right={<Text color="grey-400">대기</Text>} />
          <ListRow contents={<Text typography="t5" color="grey-500">4. 임금 (시급)</Text>} right={<Text color="grey-400">대기</Text>} />
        </List>
      </CommentBoundary>
    </div>
  );
}