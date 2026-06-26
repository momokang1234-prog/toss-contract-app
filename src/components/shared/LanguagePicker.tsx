import { Spacing, Button } from '@toss/tds-mobile';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../i18n/useLanguage';
import styles from './LanguagePicker.module.css';

interface LanguagePickerProps {
  /** 언어 선택 후 호출. 미지정 시 온보딩 완료 처리 + 페이지 이동 없음 */
  onSelect?: (lang: string) => void;
}

/** 10개국 언어 선택 UI. 온보딩과 설정에서 공용 사용 */
export function LanguagePicker({ onSelect }: LanguagePickerProps) {
  const { t } = useTranslation();
  const { current, change, supported } = useLanguage();

  const handleSelect = (lang: string) => {
    change(lang as never);
    onSelect?.(lang);
  };

  return (
    <div className={styles.container}>
      {supported.map((lang) => (
        <button
          key={lang.lang}
          className={`${styles.option} ${lang.lang === current ? styles.selected : ''}`}
          onClick={() => handleSelect(lang.lang)}
        >
          <span className={styles.flag}>{lang.flag}</span>
          <span className={styles.text}>
            <span className={styles.nativeName}>{lang.nativeName}</span>
            <span className={styles.name}>{lang.name}</span>
          </span>
          {lang.lang === current && <span className={styles.check}>✓</span>}
        </button>
      ))}
      <Spacing size={24} />
    </div>
  );
}
