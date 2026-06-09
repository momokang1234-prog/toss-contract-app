import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spacing, ListRow, List, Paragraph } from '@toss/tds-mobile';

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleSelect = async (role: 'employer' | 'worker') => {
    await setRole(role);
    if (role === 'employer') navigate('/employer/dashboard', { replace: true });
    else navigate('/worker/contracts', { replace: true });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24 }}>
      <Paragraph typography="st3" fontWeight="bold">시작 방법 선택</Paragraph>
      <Spacing size={8} />
      <p style={{ color: '#6B7684', marginBottom: 32, textAlign: 'center' }}>어떻게 사용하시나요?</p>

      <div style={{ width: '100%', maxWidth: 320 }}>
        <List>
          <ListRow onClick={() => handleSelect('employer')}>
            <ListRow.Texts
              top={{
                label: '사장님',
                typo: { fontWeight: 'bold' },
              }}
              bottom={{
                label: '근로계약서를 작성하고 관리해요',
                typo: { color: '#6B7684' },
              }}
            />
          </ListRow>
          <ListRow onClick={() => handleSelect('worker')}>
            <ListRow.Texts
              top={{
                label: '근로자',
                typo: { fontWeight: 'bold' },
              }}
              bottom={{
                label: '받은 계약서를 확인하고 서명해요',
                typo: { color: '#6B7684' },
              }}
            />
          </ListRow>
        </List>
      </div>
    </div>
  );
}
