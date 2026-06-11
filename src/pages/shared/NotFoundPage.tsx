import { useNavigate } from 'react-router-dom';
import { Top, Paragraph, Spacing, Button } from '@toss/tds-mobile';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Top title="" />
      <div className={styles.center}>
        <Spacing size={80} />
        <Paragraph typography="st1">🔍</Paragraph>
        <Spacing size={16} />
        <Paragraph typography="st2" fontWeight="bold">페이지를 찾을 수 없어요</Paragraph>
        <Spacing size={12} />
        <Paragraph typography="st5" color="grey-500">주소가 잘못되었거나 삭제된 페이지예요</Paragraph>
        <Spacing size={32} />
        <Button color="primary" variant="weak" size="large"
          onClick={() => navigate('/login')}>처음으로</Button>
      </div>
    </div>
  );
}
