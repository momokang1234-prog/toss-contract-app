import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 48, fontWeight: 700 }}>404</h1>
      <p style={{ color: '#6B7684', marginBottom: 24 }}>페이지를 찾을 수 없어요.</p>
      <Link to="/login" style={{ color: '#3182F6' }}>로그인으로 돌아가기</Link>
    </div>
  );
}
