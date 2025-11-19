import { ChevronDown, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '../ui/card';
import AnimationDurationSetting from './AnimationDurationSetting';
import CurveTypeSetting from './CurveTypeSetting';
import { useChartEditor } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import BarTypeSettings from './BarTypeSettings';
import AreaTypeSettings from './AreaTypeSettings';
import ScatterTypeSettings from './ScatterTypeSettings';
import DisplayOptionsSettings from './DisplayOptionsSettings';

const BasicChartSettingsSection: React.FC = () => {
  const { t } = useTranslation();
  const { currentChartType, chartConfig } = useChartEditor();
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Phải đặt phía sau các hook
  // Nếu chartConfig null -> dừng lại và không chạy các hook
  if (!chartConfig || !chartConfig.config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden rounded-lg">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-gray-700/10 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('chart_editor_chart_settings', 'Chart Settings')}
            </h3>
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </motion.div>
          </div>
        </CardHeader>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="basic-settings-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <CardContent className="space-y-4 mt-4">
                {/* Animation Duration */}
                <div>
                  <AnimationDurationSetting />
                </div>

                {/* Curve Type */}
                {(currentChartType === ChartType.Line || currentChartType === ChartType.Area) && (
                  <div>
                    <CurveTypeSetting />
                  </div>
                )}

                {/* Area Type Settings */}
                {currentChartType === ChartType.Area && (
                  <div>
                    <AreaTypeSettings />
                  </div>
                )}

                {/* Bar Type */}
                {currentChartType === ChartType.Bar && (
                  <div>
                    <BarTypeSettings />
                  </div>
                )}

                {/* Scatter Type Settings */}
                {currentChartType === ChartType.Scatter && (
                  <div>
                    <ScatterTypeSettings />
                  </div>
                )}

                {/* Display Options */}
                <div>
                  <DisplayOptionsSettings />
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default BasicChartSettingsSection;
