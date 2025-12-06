import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useTranslation } from 'react-i18next';
import { useChartEditorRead, useChartEditorActions } from '@/features/chartEditor';
import { ChartType } from '@/features/charts';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { motion, AnimatePresence } from 'framer-motion';

const HeatmapAdvancedOptions: React.FC = () => {
  const { t } = useTranslation();
  const { chartConfig, currentChartType } = useChartEditorRead();
  const { handleConfigChange } = useChartEditorActions();
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (!chartConfig || currentChartType !== ChartType.Heatmap) return null;

  const cfg: any = chartConfig.config || {};

  // Get current settings with defaults
  const showTooltip = cfg.showTooltip ?? true;
  const showValues = cfg.showValues ?? false;
  const colorScheme = cfg.colorScheme ?? 'viridis';
  const cellBorderWidth = cfg.cellBorderWidth ?? 1;
  const legendSteps = cfg.legendSteps ?? 5;
  const minValue = cfg.minValue ?? 'auto';
  const maxValue = cfg.maxValue ?? 'auto';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
    >
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-hidden rounded-lg">
        <CardHeader
          className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              {t('heatmap_advanced_options', 'Advanced Options')}
            </h3>
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </CardHeader>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <CardContent className="px-4 py-3 space-y-4">
                {/* Color Scheme */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('color_scheme', 'Color Scheme')}</Label>
                  <Select
                    value={colorScheme}
                    onValueChange={v => handleConfigChange({ config: { colorScheme: v } as any })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        options={[
                          { value: 'viridis', label: 'Viridis (Colorful)' },
                          { value: 'plasma', label: 'Plasma (Purple-Orange)' },
                          { value: 'inferno', label: 'Inferno (Dark-Warm)' },
                          { value: 'magma', label: 'Magma (Dark-Purple)' },
                          { value: 'turbo', label: 'Turbo (Rainbow)' },
                          { value: 'cividis', label: 'Cividis (Colorblind-Friendly)' },
                          { value: 'blues', label: 'Blues (Sequential)' },
                          { value: 'reds', label: 'Reds (Sequential)' },
                          { value: 'greens', label: 'Greens (Sequential)' },
                          { value: 'purples', label: 'Purples (Sequential)' },
                          { value: 'oranges', label: 'Oranges (Sequential)' },
                          { value: 'greys', label: 'Greys (Monochrome)' },
                        ]}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viridis">Viridis (Colorful)</SelectItem>
                      <SelectItem value="plasma">Plasma (Purple-Orange)</SelectItem>
                      <SelectItem value="inferno">Inferno (Dark-Warm)</SelectItem>
                      <SelectItem value="magma">Magma (Dark-Purple)</SelectItem>
                      <SelectItem value="turbo">Turbo (Rainbow)</SelectItem>
                      <SelectItem value="cividis">Cividis (Colorblind-Friendly)</SelectItem>
                      <SelectItem value="blues">Blues (Sequential)</SelectItem>
                      <SelectItem value="reds">Reds (Sequential)</SelectItem>
                      <SelectItem value="greens">Greens (Sequential)</SelectItem>
                      <SelectItem value="purples">Purples (Sequential)</SelectItem>
                      <SelectItem value="oranges">Oranges (Sequential)</SelectItem>
                      <SelectItem value="greys">Greys (Monochrome)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t(
                      'color_scheme_hint',
                      'Choose a color palette that best represents your data'
                    )}
                  </p>
                </div>

                {/* Value Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('min_value', 'Min Value')}</Label>
                    <Input
                      type="text"
                      value={minValue}
                      onChange={e => {
                        const val =
                          e.target.value === 'auto' ? 'auto' : parseFloat(e.target.value) || 'auto';
                        handleConfigChange({ config: { minValue: val } as any });
                      }}
                      placeholder="auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('max_value', 'Max Value')}</Label>
                    <Input
                      type="text"
                      value={maxValue}
                      onChange={e => {
                        const val =
                          e.target.value === 'auto' ? 'auto' : parseFloat(e.target.value) || 'auto';
                        handleConfigChange({ config: { maxValue: val } as any });
                      }}
                      placeholder="auto"
                    />
                  </div>
                </div>

                {/* Display Options */}
                <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <Checkbox
                    checked={showValues}
                    onCheckedChange={v =>
                      handleConfigChange({ config: { showValues: Boolean(v) } as any })
                    }
                    id="heatmap-show-values"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="heatmap-show-values"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {t('show_values', 'Show values in cells')}
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('show_values_hint', 'Display numeric values inside each cell')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <Checkbox
                    checked={showTooltip}
                    onCheckedChange={v =>
                      handleConfigChange({ config: { showTooltip: Boolean(v) } as any })
                    }
                    id="heatmap-show-tooltip"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="heatmap-show-tooltip"
                      className="text-sm font-medium cursor-pointer"
                    >
                      {t('show_tooltip', 'Show tooltip on hover')}
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t(
                        'show_tooltip_hint',
                        'Display detailed information when hovering over cells'
                      )}
                    </p>
                  </div>
                </div>

                {/* Cell Border Width */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t('cell_border_width', 'Cell Border Width')}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    value={cellBorderWidth}
                    onChange={e =>
                      handleConfigChange({
                        config: { cellBorderWidth: parseFloat(e.target.value) || 1 } as any,
                      })
                    }
                  />
                </div>

                {/* Legend Steps */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('legend_steps', 'Legend Steps')}</Label>
                  <Input
                    type="number"
                    min="2"
                    max="10"
                    value={legendSteps}
                    onChange={e =>
                      handleConfigChange({
                        config: { legendSteps: parseInt(e.target.value) || 5 } as any,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('legend_steps_hint', 'Number of tick marks in the color legend')}
                  </p>
                </div>

                {/* Tips */}
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1.5">
                    {t('tips_for_heatmap_charts', 'Tips for Heatmap Charts')}
                  </h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>
                      {t(
                        'tip_heatmap_color',
                        'Use Viridis or Cividis for accessibility and colorblind-friendly visualization'
                      )}
                    </li>
                    <li>
                      {t(
                        'tip_heatmap_values',
                        'Enable "Show values" for precise data reading in smaller heatmaps'
                      )}
                    </li>
                    <li>
                      {t(
                        'tip_heatmap_range',
                        'Set custom min/max values to focus on specific data ranges'
                      )}
                    </li>
                  </ul>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default HeatmapAdvancedOptions;
