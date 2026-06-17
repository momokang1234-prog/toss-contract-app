import { Top, Paragraph, Spacing, List, ListRow, Badge, Button } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';

const MOCK = [
  { id: '1', name: '김철수', type: '파트타임', place: '토스카페 강남점', date: '2026-06-01', status: 'sent' },
  { id: '2', name: '이영희', type: '풀타임', place: '토스카페 홍대점', date: '2026-05-20', status: 'signed' },
  { id: '3', name: '박민준', type: '파트타임', place: '토스카페 신촌점', date: '2026-05-10', status: 'cancelled' },
];

const badge = (s: string) =>
  s === 'signed' ? { label: '완료', color: 'blue' as const } :
  s === 'sent' ? { label: '서명 대기', color: 'yellow' as const } :
  { label: '만료/취소', color: 'elephant' as const };

export default function ContractListVariantA() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <CommentBoundary name="리스트-헤더">
        <Top title="">
          <Button color="primary" variant="weak" size="small">+ 새 계약서</Button>
        </Top>
      </CommentBoundary>
      <div style={{ padding: '0 20px' }}>
        <Paragraph typography="t3" fontWeight="bold">근로계약서</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="t5" color="grey-500">총 {MOCK.length}건의 계약서가 있어요</Paragraph>
        <Spacing size={12} />
        <CommentBoundary name="계약서-목록">
          <div style={{ margin: '0 -20px' }}>
            <List>
              {MOCK.map(c => (
                <ListRow
                  key={c.id}
                  aria-label={c.name}
                  contents={
                    <div>
                      <Paragraph typography="t5" fontWeight="bold" color="grey-800">
                        {c.name} ({c.type})
                      </Paragraph>
                      <Spacing size={4} />
                      <Paragraph typography="t7" color="grey-500">{c.place} · {c.date}</Paragraph>
                    </div>
                  }
                  right={
                    <Badge size="small" variant="fill" color={badge(c.status).color}>
                      {badge(c.status).label}
                    </Badge>
                  }
                />
              ))}
            </List>
          </div>
        </CommentBoundary>
      </div>
    </div>
  );
}
