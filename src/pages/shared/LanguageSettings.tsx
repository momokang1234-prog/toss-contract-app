import { Top, Spacing } from '@toss/tds-mobile';
import { useTranslation } from 'react-i18next';
import { LanguagePicker } from '../../components/shared/LanguagePicker';

export function LanguageSettings() {
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: '#fff' }}>
      <Top title={t('language.settingsLabel')} />
      <div style={{ padding: '0 24px' }}>
        <Spacing size={16} />
        <LanguagePicker />
      </div>
    </div>
  );
}
