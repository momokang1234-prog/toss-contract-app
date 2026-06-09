import { useState, useCallback } from "react";
import { Button, Paragraph, Spacing } from "@toss/tds-mobile";

interface AuthScreenProps {
  onAuthComplete: (ci: string, userName: string) => void;
}

const DEV_MODE = !import.meta.env.VITE_TOSS_CLIENT_ID;

/**
 * 토스 인증 화면
 * - 원터치 인증: 토스 앱 바로 호출 → 이탈 최소화
 * - DEV_MODE: 자격증명 없이 mock 응답으로 플로우 테스트
 */
export function AuthScreen({ onAuthComplete }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleOneTouchAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (DEV_MODE) {
      setStatus("개발 모드: 인증 시뮬레이션 중...");
      await new Promise((r) => setTimeout(r, 1500));
      setStatus("인증 완료! (mock)");
      await new Promise((r) => setTimeout(r, 500));
      onAuthComplete("mock-ci-123456789", "김토스");
      setLoading(false);
      return;
    }

    setStatus("인증 요청 중...");
    try {
      const tokenRes = await fetch("/api/auth/token", { method: "POST" });
      if (!tokenRes.ok) throw new Error("토큰 발급 실패");
      const { access_token } = await tokenRes.json();

      const sessionKey = crypto.randomUUID();

      const authRes = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: access_token, sessionKey }),
      });
      const authData = await authRes.json();

      if (authData.resultType !== "SUCCESS") {
        throw new Error(authData.error?.reason || "인증 요청 실패");
      }

      const txId = authData.success.txId;
      setStatus("토스 앱에서 인증을 확인해주세요...");

      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const statusRes = await fetch(
          `/api/auth/status/${txId}?accessToken=${access_token}&sessionKey=${sessionKey}`
        );
        const statusData = await statusRes.json();

        if (statusData.success?.status === "COMPLETED") {
          const resultRes = await fetch(
            `/api/auth/result/${txId}?accessToken=${access_token}&sessionKey=${sessionKey}`
          );
          const resultData = await resultRes.json();
          if (resultData.resultType === "SUCCESS") {
            onAuthComplete(resultData.success.ci, resultData.success.userName);
            return;
          }
        }
        if (statusData.success?.status === "EXPIRED") {
          throw new Error("인증 시간이 만료되었습니다.");
        }
        setStatus(`인증 대기 중... (${i + 1}/60)`);
      }
      throw new Error("인증 시간 초과");
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [onAuthComplete]);

  return (
    <div style={{ textAlign: "center", paddingTop: 80 }}>
      <Paragraph typography="st1" fontWeight="bold">근로계약</Paragraph>
      <Spacing size={8} />
      <Paragraph typography="st4" color="grey600">토스 인증으로 간편하게 본인 확인 후 계약을 진행합니다</Paragraph>
      <Spacing size={40} />

      {DEV_MODE && (
        <div
          style={{
            padding: "10px 14px",
            marginBottom: 16,
            backgroundColor: "#FFF8E1",
            borderRadius: 10,
          }}
        >
          <Paragraph typography="st6" color="yellow700">개발 모드 — mock 인증으로 테스트 중</Paragraph>
        </div>
      )}

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

      {status && !error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: 16,
            backgroundColor: "#F0F5FF",
            borderRadius: 10,
          }}
        >
          <Paragraph typography="st5" color="primary500">{status}</Paragraph>
        </div>
      )}

      <Button
        color="primary"
        variant="fill"
        display="block"
        size="large"
        onClick={handleOneTouchAuth}
        disabled={loading}
      >
        {loading ? "인증 중..." : "토스로 본인 인증하기"}
      </Button>
    </div>
  );
}
