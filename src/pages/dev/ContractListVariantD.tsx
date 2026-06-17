import { Top, Paragraph, Spacing, List, ListRow, Badge, Button } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';

const MOCK = [
  { id: '1', name: '김철수', type: '파트타임', place: '토스카페 강남점', date: '2026-06-01', month: '2026년 6월', status: 'sent' },
  { id: '2', name: '이영희', type: '풀타임', place: '토스카페 홍대점', date: '2026-05-20', month: '2026년 5월', status: 'signed' },
  { id: '3', name: '박민준', type: '파트타임', place: '토스카페 신촌점', date: '2026-05-10', month: '2026년 5월', status: 'cancelled' },
];

const badge = (s: string) =>
  s === 'signed' ? { label: '완료', color: 'blue' as const } :
  s === 'sent' ? { label: '서명 대기', color: 'yellow' as const } :
  { label: '만료/취소', color: 'elephant' as const };

export default function ContractListVariantD() {
  const months = [...new Set(MOCK.map(c => c.month))];

  return (
    <div style={{ background: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <Top title="">
        <Button color="primary" variant="weak" size="small">+ 새 계약서</Button>
      </Top>
      <div style={{ padding: '0 20px' }}>
        <Paragraph typography="t3" fontWeight="bold">근로계약서</Paragraph>
        <Spacing size={16} />
        {months.map(month => (
          <CommentBoundary key={month} name={`타임라인-${month}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3182f6', flexShrink: 0 }} />
              <Paragraph typography="t6" fontWeight="bold" color="grey-500">{month}</Paragraph>
            </div>
            <div style={{ marginLeft: 3, borderLeft: '2px solid #e5e8eb', paddingLeft: 17, marginBottom: 16 }}>
              <div style={{ margin: '0 -20px 0 -20px' }}>
                <List>
                  {MOCK.filter(c => c.month === month).map(c => (
                    <ListRow
                      key={c.id}
                      aria-label={c.name}
                      contents={
                        <div>
                          <Paragraph typography="t5" fontWeight="bold" color="grey-800">{c.name} ({c.type})</Paragraph>
                          <Spacing size={4} />
                          <Paragraph typography="t7" color="grey-500">{c.place} · {c.date}</Paragraph>
                        </div>
                      }
                      right={<Badge size="small" variant="fill" color={badge(c.status).color}>{badge(c.status).label}</Badge>}
                    />
                  ))}
                </List>
              </div>
            </div>
          </CommentBoundary>
        ))}
      </div>
    </div>
  );
}
