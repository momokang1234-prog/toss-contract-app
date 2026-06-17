import { Paragraph, List, ListRow, Spacing } from "@toss/tds-mobile";
import { HeroMarquee } from "../../components/shared/HeroMarquee";
import { CommentBoundary } from './CommentBoundary';

export default function LoginVariantC() {
  return (
    <div style={{ height: '100vh', padding: 24, background: '#fff' }}>
      <CommentBoundary name="로그인-히어로">
        <Spacing size={40} />
        <Paragraph typography="t3" fontWeight="bold">토스 근로계약 시작하기</Paragraph>
        <Spacing size={12} />
        <Paragraph typography="t6" color="grey-600">원하시는 로그인 방식을 선택해주세요.</Paragraph>
        <Spacing size={40} />
        <HeroMarquee />
      </CommentBoundary>
      <CommentBoundary name="로그인-폼">
        <List>
          <ListRow contents={<Paragraph typography="t5" fontWeight="bold">🏢 사장님으로 시작하기</Paragraph>} onClick={() => alert('사장님')} />
          <ListRow contents={<Paragraph typography="t5" fontWeight="bold">✍️ 근로자로 시작하기</Paragraph>} onClick={() => alert('근로자')} />
          <ListRow contents={<Paragraph typography="t5" color="grey-500">🧪 Mock 데이터로 체험하기</Paragraph>} onClick={() => alert('체험')} />
        </List>
      </CommentBoundary>
    </div>
  );
}
