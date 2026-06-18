import { Top, List, ListRow, Button, Spacing, Paragraph } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';
export default function BusinessVariantE() {
  return (
    <div>
      <CommentBoundary name="사업장-헤더">
        <Top title="사업장 등록" />
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>입력할 항목을<br/>선택해주세요</div>
          <Spacing size={24} />
        </div>
      </CommentBoundary>
      <CommentBoundary name="사업장-폼">
        <List>
          <ListRow
            contents={
              <div>
                <Paragraph typography="t5" fontWeight="bold" color="grey-800">사업자등록번호</Paragraph>
                <Paragraph typography="t7" color="grey-500">입력 필요</Paragraph>
              </div>
            }
            right={<span style={{color: '#3182f6', fontSize: 14}}>입력하기</span>}
            onClick={() => {}}
          />
          <ListRow
            contents={
              <div>
                <Paragraph typography="t5" fontWeight="bold" color="grey-800">상호 및 대표자</Paragraph>
                <Paragraph typography="t7" color="grey-500">입력 필요</Paragraph>
              </div>
            }
            right={<span style={{color: '#3182f6', fontSize: 14}}>입력하기</span>}
            onClick={() => {}}
          />
          <ListRow
            contents={
              <div>
                <Paragraph typography="t5" fontWeight="bold" color="grey-800">사업장 소재지</Paragraph>
                <Paragraph typography="t7" color="grey-500">입력 필요</Paragraph>
              </div>
            }
            right={<span style={{color: '#3182f6', fontSize: 14}}>입력하기</span>}
            onClick={() => {}}
          />
        </List>
      </CommentBoundary>
      <CommentBoundary name="사업장-제출">
        <div style={{ padding: '40px 24px' }}>
          <Button size="xlarge" display="block" color="primary" variant="fill" disabled>모두 입력 후 등록</Button>
        </div>
      </CommentBoundary>
    </div>
  );
}
