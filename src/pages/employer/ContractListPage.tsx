import { useNavigate } from 'react-router-dom';
import { useContracts } from '../../hooks/useContracts';
import { Top, Paragraph, Spacing, Button, List, ListRow, Badge } from '@toss/tds-mobile';
import styles from './ContractListPage.module.css';

export default function ContractListPage() {
  const navigate = useNavigate();
  const { contracts } = useContracts();

  const badgeFor = (status: string) => {
    if (status === 'draft') return { label: '작성중', color: 'elephant' as const };
    if (status === 'sent' || status === 'viewed') return { label: '진행중', color: 'blue' as const };
    if (status === 'signed') return { label: '서명완료', color: 'yellow' as const };
    if (status === 'completed') return { label: '계약완료', color: 'teal' as const };
    return { label: status, color: 'elephant' as const };
  };

  return (
    <div className={styles.page}>
      <Top title="계약서 목록">
        <Button color="primary" variant="weak" size="small"
          onClick={() => navigate('/employer/contracts/new')}>
          + 새 계약서
        </Button>
      </Top>

      <div className={styles.content}>
        <Spacing size={24} />

        <Paragraph typography="st2" fontWeight="bold">근로계약서</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="st5" color="grey-500">
          {contracts.length > 0
            ? `총 ${contracts.length}건의 계약서가 있어요`
            : '아직 작성한 계약서가 없어요'}
        </Paragraph>

        <Spacing size={24} />

        {contracts.length > 0 ? (
          <List>
            {contracts.map(c => (
              <ListRow
                key={c.id}
                onClick={() => navigate(`/employer/contracts/${c.id}`)}
                aria-label={c.worker_name}
                left={
                  <div className={styles.contractRow}>
                    <Paragraph typography="st5" fontWeight="bold">{c.worker_name}</Paragraph>
                    <Paragraph typography="st7" color="grey-500">{c.workplace} · {c.start_date}</Paragraph>
                  </div>
                }
                right={
                  <Badge size="small" variant="weak" color={badgeFor(c.status).color}>
                    {badgeFor(c.status).label}
                  </Badge>
                }
              />
            ))}
          </List>
        ) : (
          <div className={styles.empty}>
            <img src="https://static.toss.im/2d-emojis/png/4x/u1F4CB.png" alt=""
              style={{ width: 72, height: 72 }}
            />
            <Spacing size={16} />
            <Paragraph typography="st5" color="grey-500">
              첫 계약서를 작성해보세요
            </Paragraph>
            <Spacing size={20} />
            <Button color="primary" variant="fill" size="large"
              onClick={() => navigate('/employer/contracts/new')}>
              계약서 작성하기
            </Button>
          </div>
        )}

        <Spacing size={40} />
      </div>
    </div>
  );
}
