import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import D3AreaChart, { type ChartDataPoint } from './D3AreaChart';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import {
  BarChart3,
  Plus,
  Minus,
  Palette,
  ToggleLeft,
  ToggleRight,
  Table,
  Edit3,
  Eye,
  EyeOff,
  X,
  Save,
} from 'lucide-react';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { sizePresets, type ColorConfig, curveOptions } from './chartConstants';

// AreaChart configuration interface
export interface AreaChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKeys: string[];
  disabledLines: string[]; // New field for disabled areas (same as line chart)
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  showLegend: boolean;
  showGrid: boolean;
  showPoints: boolean;
  showStroke: boolean;
  animationDuration: number;
  curve: keyof typeof curveOptions;
  opacity: number;
  stackedMode: boolean;
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
// Props for AreaChart Editor
export interface AreaChartEditorProps {
  initialData: ChartDataPoint[];
  initialConfig?: Partial<AreaChartConfig>;
  initialColors?: ColorConfig;
  initialFormatters?: Partial<FormatterConfig>;
  onConfigChange?: (config: AreaChartConfig) => void;
  onDataChange?: (data: ChartDataPoint[]) => void;
  onColorsChange?: (colors: ColorConfig) => void;
  onFormattersChange?: (formatters: FormatterConfig) => void;
  title?: string;
  description?: string;
}

const AreaChartEditor: React.FC<AreaChartEditorProps> = ({
  initialData,
  initialConfig = {},
  initialColors = {},
  initialFormatters = {},
  onConfigChange,
  onDataChange,
  onColorsChange,
  onFormattersChange,
  title: _title,
  description: _description,
}) => {
  const { t } = useTranslation();

  // Calculate responsive default dimensions
  const getResponsiveDefaults = () => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const containerWidth = Math.min(screenWidth * 0.7, 1000);
    const aspectRatio = 16 / 9;

    return {
      width: Math.max(600, Math.min(containerWidth, 1000)),
      height: Math.max(300, Math.min(containerWidth / aspectRatio, 600)),
    };
  };

  const responsiveDefaults = getResponsiveDefaults();

  // Default configuration
  const defaultConfig: AreaChartConfig = {
    width: responsiveDefaults.width,
    height: responsiveDefaults.height,
    margin: { top: 20, right: 40, bottom: 60, left: 80 },
    xAxisKey: Object.keys(initialData[0] || {})[0] || 'x',
    yAxisKeys: Object.keys(initialData[0] || {}).filter(
      key => typeof (initialData[0] || {})[key] === 'number'
    ) || ['y'],
    disabledLines: [],
    title: t('areaChart_editor_title') || 'Area Chart',
    xAxisLabel: t('areaChart_editor_xAxisLabel') || 'X Axis',
    yAxisLabel: t('areaChart_editor_yAxisLabel') || 'Y Axis',
    showLegend: true,
    showGrid: true,
    showPoints: false,
    showStroke: true,
    animationDuration: 1000,
    curve: 'curveMonotoneX',
    opacity: 0.7,
    stackedMode: false,
    ...initialConfig,
  };

  const defaultColors: ColorConfig = {
    area1: { light: '#3b82f6', dark: '#60a5fa' },
    area2: { light: '#f97316', dark: '#fb923c' },
    area3: { light: '#10b981', dark: '#34d399' },
    area4: { light: '#eab308', dark: '#facc15' },
    area5: { light: '#ef4444', dark: '#f87171' },
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
  const [config, setConfig] = useState<AreaChartConfig>(defaultConfig);
  const [colors, setColors] = useState<ColorConfig>(defaultColors);
  const [data, setData] = useState<ChartDataPoint[]>(initialData);
  const [formatters, setFormatters] = useState<FormatterConfig>(defaultFormatters);
  const [showDataModal, setShowDataModal] = useState(false);
  const [tempData, setTempData] = useState<ChartDataPoint[]>(initialData);

  // Calculate responsive fontSize based on chart dimensions
  const getResponsiveFontSize = () => {
    const baseSize = Math.min(config.width, config.height);
    if (baseSize <= 300) return { axis: 10, label: 12, title: 14 };
    if (baseSize <= 500) return { axis: 11, label: 13, title: 16 };
    if (baseSize <= 700) return { axis: 12, label: 14, title: 18 };
    if (baseSize <= 900) return { axis: 13, label: 15, title: 20 };
    return { axis: 14, label: 16, title: 22 };
  };

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
  const updateConfig = (newConfig: Partial<AreaChartConfig>) => {
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

  // Data manipulation functions are kept but not used in current implementation
  // These may be used in future enhancements

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
    const newKey = `area${config.yAxisKeys.length + 1}`;
    updateConfig({
      yAxisKeys: [...config.yAxisKeys, newKey],
    });

    updateColors({
      ...colors,
      [newKey]: { light: '#6366f1', dark: '#818cf8' },
    });

    const newData = data.map(point => ({
      ...point,
      [newKey]: Math.floor(Math.random() * 100) + 50,
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

  const updateColor = (key: string, theme: 'light' | 'dark', value: string) => {
    updateColors({
      ...colors,
      [key]: {
        ...colors[key],
        [theme]: value,
      },
    });
  };

  // Toggle area visibility (similar to line chart)
  const toggleAreaVisibility = (key: string) => {
    const isCurrentlyDisabled = config.disabledLines.includes(key);
    if (isCurrentlyDisabled) {
      // Enable the area
      updateConfig({
        disabledLines: config.disabledLines.filter(area => area !== key),
      });
    } else {
      // Disable the area
      updateConfig({
        disabledLines: [...config.disabledLines, key],
      });
    }
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
                    {t('areaChart_editor_basicSettings') || 'Basic Settings'}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Size Presets */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t('areaChart_editor_sizePresets') || 'Size Presets'}
                    </Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                      {Object.entries(sizePresets).map(([key, preset]) => (
                        <Button
                          key={key}
                          variant="outline"
                          size="sm"
                          onClick={() => applySizePreset(key as keyof typeof sizePresets)}
                          className="text-xs"
                        >
                          {key === 'responsive'
                            ? t(preset.labelKey) || 'Auto'
                            : `${preset.width}×${preset.height}`}
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
                        <Label className="text-xs text-gray-500">Width</Label>
                        <Input
                          type="number"
                          value={config.width}
                          onChange={e => updateConfig({ width: parseInt(e.target.value) || 600 })}
                          className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Height</Label>
                        <Input
                          type="number"
                          value={config.height}
                          onChange={e => updateConfig({ height: parseInt(e.target.value) || 400 })}
                          className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                      </div>
                    </div>
                    <div className="text-center mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Aspect Ratio: {(config.width / config.height).toFixed(2)}:1
                      </span>
                    </div>
                  </div>

                  {/* Padding Configuration */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Padding (Margin)
                    </Label>
                    <div className="mt-2">
                      {/* Visual Padding Editor */}
                      <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        {/* Top */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <Input
                            type="number"
                            value={config.margin.top}
                            onChange={e => {
                              const newTop = parseInt(e.target.value) || 0;
                              updateConfig({
                                margin: { ...config.margin, top: Math.max(0, newTop) },
                              });
                            }}
                            className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            min="0"
                          />
                        </div>

                        {/* Left */}
                        <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <Input
                            type="number"
                            value={config.margin.left}
                            onChange={e => {
                              const newLeft = parseInt(e.target.value) || 0;
                              updateConfig({
                                margin: { ...config.margin, left: Math.max(0, newLeft) },
                              });
                            }}
                            className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            min="0"
                          />
                        </div>

                        {/* Right */}
                        <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                          <Input
                            type="number"
                            value={config.margin.right}
                            onChange={e => {
                              const newRight = parseInt(e.target.value) || 0;
                              updateConfig({
                                margin: { ...config.margin, right: Math.max(0, newRight) },
                              });
                            }}
                            className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            min="0"
                          />
                        </div>

                        {/* Bottom */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                          <Input
                            type="number"
                            value={config.margin.bottom}
                            onChange={e => {
                              const newBottom = parseInt(e.target.value) || 0;
                              updateConfig({
                                margin: { ...config.margin, bottom: Math.max(0, newBottom) },
                              });
                            }}
                            className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            min="0"
                          />
                        </div>

                        {/* Center Chart Area Representation */}
                        <div className="bg-white dark:bg-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded h-20 flex items-center justify-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Chart Area
                          </span>
                        </div>
                      </div>

                      {/* Padding Values Display */}
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Top:</span>
                            <div className="font-mono">{config.margin.top}px</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Right:</span>
                            <div className="font-mono">{config.margin.right}px</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Bottom:</span>
                            <div className="font-mono">{config.margin.bottom}px</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Left:</span>
                            <div className="font-mono">{config.margin.left}px</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t('areaChart_editor_title') || 'Title'}
                    </Label>
                    <Input
                      value={config.title}
                      onChange={e => updateConfig({ title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('areaChart_editor_xAxisLabel') || 'X-Axis Label'}
                      </Label>
                      <Input
                        value={config.xAxisLabel}
                        onChange={e => updateConfig({ xAxisLabel: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('areaChart_editor_yAxisLabel') || 'Y-Axis Label'}
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
                      {t('areaChart_editor_xAxisKey') || 'X-Axis Key'}
                    </Label>
                    <Input
                      value={config.xAxisKey}
                      onChange={e => updateConfig({ xAxisKey: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t('areaChart_editor_animationDuration') || 'Animation Duration (ms)'}
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
                      {t('areaChart_editor_curveType') || 'Curve Type'}
                    </Label>
                    <select
                      value={config.curve}
                      onChange={e =>
                        updateConfig({ curve: e.target.value as keyof typeof curveOptions })
                      }
                      className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {Object.keys(curveOptions).map(curve => (
                        <option key={curve} value={curve}>
                          {curve.replace('curve', '')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t('areaChart_editor_opacity') || 'Area Opacity'}
                    </Label>
                    <div className="mt-2">
                      <Slider
                        value={[config.opacity]}
                        onValueChange={values => updateConfig({ opacity: values[0] })}
                        min={0.1}
                        max={1.0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {Math.round(config.opacity * 100)}%
                      </div>
                    </div>
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
                    {t('areaChart_editor_displayOptions') || 'Display Options'}
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
                      {t('areaChart_editor_showLegend') || 'Show Legend'}
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
                      {t('areaChart_editor_showGrid') || 'Show Grid'}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showPoints"
                      checked={config.showPoints}
                      onCheckedChange={checked => updateConfig({ showPoints: !!checked })}
                    />
                    <Label
                      htmlFor="showPoints"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {t('areaChart_editor_showPoints') || 'Show Points'}
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showStroke"
                      checked={config.showStroke}
                      onCheckedChange={checked => updateConfig({ showStroke: !!checked })}
                    />
                    <Label
                      htmlFor="showStroke"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {t('areaChart_editor_showStroke') || 'Show Stroke'}
                    </Label>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="stacked-mode"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >
                      {t('areaChart_editor_stackedMode') || 'Stacked Mode'}
                    </Label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateConfig({ stackedMode: !config.stackedMode })}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {config.stackedMode ? (
                          <ToggleRight className="h-5 w-5 text-blue-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <Badge variant={config.stackedMode ? 'default' : 'secondary'}>
                        {config.stackedMode ? 'Stacked' : 'Overlapped'}
                      </Badge>
                    </div>
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
                    {t('areaChart_editor_formatters') || 'Data Formatters'}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {/* Y-Axis Formatter */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {t('areaChart_editor_yAxisFormatter') || 'Y-Axis Formatter'}
                        </Label>
                        <Checkbox
                          checked={formatters.useYFormatter}
                          onCheckedChange={checked =>
                            updateFormatters({ useYFormatter: !!checked })
                          }
                        />
                      </div>

                      {formatters.useYFormatter && (
                        <div className="space-y-2">
                          <select
                            value={formatters.yFormatterType}
                            onChange={e =>
                              updateFormatters({
                                yFormatterType: e.target.value as FormatterConfig['yFormatterType'],
                              })
                            }
                            className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          >
                            <option value="currency">Currency</option>
                            <option value="percentage">Percentage</option>
                            <option value="number">Number</option>
                            <option value="decimal">Decimal</option>
                            <option value="scientific">Scientific</option>
                            <option value="bytes">Bytes</option>
                            <option value="duration">Duration</option>
                            <option value="date">Date</option>
                            <option value="custom">Custom</option>
                          </select>
                          {formatters.yFormatterType === 'custom' && (
                            <Input
                              placeholder="e.g., `value + ' units'`"
                              value={formatters.customYFormatter}
                              onChange={e => updateFormatters({ customYFormatter: e.target.value })}
                              className="text-sm"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* X-Axis Formatter */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {t('areaChart_editor_xAxisFormatter') || 'X-Axis Formatter'}
                        </Label>
                        <Checkbox
                          checked={formatters.useXFormatter}
                          onCheckedChange={checked =>
                            updateFormatters({ useXFormatter: !!checked })
                          }
                        />
                      </div>

                      {formatters.useXFormatter && (
                        <div className="space-y-2">
                          <select
                            value={formatters.xFormatterType}
                            onChange={e =>
                              updateFormatters({
                                xFormatterType: e.target.value as FormatterConfig['xFormatterType'],
                              })
                            }
                            className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          >
                            <option value="currency">Currency</option>
                            <option value="percentage">Percentage</option>
                            <option value="number">Number</option>
                            <option value="decimal">Decimal</option>
                            <option value="scientific">Scientific</option>
                            <option value="bytes">Bytes</option>
                            <option value="duration">Duration</option>
                            <option value="date">Date</option>
                            <option value="custom">Custom</option>
                          </select>
                          {formatters.xFormatterType === 'custom' && (
                            <Input
                              placeholder="e.g., `value + ' units'`"
                              value={formatters.customXFormatter}
                              onChange={e => updateFormatters({ customXFormatter: e.target.value })}
                              className="text-sm"
                            />
                          )}
                        </div>
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
                  <D3AreaChart
                    data={data}
                    width={config.width}
                    height={config.height}
                    margin={config.margin}
                    xAxisKey={config.xAxisKey}
                    yAxisKeys={config.yAxisKeys}
                    disabledLines={config.disabledLines}
                    colors={colors}
                    title={config.title}
                    xAxisLabel={config.xAxisLabel}
                    yAxisLabel={config.yAxisLabel}
                    showLegend={config.showLegend}
                    showGrid={config.showGrid}
                    showPoints={config.showPoints}
                    showStroke={config.showStroke}
                    animationDuration={config.animationDuration}
                    curve={curveOptions[config.curve]}
                    yAxisFormatter={getYAxisFormatter}
                    xAxisFormatter={getXAxisFormatter}
                    fontSize={getResponsiveFontSize()}
                    opacity={config.opacity}
                    stackedMode={config.stackedMode}
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
                    {t('areaChart_editor_areaConfiguration') || 'Area Configuration'}
                  </h3>
                  <Button onClick={addYAxisKey} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    {t('areaChart_editor_addSeries') || 'Add Series'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.yAxisKeys.map((key, index) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAreaVisibility(key)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {config.disabledLines.includes(key) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <div
                          className="w-4 h-4 rounded border"
                          style={{
                            backgroundColor: config.disabledLines.includes(key)
                              ? '#d1d5db'
                              : colors[key]?.light || defaultColors[`area${index + 1}`]?.light,
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm font-medium">{key}</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <Label className="text-xs text-gray-500">Light Theme</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={
                                  colors[key]?.light || defaultColors[`area${index + 1}`]?.light
                                }
                                onChange={e => updateColor(key, 'light', e.target.value)}
                                className="w-8 h-8 rounded border"
                              />
                              <Input
                                value={
                                  colors[key]?.light || defaultColors[`area${index + 1}`]?.light
                                }
                                onChange={e => updateColor(key, 'light', e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Dark Theme</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={colors[key]?.dark || defaultColors[`area${index + 1}`]?.dark}
                                onChange={e => updateColor(key, 'dark', e.target.value)}
                                className="w-8 h-8 rounded border"
                              />
                              <Input
                                value={colors[key]?.dark || defaultColors[`area${index + 1}`]?.dark}
                                onChange={e => updateColor(key, 'dark', e.target.value)}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {config.yAxisKeys.length > 1 && (
                        <Button onClick={() => removeYAxisKey(key)} size="sm" variant="destructive">
                          <Minus className="h-4 w-4" />
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
                    {t('areaChart_editor_dataEditor') || 'Data Editor'}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={openDataModal}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Edit3 className="h-4 w-4" />
                      {t('areaChart_editor_editData') || 'Edit Data'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="grid grid-cols-4 gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-medium">
                        <div className="text-center">{config.xAxisKey}</div>
                        {config.yAxisKeys.map(key => (
                          <div key={key} className="text-center">
                            {key}
                          </div>
                        ))}
                      </div>
                      {data.slice(0, 5).map((point, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-4 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                        >
                          <div className="text-center">{point[config.xAxisKey]}</div>
                          {config.yAxisKeys.map(key => (
                            <div key={key} className="text-center">
                              {point[key]}
                            </div>
                          ))}
                        </div>
                      ))}
                      {data.length > 5 && (
                        <div className="text-center text-gray-500 text-sm">
                          ... and {data.length - 5} more rows
                        </div>
                      )}
                    </div>
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
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t('areaChart_editor_editChartData') || 'Edit Chart Data'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('areaChart_editor_editDataDescription') ||
                        'Modify your chart data using the interactive table below'}
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
                    {t('areaChart_editor_addRow') || 'Add Row'}
                  </Button>
                  <Button
                    onClick={saveDataChanges}
                    size="sm"
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4" />
                    {t('areaChart_editor_saveChanges') || 'Save Changes'}
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
                          <th className="text-left p-3 font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                            {config.xAxisKey}
                          </th>
                          {config.yAxisKeys.map(key => (
                            <th
                              key={key}
                              className="text-left p-3 font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600"
                            >
                              {key}
                            </th>
                          ))}
                          <th className="text-left p-3 font-medium text-gray-900 dark:text-white">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tempData.map((point, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="p-2 border-r border-gray-200 dark:border-gray-600">
                              <Input
                                type="number"
                                value={point[config.xAxisKey]}
                                onChange={e =>
                                  updateTempDataPoint(index, config.xAxisKey, e.target.value)
                                }
                                className="h-8 border-0 focus:ring-1 focus:ring-blue-500"
                                data-row={index}
                                data-col="0"
                              />
                            </td>
                            {config.yAxisKeys.map((key, colIndex) => (
                              <td
                                key={key}
                                className="p-2 border-r border-gray-200 dark:border-gray-600"
                              >
                                <Input
                                  type="number"
                                  value={point[key]}
                                  onChange={e => updateTempDataPoint(index, key, e.target.value)}
                                  className="h-8 border-0 focus:ring-1 focus:ring-blue-500"
                                  data-row={index}
                                  data-col={colIndex + 1}
                                />
                              </td>
                            ))}
                            <td className="p-2">
                              <Button
                                onClick={() => removeTempDataPoint(index)}
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Minus className="h-4 w-4" />
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
                    <span>{config.yAxisKeys.length + 1} columns</span>
                    <span>Area chart data</span>
                  </div>
                  <div className="text-xs">
                    {t('areaChart_editor_dataEditTip') || 'Use Tab/Enter to navigate between cells'}
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

export default AreaChartEditor;
