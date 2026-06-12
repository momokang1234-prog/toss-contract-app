import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { IS_MOCK } from "../../api/supabase";
import { Paragraph, Spacing, Button, ListRow, List } from "@toss/tds-mobile";
import styles from "./LoginPage.module.css";

const benefits = [
  { icon: "📝", text: "근로기준법에 맞춘 계약서 자동 완성" },
  { icon: "📤", text: "근로자에게 링크 하나로 즉시 전송" },
  { icon: "✍️", text: "전자서명으로 계약까지 5분 완료" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, userRole, isLoading } = useAuth();

  // 이미 인증된 상태면 바로 대시보드로
  useEffect(() => {
    if (isAuthenticated && userRole) {
      navigate(userRole === 'employer' ? '/employer/dashboard' : '/worker/contracts', { replace: true });
    }
  }, [isAuthenticated, userRole]);

  // 디자인 프리뷰: 자동 리디렉트 비활성화
  const handleLogin = async (role?: 'employer' | 'worker') => {
    if (role) {
      await login(role);
      navigate(role === 'employer' ? '/employer/dashboard' : '/worker/contracts', { replace: true });
    } else {
      await login();
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero area */}
      <div className={styles.hero}>
        <Paragraph typography="st3">📄</Paragraph>
        <Spacing size={24} />
        <Paragraph typography="st2" fontWeight="bold">
          근로계약서,
        </Paragraph>
        <Spacing size={4} />
        <Paragraph typography="st2" fontWeight="bold">
          5분이면 충분해요
        </Paragraph>
        <Spacing size={8} />
        <Paragraph typography="st4" color="grey-600">
          종이 계약서 대신 토스에서 간편하게
        </Paragraph>
        <Spacing size={32} />
        <List>
          {benefits.map((b, i) => (
            <ListRow
              key={i}
              contents={
                <Paragraph typography="st5">{`${b.icon}  ${b.text}`}</Paragraph>
              }
            />
          ))}
        </List>
      </div>
      <div className={styles.bottomCta}>
        <Paragraph typography="st5" color="grey-600" textAlign="center">
          로그인하면 근로기준법 기반 계약서를<br />바로 작성할 수 있어요
        </Paragraph>
        <Spacing size={12} />
        {IS_MOCK ? (
          <div className={styles.buttonGroup}>
            <Button
              color="primary"
              variant="fill"
              display="block"
              size="xlarge"
              onClick={() => handleLogin("employer")}
              disabled={isLoading}
            >
              사장님으로 시작하기
            </Button>
            <Button
              color="light"
              variant="fill"
              display="block"
              size="xlarge"
              onClick={() => handleLogin("worker")}
              disabled={isLoading}
            >
              근로자로 시작하기
            </Button>
          </div>
        ) : (
          <Button
            color="primary"
            variant="fill"
            display="block"
            size="xlarge"
            onClick={() => handleLogin()}
            disabled={isLoading}
          >
            토스로 시작하기
          </Button>
        )}
      </div>
    </div>
  );
}
