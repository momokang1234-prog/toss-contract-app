import { Top, Paragraph, Spacing, List, ListRow, Badge, Button } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';

const MOCK = {
  pending: [
    { id: '1', name: '김철수', type: '파트타임', place: '토스카페 강남점', date: '2026-06-01' },
  ],
  completed: [
    { id: '2', name: '이영희', type: '풀타임', place: '토스카페 홍대점', date: '2026-05-20' },
  ],
  expired: [
    { id: '3', name: '박민준', type: '파트타임', place: '토스카페 신촌점', date: '2026-05-10' },
  ],
};

function Section({ title, items, badgeColor, badgeLabel }: { title: string; items: typeof MOCK.pending; badgeColor: 'blue' | 'yellow' | 'elephant'; badgeLabel: string }) {
  if (!items.length) return null;
  return (
    <CommentBoundary name={`섹션-${title}`}>
      <Paragraph typography="t6" fontWeight="bold" color="grey-600" style={{ padding: '12px 20px 4px' }}>{title}</Paragraph>
      <div style={{ margin: '0' }}>
        <List>
          {items.map(c => (
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
              right={<Badge size="small" variant="fill" color={badgeColor}>{badgeLabel}</Badge>}
            />
          ))}
        </List>
      </div>
    </CommentBoundary>
  );
}

export default function ContractListVariantB() {
  return (
    <div style={{ background: '#f2f4f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <Top title="">
        <Button color="primary" variant="weak" size="small">+ 새 계약서</Button>
      </Top>
      <div style={{ background: '#fff', borderRadius: 16, margin: '8px 12px', overflow: 'hidden' }}>
        <Section title="서명 대기" items={MOCK.pending} badgeColor="yellow" badgeLabel="서명 대기" />
        <Section title="완료된 계약" items={MOCK.completed} badgeColor="blue" badgeLabel="완료" />
        <Section title="만료·취소" items={MOCK.expired} badgeColor="elephant" badgeLabel="만료/취소" />
      </div>
    </div>
  );
}
