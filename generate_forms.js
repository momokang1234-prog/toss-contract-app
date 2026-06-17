const fs = require('fs');
const path = require('path');

const variants = [
  { id: 'A', name: 'Standard Full Page', code: `
import { Top, Text, Button, Spacing, TextField } from '@toss/tds-mobile';
export default function FormVariantA() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Top title="" />
      <div style={{ padding: '24px 24px 0', flex: 1 }}>
        <Text typography="t3" fontWeight="bold">근무할 장소의<br/>이름을 알려주세요</Text>
        <Spacing size={8} />
        <Text typography="t6" color="grey-600">예: 토스카페 강남점</Text>
        <Spacing size={32} />
        <TextField placeholder="사업장명 입력" autoFocus />
      </div>
      <div style={{ padding: '24px' }}>
        <Button size="large" display="block">다음</Button>
      </div>
    </div>
  );
}` },
  { id: 'B', name: 'Bottom Sheet', code: `
import { Top, Text, Button, Spacing, TextField, BottomSheet } from '@toss/tds-mobile';
export default function FormVariantB() {
  return (
    <div style={{ background: '#f2f4f6', minHeight: '100vh', position: 'relative' }}>
      <Top title="계약서 작성" />
      <div style={{ padding: '24px', opacity: 0.5 }}>
        {/* Fake Dashboard background */}
        <div style={{ background: '#fff', borderRadius: 16, height: 200, marginBottom: 16 }} />
        <div style={{ background: '#fff', borderRadius: 16, height: 100 }} />
      </div>
      {/* Overlay to darken background */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '32px 24px 24px' }}>
        <Text typography="t4" fontWeight="bold">근무할 장소를 입력해주세요</Text>
        <Spacing size={24} />
        <TextField placeholder="예: 토스카페 강남점" autoFocus />
        <Spacing size={32} />
        <Button size="large" display="block">다음</Button>
      </div>
    </div>
  );
}` },
  { id: 'C', name: 'Accordion/Checklist', code: `
import { Top, Text, Button, Spacing, TextField, List, ListRow } from '@toss/tds-mobile';
export default function FormVariantC() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Top title="계약서 작성 (1/7)" />
      <List>
        <div style={{ padding: '24px' }}>
          <Text typography="t4" fontWeight="bold" color="blue">1. 근무 장소</Text>
          <Spacing size={16} />
          <TextField placeholder="예: 토스카페 강남점" autoFocus />
          <Spacing size={16} />
          <Button size="medium" display="inline-block">저장하고 다음</Button>
        </div>
        <div style={{ height: 8, background: '#f2f4f6' }} />
        <ListRow contents={<Text typography="t5" color="grey-500">2. 계약 기간</Text>} right={<Text color="grey-400">대기</Text>} />
        <ListRow contents={<Text typography="t5" color="grey-500">3. 근무 요일 및 시간</Text>} right={<Text color="grey-400">대기</Text>} />
        <ListRow contents={<Text typography="t5" color="grey-500">4. 임금 (시급)</Text>} right={<Text color="grey-400">대기</Text>} />
      </List>
    </div>
  );
}` },
  { id: 'D', name: 'Conversational', code: `
import { Top, Text, Button, Spacing, TextField } from '@toss/tds-mobile';
export default function FormVariantD() {
  return (
    <div style={{ background: '#f2f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Top title="계약서 작성 챗봇" />
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: 4, maxWidth: '80%' }}>
          <Text typography="t6">사장님, 안녕하세요! 👋</Text>
        </div>
        <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '12px 16px', borderRadius: 16, borderTopLeftRadius: 4, maxWidth: '80%' }}>
          <Text typography="t6">첫 번째로, <b>어떤 사업장</b>에서 일하게 되나요?</Text>
        </div>
      </div>
      <div style={{ padding: '16px 24px 24px', background: '#fff', borderTop: '1px solid #e5e8eb' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <TextField placeholder="답변 입력..." style={{ flex: 1 }} />
          <Button size="medium">전송</Button>
        </div>
      </div>
    </div>
  );
}` },
  { id: 'E', name: 'Horizontal Carousel', code: `
import { Top, Text, Button, Spacing, TextField } from '@toss/tds-mobile';
export default function FormVariantE() {
  return (
    <div style={{ background: '#191f28', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Top title="계약서 작성" style={{ background: '#191f28', color: '#fff' }} />
      <div style={{ padding: '24px', flex: 1, display: 'flex', alignItems: 'center' }}>
        {/* Card */}
        <div style={{ background: '#fff', width: '100%', borderRadius: 24, padding: '32px 24px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <Text typography="t6" color="grey-500" fontWeight="bold">Step 1 of 7</Text>
            <Text typography="t6" color="blue" fontWeight="bold">건너뛰기</Text>
          </div>
          <Text typography="t3" fontWeight="bold">어디서 일하나요?</Text>
          <Spacing size={8} />
          <Text typography="t6" color="grey-600">근무 장소를 입력해주세요.</Text>
          <Spacing size={32} />
          <TextField placeholder="사업장명" />
          <Spacing size={32} />
          <Button size="large" display="block">다음 단계로</Button>
        </div>
      </div>
    </div>
  );
}` }
];

variants.forEach(v => {
  fs.writeFileSync(path.join(__dirname, 'src/pages/dev', `FormVariant${v.id}.tsx`), v.code);
});

console.log('Generated FormVariants');
