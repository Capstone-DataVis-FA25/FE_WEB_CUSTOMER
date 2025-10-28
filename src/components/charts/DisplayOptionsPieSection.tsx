import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useChartEditor, useChartEditorActions } from '@/features/chartEditor';
import type { SubPieDonutChartConfig } from '@/types/chart';
import { motion, AnimatePresence } from 'framer-motion';

function isPieDonutConfig(config: any): config is SubPieDonutChartConfig {
  return (
    config &&
    typeof config === 'object' &&
    'showTitle' in config &&
    'showLegend' in config &&
    'legendPosition' in config &&
    'legendMaxItems' in config &&
    'showLabels' in config &&
    'showPercentage' in config &&
    'showSliceValues' in config &&
    'sliceOpacity' in config &&
    'enableHoverEffect' in config &&
    'hoverScale' in config &&
    'enableAnimation' in config &&
    'animationDuration' in config &&
    'showTooltip' in config
  );
}

const DisplayOptionsPieSection: React.FC = () => {
  const { chartConfig } = useChartEditor();
  const { handleConfigChange } = useChartEditorActions();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const config = chartConfig?.config;
  const toggleSection = () => setIsCollapsed(!isCollapsed);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
          onClick={toggleSection}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {'Display Options'}
            </h3>
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        <AnimatePresence mode="wait">
          {!isCollapsed && isPieDonutConfig(config) && (
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* Title Settings */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">{'Show Title'}</Label>
                  <input
                    type="checkbox"
                    checked={config.showTitle}
                    onChange={e => handleConfigChange({ config: { showTitle: e.target.checked } })}
                    className="w-4 h-4"
                  />
                </div>

                {/* Legend Settings */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">{'Show Legend'}</Label>
                  <input
                    type="checkbox"
                    checked={config.showLegend}
                    onChange={e => handleConfigChange({ config: { showLegend: e.target.checked } })}
                    className="w-4 h-4"
                  />
                </div>

                <div>
                  <Label className="text-xs">{'Legend Position'}</Label>
                  <select
                    value={config.legendPosition}
                    onChange={e =>
                      handleConfigChange({
                        config: {
                          legendPosition: e.target.value as 'top' | 'bottom' | 'left' | 'right',
                        },
                      })
                    }
                    className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">
                    {'Legend Max Items'}: {config.legendMaxItems}
                  </Label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={config.legendMaxItems}
                    onChange={e =>
                      handleConfigChange({ config: { legendMaxItems: parseInt(e.target.value) } })
                    }
                    className="w-full mt-1"
                  />
                </div>

                {/* Labels Settings */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">{'Show Labels'}</Label>
                  <input
                    type="checkbox"
                    checked={config.showLabels}
                    onChange={e => handleConfigChange({ config: { showLabels: e.target.checked } })}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">{'Show Percentage'}</Label>
                  <input
                    type="checkbox"
                    checked={config.showPercentage}
                    onChange={e =>
                      handleConfigChange({ config: { showPercentage: e.target.checked } })
                    }
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">{'Show Slice Values'}</Label>
                  <input
                    type="checkbox"
                    checked={config.showSliceValues}
                    onChange={e =>
                      handleConfigChange({ config: { showSliceValues: e.target.checked } })
                    }
                    className="w-4 h-4"
                  />
                </div>

                {/* Visual Effects */}
                <div>
                  <Label className="text-xs">
                    {'Slice Opacity'}: {((config.sliceOpacity ?? 1) * 100).toFixed(0)}%
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={config.sliceOpacity ?? 1}
                    onChange={e =>
                      handleConfigChange({ config: { sliceOpacity: parseFloat(e.target.value) } })
                    }
                    className="w-full mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">{'Enable Hover Effect'}</Label>
                  <input
                    type="checkbox"
                    checked={config.enableHoverEffect}
                    onChange={e =>
                      handleConfigChange({ config: { enableHoverEffect: e.target.checked } })
                    }
                    className="w-4 h-4"
                  />
                </div>

                {config.enableHoverEffect && (
                  <div>
                    <Label className="text-xs">
                      {'Hover Scale'}: {(config.hoverScale ?? 1).toFixed(2)}x
                    </Label>
                    <input
                      type="range"
                      min="1"
                      max="1.5"
                      step="0.01"
                      value={config.hoverScale ?? 1}
                      onChange={e =>
                        handleConfigChange({ config: { hoverScale: parseFloat(e.target.value) } })
                      }
                      className="w-full mt-1"
                    />
                  </div>
                )}

                {/* Animation Settings */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">{'Enable Animation'}</Label>
                  <input
                    type="checkbox"
                    checked={config.enableAnimation}
                    onChange={e =>
                      handleConfigChange({ config: { enableAnimation: e.target.checked } })
                    }
                    className="w-4 h-4"
                  />
                </div>

                {config.enableAnimation && (
                  <div>
                    <Label className="text-xs">
                      {'Animation Duration'}: {config.animationDuration}ms
                    </Label>
                    <input
                      type="range"
                      min="100"
                      max="3000"
                      step="100"
                      value={config.animationDuration}
                      onChange={e =>
                        handleConfigChange({
                          config: { animationDuration: parseInt(e.target.value) },
                        })
                      }
                      className="w-full mt-1"
                    />
                  </div>
                )}

                {/* Tooltip */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs">{'Show Tooltip'}</Label>
                  <input
                    type="checkbox"
                    checked={config.showTooltip}
                    onChange={e =>
                      handleConfigChange({ config: { showTooltip: e.target.checked } })
                    }
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </CardContent>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default DisplayOptionsPieSection;
