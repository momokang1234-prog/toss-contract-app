import React from 'react';
import { Top, Paragraph, Spacing, List, ListRow, Badge, Button, Text } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';

export default function WorkerVariantB() {
  return (
    <div style={{ background: '#f2f4f6', minHeight: '100vh', paddingBottom: 24, display: 'flex', flexDirection: 'column' }}>
      <CommentBoundary name="Header (인사말 영역)">
        <div style={{ background: '#3182f6', padding: '24px', color: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
          <Spacing size={16} />
          <Paragraph typography="t4" fontWeight="bold" style={{ color: '#fff' }}>안녕하세요, 홍길동님!</Paragraph>
          <Spacing size={8} />
          <Paragraph typography="t6" style={{ color: 'rgba(255,255,255,0.8)' }}>
            새로 도착한 근로계약서가 1건 있습니다.<br />빠르게 서명하고 업무를 시작해 보세요.
          </Paragraph>
          <Spacing size={24} />
        </div>
      </CommentBoundary>

      <CommentBoundary name="SummaryCards (상태 요약 카드)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 24, marginTop: -40 }}>
          <div style={{ background: '#fff', padding: 16, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Paragraph typography="t6" color="grey-600" style={{ marginBottom: 12 }}>서명 대기</Paragraph>
            <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 4, borderBottom: '2px solid #3182f6', paddingBottom: 2 }}>
              <Text typography="t3" color="primary" fontWeight="bold">1</Text>
              <Text typography="t5" color="grey-800" fontWeight="bold">건</Text>
            </div>
          </div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Paragraph typography="t6" color="grey-600" style={{ marginBottom: 12 }}>완료된 계약</Paragraph>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <Text typography="t3" color="grey-900" fontWeight="bold">3</Text>
              <Text typography="t5" color="grey-800" fontWeight="bold" style={{ paddingBottom: 2 }}>건</Text>
            </div>
          </div>
        </div>
      </CommentBoundary>

      <Spacing size={16} />
      <Paragraph typography="t5" fontWeight="bold" style={{ padding: '0 24px' }}>진행 중인 계약</Paragraph>
      <Spacing size={8} />
      <CommentBoundary name="List (계약 리스트)">
        <List>
          <ListRow
            contents={
              <div>
                <Paragraph typography="t5" fontWeight="bold" color="grey-800">토스커피 (강남점)</Paragraph>
                <Paragraph typography="t7" color="grey-500">최신 업데이트: 방금 전</Paragraph>
              </div>
            }
            right={<Badge size="small" variant="fill" color="blue">서명 대기</Badge>}
          />
        </List>
      </CommentBoundary>
      <div style={{ padding: 24, marginTop: 'auto' }}>
        <CommentBoundary name="Button (전체보기 버튼)">
          <Button size="large" display="block">전체 목록 보기</Button>
        </CommentBoundary>
      </div>
    </div>
  );
}
