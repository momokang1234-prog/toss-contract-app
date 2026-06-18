import { Paragraph, Spacing, Button, Top } from "@toss/tds-mobile";
import { useState } from "react";
import { CommentBoundary } from './CommentBoundary';
import { HeroMarquee } from "../../components/shared/HeroMarquee";

export default function LoginVariantE() {
  const [step, setStep] = useState(1);
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <Top title={step === 1 ? "" : "역할 선택"} />
      {step === 2 && (
        <div style={{ padding: '8px 16px' }}>
          <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#3182f6', fontSize: 14, cursor: 'pointer', padding: 0 }}>← 뒤로</button>
        </div>
      )}
      <div style={{ padding: 24, flex: 1 }}>
        {step === 1 ? (
          <CommentBoundary name="로그인-히어로">
            <Paragraph typography="t3" fontWeight="bold">근로계약서, 이제 토스에서</Paragraph>
            <Spacing size={40} />
            <HeroMarquee />
          </CommentBoundary>
        ) : (
          <CommentBoundary name="로그인-폼">
            <Paragraph typography="t3" fontWeight="bold">어떤 역할이신가요?</Paragraph>
            <Spacing size={24} />
            <Button size="large" display="block" color="primary" variant="weak" onClick={() => alert('사장님')}>사장님</Button>
            <Spacing size={12} />
            <Button size="large" display="block" color="light" onClick={() => alert('근로자')}>근로자</Button>
          </CommentBoundary>
        )}
      </div>
      {step === 1 && (
        <CommentBoundary name="로그인-CTA">
          <div style={{ padding: 24 }}>
            <Button size="xlarge" display="block" onClick={() => setStep(2)}>다음으로</Button>
          </div>
        </CommentBoundary>
      )}
    </div>
  );
}
