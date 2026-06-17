import { useState } from 'react';
import { Top, Paragraph, Spacing, List, ListRow, Badge, Button, BottomSheet, TextButton } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';

const ALL = [
  { id: '1', name: '김철수', type: '파트타임', place: '토스카페 강남점', date: '2026-06-01', status: 'sent' },
  { id: '2', name: '이영희', type: '풀타임', place: '토스카페 홍대점', date: '2026-05-20', status: 'signed' },
  { id: '3', name: '박민준', type: '파트타임', place: '토스카페 신촌점', date: '2026-05-10', status: 'cancelled' },
];

const badge = (s: string) =>
  s === 'signed' ? { label: '완료', color: 'blue' as const } :
  s === 'sent' ? { label: '서명 대기', color: 'yellow' as const } :
  { label: '만료/취소', color: 'elephant' as const };

const FILTERS = ['전체', '서명 대기', '완료', '만료/취소'];
const SORTS = ['최신순', '이름순'];

export default function ContractListVariantC() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState('전체');
  const [sort, setSort] = useState('최신순');

  const filtered = ALL.filter(c =>
    filter === '전체' ? true :
    filter === '서명 대기' ? c.status === 'sent' :
    filter === '완료' ? c.status === 'signed' : c.status === 'cancelled'
  );

  return (
    <div style={{ background: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <Top title="">
        <Button color="primary" variant="weak" size="small">+ 새 계약서</Button>
      </Top>
      <div style={{ padding: '0 20px' }}>
        <Paragraph typography="t3" fontWeight="bold">근로계약서</Paragraph>
        <Spacing size={12} />
        <CommentBoundary name="필터-정렬-바">
          <TextButton size="small" onClick={() => setSheetOpen(true)}>
            {filter} · {sort} ▼
          </TextButton>
        </CommentBoundary>
        <Spacing size={8} />
        <CommentBoundary name="계약서-목록">
          <div style={{ margin: '0 -20px' }}>
            <List>
              {filtered.map(c => (
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
        </CommentBoundary>
      </div>
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} header={<BottomSheet.Header>필터 · 정렬</BottomSheet.Header>}>
        <div style={{ padding: '0 24px 24px' }}>
          <Paragraph typography="t6" fontWeight="bold" color="grey-600">상태 필터</Paragraph>
          <Spacing size={8} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: filter === f ? '#3182f6' : '#f2f4f6', color: filter === f ? '#fff' : '#333', fontWeight: 600, cursor: 'pointer' }}>{f}</button>
            ))}
          </div>
          <Spacing size={16} />
          <Paragraph typography="t6" fontWeight="bold" color="grey-600">정렬</Paragraph>
          <Spacing size={8} />
          <div style={{ display: 'flex', gap: 8 }}>
            {SORTS.map(s => (
              <button key={s} onClick={() => setSort(s)} style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: sort === s ? '#3182f6' : '#f2f4f6', color: sort === s ? '#fff' : '#333', fontWeight: 600, cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
          <Spacing size={24} />
          <Button size="large" display="block" onClick={() => setSheetOpen(false)}>적용</Button>
        </div>
      </BottomSheet>
    </div>
  );
}
