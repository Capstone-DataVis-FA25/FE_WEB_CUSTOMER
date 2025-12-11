import React, { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import { useAppSelector } from '@/store/hooks';
import AreaAdvancedOptions from './AreaAdvancedOptions';
import DataPairSuggestionPanel from './DataPairSuggestionPanel';

/**
 * AreaTypeSettings Component
 *
 * Settings specific to Area charts including:
 * - Stacked vs Overlapping mode
 * - Area opacity
 * - Advanced display options for non-tech users
 */
const AreaTypeSettings: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  const currentDataset = useAppSelector(state => state.dataset.currentDataset);

  if (!chartConfig) return null;
  if (currentChartType !== ChartType.Area) return null;

  const cfg: any = chartConfig.config || {};

  const [localStackedMode, setLocalStackedMode] = useState<boolean>(cfg.stackedMode ?? false);
  const [localOpacity, setLocalOpacity] = useState<number>(cfg.opacity ?? 0.7);

  // Sync local state with chartConfig when it changes (for edit mode)
  useEffect(() => {
    setLocalStackedMode(cfg.stackedMode ?? false);
    setLocalOpacity(cfg.opacity ?? 0.7);
  }, [cfg?.stackedMode, cfg?.opacity]);

  // Get headers from dataset
  const dataHeaders = currentDataset?.headers || [];
  const hasDataset = currentDataset && currentDataset.id;

  // Get current axis selections
  const currentXAxisId = (chartConfig as any).axisConfigs?.xAxisKey;
  const currentYAxisIds =
    (chartConfig as any).axisConfigs?.seriesConfigs?.map((s: any) => s.dataColumn) || [];

  // Handle applying a recommendation
  const handleApplyRecommendation = (xColumnId: string, yColumnId: string, isRemoving = false) => {
    if (isRemoving) {
      // Remove only the specific Y-series, keep X-axis intact
      const existingSeries = (chartConfig as any).axisConfigs?.seriesConfigs || [];
      const filteredSeries = existingSeries.filter((s: any) => s.dataColumn !== yColumnId);

      const updates: any = {
        axisConfigs: {
          ...((chartConfig as any).axisConfigs || {}),
          seriesConfigs: filteredSeries,
        },
      };

      handleConfigChange(updates);
    } else {
      // Apply the recommendation
      const updates: any = {
        axisConfigs: {
          ...((chartConfig as any).axisConfigs || {}),
          xAxisKey: xColumnId,
        },
      };

      // Find the column to get its color
      const yHeader = dataHeaders.find(h => h.id === yColumnId);

      // Update series configs to include the recommended Y column
      const existingSeries = (chartConfig as any).axisConfigs?.seriesConfigs || [];
      const seriesExists = existingSeries.some((s: any) => s.dataColumn === yColumnId);

      if (!seriesExists && yHeader) {
        // Add new series for the Y column
        const newSeries = {
          id: `series-${Date.now()}`,
          name: yHeader.name,
          dataColumn: yColumnId,
          color: '#3b82f6', // Default color
          visible: true,
        };

        updates.axisConfigs.seriesConfigs = [...existingSeries, newSeries];
      }

      handleConfigChange(updates);
    }
  };

  return (
    <div className="space-y-4">
      {/* Smart Data Pair Suggestions - Only show if dataset exists */}
      {hasDataset && dataHeaders.length >= 2 && (
        <>
          <DataPairSuggestionPanel
            headers={dataHeaders as any}
            chartType="area"
            currentXAxisId={currentXAxisId}
            currentYAxisIds={currentYAxisIds}
            onApplyRecommendation={handleApplyRecommendation}
          />

          {/* Divider after suggestions */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
        </>
      )}

      {/* Area Mode Selection */}
      <div>
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('area_mode', 'Area display mode')}
        </Label>
        <select
          value={localStackedMode ? 'stacked' : 'overlapping'}
          onChange={e => {
            const v = e.target.value === 'stacked';
            setLocalStackedMode(v);
            handleConfigChange({ config: { stackedMode: v } as any });
          }}
          className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="overlapping">
            {t('area_overlapping', 'Overlapping - Compare trends separately')}
          </option>
          <option value="stacked">{t('area_stacked', 'Stacked - Show cumulative total')}</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {!localStackedMode
            ? t(
                'area_overlapping_hint',
                'Overlapping mode shows each area independently, making it easy to compare individual trends'
              )
            : t(
                'area_stacked_hint',
                'Stacked mode accumulates values on top of each other, showing how different parts contribute to the whole'
              )}
        </p>
      </div>

      {/* Area Opacity Slider */}
      <div>
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('area_opacity', 'Area transparency')}
        </Label>
        <div className="flex items-center gap-3 mt-2">
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={localOpacity}
            onChange={e => {
              const v = parseFloat(e.target.value);
              setLocalOpacity(v);
              handleConfigChange({ config: { opacity: v } as any });
            }}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">
            {Math.round(localOpacity * 100)}%
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t(
            'area_opacity_hint',
            'Lower transparency makes areas more see-through, useful when comparing overlapping areas'
          )}
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

      {/* Advanced Display Options - Separate component for non-tech users */}
      <AreaAdvancedOptions />
    </div>
  );
};

export default AreaTypeSettings;
