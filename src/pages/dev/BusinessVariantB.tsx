import { Top, TextField, Spacing, Button } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';
export default function BusinessVariantB() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <CommentBoundary name="사업장-헤더">
        <Top title="사업장 등록" />
      </CommentBoundary>
      <CommentBoundary name="사업장-폼">
        <div style={{ padding: '0 24px', flex: 1 }}>
          <Spacing size={24} />
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>사업자등록번호를<br/>입력해주세요</div>
          <Spacing size={32} />
          <TextField variant="line" labelOption="sustain" label="사업자등록번호" placeholder="000-00-00000" />
        </div>
      </CommentBoundary>
      <CommentBoundary name="사업장-제출">
        <div style={{ padding: 24 }}>
          <Button size="xlarge" display="block" color="primary" variant="fill">다음</Button>
        </div>
      </CommentBoundary>
    </div>
  );
}
