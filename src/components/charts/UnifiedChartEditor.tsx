import React from 'react';
import ChartTypeSelector from './ChartTypeSelector';
import BasicSettingsSection from './BasicSettingsSection';
import BasicChartSettingsSection from './BasicChartSettingsSection';
import AxisConfigurationSection from './AxisConfigurationSection';
import SeriesManagementSection from './SeriesManagementSection';
import ChartDisplaySection from './ChartDisplaySection';

export interface UnifiedChartEditorProps {}

const UnifiedChartEditor: React.FC<UnifiedChartEditorProps> = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="w-full px-2">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Left Sidebar - Chart Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              {/* Chart Type Selector */}
              <ChartTypeSelector />

              {/* Basic Settings Section */}
              <BasicSettingsSection />

              {/* Basic Chart Settings Section */}
              <BasicChartSettingsSection />

              {/* Axis Configuration Section */}
              <AxisConfigurationSection />

              {/* Series Management Section */}
              <SeriesManagementSection />
            </div>
          </div>
          {/* Right Side - Chart Display */}
          <ChartDisplaySection />
        </div>
      </div>
    </div>
  );
};

export default UnifiedChartEditor;
