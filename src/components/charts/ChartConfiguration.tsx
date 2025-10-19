import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';

const ChartConfiguration: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  if (!chartConfig) return null;

  const config = chartConfig.config;
  const [localGridOpacity, setLocalGridOpacity] = useState(config.gridOpacity);

  // Sync local state with chartConfig when it changes (for edit mode)
  useEffect(() => {
    setLocalGridOpacity(config.gridOpacity);
  }, [config?.gridOpacity]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedApply = useCallback((apply: () => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(apply, 500);
  }, []);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
        {t('chart_editor_chart_settings')}
      </h4>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('chart_editor_grid_opacity')}
          </Label>
          <Input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={localGridOpacity}
            onChange={e => {
              const v = parseFloat(e.target.value) || 0.3;
              setLocalGridOpacity(v);
              debouncedApply(() => handleConfigChange({ config: { gridOpacity: v } }));
            }}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('chart_editor_legend_position')}
          </Label>
          <select
            value={config.legendPosition}
            onChange={e =>
              handleConfigChange({
                config: {
                  legendPosition: e.target.value as 'top' | 'bottom' | 'left' | 'right',
                },
              })
            }
            className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="top">{t('chart_editor_top')}</option>
            <option value="bottom">{t('chart_editor_bottom')}</option>
            <option value="left">{t('chart_editor_left')}</option>
            <option value="right">{t('chart_editor_right')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ChartConfiguration;
