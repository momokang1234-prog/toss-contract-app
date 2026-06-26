import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguage, SUPPORTED_LANGS, type SupportedLang, LANG_META } from './index';

/** 현재 언어 조회/변경 + 메타 정보를 제공하는 훅 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const current = (i18n.language?.split('-')[0] ?? 'ko') as SupportedLang;

  const change = useCallback((lang: SupportedLang) => {
    setLanguage(lang);
  }, []);

  return {
    current,
    change,
    supported: SUPPORTED_LANGS.map((lang) => ({ lang, ...LANG_META[lang] })),
  };
}
