import i18n from '@/i18n/i18n';

/**
 * Get translated text for driver.js tours
 * This helper function provides i18n support for driver.js steps
 */
export const t = (key: string, fallback?: string): string => {
  return i18n.t(key, fallback || key);
};
