import { Link } from 'react-router-dom';
import { Paragraph, Button, Spacing } from '@toss/tds-mobile';

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Paragraph typography="st1" fontWeight="bold" style={{ fontSize: 48 }}>404</Paragraph>
      <Paragraph typography="st4" color="grey600">페이지를 찾을 수 없어요.</Paragraph>
      <Spacing size={16} />
      <Link to="/login" style={{ textDecoration: 'none' }}>
        <Button color="primary" variant="weak" size="large">로그인으로 돌아가기</Button>
      </Link>
    </div>
  );
}
