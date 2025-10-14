import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import viTranslation from './translations/vi.json';
import enTranslation from './translations/en.json';

const resources = {
  vi: {
    translation: viTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    debug: false, // Disable debug mode to suppress console logs
    saveMissing: false, // Don't save missing keys
    missingKeyHandler: false, // Disable missing key handler
    missingKeyNoValueFallbackToKey: false, // Don't fallback to key for missing values

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
