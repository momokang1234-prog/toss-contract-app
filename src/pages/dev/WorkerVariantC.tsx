import { Top, Paragraph, Spacing, List, ListRow, Badge } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';

export default function WorkerVariantC() {
  return (
    <div style={{ background: '#f2f4f6', minHeight: '100vh', paddingBottom: 24 }}>
      <CommentBoundary name="인사말">
        <Top title="내 계약 목록" subtitle="C: 리스트-디테일 (정통 뷰)" />
        <Spacing size={24} />
        <Paragraph typography="t4" fontWeight="bold" style={{ padding: '0 24px' }}>받은 계약서 목록</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="t6" color="grey-600" style={{ padding: '0 24px' }}>
          서명할 계약서를 선택해 상세 내용을 꼼꼼히 읽어보세요.
        </Paragraph>
        <Spacing size={24} />
      </CommentBoundary>
      <CommentBoundary name="계약리스트">
        <List>
          <ListRow 
            title="토스커피 (강남점)" 
            subtitle="전송일: 2026.06.16" 
            right={<Badge color="blue">서명 대기</Badge>} 
          />
          <ListRow 
            title="비바 리퍼블리카" 
            subtitle="전송일: 2026.05.01" 
            right={<Badge color="green">계약 완료</Badge>} 
          />
          <ListRow 
            title="토스프론트 (을지로점)" 
            subtitle="전송일: 2026.04.15" 
            right={<Badge color="red">만료됨</Badge>} 
          />
        </List>
      </CommentBoundary>
    </div>
  );
}
