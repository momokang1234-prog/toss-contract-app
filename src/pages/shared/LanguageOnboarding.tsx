import { useNavigate } from 'react-router-dom';
import { Top, Paragraph, Spacing, Button } from '@toss/tds-mobile';
import { useTranslation } from 'react-i18next';
import { LanguagePicker } from '../../components/shared/LanguagePicker';

const ONBOARDED_KEY = 'lang_onboarded';

export function LanguageOnboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSelect = () => {
    try {
      window.localStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const handleDone = () => {
    handleSelect();
    navigate('/');
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Top title={t('language.settingsLabel')} />
      <div style={{ padding: '0 24px', flex: 1 }}>
        <Spacing size={16} />
        <Paragraph typography="t2" fontWeight="bold">{t('language.onboardingTitle')}</Paragraph>
        <Spacing size={8} />
        <Paragraph typography="t5" color="grey-500">{t('language.onboardingSub')}</Paragraph>
        <Spacing size={32} />
        <LanguagePicker onSelect={handleSelect} />
      </div>
      <div style={{ padding: '0 24px 32px' }}>
        <Button color="primary" variant="fill" display="block" size="xlarge" onClick={handleDone}>
          {t('common.confirm')}
        </Button>
      </div>
    </div>
  );
}

/** 온보딩 완료 여부 조회 (App 초기화 시 사용) */
export function isLanguageOnboarded(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return false;
  }
}
