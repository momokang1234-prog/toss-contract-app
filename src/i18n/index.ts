import { getLocale } from '@apps-in-toss/web-framework';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko.json';
import en from './locales/en.json';
import zh from './locales/zh.json';
import vi from './locales/vi.json';
import th from './locales/th.json';
import km from './locales/km.json';
import ne from './locales/ne.json';
import uz from './locales/uz.json';
import id from './locales/id.json';
import mn from './locales/mn.json';

export const SUPPORTED_LANGS = ['ko', 'en', 'zh', 'vi', 'th', 'km', 'ne', 'uz', 'id', 'mn'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const LANG_META: Record<SupportedLang, { name: string; nativeName: string; flag: string; bcp47: string }> = {
  ko: { name: '한국어', nativeName: '한국어', flag: '🇰🇷', bcp47: 'ko-KR' },
  en: { name: '영어', nativeName: 'English', flag: '🇺🇸', bcp47: 'en-US' },
  zh: { name: '중국어', nativeName: '中文', flag: '🇨🇳', bcp47: 'zh-CN' },
  vi: { name: '베트남어', nativeName: 'Tiếng Việt', flag: '🇻🇳', bcp47: 'vi-VN' },
  th: { name: '태국어', nativeName: 'ภาษาไทย', flag: '🇹🇭', bcp47: 'th-TH' },
  km: { name: '크메르어', nativeName: 'ខ្មែរ', flag: '🇰🇭', bcp47: 'km-KH' },
  ne: { name: '네팔어', nativeName: 'नेपाली', flag: '🇳🇵', bcp47: 'ne-NP' },
  uz: { name: '우즈베크어', nativeName: 'Oʻzbekcha', flag: '🇺🇿', bcp47: 'uz-UZ' },
  id: { name: '인도네시아어', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', bcp47: 'id-ID' },
  mn: { name: '몽골어', nativeName: 'Монгол', flag: '🇲🇳', bcp47: 'mn-MN' },
};

const STORAGE_KEY = 'app_language';

/** BCP 47 로케일(예: ko-KR, vi-VN)을 지원 언어 코드(예: ko, vi)로 매핑 */
export function localeToLang(locale: string): SupportedLang {
  const lang = locale.split('-')[0].toLowerCase();
  return (SUPPORTED_LANGS as readonly string[]).includes(lang) ? (lang as SupportedLang) : 'ko';
}

/** 초기 언어 결정: localStorage > dev override(?lang=) > getLocale() > ko */
function resolveInitialLang(): SupportedLang {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (SUPPORTED_LANGS as readonly string[]).includes(stored)) {
      return stored as SupportedLang;
    }
    // dev 환경에서만 URL 쿼리로 언어 오버라이드 허용 (저장된 값이 없을 때만)
    const params = new URLSearchParams(window.location.search);
    const q = params.get('lang');
    if (import.meta.env.DEV && q && (SUPPORTED_LANGS as readonly string[]).includes(q)) {
      return q as SupportedLang;
    }
  }
  try {
    return localeToLang(getLocale());
  } catch {
    return 'ko';
  }
}

i18n.use(initReactI18next).init({
  lng: resolveInitialLang(),
  fallbackLng: 'ko',
  supportedLngs: [...SUPPORTED_LANGS],
  compatibilityJSON: 'v4',
  interpolation: { escapeValue: false },
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    zh: { translation: zh },
    vi: { translation: vi },
    th: { translation: th },
    km: { translation: km },
    ne: { translation: ne },
    uz: { translation: uz },
    id: { translation: id },
    mn: { translation: mn },
  },
});

export function setLanguage(lang: SupportedLang) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }
  void i18n.changeLanguage(lang);
}

export default i18n;
