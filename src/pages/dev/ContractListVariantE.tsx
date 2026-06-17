import { Top, Paragraph, Spacing, List, ListRow, Badge, Button } from '@toss/tds-mobile';
import { CommentBoundary } from './CommentBoundary';

const MOCK: any[] = [];

export default function ContractListVariantE() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <Top title="">
        <Button color="primary" variant="weak" size="small">+ 새 계약서</Button>
      </Top>
      <div style={{ padding: '0 20px' }}>
        <Paragraph typography="t3" fontWeight="bold">근로계약서</Paragraph>
        <Spacing size={12} />

        {MOCK.length > 0 ? (
          <div style={{ margin: '0 -20px' }}>
            <List>
              {MOCK.map(c => (
                <ListRow key={c.id} aria-label={c.name} contents={<Paragraph typography="t5">{c.name}</Paragraph>} right={<Badge size="small" variant="fill" color="blue">완료</Badge>} />
              ))}
            </List>
          </div>
        ) : (
          <CommentBoundary name="빈상태-온보딩">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, textAlign: 'center' }}>
              <img src="https://static.toss.im/2d-emojis/png/4x/u1F4CB.png" alt="" style={{ width: 80, height: 80 }} />
              <Spacing size={20} />
              <Paragraph typography="t3" fontWeight="bold" color="grey-800">
                첫 계약서를<br/>작성해보세요
              </Paragraph>
              <Spacing size={8} />
              <Paragraph typography="t5" color="grey-500">
                3분 만에 근로계약서를 만들고<br/>직원에게 바로 보낼 수 있어요
              </Paragraph>
              <Spacing size={32} />
              <Button color="primary" variant="fill" size="large">계약서 작성하기</Button>
              <Spacing size={12} />
              <Button color="primary" variant="weak" size="medium">샘플 계약서 보기</Button>
            </div>
          </CommentBoundary>
        )}
      </div>
    </div>
  );
}
