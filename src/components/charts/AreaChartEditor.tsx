import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import D3AreaChart, { type ChartDataPoint } from './D3AreaChart';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Minus,
  Palette,
  ToggleLeft,
  ToggleRight,
  Database,
  Edit3,
  Eye,
  Layers,
} from 'lucide-react';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';

// AreaChart configuration interface
export interface AreaChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKeys: string[];
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
  yFormatterType: 'currency' | 'percentage' | 'number' | 'custom';
  xFormatterType: 'default' | 'date' | 'custom';
  customYFormatter: string;
  customXFormatter: string;
}

// Color configuration
export type ColorConfig = Record<string, { light: string; dark: string }>;

// Common chart size presets
const sizePresets = {
  tiny: { width: 300, height: 200, labelKey: 'areaChart_editor_preset_tiny' },
  small: { width: 400, height: 250, labelKey: 'areaChart_editor_preset_small' },
  medium: { width: 600, height: 375, labelKey: 'areaChart_editor_preset_medium' },
  large: { width: 800, height: 500, labelKey: 'areaChart_editor_preset_large' },
  xlarge: { width: 1000, height: 625, labelKey: 'areaChart_editor_preset_xlarge' },
  wide: { width: 1200, height: 400, labelKey: 'areaChart_editor_preset_wide' },
  ultrawide: { width: 1400, height: 350, labelKey: 'areaChart_editor_preset_ultrawide' },
  square: { width: 500, height: 500, labelKey: 'areaChart_editor_preset_square' },
  presentation: { width: 1024, height: 768, labelKey: 'areaChart_editor_preset_presentation' },
  mobile: { width: 350, height: 300, labelKey: 'areaChart_editor_preset_mobile' },
  tablet: { width: 768, height: 480, labelKey: 'areaChart_editor_preset_tablet' },
  responsive: { width: 0, height: 0, labelKey: 'areaChart_editor_preset_responsive' },
};

// Curve options
const curveOptions = {
  curveLinear: d3.curveLinear,
  curveMonotoneX: d3.curveMonotoneX,
  curveMonotoneY: d3.curveMonotoneY,
  curveBasis: d3.curveBasis,
  curveCardinal: d3.curveCardinal,
  curveCatmullRom: d3.curveCatmullRom,
  curveStep: d3.curveStep,
  curveStepBefore: d3.curveStepBefore,
  curveStepAfter: d3.curveStepAfter,
};

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
  title,
  description,
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
    useYFormatter: false,
    useXFormatter: false,
    yFormatterType: 'number',
    xFormatterType: 'default',
    customYFormatter: '',
    customXFormatter: '',
    ...initialFormatters,
  };

  // State management
  const [config, setConfig] = useState<AreaChartConfig>(defaultConfig);
  const [colors, setColors] = useState<ColorConfig>(defaultColors);
  const [data, setData] = useState<ChartDataPoint[]>(initialData);
  const [formatters, setFormatters] = useState<FormatterConfig>(defaultFormatters);
  const [isEditingData, setIsEditingData] = useState(false);

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
        return (value: number) => `$${(value / 1000).toFixed(1)}K`;
      case 'percentage':
        return (value: number) => `${value}%`;
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

    if (formatters.xFormatterType === 'custom' && formatters.customXFormatter) {
      try {
        return new Function('value', `return ${formatters.customXFormatter}`) as (
          value: number
        ) => string;
      } catch {
        return undefined;
      }
    }
    return undefined;
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

  const _updateFormatters = (newFormatters: Partial<FormatterConfig>) => {
    const updatedFormatters = { ...formatters, ...newFormatters };
    setFormatters(updatedFormatters);
    onFormattersChange?.(updatedFormatters);
  };

  // Data manipulation
  const addDataPoint = () => {
    const newPoint: ChartDataPoint = {
      [config.xAxisKey]:
        data.length > 0 ? Math.max(...data.map(d => d[config.xAxisKey] as number)) + 1 : 1,
    };

    config.yAxisKeys.forEach(key => {
      newPoint[key] = Math.floor(Math.random() * 100) + 50;
    });

    updateData([...data, newPoint]);
  };

  const removeDataPoint = (index: number) => {
    updateData(data.filter((_, i) => i !== index));
  };

  const updateDataPoint = (index: number, key: string, value: string) => {
    const newData = [...data];
    const numValue = parseFloat(value) || 0;
    newData[index] = { ...newData[index], [key]: numValue };
    updateData(newData);
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

  // Export/Import
  const exportConfig = () => {
    const configData = {
      config,
      colors,
      data,
      formatters,
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'area-chart-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const configData = JSON.parse(e.target?.result as string);
        if (configData.config) setConfig({ ...defaultConfig, ...configData.config });
        if (configData.colors) setColors({ ...defaultColors, ...configData.colors });
        if (configData.data) setData(configData.data);
        if (configData.formatters)
          setFormatters({ ...defaultFormatters, ...configData.formatters });
      } catch (error) {
        console.error('Error importing config:', error);
      }
    };
    reader.readAsText(file);
  };

  const resetToDefault = () => {
    setConfig(defaultConfig);
    setColors(defaultColors);
    setData(initialData);
    setFormatters(defaultFormatters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Layers className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {title || 'Area Chart Editor'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
            {description ||
              'Create and customize beautiful area charts with advanced styling options'}
          </p>
        </motion.div>

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
                    <Settings className="h-5 w-5" />
                    Basic Settings
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="chart-title">Chart Title</Label>
                    <Input
                      id="chart-title"
                      value={config.title}
                      onChange={e => updateConfig({ title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="x-axis-label">X Axis Label</Label>
                      <Input
                        id="x-axis-label"
                        value={config.xAxisLabel}
                        onChange={e => updateConfig({ xAxisLabel: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="y-axis-label">Y Axis Label</Label>
                      <Input
                        id="y-axis-label"
                        value={config.yAxisLabel}
                        onChange={e => updateConfig({ yAxisLabel: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="x-axis-key">X Axis Key</Label>
                    <Input
                      id="x-axis-key"
                      value={config.xAxisKey}
                      onChange={e => updateConfig({ xAxisKey: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="animation-duration">Animation Duration (ms)</Label>
                    <Input
                      id="animation-duration"
                      type="number"
                      value={config.animationDuration}
                      onChange={e =>
                        updateConfig({ animationDuration: parseInt(e.target.value) || 1000 })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="curve-type">Curve Type</Label>
                    <Select
                      value={config.curve}
                      onValueChange={value =>
                        updateConfig({ curve: value as keyof typeof curveOptions })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(curveOptions).map(curve => (
                          <SelectItem key={curve} value={curve}>
                            {curve.replace('curve', '')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="opacity">Area Opacity</Label>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Display Options
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-legend">Show Legend</Label>
                    <Checkbox
                      id="show-legend"
                      checked={config.showLegend}
                      onCheckedChange={checked => updateConfig({ showLegend: !!checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-grid">Show Grid</Label>
                    <Checkbox
                      id="show-grid"
                      checked={config.showGrid}
                      onCheckedChange={checked => updateConfig({ showGrid: !!checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-points">Show Points</Label>
                    <Checkbox
                      id="show-points"
                      checked={config.showPoints}
                      onCheckedChange={checked => updateConfig({ showPoints: !!checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-stroke">Show Stroke</Label>
                    <Checkbox
                      id="show-stroke"
                      checked={config.showStroke}
                      onCheckedChange={checked => updateConfig({ showStroke: !!checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="stacked-mode">Stacked Mode</Label>
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

            {/* Size Presets */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Size Presets
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(sizePresets).map(([key, preset]) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => applySizePreset(key as keyof typeof sizePresets)}
                        className="text-xs"
                      >
                        {key === 'responsive' ? 'Auto' : `${preset.width}×${preset.height}`}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={exportConfig} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      onClick={() => document.getElementById('import-config')?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                  </div>
                  <input
                    id="import-config"
                    type="file"
                    accept=".json"
                    onChange={importConfig}
                    className="hidden"
                  />
                  <Button onClick={resetToDefault} variant="outline" className="w-full mt-3">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
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
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chart Preview
                  </h3>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <D3AreaChart
                    data={data}
                    width={config.width}
                    height={config.height}
                    margin={config.margin}
                    xAxisKey={config.xAxisKey}
                    yAxisKeys={config.yAxisKeys}
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
                    Area Series & Colors
                  </h3>
                  <Button onClick={addYAxisKey} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Series
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.yAxisKeys.map((key, index) => (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
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
                    <Database className="h-5 w-5" />
                    Data Editor
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditingData(!isEditingData)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      {isEditingData ? 'View' : 'Edit'}
                    </Button>
                    <Button onClick={addDataPoint} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Row
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingData ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {data.map((point, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded"
                        >
                          <div className="grid grid-cols-3 gap-2 flex-1">
                            <div>
                              <Label className="text-xs">{config.xAxisKey}</Label>
                              <Input
                                type="number"
                                value={point[config.xAxisKey]}
                                onChange={e =>
                                  updateDataPoint(index, config.xAxisKey, e.target.value)
                                }
                                className="h-8"
                              />
                            </div>
                            {config.yAxisKeys.map(key => (
                              <div key={key}>
                                <Label className="text-xs">{key}</Label>
                                <Input
                                  type="number"
                                  value={point[key]}
                                  onChange={e => updateDataPoint(index, key, e.target.value)}
                                  className="h-8"
                                />
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={() => removeDataPoint(index)}
                            size="sm"
                            variant="destructive"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Click "Edit" to modify chart data</p>
                      <p className="text-sm mt-1">{data.length} data points</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaChartEditor;
