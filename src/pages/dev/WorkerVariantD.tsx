import { Top, Paragraph, Spacing, List, ListRow, Badge, Button } from '@toss/tds-mobile';

import { CommentBoundary } from './CommentBoundary';

export default function WorkerVariantD() {
  return (
    <div style={{ background: '#f2f4f6', minHeight: '100vh', paddingBottom: 24, position: 'relative' }}>
      <CommentBoundary name="인사말">
        <Top title="내 계약 목록" subtitleBottom="D: 모달 알림 강조" />
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
                <Paragraph typography="t7" color="grey-500">서명 대기</Paragraph>
              </div>
            }
            right={<Badge size="small" variant="fill" color="blue">작성중</Badge>}
          />
        </List>
      </CommentBoundary>

      <CommentBoundary name="CTA버튼">
        {/* Dimmed Overlay & Modal Mock */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ background: '#fff', width: '80%', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <Paragraph typography="t4" fontWeight="bold">서명이 필요한 계약서가 있어요!</Paragraph>
            <Spacing size={12} />
            <Paragraph typography="t6" color="grey-600">
              사장님이 보낸 근로계약서에 아직 서명하지 않았습니다. 내용을 확인하고 서명을 완료해 주세요.
            </Paragraph>
            <Spacing size={24} />
            <Button size="large" display="block">지금 서명하러 가기</Button>
            <Spacing size={12} />
            <div style={{ fontSize: 13, color: '#8b95a1', textDecoration: 'underline' }}>나중에 하기</div>
          </div>
        </div>
      </CommentBoundary>
    </div>
  );
}
