import { Top, Paragraph, Spacing, List, ListRow, Badge, BottomSheet } from '@toss/tds-mobile';
import { useState } from 'react';
import { CommentBoundary } from './CommentBoundary';

export default function WorkerVariantA() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: '#f2f4f6', minHeight: '100vh', paddingBottom: 24 }}>
      <CommentBoundary name="인사말">
        <Top title="내 계약 목록" subtitleBottom="A: 바텀시트 중심 (화면 이동 최소화)" />
        <Spacing size={24} />
        <Paragraph typography="t4" fontWeight="bold" style={{ padding: '0 24px' }}>받은 계약서</Paragraph>
        <Spacing size={16} />
      </CommentBoundary>
      <CommentBoundary name="계약리스트">
        <List>
          <ListRow
            contents={
              <div>
                <Paragraph typography="t5" fontWeight="bold" color="grey-800">토스커피 (강남점)</Paragraph>
                <Paragraph typography="t7" color="grey-500">전송일: 방금 전</Paragraph>
              </div>
            }
            right={<Badge size="small" variant="fill" color="blue">서명 대기</Badge>}
            onClick={() => setOpen(true)}
          />
          <ListRow
            contents={
              <div>
                <Paragraph typography="t5" fontWeight="bold" color="grey-800">비바 리퍼블리카</Paragraph>
                <Paragraph typography="t7" color="grey-500">전송일: 2일 전</Paragraph>
              </div>
            }
            right={<Badge size="small" variant="fill" color="green">계약 완료</Badge>}
          />
        </List>
      </CommentBoundary>
      <CommentBoundary name="CTA버튼">
        <BottomSheet open={open} onClose={() => setOpen(false)}>
          <div style={{ padding: 24 }}>
            <Paragraph typography="t4" fontWeight="bold">토스커피 (강남점)</Paragraph>
            <Spacing size={12} />
            <Paragraph typography="t6" color="grey-600">
              여기에 요약된 계약 조건(시급, 근로시간 등)을 먼저 띄워<br />
              페이지 이동 없이 바로 확인하고 전자서명으로 넘어갈 수 있도록 구성합니다.
            </Paragraph>
            <Spacing size={24} />
            <div style={{ padding: 16, background: '#e8f3ff', borderRadius: 8, color: '#3182f6', textAlign: 'center', fontWeight: 'bold' }}>
              서명하러 가기 버튼
            </div>
            <Spacing size={16} />
          </div>
        </BottomSheet>
      </CommentBoundary>
    </div>
  );
}
