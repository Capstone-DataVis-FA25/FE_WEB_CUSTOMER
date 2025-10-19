import React from 'react';
import { motion } from 'framer-motion';
import ChartTypeSelector from './ChartTypeSelector';
import BasicSettingsSection from './BasicSettingsSection';
import BasicChartSettingsSection from './BasicChartSettingsSection';
import AxisConfigurationSection from './AxisConfigurationSection';
import SeriesManagementSection from './SeriesManagementSection';
import ChartDisplaySection from './ChartDisplaySection';
import { useChartEditorRead } from '@/features/chartEditor';
import { containerVariants, listItemVariants } from '@/theme/animation/animation.config';

export interface UnifiedChartEditorProps {}

const UnifiedChartEditor: React.FC<UnifiedChartEditorProps> = () => {
  const { currentChartType } = useChartEditorRead();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="w-full px-2">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Left Sidebar - Chart Settings */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="space-y-4">
              {/* Chart Type Selector */}
              <motion.div variants={listItemVariants}>
                <ChartTypeSelector />
              </motion.div>

              {/* Basic Settings Section */}
              <motion.div variants={listItemVariants}>
                <BasicSettingsSection />
              </motion.div>

              {/* Basic Chart Settings Section */}
              <motion.div variants={listItemVariants}>
                <BasicChartSettingsSection />
              </motion.div>

              {/* Axis Configuration Section */}
              <motion.div variants={listItemVariants}>
                <AxisConfigurationSection />
              </motion.div>

              {/* Series Management Section */}
              <motion.div variants={listItemVariants}>
                <SeriesManagementSection />
              </motion.div>
            </div>
          </motion.div>
          {/* Right Side - Chart Display */}
          <ChartDisplaySection />
        </div>
      </div>
    </div>
  );
};

export default UnifiedChartEditor;
