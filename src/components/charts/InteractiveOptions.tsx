import React, { useState, useRef, useCallback } from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';
import { useChartEditor } from '@/contexts/ChartEditorContext';

const InteractiveOptions: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, handleConfigChange } = useChartEditor();
  if (!chartConfig) return null;

  const config = chartConfig.config;
  const [localZoomExtent, setLocalZoomExtent] = useState(config.zoomExtent);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedApply = useCallback((apply: () => void) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(apply, 500);
  }, []);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
        {t('chart_editor_interactive_options')}
      </h4>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showTooltip"
            checked={config.showTooltip}
            onCheckedChange={checked => handleConfigChange({ config: { showTooltip: !!checked } })}
          />
          <Label
            htmlFor="showTooltip"
            className="text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {t('chart_editor_show_tooltip')}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="enableZoom"
            checked={config.enableZoom}
            onCheckedChange={checked => handleConfigChange({ config: { enableZoom: !!checked } })}
          />
          <Label
            htmlFor="enableZoom"
            className="text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {t('chart_editor_enable_zoom')}
          </Label>
        </div>

        {config.enablePan !== undefined && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enablePan"
              checked={config.enablePan}
              onCheckedChange={checked => handleConfigChange({ config: { enablePan: !!checked } })}
            />
            <Label
              htmlFor="enablePan"
              className="text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              {t('chart_editor_enable_pan')}
            </Label>
          </div>
        )}

        {config.zoomExtent !== undefined && (
          <div className="ml-4 space-y-2">
            <div>
              <Label className="text-xs text-gray-600 dark:text-gray-400">
                {t('chart_editor_zoom_extent')}
              </Label>
              <Input
                type="number"
                min="1"
                max="20"
                step="0.5"
                value={localZoomExtent}
                onChange={e => {
                  const v = parseFloat(e.target.value) || 8;
                  setLocalZoomExtent(v);
                  debouncedApply(() => handleConfigChange({ config: { zoomExtent: v } }));
                }}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveOptions;
