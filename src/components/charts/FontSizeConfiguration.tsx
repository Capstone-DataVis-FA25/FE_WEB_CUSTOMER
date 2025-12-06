import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';

const FontSizeConfiguration: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  if (!chartConfig) return null;

  const config = chartConfig.config;
  if (!config) return null;

  const [localTitleFontSize, setLocalTitleFontSize] = useState(config.titleFontSize);
  const [localLabelFontSize, setLocalLabelFontSize] = useState(config.labelFontSize);
  const [localLegendFontSize, setLocalLegendFontSize] = useState(config.legendFontSize);

  // Sync local state with chartConfig when it changes (for edit mode)
  useEffect(() => {
    setLocalTitleFontSize(config.titleFontSize);
    setLocalLabelFontSize(config.labelFontSize);
    setLocalLegendFontSize(config.legendFontSize);
  }, [config?.titleFontSize, config?.labelFontSize, config?.legendFontSize]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedApply = useCallback((apply: () => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(apply, 500);
  }, []);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
        {t('chart_editor_font_sizes')}
      </h4>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('chart_editor_title_size')}
          </Label>
          <Input
            type="number"
            min="8"
            max="36"
            value={localTitleFontSize}
            onChange={e => {
              const v = parseInt(e.target.value) || 16;
              setLocalTitleFontSize(v);
              debouncedApply(() => handleConfigChange({ config: { titleFontSize: v } }));
            }}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('chart_editor_label_size')}
          </Label>
          <Input
            type="number"
            min="6"
            max="24"
            value={localLabelFontSize}
            onChange={e => {
              const v = parseInt(e.target.value) || 12;
              setLocalLabelFontSize(v);
              debouncedApply(() => handleConfigChange({ config: { labelFontSize: v } }));
            }}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('chart_editor_legend_size')}
          </Label>
          <Input
            type="number"
            min="6"
            max="20"
            value={localLegendFontSize}
            onChange={e => {
              const v = parseInt(e.target.value) || 11;
              setLocalLegendFontSize(v);
              debouncedApply(() => handleConfigChange({ config: { legendFontSize: v } }));
            }}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default FontSizeConfiguration;
