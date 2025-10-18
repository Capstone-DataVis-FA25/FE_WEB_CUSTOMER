import React, { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';
import { useChartEditor } from '@/contexts/ChartEditorContext';
import { ChartType } from '@/features/charts';

const BarTypeSettings: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, handleConfigChange, currentChartType } = useChartEditor();
  if (!chartConfig) return null;
  if (currentChartType !== ChartType.Bar) return null;

  const cfg: any = chartConfig.config || {};

  const [localBarType, setLocalBarType] = useState<'grouped' | 'stacked'>(cfg.barType ?? 'grouped');
  const [localBarWidth, setLocalBarWidth] = useState<number>(cfg.barWidth ?? 24);
  const [localBarSpacing, setLocalBarSpacing] = useState<number>(cfg.barSpacing ?? 8);

  // Sync local state with chartConfig when it changes (for edit mode)
  useEffect(() => {
    setLocalBarType(cfg.barType ?? 'grouped');
    setLocalBarWidth(cfg.barWidth ?? 24);
    setLocalBarSpacing(cfg.barSpacing ?? 8);
  }, [cfg?.barType, cfg?.barWidth, cfg?.barSpacing]);

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('chart_editor_bar_type', 'Bar type')}
        </Label>
        <select
          value={localBarType}
          onChange={e => {
            const v = e.target.value as 'grouped' | 'stacked';
            setLocalBarType(v);
            handleConfigChange({ config: { barType: v } as any });
          }}
          className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="grouped">{t('chart_editor_grouped', 'Grouped')}</option>
          <option value="stacked">{t('chart_editor_stacked', 'Stacked')}</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('chart_editor_bar_width', 'Bar width')}
          </Label>
          <Input
            type="number"
            min={0}
            step={1}
            value={localBarWidth}
            onChange={e => {
              const v = parseInt(e.target.value) || 0;
              setLocalBarWidth(v);
              handleConfigChange({ config: { barWidth: v } as any });
            }}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {t('chart_editor_bar_spacing', 'Bar spacing')}
          </Label>
          <Input
            type="number"
            min={0}
            step={1}
            value={localBarSpacing}
            onChange={e => {
              const v = parseInt(e.target.value) || 0;
              setLocalBarSpacing(v);
              handleConfigChange({ config: { barSpacing: v } as any });
            }}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default BarTypeSettings;
