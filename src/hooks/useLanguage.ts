import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export type Language = 'en' | 'vi';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: LanguageInfo[] = [
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
];

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language as Language;

  const changeLanguage = useCallback(
    (lng: Language) => {
      i18n.changeLanguage(lng);
    },
    [i18n]
  );

  const getCurrentLanguageInfo = useCallback((): LanguageInfo => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0];
  }, [currentLanguage]);

  const getLanguageInfo = useCallback((code: Language): LanguageInfo => {
    return languages.find(lang => lang.code === code) || languages[0];
  }, []);

  return {
    currentLanguage,
    changeLanguage,
    getCurrentLanguageInfo,
    getLanguageInfo,
    languages,
    t,
  };
};

export default useLanguage;
