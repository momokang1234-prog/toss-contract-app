import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { IS_MOCK } from "../../api/supabase";
import { Paragraph, Spacing, Button, List, ListRow, BottomSheet } from "@toss/tds-mobile";
import { CommentBoundary } from "../dev/CommentBoundary";
import styles from "./LoginPage.module.css";

// C안 (list-detail): 헤드라인 + 3대 기능 리스트로 서비스 설명 → 단일 '시작하기' → 역할 BottomSheet
const FEATURES = [
  { icon: "📝", title: "자동 완성", desc: "근로기준법 필수 기재사항을 채워줘요" },
  { icon: "📤", title: "링크 전송", desc: "근로자에게 메시지 하나로 바로 전달" },
  { icon: "✍️", title: "전자서명", desc: "폰에서 서명하면 5분 만에 계약 완료" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setRole, isAuthenticated, userRole, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  const location = new URLSearchParams(window.location.search);
  const redirectUrl = location.get('redirect');
  const preview = location.get('preview');

  // 이미 인증된 상태면 바로 이동
  useEffect(() => {
    if (preview === 'true') return;
    if (isAuthenticated && userRole) {
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
      } else {
        navigate(userRole === 'employer' ? '/employer/dashboard' : '/worker/contracts', { replace: true });
      }
    }
  }, [isAuthenticated, userRole, navigate, redirectUrl, preview]);

  const handleStart = async () => {
    try {
      const res = await login();
      if (res.isNewUser) {
        setOpen(true);
      }
    } catch (error: any) {
      alert(`인증 실패: ${error.message || error}`);
    }
  };

  const handleRoleSelect = async (role: 'employer' | 'worker') => {
    setOpen(false);
    try {
      await setRole(role);
    } catch (error: any) {
      alert(`역할 설정 실패: ${error.message || error}`);
    }
  };

  return (
    <div className={styles.page}>
      <CommentBoundary name="로그인-헤드">
        <div style={{ paddingTop: 60 }}>
          <Paragraph typography="t2" fontWeight="bold">근로계약서 작성을<br />더 쉽게</Paragraph>
          <Spacing size={8} />
          <Paragraph typography="t5" color="grey-500">3단계로 끝내는 간편 계약서</Paragraph>
        </div>
      </CommentBoundary>

      <CommentBoundary name="로그인-기능리스트">
        <div style={{ marginTop: 32 }}>
          <List>
            {FEATURES.map((f, i) => (
              <ListRow
                key={i}
                left={<span style={{ fontSize: 28 }}>{f.icon}</span>}
                contents={<ListRow.Texts type="2RowTypeA" top={f.title} bottom={f.desc} />}
              />
            ))}
          </List>
        </div>
      </CommentBoundary>

      <CommentBoundary name="로그인-CTA">
        <div className={styles.bottomCta}>
          <Button
            color="primary"
            variant="fill"
            display="block"
            size="xlarge"
            onClick={handleStart}
            disabled={isLoading}
          >
            {IS_MOCK ? "시작하기 (Mock)" : "시작하기"}
          </Button>
        </div>
      </CommentBoundary>

      <CommentBoundary name="로그인-역할선택">
        <BottomSheet open={open} onClose={() => setOpen(false)} header={<BottomSheet.Header>어떤 역할로 시작할까요?</BottomSheet.Header>}>
          <ListRow contents={<ListRow.Texts type="1RowTypeA" top="사장님으로 시작하기" />} onClick={() => handleRoleSelect("employer")} />
          <ListRow contents={<ListRow.Texts type="1RowTypeA" top="근로자로 시작하기" />} onClick={() => handleRoleSelect("worker")} />
        </BottomSheet>
      </CommentBoundary>
    </div>
  );
}
