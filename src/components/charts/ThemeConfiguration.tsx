import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useTranslation } from 'react-i18next';
import { useChartEditor } from '@/contexts/ChartEditorContext';
import { useDebouncedUpdater } from '@/hooks/useDebounce';

const ThemeConfiguration: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, handleConfigChange } = useChartEditor();
  if (!chartConfig) return null;

  const config = chartConfig.config;
  const [localBackgroundColor, setLocalBackgroundColor] = useState(
    config.backgroundColor === 'transparent'
      ? '#ffffff'
      : (config.backgroundColor?.length === 4
          ? config.backgroundColor.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3')
          : config.backgroundColor) || '#ffffff'
  );

  // Debounced update handler using custom hook
  const debouncedUpdateBackgroundColor = useDebouncedUpdater<string>(color =>
    handleConfigChange({ config: { backgroundColor: color } })
  );

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
        {t('chart_editor_theme_colors')}
      </h4>

      <div className="grid grid-cols-2 gap-4 mb-2">
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('chart_editor_theme')}
          </Label>
          <select
            value={config.theme}
            onChange={e =>
              handleConfigChange({
                config: { theme: e.target.value as 'light' | 'dark' | 'auto' },
              })
            }
            className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="auto">{t('chart_editor_auto')}</option>
            <option value="light">{t('chart_editor_light')}</option>
            <option value="dark">{t('chart_editor_dark')}</option>
          </select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('chart_editor_background_color')}
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              type="color"
              value={localBackgroundColor}
              onChange={e => {
                const v = e.target.value;
                setLocalBackgroundColor(v);
                debouncedUpdateBackgroundColor(v);
              }}
              className="h-10 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setLocalBackgroundColor('#ffffff');
                handleConfigChange({ config: { backgroundColor: 'transparent' } });
              }}
              className="px-3 h-10 text-xs"
              title={t('chart_editor_reset_to_transparent')}
            >
              {t('chart_editor_transparent')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeConfiguration;
