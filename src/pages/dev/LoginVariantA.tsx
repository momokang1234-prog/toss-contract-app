import { Button, Paragraph, Spacing, ListRow, BottomSheet } from "@toss/tds-mobile";
import { useState } from "react";
import { HeroMarquee } from "../../components/shared/HeroMarquee";
import { CommentBoundary } from './CommentBoundary';

export default function LoginVariantA() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <CommentBoundary name="로그인-히어로">
        <div style={{ flex: 1, paddingTop: 40 }}>
          <HeroMarquee />
          <div style={{ padding: 24 }}>
            <Paragraph typography="t3" fontWeight="bold">근로계약서,<br/>5분이면 충분해요</Paragraph>
          </div>
        </div>
      </CommentBoundary>
      <CommentBoundary name="로그인-CTA">
        <div style={{ padding: 24, paddingBottom: 40 }}>
          <Button size="xlarge" display="block" onClick={() => setOpen(true)}>시작하기</Button>
        </div>
      </CommentBoundary>
      <CommentBoundary name="로그인-폼">
        <BottomSheet open={open} onClose={() => setOpen(false)} header={<BottomSheet.Header>어떤 역할로 시작할까요?</BottomSheet.Header>}>
          <ListRow contents="사장님으로 시작하기" onClick={() => alert('사장님 로그인')} />
          <ListRow contents="근로자로 시작하기" onClick={() => alert('근로자 로그인')} />
        </BottomSheet>
      </CommentBoundary>
    </div>
  );
}
