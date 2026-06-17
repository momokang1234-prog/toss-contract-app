import { Top, Paragraph, Spacing, Button } from "@toss/tds-mobile";
import { HeroMarquee } from "../../components/shared/HeroMarquee";
import { CommentBoundary } from './CommentBoundary';

export default function LoginVariantB() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f2f4f6' }}>
      <CommentBoundary name="로그인-히어로">
        <Top title="로그인" />
        <div style={{ padding: 24, flex: 1 }}>
          <Spacing size={40} />
          <Paragraph typography="t2" fontWeight="bold" textAlign="center">토스 근로계약</Paragraph>
          <Spacing size={16} />
          <Paragraph typography="t5" color="grey-600" textAlign="center">지금 바로 시작해보세요</Paragraph>
          <Spacing size={40} />
          <HeroMarquee />
        </div>
      </CommentBoundary>
      <CommentBoundary name="로그인-CTA">
        <div style={{ padding: 24, background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <Button size="xlarge" display="block" color="primary">사장님으로 시작하기</Button>
          <Spacing size={12} />
          <Button size="xlarge" display="block" color="light">근로자로 시작하기</Button>
          <Spacing size={24} />
        </div>
      </CommentBoundary>
    </div>
  );
}
