import { Button, Paragraph, Spacing, Top, Badge } from "@toss/tds-mobile";

const RESULT_TOP_SPACING = 60;

export function ContractResult() {
  const steps = [
    { label: "본인 인증", done: true },
    { label: "계약서 작성", done: true },
    { label: "사업자 확인", done: false },
    { label: "전자서명", done: false },
  ];

  return (
    <div>
      <Top spacing={RESULT_TOP_SPACING} />
      <div style={{ textAlign: 'center', paddingTop: 20 }}>
        <img src="https://static.toss.im/2d-emojis/png/4x/u2705.png" alt=""
          style={{ width: 100, height: 100 }}
        />
      </div>
      <Spacing size={20} />
      <Paragraph typography="st1" fontWeight="bold">
        계약서 제출 완료
      </Paragraph>
      <Spacing size={8} />
      <Paragraph typography="st4" color="grey-600">
        근로계약서가 성공적으로 제출되었습니다.
        <br />
        확인 후 서명 요청이 발송됩니다.
      </Paragraph>
      <Spacing size={24} />

      <div>
        <Paragraph typography="st4" fontWeight="bold">
          진행 상태
        </Paragraph>
        <Spacing size={12} />
        {steps.map((step, i) => (
          <div key={i}>
            <Badge
              color={step.done ? "blue" : "elephant"}
              size="xsmall"
              variant={step.done ? "fill" : "weak"}
            />
            <Paragraph
              typography="st7"
              color={step.done ? "primary" : "grey-500"}
            >
              {step.label}
            </Paragraph>
            <Spacing size={8} />
          </div>
        ))}
      </div>
      <Spacing size={24} />

      <Button
        color="primary"
        variant="weak"
        display="block"
        size="large"
        onClick={() => window.location.reload()}
      >
        홈으로 돌아가기
      </Button>
    </div>
  );
}
