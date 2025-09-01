import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import D3LineChart from '@/components/charts/D3LineChart';
import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Download, 
  RefreshCw, 
  Palette, 
  BarChart3, 
  Plus, 
  Minus,
  Edit3,
  Trash2,
  Upload
} from 'lucide-react';
import * as d3 from 'd3';

// LineChart configuration interface
export interface LineChartConfig {
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
  animationDuration: number;
  curve: keyof typeof curveOptions;
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

// Props for LineChart Editor
export interface LineChartEditorProps {
  initialData: ChartDataPoint[];
  initialConfig?: Partial<LineChartConfig>;
  initialColors?: ColorConfig;
  initialFormatters?: Partial<FormatterConfig>;
  onConfigChange?: (config: LineChartConfig) => void;
  onDataChange?: (data: ChartDataPoint[]) => void;
  onColorsChange?: (colors: ColorConfig) => void;
  onFormattersChange?: (formatters: FormatterConfig) => void;
  title?: string;
  description?: string;
}

const LineChartEditor: React.FC<LineChartEditorProps> = ({
  initialData,
  initialConfig = {},
  initialColors = {},
  initialFormatters = {},
  onConfigChange,
  onDataChange,
  onColorsChange,
  onFormattersChange,
  title = 'LineChart Editor',
  description = 'Interactive line chart configuration and data editor'
}) => {
  // Default configuration
  const defaultConfig: LineChartConfig = {
    width: 800,
    height: 400,
    margin: { top: 20, right: 40, bottom: 60, left: 80 },
    xAxisKey: Object.keys(initialData[0] || {})[0] || 'x',
    yAxisKeys: Object.keys(initialData[0] || {}).filter(key => typeof (initialData[0] || {})[key] === 'number') || ['y'],
    title: 'Line Chart',
    xAxisLabel: 'X Axis',
    yAxisLabel: 'Y Axis',
    showLegend: true,
    showGrid: true,
    showPoints: true,
    animationDuration: 1000,
    curve: 'curveMonotoneX',
    ...initialConfig
  };

  const defaultColors: ColorConfig = {
    line1: { light: "#3b82f6", dark: "#60a5fa" },
    line2: { light: "#f97316", dark: "#fb923c" },
    line3: { light: "#10b981", dark: "#34d399" },
    ...initialColors
  };

  const defaultFormatters: FormatterConfig = {
    useYFormatter: false,
    useXFormatter: false,
    yFormatterType: 'number',
    xFormatterType: 'default',
    customYFormatter: '',
    customXFormatter: '',
    ...initialFormatters
  };

  // State management
  const [config, setConfig] = useState<LineChartConfig>(defaultConfig);
  const [colors, setColors] = useState<ColorConfig>(defaultColors);
  const [data, setData] = useState<ChartDataPoint[]>(initialData);
  const [formatters, setFormatters] = useState<FormatterConfig>(defaultFormatters);
  const [isEditingData, setIsEditingData] = useState(false);

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
            return new Function('value', `return ${formatters.customYFormatter}`) as (value: number) => string;
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
        return new Function('value', `return ${formatters.customXFormatter}`) as (value: number) => string;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [formatters]);

  // Update handlers
  const updateConfig = (newConfig: Partial<LineChartConfig>) => {
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

  // Data manipulation
  const addDataPoint = () => {
    const newPoint: ChartDataPoint = {
      [config.xAxisKey]: data.length > 0 ? Math.max(...data.map(d => d[config.xAxisKey] as number)) + 1 : 1,
    };
    
    config.yAxisKeys.forEach(key => {
      newPoint[key] = 100;
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

  // Y-axis keys management
  const addYAxisKey = () => {
    const newKey = `line${config.yAxisKeys.length + 1}`;
    updateConfig({
      yAxisKeys: [...config.yAxisKeys, newKey]
    });
    
    updateColors({
      ...colors,
      [newKey]: { light: "#6366f1", dark: "#818cf8" }
    });
    
    const newData = data.map(point => ({
      ...point,
      [newKey]: 100
    }));
    updateData(newData);
  };

  const removeYAxisKey = (keyToRemove: string) => {
    if (config.yAxisKeys.length <= 1) return;
    
    updateConfig({
      yAxisKeys: config.yAxisKeys.filter(key => key !== keyToRemove)
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
        [theme]: value
      }
    });
  };

  // Export/Import
  const exportConfig = () => {
    const configData = {
      config,
      colors,
      data,
      formatters
    };
    
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'line-chart-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const configData = JSON.parse(e.target?.result as string);
        if (configData.config) setConfig({ ...defaultConfig, ...configData.config });
        if (configData.colors) setColors({ ...defaultColors, ...configData.colors });
        if (configData.data) setData(configData.data);
        if (configData.formatters) setFormatters({ ...defaultFormatters, ...configData.formatters });
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
            <Settings className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
            {description}
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
                    <BarChart3 className="h-5 w-5" />
                    Basic Settings
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Width</Label>
                      <Input
                        type="number"
                        value={config.width}
                        onChange={(e) => updateConfig({ width: parseInt(e.target.value) || 800 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Height</Label>
                      <Input
                        type="number"
                        value={config.height}
                        onChange={(e) => updateConfig({ height: parseInt(e.target.value) || 400 })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <Input
                      value={config.title}
                      onChange={(e) => updateConfig({ title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">X Axis Label</Label>
                      <Input
                        value={config.xAxisLabel}
                        onChange={(e) => updateConfig({ xAxisLabel: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Y Axis Label</Label>
                      <Input
                        value={config.yAxisLabel}
                        onChange={(e) => updateConfig({ yAxisLabel: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">X Axis Key</Label>
                    <Input
                      value={config.xAxisKey}
                      onChange={(e) => updateConfig({ xAxisKey: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Animation Duration (ms)</Label>
                    <Input
                      type="number"
                      value={config.animationDuration}
                      onChange={(e) => updateConfig({ animationDuration: parseInt(e.target.value) || 1000 })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Curve Type</Label>
                    <select
                      value={config.curve}
                      onChange={(e) => updateConfig({ curve: e.target.value as keyof typeof curveOptions })}
                      className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {Object.keys(curveOptions).map((curve) => (
                        <option key={curve} value={curve}>
                          {curve.replace('curve', '')}
                        </option>
                      ))}
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Display Options</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showLegend"
                      checked={config.showLegend}
                      onCheckedChange={(checked) => updateConfig({ showLegend: !!checked })}
                    />
                    <Label htmlFor="showLegend" className="text-sm font-medium">Show Legend</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showGrid"
                      checked={config.showGrid}
                      onCheckedChange={(checked) => updateConfig({ showGrid: !!checked })}
                    />
                    <Label htmlFor="showGrid" className="text-sm font-medium">Show Grid</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showPoints"
                      checked={config.showPoints}
                      onCheckedChange={(checked) => updateConfig({ showPoints: !!checked })}
                    />
                    <Label htmlFor="showPoints" className="text-sm font-medium">Show Points</Label>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Formatters</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useYFormatter"
                        checked={formatters.useYFormatter}
                        onCheckedChange={(checked) => updateFormatters({ useYFormatter: !!checked })}
                      />
                      <Label htmlFor="useYFormatter" className="text-sm font-medium">Y-Axis Formatter</Label>
                    </div>

                    {formatters.useYFormatter && (
                      <div className="space-y-2 ml-6">
                        <select
                          value={formatters.yFormatterType}
                          onChange={(e) => updateFormatters({ yFormatterType: e.target.value as FormatterConfig['yFormatterType'] })}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="number">Number</option>
                          <option value="currency">Currency ($1.0K)</option>
                          <option value="percentage">Percentage (%)</option>
                          <option value="custom">Custom</option>
                        </select>

                        {formatters.yFormatterType === 'custom' && (
                          <Input
                            placeholder="e.g., `${value.toFixed(2)}M`"
                            value={formatters.customYFormatter}
                            onChange={(e) => updateFormatters({ customYFormatter: e.target.value })}
                            className="text-sm"
                          />
                        )}
                      </div>
                    )}
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
                  <div className="space-y-3">
                    <Button onClick={resetToDefault} className="w-full" variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset to Default
                    </Button>
                    <Button onClick={exportConfig} className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Config
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importConfig}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button className="w-full" variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Config
                      </Button>
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
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Live Preview
                  </h2>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <D3LineChart
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
                    animationDuration={config.animationDuration}
                    curve={curveOptions[config.curve]}
                    yAxisFormatter={getYAxisFormatter}
                    xAxisFormatter={getXAxisFormatter}
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
                    Line Configuration
                  </h3>
                  <Button onClick={addYAxisKey} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Line
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.yAxisKeys.map((key) => (
                    <div key={key} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: colors[key]?.light || '#6366f1' }}
                          />
                          <Label className="font-medium">{key}</Label>
                        </div>
                        {config.yAxisKeys.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeYAxisKey(key)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm">Light Theme Color</Label>
                          <Input
                            type="color"
                            value={colors[key]?.light || '#6366f1'}
                            onChange={(e) => updateColor(key, 'light', e.target.value)}
                            className="mt-1 h-10"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Dark Theme Color</Label>
                          <Input
                            type="color"
                            value={colors[key]?.dark || '#818cf8'}
                            onChange={(e) => updateColor(key, 'dark', e.target.value)}
                            className="mt-1 h-10"
                          />
                        </div>
                      </div>
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
                    <Edit3 className="h-5 w-5" />
                    Data Editor
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setIsEditingData(!isEditingData)} 
                      size="sm" 
                      variant="outline"
                    >
                      {isEditingData ? 'View' : 'Edit'}
                    </Button>
                    <Button onClick={addDataPoint} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Point
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingData ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {data.map((point, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
                            <div>
                              <Label className="text-xs text-gray-500">{config.xAxisKey}</Label>
                              <Input
                                type="number"
                                value={point[config.xAxisKey] as number}
                                onChange={(e) => updateDataPoint(index, config.xAxisKey, e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            {config.yAxisKeys.map((key) => (
                              <div key={key}>
                                <Label className="text-xs text-gray-500">{key}</Label>
                                <Input
                                  type="number"
                                  value={point[key] as number}
                                  onChange={(e) => updateDataPoint(index, key, e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeDataPoint(index)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Edit3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Click "Edit" to modify chart data</p>
                      <p className="text-sm mt-1">Current data points: {data.length}</p>
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

export default LineChartEditor;
