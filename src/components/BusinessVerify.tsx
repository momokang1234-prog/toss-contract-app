import { useState, type FormEvent } from "react";
import { TextField, Button, Paragraph, Spacing, List, ListRow } from "@toss/tds-mobile";

interface BusinessVerifyProps {
  onComplete: (businessInfo: BusinessInfo) => void;
}

interface BusinessInfo {
  businessNumber: string;
  businessName: string;
  representative: string;
  address: string;
  verified: boolean;
}

export function BusinessVerify({ onComplete }: BusinessVerifyProps) {
  const [businessNumber, setBusinessNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BusinessInfo | null>(null);

  const formatNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 10);
    if (digits.length > 5) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    if (digits.length > 3) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return digits;
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    const digits = businessNumber.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("사업자등록번호 10자리를 입력하세요");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await new Promise((r) => setTimeout(r, 1500));

      const mockResult: BusinessInfo = {
        businessNumber: businessNumber,
        businessName: "(주)토스테스트",
        representative: "김토스",
        address: "서울특별시 강남구 테헤란로 123",
        verified: true,
      };

      setResult(mockResult);
    } catch {
      setError("사업자 확인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div>
        <Paragraph typography="st1" fontWeight="bold">사업자 확인 완료</Paragraph>
        <Spacing size={4} />
        <Paragraph typography="st4" color="grey600">사업자 정보가 확인되었습니다</Paragraph>
        <Spacing size={24} />

        <div
          style={{
            backgroundColor: "#F5F6F8",
            borderRadius: 12,
            padding: "20px 16px",
            marginBottom: 24,
          }}
        >
          <List>
            <ListRow>
              <ListRow.Texts
                top={{ label: "사업자등록번호", typo: { color: "#6B7684" } }}
                bottom={{ label: result.businessNumber, typo: { fontWeight: "bold" } }}
              />
            </ListRow>
            <ListRow>
              <ListRow.Texts
                top={{ label: "상호(법인명)", typo: { color: "#6B7684" } }}
                bottom={{ label: result.businessName, typo: { fontWeight: "bold" } }}
              />
            </ListRow>
            <ListRow>
              <ListRow.Texts
                top={{ label: "대표자", typo: { color: "#6B7684" } }}
                bottom={{ label: result.representative, typo: { fontWeight: "bold" } }}
              />
            </ListRow>
            <ListRow>
              <ListRow.Texts
                top={{ label: "사업장 소재지", typo: { color: "#6B7684" } }}
                bottom={{ label: result.address, typo: { fontWeight: "bold" } }}
              />
            </ListRow>
          </List>

          <Spacing size={12} />
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "#E8F5E9",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <Paragraph typography="st6" color="teal700">✓ 사업자 확인 완료</Paragraph>
          </div>
        </div>

        <Button
          color="primary"
          variant="fill"
          display="block"
          size="large"
          onClick={() => onComplete(result)}
        >
          다음 단계로
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify}>
      <Paragraph typography="st1" fontWeight="bold">사업자 확인</Paragraph>
      <Spacing size={4} />
      <Paragraph typography="st4" color="grey600">사업자등록번호를 입력하여 사업자를 확인합니다</Paragraph>
      <Spacing size={24} />

      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: 16,
            backgroundColor: "#FFF3F0",
            borderRadius: 10,
          }}
        >
          <Paragraph typography="st5" color="danger500">{error}</Paragraph>
        </div>
      )}

      <TextField
        variant="box"
        label="사업자등록번호"
        value={businessNumber}
        onChange={(e) => {
          setBusinessNumber(formatNumber(e.target.value));
          if (error) setError(null);
        }}
        placeholder="000-00-00000"
        inputMode="numeric"
      />
      <Spacing size={16} />

      <Button
        color="primary"
        variant="fill"
        display="block"
        size="large"
        type="submit"
        disabled={loading}
      >
        {loading ? "확인 중..." : "사업자 확인"}
      </Button>
    </form>
  );
}
