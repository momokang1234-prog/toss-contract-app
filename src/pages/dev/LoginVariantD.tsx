import { Paragraph, Spacing, Button } from "@toss/tds-mobile";
import { overlay } from "overlay-kit";
import { HeroMarquee } from "../../components/shared/HeroMarquee";
import { CommentBoundary } from './CommentBoundary';

export default function LoginVariantD() {
  return (
    <div style={{ height: '100vh', padding: 24, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <CommentBoundary name="로그인-히어로">
        <Spacing size={40} />
        <HeroMarquee />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paragraph typography="t3" fontWeight="bold" textAlign="center">모든 계약을<br/>쉽고 빠르게</Paragraph>
        </div>
      </CommentBoundary>
      <CommentBoundary name="로그인-CTA">
        <Button size="xlarge" display="block" onClick={() => {
          overlay.open(({ isOpen, close }) => (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s' }}>
              <div style={{ background: '#fff', width: 320, borderRadius: 16, padding: 24 }}>
                <Paragraph typography="t4" fontWeight="bold">로그인 수단 선택</Paragraph>
                <Spacing size={8} />
                <Paragraph typography="t6" color="grey-600">역할에 맞는 버튼을 눌러주세요.</Paragraph>
                <Spacing size={24} />
                <Button size="large" display="block" onClick={() => { close(); alert('사장님'); }}>사장님</Button>
                <Spacing size={12} />
                <Button size="large" display="block" color="light" onClick={() => { close(); alert('근로자'); }}>근로자</Button>
                <Spacing size={16} />
                <div style={{ textAlign: 'center' }}>
                  <span onClick={close} style={{ fontSize: 13, color: '#8b95a1', textDecoration: 'underline', cursor: 'pointer' }}>닫기</span>
                </div>
              </div>
            </div>
          ));
        }}>로그인</Button>
      </CommentBoundary>
    </div>
  );
}
