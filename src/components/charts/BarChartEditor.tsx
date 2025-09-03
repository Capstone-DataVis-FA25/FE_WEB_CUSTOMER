import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Palette, Plus, Eye, EyeOff, Trash2, Table, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import D3BarChart from './D3BarChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Types
export interface ChartDataPoint {
  [key: string]: string | number;
}

// BarChart configuration interface
export interface BarChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKeys: string[];
  disabledBars: string[]; // New field for disabled bars
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  showLegend: boolean;
  showGrid: boolean;
  animationDuration: number;
  barType: 'grouped' | 'stacked';
}

// Formatter configuration
export interface FormatterConfig {
  useYFormatter: boolean;
  useXFormatter: boolean;
  yFormatterType:
    | 'currency'
    | 'percentage'
    | 'number'
    | 'decimal'
    | 'scientific'
    | 'bytes'
    | 'duration'
    | 'date'
    | 'custom';
  xFormatterType:
    | 'currency'
    | 'percentage'
    | 'number'
    | 'decimal'
    | 'scientific'
    | 'bytes'
    | 'duration'
    | 'date'
    | 'custom';
  customYFormatter: string;
  customXFormatter: string;
}

// Color configuration
export type ColorConfig = Record<string, { light: string; dark: string }>;

// Common chart size presets
const sizePresets = {
  tiny: { width: 300, height: 200, labelKey: 'barChart_editor_preset_tiny' },
  small: { width: 400, height: 250, labelKey: 'barChart_editor_preset_small' },
  medium: { width: 600, height: 375, labelKey: 'barChart_editor_preset_medium' },
  large: { width: 800, height: 500, labelKey: 'barChart_editor_preset_large' },
  xlarge: { width: 1000, height: 625, labelKey: 'barChart_editor_preset_xlarge' },
  wide: { width: 1200, height: 400, labelKey: 'barChart_editor_preset_wide' },
  ultrawide: { width: 1400, height: 350, labelKey: 'barChart_editor_preset_ultrawide' },
  square: { width: 500, height: 500, labelKey: 'barChart_editor_preset_square' },
  presentation: { width: 1024, height: 768, labelKey: 'barChart_editor_preset_presentation' },
  mobile: { width: 350, height: 300, labelKey: 'barChart_editor_preset_mobile' },
  tablet: { width: 768, height: 480, labelKey: 'barChart_editor_preset_tablet' },
  responsive: { width: 0, height: 0, labelKey: 'barChart_editor_preset_responsive' },
};

// Props for BarChart Editor
export interface BarChartEditorProps {
  initialData: ChartDataPoint[];
  initialConfig?: Partial<BarChartConfig>;
  initialColors?: ColorConfig;
  initialFormatters?: Partial<FormatterConfig>;
  onConfigChange?: (config: BarChartConfig) => void;
  onDataChange?: (data: ChartDataPoint[]) => void;
  onColorsChange?: (colors: ColorConfig) => void;
  onFormattersChange?: (formatters: FormatterConfig) => void;
  title?: string;
  description?: string;
}

const BarChartEditor: React.FC<BarChartEditorProps> = ({
  initialData,
  initialConfig = {},
  initialColors = {},
  initialFormatters = {},
  onConfigChange,
  onDataChange,
  onColorsChange,
  onFormattersChange,
}) => {
  const { t } = useTranslation();

  // Calculate responsive default dimensions
  const getResponsiveDefaults = () => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const containerWidth = Math.min(screenWidth * 0.7, 1000); // 70% of screen, max 1000px
    const aspectRatio = 16 / 9; // Golden ratio for charts

    return {
      width: Math.max(600, Math.min(containerWidth, 1000)), // Min 600px, max 1000px
      height: Math.max(300, Math.min(containerWidth / aspectRatio, 600)), // Min 300px, max 600px
    };
  };

  const responsiveDefaults = getResponsiveDefaults();

  // Default configuration
  const defaultConfig: BarChartConfig = {
    width: responsiveDefaults.width,
    height: responsiveDefaults.height,
    margin: { top: 20, right: 40, bottom: 60, left: 80 },
    xAxisKey: Object.keys(initialData[0] || {})[0] || 'x',
    yAxisKeys: Object.keys(initialData[0] || {}).filter(
      key => typeof (initialData[0] || {})[key] === 'number'
    ) || ['y'],
    disabledBars: [], // Default to no disabled bars
    title: t('barChart_editor_title') || 'Bar Chart Editor',
    xAxisLabel: t('barChart_editor_xAxisLabel') || 'X Axis',
    yAxisLabel: t('barChart_editor_yAxisLabel') || 'Y Axis',
    showLegend: true,
    showGrid: true,
    animationDuration: 1000,
    barType: 'grouped',
    ...initialConfig,
  };

  const defaultColors: ColorConfig = {
    bar1: { light: '#3b82f6', dark: '#60a5fa' },
    bar2: { light: '#f97316', dark: '#fb923c' },
    bar3: { light: '#10b981', dark: '#34d399' },
    ...initialColors,
  };

  const defaultFormatters: FormatterConfig = {
    useYFormatter: true,
    useXFormatter: true,
    yFormatterType: 'number',
    xFormatterType: 'number',
    customYFormatter: '',
    customXFormatter: '',
    ...initialFormatters,
  };

  // State management
  const [config, setConfig] = useState<BarChartConfig>(defaultConfig);
  const [colors, setColors] = useState<ColorConfig>(defaultColors);
  const [data, setData] = useState<ChartDataPoint[]>(initialData);
  const [formatters, setFormatters] = useState<FormatterConfig>(defaultFormatters);
  const [showDataModal, setShowDataModal] = useState(false);
  const [tempData, setTempData] = useState<ChartDataPoint[]>(initialData);

  // Calculate responsive fontSize based on chart dimensions (for future use)
  // const getResponsiveFontSize = () => {
  //   const baseSize = Math.min(config.width, config.height);
  //   if (baseSize <= 300) return { axis: 10, label: 12, title: 14 };
  //   if (baseSize <= 500) return { axis: 11, label: 13, title: 16 };
  //   if (baseSize <= 700) return { axis: 12, label: 14, title: 18 };
  //   if (baseSize <= 900) return { axis: 13, label: 15, title: 20 };
  //   return { axis: 14, label: 16, title: 22 };
  // };

  // Generate formatter functions
  const getYAxisFormatter = useMemo(() => {
    if (!formatters.useYFormatter) return undefined;

    switch (formatters.yFormatterType) {
      case 'currency':
        return (value: number) => {
          if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
          return `$${value.toFixed(0)}`;
        };
      case 'percentage':
        return (value: number) => `${value.toFixed(1)}%`;
      case 'number':
        return (value: number) => {
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
          return value.toString();
        };
      case 'decimal':
        return (value: number) => value.toFixed(2);
      case 'scientific':
        return (value: number) => value.toExponential(2);
      case 'bytes':
        return (value: number) => {
          if (value >= 1024 * 1024 * 1024) return `${(value / (1024 * 1024 * 1024)).toFixed(1)}GB`;
          if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)}MB`;
          if (value >= 1024) return `${(value / 1024).toFixed(1)}KB`;
          return `${value}B`;
        };
      case 'duration':
        return (value: number) => {
          const hours = Math.floor(value / 3600);
          const minutes = Math.floor((value % 3600) / 60);
          const seconds = value % 60;
          if (hours > 0) return `${hours}h ${minutes}m`;
          if (minutes > 0) return `${minutes}m ${seconds}s`;
          return `${seconds}s`;
        };
      case 'date':
        return (value: number) => new Date(value).toLocaleDateString();
      case 'custom':
        if (formatters.customYFormatter) {
          try {
            return new Function('value', `return ${formatters.customYFormatter}`) as (
              value: number
            ) => string;
          } catch {
            return undefined;
          }
        }
        return undefined;
      default:
        return undefined;
    }
  }, [formatters]);

  const getXAxisFormatter = useMemo(() => {
    if (!formatters.useXFormatter) return undefined;

    switch (formatters.xFormatterType) {
      case 'currency':
        return (value: number) => {
          if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
          return `$${value.toFixed(0)}`;
        };
      case 'percentage':
        return (value: number) => `${value.toFixed(1)}%`;
      case 'number':
        return (value: number) => {
          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
          return value.toString();
        };
      case 'decimal':
        return (value: number) => value.toFixed(2);
      case 'scientific':
        return (value: number) => value.toExponential(2);
      case 'bytes':
        return (value: number) => {
          if (value >= 1024 * 1024 * 1024) return `${(value / (1024 * 1024 * 1024)).toFixed(1)}GB`;
          if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)}MB`;
          if (value >= 1024) return `${(value / 1024).toFixed(1)}KB`;
          return `${value}B`;
        };
      case 'duration':
        return (value: number) => {
          const hours = Math.floor(value / 3600);
          const minutes = Math.floor((value % 3600) / 60);
          const seconds = value % 60;
          if (hours > 0) return `${hours}h ${minutes}m`;
          if (minutes > 0) return `${minutes}m ${seconds}s`;
          return `${seconds}s`;
        };
      case 'date':
        return (value: number) => new Date(value).toLocaleDateString();
      case 'custom':
        if (formatters.customXFormatter) {
          try {
            return new Function('value', `return ${formatters.customXFormatter}`) as (
              value: number
            ) => string;
          } catch {
            return undefined;
          }
        }
        return undefined;
      default:
        return undefined;
    }
  }, [formatters]);

  // Update handlers
  const updateConfig = (newConfig: Partial<BarChartConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    onConfigChange?.(updatedConfig);
  };

  const updateColors = (newColors: ColorConfig) => {
    setColors(newColors);
    onColorsChange?.(newColors);
  };

  const updateData = (newData: ChartDataPoint[]) => {
    setData(newData);
    onDataChange?.(newData);
  };

  const updateFormatters = (newFormatters: Partial<FormatterConfig>) => {
    const updatedFormatters = { ...formatters, ...newFormatters };
    setFormatters(updatedFormatters);
    onFormattersChange?.(updatedFormatters);
  };

  // Modal functions
  const openDataModal = () => {
    setTempData([...data]);
    setShowDataModal(true);
  };

  const closeDataModal = () => {
    setShowDataModal(false);
  };

  const saveDataChanges = () => {
    updateData(tempData);
    setShowDataModal(false);
  };

  const updateTempDataPoint = (index: number, key: string, value: string) => {
    const newTempData = [...tempData];
    const numValue = parseFloat(value) || 0;
    newTempData[index] = { ...newTempData[index], [key]: numValue };
    setTempData(newTempData);
  };

  const addTempDataPoint = () => {
    const newPoint: ChartDataPoint = {
      [config.xAxisKey]:
        tempData.length > 0 ? Math.max(...tempData.map(d => d[config.xAxisKey] as number)) + 1 : 1,
    };

    config.yAxisKeys.forEach(key => {
      newPoint[key] = 0;
    });

    const newTempData = [...tempData, newPoint];
    setTempData(newTempData);

    // Focus vào input đầu tiên của dòng mới sau khi component re-render
    setTimeout(() => {
      const newRowIndex = newTempData.length - 1;
      const firstInput = document.querySelector(
        `input[data-row="${newRowIndex}"][data-col="0"]`
      ) as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }
    }, 50);
  };

  const removeTempDataPoint = (index: number) => {
    setTempData(tempData.filter((_, i) => i !== index));
  };

  // Apply size preset
  const applySizePreset = (presetKey: keyof typeof sizePresets) => {
    const preset = sizePresets[presetKey];
    if (presetKey === 'responsive') {
      const responsive = getResponsiveDefaults();
      updateConfig({ width: responsive.width, height: responsive.height });
    } else {
      updateConfig({ width: preset.width, height: preset.height });
    }
  };

  // Y-axis keys management
  const addYAxisKey = () => {
    const newKey = `bar${config.yAxisKeys.length + 1}`;
    updateConfig({
      yAxisKeys: [...config.yAxisKeys, newKey],
    });

    updateColors({
      ...colors,
      [newKey]: { light: '#6366f1', dark: '#818cf8' },
    });

    const newData = data.map(point => ({
      ...point,
      [newKey]: 100,
    }));
    updateData(newData);
  };

  const removeYAxisKey = (keyToRemove: string) => {
    if (config.yAxisKeys.length <= 1) return;

    updateConfig({
      yAxisKeys: config.yAxisKeys.filter(key => key !== keyToRemove),
    });

    const newColors = { ...colors };
    delete newColors[keyToRemove];
    updateColors(newColors);

    const newData = data.map(point => {
      const newPoint = { ...point };
      delete newPoint[keyToRemove];
      return newPoint;
    });
    updateData(newData);
  };

  // Toggle bar visibility
  const toggleBarVisibility = (key: string) => {
    const isCurrentlyDisabled = config.disabledBars.includes(key);
    if (isCurrentlyDisabled) {
      // Enable the bar
      updateConfig({
        disabledBars: config.disabledBars.filter(bar => bar !== key),
      });
    } else {
      // Disable the bar
      updateConfig({
        disabledBars: [...config.disabledBars, key],
      });
    }
  };

  const updateColor = (key: string, theme: 'light' | 'dark', value: string) => {
    updateColors({
      ...colors,
      [key]: {
        ...colors[key],
        [theme]: value,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t('barChart_editor_basicSettings') || 'Basic Settings'}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Size Presets */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Size Presets
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                      {Object.entries(sizePresets).map(([key, preset]) => (
                        <Button
                          key={key}
                          variant="outline"
                          size="sm"
                          onClick={() => applySizePreset(key as keyof typeof sizePresets)}
                          className="text-xs h-8"
                        >
                          {t(preset.labelKey) ||
                            (preset.width === 0
                              ? 'Responsive'
                              : `${preset.width}×${preset.height}`)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Width and Height */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Custom Size
                    </Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Width</Label>
                        <Input
                          type="number"
                          value={config.width}
                          onChange={e => updateConfig({ width: parseInt(e.target.value) || 600 })}
                          className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Height</Label>
                        <Input
                          type="number"
                          value={config.height}
                          onChange={e => updateConfig({ height: parseInt(e.target.value) || 400 })}
                          className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                      </div>
                    </div>
                    <div className="text-center mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Aspect Ratio: {(config.width / config.height).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Padding Configuration */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Padding (Margin)
                    </Label>
                    <div className="mt-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <Input
                          type="number"
                          placeholder="Top"
                          value={config.margin.top}
                          onChange={e =>
                            updateConfig({
                              margin: { ...config.margin, top: parseInt(e.target.value) || 0 },
                            })
                          }
                          className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                        <Input
                          type="number"
                          placeholder="Right"
                          value={config.margin.right}
                          onChange={e =>
                            updateConfig({
                              margin: { ...config.margin, right: parseInt(e.target.value) || 0 },
                            })
                          }
                          className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                        <Input
                          type="number"
                          placeholder="Bottom"
                          value={config.margin.bottom}
                          onChange={e =>
                            updateConfig({
                              margin: { ...config.margin, bottom: parseInt(e.target.value) || 0 },
                            })
                          }
                          className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                        <Input
                          type="number"
                          placeholder="Left"
                          value={config.margin.left}
                          onChange={e =>
                            updateConfig({
                              margin: { ...config.margin, left: parseInt(e.target.value) || 0 },
                            })
                          }
                          className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Chart Title
                    </Label>
                    <Input
                      value={config.title}
                      onChange={e => updateConfig({ title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600 dark:text-gray-400">
                        X-Axis Label
                      </Label>
                      <Input
                        value={config.xAxisLabel}
                        onChange={e => updateConfig({ xAxisLabel: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 dark:text-gray-400">
                        Y-Axis Label
                      </Label>
                      <Input
                        value={config.yAxisLabel}
                        onChange={e => updateConfig({ yAxisLabel: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      X-Axis Key
                    </Label>
                    <Input
                      value={config.xAxisKey}
                      onChange={e => updateConfig({ xAxisKey: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Animation Duration (ms)
                    </Label>
                    <Input
                      type="number"
                      value={config.animationDuration}
                      onChange={e =>
                        updateConfig({ animationDuration: parseInt(e.target.value) || 1000 })
                      }
                      className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Bar Type
                    </Label>
                    <select
                      value={config.barType}
                      onChange={e =>
                        updateConfig({ barType: e.target.value as 'grouped' | 'stacked' })
                      }
                      className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="grouped">Grouped</option>
                      <option value="stacked">Stacked</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Display Options */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('barChart_editor_displayOptions') || 'Display Options'}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showLegend"
                      checked={config.showLegend}
                      onCheckedChange={checked => updateConfig({ showLegend: !!checked })}
                    />
                    <Label
                      htmlFor="showLegend"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      Show Legend
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showGrid"
                      checked={config.showGrid}
                      onCheckedChange={checked => updateConfig({ showGrid: !!checked })}
                    />
                    <Label
                      htmlFor="showGrid"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      Show Grid
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Formatters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Formatters
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {/* Y-Axis Formatter */}
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="useYFormatter"
                          checked={formatters.useYFormatter}
                          onCheckedChange={checked =>
                            updateFormatters({ useYFormatter: !!checked })
                          }
                        />
                        <Label
                          htmlFor="useYFormatter"
                          className="text-sm font-medium text-gray-900 dark:text-gray-100"
                        >
                          Y-Axis Formatter
                        </Label>
                      </div>
                      {formatters.useYFormatter && (
                        <select
                          value={formatters.yFormatterType}
                          onChange={e =>
                            updateFormatters({
                              yFormatterType: e.target.value as FormatterConfig['yFormatterType'],
                            })
                          }
                          className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="number">Number</option>
                          <option value="currency">Currency</option>
                          <option value="percentage">Percentage</option>
                          <option value="decimal">Decimal</option>
                          <option value="scientific">Scientific</option>
                          <option value="bytes">Bytes</option>
                          <option value="duration">Duration</option>
                          <option value="date">Date</option>
                          <option value="custom">Custom</option>
                        </select>
                      )}
                    </div>

                    {/* X-Axis Formatter */}
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="useXFormatter"
                          checked={formatters.useXFormatter}
                          onCheckedChange={checked =>
                            updateFormatters({ useXFormatter: !!checked })
                          }
                        />
                        <Label
                          htmlFor="useXFormatter"
                          className="text-sm font-medium text-gray-900 dark:text-gray-100"
                        >
                          X-Axis Formatter
                        </Label>
                      </div>
                      {formatters.useXFormatter && (
                        <select
                          value={formatters.xFormatterType}
                          onChange={e =>
                            updateFormatters({
                              xFormatterType: e.target.value as FormatterConfig['xFormatterType'],
                            })
                          }
                          className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="number">Number</option>
                          <option value="currency">Currency</option>
                          <option value="percentage">Percentage</option>
                          <option value="decimal">Decimal</option>
                          <option value="scientific">Scientific</option>
                          <option value="bytes">Bytes</option>
                          <option value="duration">Duration</option>
                          <option value="date">Date</option>
                          <option value="custom">Custom</option>
                        </select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Chart Preview & Data Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardContent className="p-4 sm:p-6">
                  <D3BarChart
                    data={data}
                    width={config.width}
                    height={config.height}
                    margin={config.margin}
                    xAxisKey={config.xAxisKey}
                    yAxisKeys={config.yAxisKeys.filter(key => !config.disabledBars.includes(key))}
                    colors={colors}
                    title={config.title}
                    xAxisLabel={config.xAxisLabel}
                    yAxisLabel={config.yAxisLabel}
                    showLegend={config.showLegend}
                    showGrid={config.showGrid}
                    animationDuration={config.animationDuration}
                    yAxisFormatter={getYAxisFormatter}
                    xAxisFormatter={getXAxisFormatter}
                    barType={config.barType}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Y-Axis Keys Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Data Series & Colors
                  </h3>
                  <Button onClick={addYAxisKey} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Series
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.yAxisKeys.map(key => (
                    <div
                      key={key}
                      className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <Button
                        onClick={() => toggleBarVisibility(key)}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-8 w-8"
                      >
                        {config.disabledBars.includes(key) ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-blue-600" />
                        )}
                      </Button>

                      <div className="flex items-center space-x-2 flex-1">
                        <div
                          className="w-4 h-4 rounded border-2"
                          style={{
                            backgroundColor: colors[key]?.light || '#3b82f6',
                            borderColor: colors[key]?.dark || '#1e40af',
                          }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">{key}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={colors[key]?.light || '#3b82f6'}
                          onChange={e => updateColor(key, 'light', e.target.value)}
                          className="w-8 h-8 border rounded cursor-pointer"
                          title="Light theme color"
                        />
                        <input
                          type="color"
                          value={colors[key]?.dark || '#60a5fa'}
                          onChange={e => updateColor(key, 'dark', e.target.value)}
                          className="w-8 h-8 border rounded cursor-pointer"
                          title="Dark theme color"
                        />
                      </div>

                      {config.yAxisKeys.length > 1 && (
                        <Button
                          onClick={() => removeYAxisKey(key)}
                          variant="ghost"
                          size="sm"
                          className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Data Editor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Table className="h-5 w-5" />
                    Data Editor
                  </h3>
                  <div className="flex gap-2">
                    <Button onClick={openDataModal} variant="outline" size="sm">
                      <Table className="h-4 w-4 mr-1" />
                      Edit Data
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        Current data: {data.length} rows, {Object.keys(data[0] || {}).length}{' '}
                        columns
                      </p>
                      <p>
                        Chart shows: {config.yAxisKeys.length - config.disabledBars.length} of{' '}
                        {config.yAxisKeys.length} data series
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.slice(0, 6).map((point, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Row {index + 1}
                          </div>
                          {Object.entries(point).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="font-medium">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {data.length > 6 && (
                      <div className="text-center">
                        <Button onClick={openDataModal} variant="link" size="sm">
                          View all {data.length} rows...
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Data Editor Modal */}
      <AnimatePresence>
        {showDataModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeDataModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <Table className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Edit Chart Data
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Modify your chart data in spreadsheet format
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={addTempDataPoint}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Row
                  </Button>
                  <Button
                    onClick={saveDataChanges}
                    size="sm"
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={closeDataModal}
                    size="sm"
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Modal Content - Sheet-like Table */}
              <div className="p-6">
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                  <div className="max-h-[60vh] overflow-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="w-12 p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                            #
                          </th>
                          {Object.keys(tempData[0] || {}).map(key => (
                            <th
                              key={key}
                              className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600"
                            >
                              {key}
                            </th>
                          ))}
                          <th className="w-20 p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {tempData.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="p-3 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">
                              {index + 1}
                            </td>
                            {Object.entries(row).map(([key, value], colIndex) => (
                              <td
                                key={key}
                                className="p-3 border-r border-gray-200 dark:border-gray-600"
                              >
                                <Input
                                  value={value?.toString() || ''}
                                  onChange={e => updateTempDataPoint(index, key, e.target.value)}
                                  className="w-full h-8 text-sm"
                                  data-row={index}
                                  data-col={colIndex}
                                />
                              </td>
                            ))}
                            <td className="p-3">
                              <Button
                                onClick={() => removeTempDataPoint(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>{tempData.length} rows</span>
                    <span>{Object.keys(tempData[0] || {}).length} columns</span>
                    <span>{config.yAxisKeys.length} data series</span>
                  </div>
                  <div className="text-xs">
                    Press Tab to move between cells, Enter to move to next row
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BarChartEditor;
