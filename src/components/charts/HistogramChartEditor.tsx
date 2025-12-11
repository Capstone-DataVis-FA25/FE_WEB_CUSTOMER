import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Settings, Palette } from 'lucide-react';
import { useChartEditorRead } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import { Card, CardContent, CardHeader } from '../ui/card';
import BasicChartSettingsSection from './BasicChartSettingsSection';
import SeriesManagementSection from './SeriesManagementSection';
import HistogramTypeSettings from './HistogramTypeSettings';
import HistogramAdvancedOptions from './HistogramAdvancedOptions';

interface HistogramChartEditorProps {
  processedHeaders?: any[];
}

const HistogramChartEditor: React.FC<HistogramChartEditorProps> = ({ processedHeaders }) => {
  const { t } = useTranslation();
  const { currentChartType } = useChartEditorRead();
  const [isDataColumnCollapsed, setIsDataColumnCollapsed] = useState(false);
  const [isBinConfigCollapsed, setIsBinConfigCollapsed] = useState(true);
  const [isAdvancedCollapsed, setIsAdvancedCollapsed] = useState(true);

  if (currentChartType !== ChartType.Histogram) return null;

  return (
    <div className="space-y-6">
      {/* Basic Chart Settings */}
      <BasicChartSettingsSection />

      {/* Series Management - Data Column Selection */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden rounded-lg">
          <AnimatePresence mode="wait">
            {!isDataColumnCollapsed && (
              <motion.div
                key="series-management-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <SeriesManagementSection processedHeaders={processedHeaders} />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Bin Configuration */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden rounded-lg">
          <CardHeader
            className="pb-3 cursor-pointer hover:bg-gray-700/10 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
            onClick={() => setIsBinConfigCollapsed(!isBinConfigCollapsed)}
          >
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                {t('histogram_bin_configuration', 'Bin Configuration')}
              </h3>
              <motion.div
                animate={{ rotate: isBinConfigCollapsed ? 0 : 180 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </motion.div>
            </div>
          </CardHeader>
          <AnimatePresence mode="wait">
            {!isBinConfigCollapsed && (
              <motion.div
                key="bin-config-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <CardContent className="mt-4">
                  <HistogramTypeSettings />
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Advanced Display Options */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden rounded-lg">
          <CardHeader
            className="pb-3 cursor-pointer hover:bg-gray-700/10 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
            onClick={() => setIsAdvancedCollapsed(!isAdvancedCollapsed)}
          >
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-500" />
                {t('histogram_advanced_options', 'Advanced Display Options')}
              </h3>
              <motion.div
                animate={{ rotate: isAdvancedCollapsed ? 0 : 180 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </motion.div>
            </div>
          </CardHeader>
          <AnimatePresence mode="wait">
            {!isAdvancedCollapsed && (
              <motion.div
                key="advanced-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <CardContent className="mt-4">
                  <HistogramAdvancedOptions />
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
};

export default HistogramChartEditor;
