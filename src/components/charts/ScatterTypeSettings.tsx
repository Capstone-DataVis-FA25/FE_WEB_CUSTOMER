import React from 'react';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import { useAppSelector } from '@/store/hooks';
import ScatterAdvancedOptions from './ScatterAdvancedOptions';
import DataPairSuggestionPanel from './DataPairSuggestionPanel';

const ScatterTypeSettings: React.FC = () => {
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  const currentDataset = useAppSelector(state => state.dataset.currentDataset);

  if (!chartConfig) return null;
  if (currentChartType !== ChartType.Scatter) return null;

  // Get headers from dataset
  const dataHeaders = currentDataset?.headers || [];
  const hasDataset = currentDataset && currentDataset.id;

  // Get current axis selections
  const currentXAxisId = (chartConfig as any).axisConfigs?.xAxisKey;
  const currentYAxisIds =
    (chartConfig as any).axisConfigs?.seriesConfigs?.map((s: any) => s.dataColumn) || [];

  // Handle applying a recommendation
  const handleApplyRecommendation = (xColumnId: string, yColumnId: string) => {
    // Update axis configuration for scatter chart
    const updates: any = {
      axisConfigs: {
        ...((chartConfig as any).axisConfigs || {}),
        xAxisKey: xColumnId,
      },
    };

    // Find the column to get its name
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
  };

  return (
    <div className="space-y-4">
      {/* Smart Data Pair Suggestions - Only show if dataset exists */}
      {hasDataset && dataHeaders.length >= 2 && (
        <>
          <DataPairSuggestionPanel
            headers={dataHeaders as any}
            chartType="scatter"
            currentXAxisId={currentXAxisId}
            currentYAxisIds={currentYAxisIds}
            onApplyRecommendation={handleApplyRecommendation}
          />

          {/* Divider after suggestions */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
        </>
      )}

      {/* Scatter Advanced Options */}
      <ScatterAdvancedOptions />
    </div>
  );
};

export default ScatterTypeSettings;
