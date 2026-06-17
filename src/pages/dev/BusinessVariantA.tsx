import { Top, TextField, Spacing, Button } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';
export default function BusinessVariantA() {
  return (
    <div style={{ paddingBottom: 80 }}>
      <CommentBoundary name="사업장-헤더">
        <Top title="사업장 등록" />
      </CommentBoundary>
      <CommentBoundary name="사업장-폼">
        <div style={{ padding: '0 24px' }}>
          <Spacing size={24} />
          <TextField variant="line" labelOption="sustain" label="사업자등록번호" placeholder="000-00-00000" />
          <Spacing size={24} />
          <TextField variant="line" labelOption="sustain" label="상호" placeholder="사업장 이름" />
          <Spacing size={24} />
          <TextField variant="line" labelOption="sustain" label="대표자" placeholder="대표자 이름" />
          <Spacing size={24} />
          <TextField variant="line" labelOption="sustain" label="사업장 소재지" placeholder="주소" />
          <Spacing size={24} />
          <TextField variant="line" labelOption="sustain" label="전화번호" placeholder="02-1234-5678" />
          <Spacing size={40} />
          <CommentBoundary name="사업장-제출">
            <Button size="xlarge" display="block" color="primary" variant="fill">등록하기</Button>
          </CommentBoundary>
        </div>
      </CommentBoundary>
    </div>
  );
}
