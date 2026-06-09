import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { IS_MOCK } from "../../api/supabase";
import { Paragraph, Spacing, Button, ListRow, List } from "@toss/tds-mobile";

const benefits = [
  { icon: "📝", text: "근로기준법에 맞춘 계약서 자동 완성" },
  { icon: "📤", text: "근로자에게 링크 하나로 즉시 전송" },
  { icon: "✍️", text: "전자서명으로 계약까지 5분 완료" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, userRole, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (userRole === "employer")
        navigate("/employer/dashboard", { replace: true });
      else if (userRole === "worker")
        navigate("/worker/contracts", { replace: true });
      else navigate("/role-select", { replace: true });
    }
  }, [isAuthenticated, isLoading, userRole, navigate]);

  const handleLogin = async (role?: "employer" | "worker") => {
    try {
      await login(role);
    } catch (err) {
      console.error("로그인 실패:", err);
      alert("로그인에 실패했습니다.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
        }}
      >
        {/* 일러스트 영역 */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 32,
            background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            marginBottom: 24,
          }}
        >
          📄
        </div>

        {/* 헤드라인 */}
        <Paragraph typography="st2" fontWeight="bold" style={{ textAlign: "center" }}>
          근로계약서,
        </Paragraph>
        <Paragraph typography="st2" fontWeight="bold" style={{ textAlign: "center" }}>
          5분이면 충분해요
        </Paragraph>
        <Spacing size={8} />
        <Paragraph typography="st5" color="grey500" style={{ textAlign: "center" }}>
          종이 계약서 대신 토스에서 간편하게
        </Paragraph>

        <Spacing size={32} />

        {/* 혜택 리스트 */}
        <List>
          {benefits.map((b, i) => (
            <ListRow key={i}>
              <ListRow.Texts
                top={{
                  label: `${b.icon}  ${b.text}`,
                  typo: { fontSize: 15 },
                }}
              />
            </ListRow>
          ))}
        </List>
      </div>

      {/* 하단 CTA */}
      <div style={{ padding: "0 24px 32px" }}>
        {IS_MOCK ? (
          <>
            <Button
              color="primary"
              variant="fill"
              display="block"
              size="xlarge"
              loading={isLoading}
              onClick={() => handleLogin("employer")}
            >
              사장님으로 시작하기
            </Button>
            <Spacing size={12} />
            <Button
              color="light"
              variant="fill"
              display="block"
              size="xlarge"
              loading={isLoading}
              onClick={() => handleLogin("worker")}
            >
              근로자로 시작하기
            </Button>
          </>
        ) : (
          <Button
            color="primary"
            variant="fill"
            display="block"
            size="xlarge"
            loading={isLoading}
            onClick={() => handleLogin()}
          >
            토스로 시작하기
          </Button>
        )}
        <Spacing size={16} />
        <Paragraph typography="st7" color="grey400" style={{ textAlign: "center" }}>
          로그인하면 근로기준법 기반 계약서를 바로 작성할 수 있어요
        </Paragraph>
      </div>
    </div>
  );
}
