import { Top, BottomSheet, TextField, Button, Spacing } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';
import { useState } from 'react';
export default function BusinessVariantC() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background: '#f2f4f6', height: '100vh' }}>
      <CommentBoundary name="사업장-헤더">
        <Top title="사업장 관리" />
        <div style={{ padding: 24 }}>
          <Button size="xlarge" display="block" color="primary" variant="fill" onClick={() => setOpen(true)}>사업장 등록 바텀시트 열기</Button>
        </div>
      </CommentBoundary>
      <CommentBoundary name="사업장-폼">
        <BottomSheet open={open} onClose={() => setOpen(false)} header={<BottomSheet.Header>새 사업장 등록</BottomSheet.Header>}>
          <div style={{ padding: '24px' }}>
            <TextField variant="line" labelOption="sustain" label="사업자등록번호" placeholder="000-00-00000" />
            <Spacing size={24} />
            <TextField variant="line" labelOption="sustain" label="상호" placeholder="사업장 이름" />
            <Spacing size={40} />
          </div>
          <BottomSheet.CTA>
            <CommentBoundary name="사업장-제출">
              <Button size="xlarge" display="block" color="primary" variant="fill" onClick={() => setOpen(false)}>등록하기</Button>
            </CommentBoundary>
          </BottomSheet.CTA>
        </BottomSheet>
      </CommentBoundary>
    </div>
  );
}
