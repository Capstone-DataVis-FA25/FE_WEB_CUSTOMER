import React, { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';

const ThemeConfiguration: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  const [customColor, setCustomColor] = useState('#000000');
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!chartConfig) return null;

  const config = chartConfig.config;
  if (!config) return null;

  // Sync custom color with current background color
  useEffect(() => {
    if (config.backgroundColor) {
      setCustomColor(config.backgroundColor);
      // Check if current color is a preset (black or white)
      const isPreset = config.backgroundColor === '#000000' || config.backgroundColor === '#ffffff';
      setIsCustomMode(!isPreset && config.theme !== 'auto');
    }
  }, [config.backgroundColor, config.theme]);

  // Handle theme change and automatically set matching background color
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto' | 'custom') => {
    if (newTheme === 'custom') {
      setIsCustomMode(true);
      handleConfigChange({
        config: {
          backgroundColor: customColor,
        },
      });
      return;
    }

    setIsCustomMode(false);
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

  // Handle custom color change
  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    setIsCustomMode(true);
    handleConfigChange({
      config: {
        backgroundColor: color,
      },
    });
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
        {t('chart_editor_theme_colors')}
      </h4>

      <div className="space-y-4">
        {/* Theme Preset Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('chart_editor_theme')}
          </Label>
          <div className="flex items-center gap-2 mt-1">
            <select
              value={isCustomMode ? 'custom' : config.theme}
              onChange={e =>
                handleThemeChange(e.target.value as 'light' | 'dark' | 'auto' | 'custom')
              }
              className="flex-1 h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="auto">{t('chart_editor_auto', 'Auto (System)')}</option>
              <option value="light">{t('chart_editor_light', 'Light')}</option>
              <option value="dark">{t('chart_editor_dark', 'Dark')}</option>
              <option value="custom">{t('chart_editor_custom', 'Custom Color')}</option>
            </select>
            <input
              type="color"
              value={customColor}
              onChange={e => handleCustomColorChange(e.target.value)}
              className="w-12 h-10 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer"
              style={{ padding: '2px' }}
              title={t('chart_editor_pick_color', 'Pick a color')}
            />
          </div>
          {!isCustomMode && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {config.theme === 'dark' && 'Background: Black (#000000)'}
              {config.theme === 'light' && 'Background: White (#ffffff)'}
              {config.theme === 'auto' && 'Background: Follows system preference'}
            </p>
          )}
        </div>
        {/* Custom Color Picker */}
        {isCustomMode && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('chart_editor_background_color', 'Background Color')}
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="color"
                  value={customColor}
                  onChange={e => handleCustomColorChange(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer"
                  style={{ padding: '2px' }}
                />
              </div>
              <input
                type="text"
                value={customColor}
                onChange={e => handleCustomColorChange(e.target.value)}
                placeholder="#000000"
                className="w-28 h-10 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
              />
              <div
                className="w-10 h-10 rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                style={{ backgroundColor: customColor }}
                title={`Preview: ${customColor}`}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('chart_editor_custom_color_hint', 'Choose any background color for your chart')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeConfiguration;
