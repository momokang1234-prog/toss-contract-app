import { Top, TextField, Button, Spacing } from '@toss/tds-mobile';
import { useState } from 'react';
import { CommentBoundary } from './CommentBoundary';
export default function BusinessVariantD() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background: '#f2f4f6', height: '100vh', position: 'relative' }}>
      <CommentBoundary name="사업장-헤더">
        <Top title="사업장 관리" />
        <div style={{ padding: 24 }}>
          <Button size="xlarge" display="block" color="primary" variant="fill" onClick={() => setOpen(true)}>사업장 등록 모달 열기</Button>
        </div>
      </CommentBoundary>
      <CommentBoundary name="사업장-폼">
        {open && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
          }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '80%' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 24 }}>사업장 등록</div>
              <TextField variant="line" labelOption="sustain" label="사업자등록번호" placeholder="000-00-00000" />
              <Spacing size={16} />
              <TextField variant="line" labelOption="sustain" label="상호" placeholder="사업장 이름" />
              <Spacing size={32} />
              <CommentBoundary name="사업장-제출">
                <Button size="xlarge" display="block" color="primary" variant="fill" onClick={() => setOpen(false)}>등록</Button>
              </CommentBoundary>
            </div>
          </div>
        )}
      </CommentBoundary>
    </div>
  );
}
