import React, { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import { useDebouncedUpdater } from '@/hooks/useDebounce';
import LineAdvancedOptions from './LineAdvancedOptions';

const LineChartStyling: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  if (!chartConfig || currentChartType !== ChartType.Line) return null;

  const config = chartConfig.config;
  if (!config) return null;

  // const showPoints = 'showPoints' in config ? config.showPoints : false;
  const lineWidth = 'lineWidth' in config ? config.lineWidth : 2;
  const pointRadius = 'pointRadius' in config ? config.pointRadius : 4;

  const [localLineWidth, setLocalLineWidth] = useState(lineWidth);
  const [localPointRadius, setLocalPointRadius] = useState(pointRadius);

  // Sync local state with chartConfig when it changes (for edit mode)
  useEffect(() => {
    setLocalLineWidth(lineWidth);
    setLocalPointRadius(pointRadius);
  }, [lineWidth, pointRadius]);

  // Debounced update handlers using custom hook
  const debouncedUpdateLineWidth = useDebouncedUpdater<number>(value =>
    handleConfigChange({ config: { lineWidth: value } })
  );

  const debouncedUpdatePointRadius = useDebouncedUpdater<number>(value =>
    handleConfigChange({ config: { pointRadius: value } })
  );

  return (
    <>
      {/* Styling Configuration */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white">
          {t('chart_editor_line_styling', 'Line Styling')}
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('chart_editor_line_width', 'Line width')}
            </Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={localLineWidth}
              onChange={e => {
                const v = parseInt(e.target.value) || 2;
                setLocalLineWidth(v);
                debouncedUpdateLineWidth(v);
              }}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('line_width_hint', 'Thicker lines are easier to see but may overlap')}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('chart_editor_point_radius', 'Point size')}
            </Label>
            <Input
              type="number"
              min="1"
              max="10"
              value={localPointRadius}
              onChange={e => {
                const v = parseInt(e.target.value) || 4;
                setLocalPointRadius(v);
                debouncedUpdatePointRadius(v);
              }}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('point_radius_hint', 'Adjust size of data point markers')}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

      {/* Advanced Display Options - Now a separate component */}
      <LineAdvancedOptions />
    </>
  );
};

export default LineChartStyling;
