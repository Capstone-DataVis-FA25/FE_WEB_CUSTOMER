import React from 'react';
import ChartTypeSelector from './ChartTypeSelector';
import BasicSettingsSection from './BasicSettingsSection';
import BasicChartSettingsSection from './BasicChartSettingsSection';
import AxisConfigurationSection from './AxisConfigurationSection';
import SeriesManagementSection from './SeriesManagementSection';
import ChartDisplaySection from './ChartDisplaySection';
import { useChartEditorRead } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import ChartSettingsPieSection from './ChartSettingsPieSection';
import DisplayOptionsPieSection from './DisplayOptionsPieSection';
import CyclePlotSettingsSection from './CyclePlotSettingsSection';
import ChartFormatterSettings from './ChartFormatterSettingSection';
import ImportExportSection from './ImportExportSection';
import type { DataHeader } from '@/utils/dataProcessors';

export interface UnifiedChartEditorProps {
  processedHeaders?: DataHeader[];
  setDataId: (dataId: string) => void;
  datasetId?: string;
}

const UnifiedChartEditor: React.FC<UnifiedChartEditorProps> = ({
  processedHeaders,
  setDataId,
  datasetId,
}) => {
  const { currentChartType: chartType } = useChartEditorRead();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="w-full px-2">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Left Sidebar - Chart Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              {/* Chart Type Selector */}
              <div id="chart-type-selector">
                <ChartTypeSelector />
              </div>

              {/* Basic Settings Section */}
              <div id="basic-settings-section">
                <BasicSettingsSection />
              </div>

              {(chartType == ChartType.Line ||
                chartType == ChartType.Bar ||
                chartType == ChartType.Area ||
                chartType == ChartType.Scatter) && (
                <>
                  {/* Basic Chart Settings Section */}
                  <div id="chart-settings-section">
                    <BasicChartSettingsSection />
                  </div>

                  {/* Axis Configuration Section */}
                  <div id="axis-configuration-section">
                    <AxisConfigurationSection processedHeaders={processedHeaders} />
                  </div>

                  {/* Series Management Section */}
                  <div id="series-management-section">
                    <SeriesManagementSection processedHeaders={processedHeaders} />
                  </div>
                </>
              )}

              {(chartType == ChartType.Pie || chartType == ChartType.Donut) && (
                <>
                  {/* Basic Chart Settings Section */}
                  <ChartSettingsPieSection processedHeaders={processedHeaders} />

                  {/* Display Options Section */}
                  <DisplayOptionsPieSection />
                </>
              )}

              {chartType == ChartType.CyclePlot && (
                <>
                  {/* Basic Chart Settings Section */}
                  <BasicChartSettingsSection />

                  {/* Cycle Plot Specific Settings */}
                  <CyclePlotSettingsSection />
                </>
              )}
              <div id="chart-formatter-section">
                <ChartFormatterSettings />
              </div>
              <div id="import-export-section">
                <ImportExportSection setDataId={setDataId} datasetId={datasetId} />
              </div>
            </div>
          </div>
          {/* Right Side - Chart Display */}
          <div id="chart-display-section">
            <ChartDisplaySection processedHeaders={processedHeaders} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedChartEditor;
