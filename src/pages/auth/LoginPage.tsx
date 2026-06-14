import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { IS_MOCK } from "../../api/supabase";
import { Paragraph, Spacing, Button, ListRow, List } from "@toss/tds-mobile";
import { HeroMarquee } from "../../components/shared/HeroMarquee";
import styles from "./LoginPage.module.css";

const benefits = [
  { icon: "📝", text: "근로기준법에 맞춘 계약서 자동 완성" },
  { icon: "📤", text: "근로자에게 링크 하나로 즉시 전송" },
  { icon: "✍️", text: "전자서명으로 계약까지 5분 완료" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, userRole, isLoading } = useAuth();

  const location = new URLSearchParams(window.location.search);
  const redirectUrl = location.get('redirect');

  // 이미 인증된 상태면 바로 이동
  useEffect(() => {
    if (isAuthenticated && userRole) {
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
      } else {
        navigate(userRole === 'employer' ? '/employer/dashboard' : '/worker/contracts', { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate, redirectUrl]);

  // 로그인 핸들러
  const handleLogin = async (role?: 'employer' | 'worker') => {
    try {
      if (role) {
        await login(role);
        if (redirectUrl) {
          navigate(redirectUrl, { replace: true });
        } else {
          navigate(role === 'employer' ? '/employer/dashboard' : '/worker/contracts', { replace: true });
        }
      } else {
        await login();
      }
    } catch (error: any) {
      alert(`로그인 실패: ${error.message || error}`);
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero area */}
      <div className={styles.hero}>
        <div className={styles.marqueeContainer}>
          <HeroMarquee />
        </div>
        <Spacing size={32} />
        <Paragraph typography="t3" fontWeight="bold">
          근로계약서,
        </Paragraph>
        <Spacing size={4} />
        <Paragraph typography="t3" fontWeight="bold">
          5분이면 충분해요
        </Paragraph>
        <Spacing size={12} />
        <Paragraph typography="t5" color="grey-600">
          종이 계약서 대신 토스에서 간편하게
        </Paragraph>
        <Spacing size={48} />
        <List>
          {benefits.map((b, i) => (
            <ListRow
              key={i}
              contents={
                <Paragraph typography="t6" color="grey-800" fontWeight="bold">{`${b.icon}  ${b.text}`}</Paragraph>
              }
            />
          ))}
        </List>
      </div>
      <div className={styles.bottomCta}>
        <Paragraph typography="t6" color="grey-600" textAlign="center">
          로그인하면 근로기준법 기반 계약서를<br />바로 작성할 수 있어요
        </Paragraph>
        <Spacing size={16} />
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
              사장님으로 시작하기 (Mock)
            </Button>
            <Button
              color="light"
              variant="fill"
              display="block"
              size="xlarge"
              onClick={() => handleLogin("worker")}
              disabled={isLoading}
            >
              근로자로 시작하기 (Mock)
            </Button>
          </div>
        ) : (
          <div className={styles.buttonGroup}>
            <Button
              color="primary"
              variant="fill"
              display="block"
              size="xlarge"
              onClick={() => handleLogin("employer")}
              disabled={isLoading}
            >
              사장님으로 토스 로그인
            </Button>
            <Button
              color="light"
              variant="fill"
              display="block"
              size="xlarge"
              onClick={() => handleLogin("worker")}
              disabled={isLoading}
            >
              근로자로 토스 로그인
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
