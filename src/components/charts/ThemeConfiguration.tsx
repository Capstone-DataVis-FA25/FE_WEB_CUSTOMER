import React from 'react';
import { Label } from '../ui/label';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';

const ThemeConfiguration: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  if (!chartConfig) return null;

  const config = chartConfig.config;

  // Handle theme change and automatically set matching background color
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    let backgroundColor = '#000000'; // Default to dark

    if (newTheme === 'light') {
      backgroundColor = '#ffffff';
    } else if (newTheme === 'dark') {
      backgroundColor = '#000000';
    } else if (newTheme === 'auto') {
      // Check system preference
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      backgroundColor = isDarkMode ? '#000000' : '#ffffff';
    }

    handleConfigChange({
      config: {
        theme: newTheme,
        backgroundColor: backgroundColor,
      },
    });
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
        {t('chart_editor_theme_colors')}
      </h4>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('chart_editor_theme')}
          </Label>
          <select
            value={config.theme}
            onChange={e => handleThemeChange(e.target.value as 'light' | 'dark' | 'auto')}
            className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="auto">{t('chart_editor_auto')}</option>
            <option value="light">{t('chart_editor_light')}</option>
            <option value="dark">{t('chart_editor_dark')}</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {config.theme === 'dark' && 'Background: Black (#000000)'}
            {config.theme === 'light' && 'Background: White (#ffffff)'}
            {config.theme === 'auto' && 'Background: Follows system preference'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeConfiguration;
