import { Button, Paragraph, Spacing } from "@toss/tds-mobile";

export function ContractResult() {
  return (
    <div style={{ textAlign: "center", paddingTop: 60 }}>
      <div
        style={{
          width: 64,
          height: 64,
          margin: "0 auto 20px",
          backgroundColor: "#E8F5E9",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
        }}
      >
        ✓
      </div>
      <Paragraph typography="st1" fontWeight="bold">계약서 제출 완료</Paragraph>
      <Spacing size={8} />
      <Paragraph typography="st4" color="grey600">
        근로계약서가 성공적으로 제출되었습니다.<br />확인 후 서명 요청이 발송됩니다.
      </Paragraph>
      <Spacing size={24} />

      <div
        style={{
          backgroundColor: "#F5F6F8",
          borderRadius: 12,
          padding: "20px 16px",
          textAlign: "left",
          marginBottom: 24,
        }}
      >
        <Paragraph typography="st4" fontWeight="bold">진행 상태</Paragraph>
        <Spacing size={12} />
        {[
          { label: "본인 인증", done: true },
          { label: "계약서 작성", done: true },
          { label: "사업자 확인", done: false },
          { label: "전자서명", done: false },
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{
              width: 20, height: 20, borderRadius: "50%",
              backgroundColor: step.done ? "#3182F6" : "#E5E8EB",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, flexShrink: 0,
            }}>
              {step.done ? "✓" : i + 1}
            </span>
            <Paragraph typography="st5" color={step.done ? "primary500" : "grey500"}>{step.label}</Paragraph>
          </div>
        ))}
      </div>

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
