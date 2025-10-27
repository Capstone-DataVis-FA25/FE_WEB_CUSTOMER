import React, { useState } from 'react';
import type { SubPieDonutChartConfig } from '@/types/chart';
import { Card, CardHeader, CardContent } from '../ui/card';
import { ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import { Label } from '../ui/label';
import { useChartEditor, useChartEditorActions } from '@/features/chartEditor';
import { useDataset } from '@/features/dataset/useDataset';
import { AnimatePresence, motion } from '@/theme/animation';

// Pie config type guard
function isPieDonutConfig(config: any): config is SubPieDonutChartConfig {
  return (
    config &&
    typeof config === 'object' &&
    'labelKey' in config &&
    'valueKey' in config &&
    'innerRadius' in config &&
    'cornerRadius' in config &&
    'padAngle' in config &&
    'sortSlices' in config
  );
}

const ChartSettingsPieSection: React.FC = () => {
  const { chartConfig } = useChartEditor();
  const { currentDataset } = useDataset();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { handleConfigChange } = useChartEditorActions();
  const config = chartConfig?.config;

  const toggleSection = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.12 }}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
          onClick={toggleSection}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              {'Chart Settings'}
            </h3>
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        <AnimatePresence>
          {!isCollapsed && isPieDonutConfig(config) && (
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* Label Column Selection */}
                <div>
                  <Label className="text-xs">{'Label Column'}</Label>
                  <select
                    value={config.labelKey || ''}
                    onChange={e =>
                      handleConfigChange({ config: { labelKey: e.target.value } as any })
                    }
                    className="w-full p-2 text-sm border rounded-md bg-background mt-1 h-10"
                    disabled={
                      !currentDataset ||
                      !currentDataset.headers ||
                      currentDataset.headers.length === 0
                    }
                  >
                    <option value="" disabled>
                      {!currentDataset ||
                      !currentDataset.headers ||
                      currentDataset.headers.length === 0
                        ? 'No dataset or columns available'
                        : 'Select a column'}
                    </option>
                    {currentDataset &&
                      currentDataset.headers &&
                      currentDataset.headers.length > 0 &&
                      currentDataset.headers.map((header: any) => (
                        <option key={header.id || header.name} value={header.id || header.name}>
                          {header.name || header.id}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Value Column Selection */}
                <div>
                  <Label className="text-xs">{'Value Column'}</Label>
                  <select
                    value={config.valueKey || ''}
                    onChange={e =>
                      handleConfigChange({ config: { valueKey: e.target.value } as any })
                    }
                    className="w-full p-2 text-sm border rounded-md bg-background mt-1 h-10"
                    disabled={
                      !currentDataset ||
                      !currentDataset.headers ||
                      currentDataset.headers.length === 0
                    }
                  >
                    <option value="" disabled>
                      {!currentDataset ||
                      !currentDataset.headers ||
                      currentDataset.headers.length === 0
                        ? 'No dataset or columns available'
                        : 'Select a column'}
                    </option>
                    {currentDataset &&
                      currentDataset.headers &&
                      currentDataset.headers.length > 0 &&
                      currentDataset.headers.map((header: any) => (
                        <option key={header.id || header.name} value={header.id || header.name}>
                          {header.name || header.id}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs">
                    {'Inner Radius (Donut)'}: {((config.innerRadius ?? 0) * 100).toFixed(0)}%
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={config.innerRadius ?? 0}
                    onChange={e =>
                      handleConfigChange({
                        config: { innerRadius: parseFloat(e.target.value) } as any,
                      })
                    }
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">
                    {'Corner Radius'}: {config.cornerRadius}
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={config.cornerRadius}
                    onChange={e =>
                      handleConfigChange({
                        config: { cornerRadius: parseInt(e.target.value) } as any,
                      })
                    }
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">
                    {'Pad Angle'}: {(config.padAngle ?? 0).toFixed(2)}
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="0.1"
                    step="0.01"
                    value={config.padAngle ?? 0}
                    onChange={e =>
                      handleConfigChange({
                        config: { padAngle: parseFloat(e.target.value) } as any,
                      })
                    }
                    className="w-full mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">{'Sort Slices'}</Label>
                  <select
                    value={config.sortSlices}
                    onChange={e =>
                      handleConfigChange({
                        config: {
                          sortSlices: e.target.value as 'ascending' | 'descending' | 'none',
                        } as any,
                      })
                    }
                    className="w-full p-2 text-sm border rounded-md bg-background mt-1 h-10 "
                  >
                    <option value="descending">Descending</option>
                    <option value="ascending">Ascending</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </CardContent>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default ChartSettingsPieSection;
