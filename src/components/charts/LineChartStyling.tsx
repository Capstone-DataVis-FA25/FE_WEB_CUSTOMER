import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '../ui/input';
import { useTranslation } from 'react-i18next';
import { useChartEditor } from '@/contexts/ChartEditorContext';
import { ChartType } from '@/features/charts';
import { useDebouncedUpdater } from '@/hooks/useDebounce';

const LineChartStyling: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, handleConfigChange, currentChartType } = useChartEditor();
  if (!chartConfig || currentChartType !== ChartType.Line) return null;

  const config = chartConfig.config;
  const showPoints = 'showPoints' in config ? config.showPoints : false;
  const lineWidth = 'lineWidth' in config ? config.lineWidth : 2;
  const pointRadius = 'pointRadius' in config ? config.pointRadius : 4;

  const [localLineWidth, setLocalLineWidth] = useState(lineWidth);
  const [localPointRadius, setLocalPointRadius] = useState(pointRadius);

  // Debounced update handlers using custom hook
  const debouncedUpdateLineWidth = useDebouncedUpdater<number>(value =>
    handleConfigChange({ config: { lineWidth: value } })
  );

  const debouncedUpdatePointRadius = useDebouncedUpdater<number>(value =>
    handleConfigChange({ config: { pointRadius: value } })
  );

  return (
    <>
      {/* Show Points */}
      <div className="flex items-center space-x-2 mb-1">
        <Checkbox
          id="showPoints"
          checked={showPoints}
          onCheckedChange={checked => handleConfigChange({ config: { showPoints: !!checked } })}
        />
        <Label
          htmlFor="showPoints"
          className="text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {t('chart_editor_show_points')}
        </Label>
      </div>

      {/* Show Point Values - only show if points are enabled */}
      {showPoints && (
        <div className="flex items-center space-x-2 mb-1">
          <Checkbox
            id="showPointValues"
            checked={'showPointValues' in config ? config.showPointValues : false}
            onCheckedChange={checked =>
              handleConfigChange({ config: { showPointValues: !!checked } })
            }
          />
          <Label
            htmlFor="showPointValues"
            className="text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            {t('chart_editor_show_point_values')}
          </Label>
        </div>
      )}

      {/* Styling Configuration */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
          {t('chart_editor_styling')}
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('chart_editor_line_width')}
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
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {t('chart_editor_point_radius')}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default LineChartStyling;
