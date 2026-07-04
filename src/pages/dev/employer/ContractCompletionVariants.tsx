import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, ListRow, Button, BottomSheet, Spacing, Paragraph } from '@toss/tds-mobile';

// Base mock component to simulate the Contract Detail Page
function MockContractDetail({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: '0 24px' }}>
      <Spacing size={24} />
      {children}
      <Spacing size={24} />
      <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 16 }}>
        <Paragraph typography="t5" fontWeight="bold">근로계약서</Paragraph>
        <Spacing size={12} />
        <Paragraph typography="t7" color="grey-500">김토스 • 시급 10,000원</Paragraph>
      </div>
    </div>
  );
}

// Variant A: Bottom Sheet
export function ContractCompletionVariantA() {
  const [open, setOpen] = useState(true);
  return (
    <MockContractDetail>
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div style={{ padding: '24px' }}>
          <Paragraph typography="t4" fontWeight="bold">🎉 계약서가 완성되었어요</Paragraph>
          <Spacing size={8} />
          <Paragraph typography="t6" color="grey-500">이제 근로자에게 계약서를 공유해주세요.</Paragraph>
          <Spacing size={24} />
          <Button size="xlarge" display="block" color="primary" variant="fill" onClick={() => setOpen(false)}>바로 공유하기</Button>
        </div>
      </BottomSheet>
      {!open && (
        <Button size="xlarge" display="block" color="primary" variant="fill" onClick={() => setOpen(true)}>공유하기 바텀시트 다시 열기</Button>
      )}
    </MockContractDetail>
  );
}

// Variant B: Full Page
export function ContractCompletionVariantB() {
  const navigate = useNavigate();
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: 64 }}>✅</div>
        <Spacing size={24} />
        <Paragraph typography="t3" fontWeight="bold">계약서 작성이 끝났어요</Paragraph>
        <Spacing size={12} />
        <Paragraph typography="t6" color="grey-500">
          이제 마지막 단계입니다.<br/>
          근로자에게 공유하고 서명을 요청하세요.
        </Paragraph>
      </div>
      <div style={{ paddingBottom: '32px' }}>
        <Button size="xlarge" display="block" color="primary" variant="fill">카카오톡으로 공유하기</Button>
        <Spacing size={12} />
        <Button size="xlarge" display="block" color="primary" variant="fill">나중에 하기</Button>
      </div>
    </div>
  );
}

// Variant C: List Detail (Top Banner)
export function ContractCompletionVariantC() {
  return (
    <MockContractDetail>
      <List>
        <ListRow
          contents={
            <div>
              <Paragraph typography="t5" fontWeight="bold">🎉 계약서가 완성되었어요</Paragraph>
              <Paragraph typography="t7" color="grey-500">아래 버튼으로 근로자에게 바로 공유해보세요</Paragraph>
            </div>
          }
          right={<Button size="xlarge" display="block" color="primary" variant="fill">공유하기</Button>}
        />
      </List>
    </MockContractDetail>
  );
}

// Variant D: Modal
export function ContractCompletionVariantD() {
  const [open, setOpen] = useState(true);
  return (
    <MockContractDetail>
      {open && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: 24, borderRadius: 16, width: '80%' }}>
            <Paragraph typography="t4" fontWeight="bold">계약서 완성</Paragraph>
            <Spacing size={8} />
            <Paragraph typography="t6" color="grey-500">계약서 작성이 모두 끝났습니다. 지금 바로 근로자에게 공유하시겠어요?</Paragraph>
            <Spacing size={24} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="xlarge" display="block" color="primary" variant="fill" onClick={() => setOpen(false)}>닫기</Button>
              <Button size="xlarge" display="block" color="primary" variant="fill" onClick={() => setOpen(false)}>공유하기</Button>
            </div>
          </div>
        </div>
      )}
      {!open && (
        <Button size="xlarge" display="block" color="primary" variant="fill" onClick={() => setOpen(true)}>모달 다시 열기</Button>
      )}
    </MockContractDetail>
  );
}

// Variant E: Funnel (Simulated)
export function ContractCompletionVariantE() {
  const [step, setStep] = useState(1);
  return (
    <div style={{ padding: '24px' }}>
      <Paragraph typography="t5" color="grey-500">Step 3/3</Paragraph>
      <Spacing size={24} />
      <Paragraph typography="t3" fontWeight="bold">
        {step === 1 ? '모든 항목 작성을 마쳤습니다' : '공유할 수단 선택'}
      </Paragraph>
      <Spacing size={40} />
      
      {step === 1 && (
        <Button size="xlarge" display="block" color="primary" variant="fill" onClick={() => setStep(2)}>다음으로 (공유하기)</Button>
      )}
      
      {step === 2 && (
        <List>
          <ListRow contents={<Paragraph typography="t5">카카오톡</Paragraph>} right={<span>&gt;</span>} />
          <ListRow contents={<Paragraph typography="t5">문자메시지</Paragraph>} right={<span>&gt;</span>} />
        </List>
      )}
    </div>
  );
}
