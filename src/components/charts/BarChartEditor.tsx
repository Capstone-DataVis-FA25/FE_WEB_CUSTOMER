import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import D3BarChart from '@/components/charts/D3BarChart';
import type { ChartDataPoint } from '@/components/charts/D3BarChart';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { containerVariants, cardVariants } from '@/theme/animation/animation.config';
import {
  Settings,
  Download,
  RefreshCw,
  Palette,
  BarChart3,
  Edit3,
  Eye,
  EyeOff,
  Type,
  Sliders,
  MessageSquare,
  Layout as LayoutIcon,
} from 'lucide-react';
import { datasets } from './data/data';

// BarChart configuration interface
export interface BarChartConfig {
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
  animationDuration: number;
  barType: 'grouped' | 'stacked';
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
export interface ColorConfig {
  [key: string]: {
    light: string;
    dark: string;
  };
}

// Props interface
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
  title,
  description,
}) => {
  const { t } = useTranslation();

  // Default configuration
  const defaultConfig: BarChartConfig = {
    width: 800,
    height: 400,
    margin: { top: 20, right: 40, bottom: 60, left: 80 },
    xAxisKey: Object.keys(initialData[0] || {})[0] || 'x',
    yAxisKeys: Object.keys(initialData[0] || {}).filter(
      key => typeof (initialData[0] || {})[key] === 'number'
    ) || ['y'],
    title: t('barChart_title_field', 'Bar Chart'),
    xAxisLabel: t('barChart_xAxisLabel', 'X Axis'),
    yAxisLabel: t('barChart_yAxisLabel', 'Y Axis'),
    showLegend: true,
    showGrid: true,
    animationDuration: 1000,
    barType: 'grouped',
  };

  // State management
  const [data, setData] = useState<ChartDataPoint[]>(initialData);
  const [config, setConfig] = useState<BarChartConfig>({ ...defaultConfig, ...initialConfig });
  const [colors, setColors] = useState<ColorConfig>(initialColors);
  const [formatters, setFormatters] = useState<FormatterConfig>({
    useYFormatter: false,
    useXFormatter: false,
    yFormatterType: 'number',
    xFormatterType: 'default',
    customYFormatter: '',
    customXFormatter: '',
    ...initialFormatters,
  });
  const [selectedDataset, setSelectedDataset] = useState<string>('sales');
  const [showDataTable, setShowDataTable] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'chartType' | 'refine' | 'annotate' | 'layout'>(
    'chartType'
  );

  // Helper functions
  const updateConfig = (updates: Partial<BarChartConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleDatasetChange = (datasetKey: string) => {
    setSelectedDataset(datasetKey);
    if (datasetKey !== 'custom' && datasets[datasetKey as keyof typeof datasets]) {
      const dataset = datasets[datasetKey as keyof typeof datasets];

      // Only use datasets that are compatible with bar charts (have xKey and yKeys)
      if ('xKey' in dataset && 'yKeys' in dataset) {
        const newData = dataset.data as ChartDataPoint[];
        const newConfig = {
          ...config,
          xAxisKey: dataset.xKey,
          yAxisKeys: dataset.yKeys,
          xAxisLabel: dataset.xLabel,
          yAxisLabel: dataset.yLabel,
          title: dataset.name,
        };

        setData(newData);
        setConfig(newConfig);
        setColors(dataset.colors || {});

        onDataChange?.(newData);
        onConfigChange?.(newConfig);
        onColorsChange?.(dataset.colors || {});
      }
    }
  };

  const resetToDefaults = () => {
    setConfig(defaultConfig);
    setColors({});
    setFormatters({
      useYFormatter: false,
      useXFormatter: false,
      yFormatterType: 'number',
      xFormatterType: 'default',
      customYFormatter: '',
      customXFormatter: '',
    });
    onConfigChange?.(defaultConfig);
    onColorsChange?.({});
  };

  const exportConfig = () => {
    const exportData = {
      config,
      colors,
      formatters,
      data,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bar-chart-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Formatter functions
  const getYAxisFormatter = useMemo(() => {
    if (!formatters.useYFormatter) return undefined;

    return (value: number) => {
      switch (formatters.yFormatterType) {
        case 'currency':
          return `$${value.toLocaleString()}`;
        case 'percentage':
          return `${value}%`;
        case 'custom':
          try {
            return new Function('value', `return \`${formatters.customYFormatter}\``)(value);
          } catch {
            return value.toString();
          }
        default:
          return value.toLocaleString();
      }
    };
  }, [formatters]);

  const getXAxisFormatter = useMemo(() => {
    if (!formatters.useXFormatter) return undefined;

    return (value: any) => {
      switch (formatters.xFormatterType) {
        case 'date':
          return new Date(value).toLocaleDateString();
        case 'custom':
          try {
            return new Function('value', `return \`${formatters.customXFormatter}\``)(value);
          } catch {
            return value.toString();
          }
        default:
          return value.toString();
      }
    };
  }, [formatters]);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {title || t('barChart_title')}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {description || t('barChart_description')}
          </p>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <D3BarChart
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
                animationDuration={config.animationDuration}
                yAxisFormatter={getYAxisFormatter}
                xAxisFormatter={getXAxisFormatter}
                barType={config.barType}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center"
        >
          <div className="bg-card/80 rounded-lg p-1 border border-border shadow-sm">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('chartType')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'chartType'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                {t('chartEditor_chartType')}
              </button>
              <button
                onClick={() => setActiveTab('refine')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'refine'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Sliders className="w-4 h-4" />
                {t('chartEditor_refine')}
              </button>
              <button
                onClick={() => setActiveTab('annotate')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'annotate'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {t('chartEditor_annotate')}
              </button>
              <button
                onClick={() => setActiveTab('layout')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'layout'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <LayoutIcon className="w-4 h-4" />
                {t('chartEditor_layout')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Controls Section */}
        {activeTab === 'chartType' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Dataset & Basic Configuration */}
            <div className="space-y-6">
              {/* Dataset Selection */}
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {t('barChart_datasetSelector')}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="dataset">{t('barChart_datasetLabel')}</Label>
                      <select
                        id="dataset"
                        value={selectedDataset}
                        onChange={e => handleDatasetChange(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      >
                        {Object.entries(datasets)
                          .filter(([_, dataset]) => 'xKey' in dataset && 'yKeys' in dataset)
                          .map(([key, dataset]) => (
                            <option key={key} value={key}>
                              {dataset.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Data Table Toggle */}
                    <div className="flex items-end">
                      <Button
                        onClick={() => setShowDataTable(!showDataTable)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        {showDataTable ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        {showDataTable
                          ? t('dataset_changeData', 'Hide Data Table')
                          : t('barChart_dataPreview', 'Show Data Table')}
                      </Button>
                    </div>

                    {/* Data Table */}
                    {showDataTable && (
                      <div className="mt-4 overflow-auto max-h-96 border border-border rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              {Object.keys(data[0] || {}).map(key => (
                                <th
                                  key={key}
                                  className="px-4 py-2 text-left font-medium text-foreground"
                                >
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.slice(0, 10).map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-t border-border">
                                {Object.values(row).map((value, colIndex) => (
                                  <td key={colIndex} className="px-4 py-2 text-foreground">
                                    {typeof value === 'number' ? value.toLocaleString() : value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Chart Type Selection */}
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Type className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {t('chartEditor_chartType')}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="barType">{t('barChart_barType')}</Label>
                      <select
                        id="barType"
                        value={config.barType}
                        onChange={e =>
                          updateConfig({ barType: e.target.value as 'grouped' | 'stacked' })
                        }
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      >
                        <option value="grouped">{t('barChart_grouped')}</option>
                        <option value="stacked">{t('barChart_stacked')}</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column: Axis Configuration */}
            <div className="space-y-6">
              {/* X Axis Configuration */}
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">X Axis</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="xAxisKey">{t('barChart_xAxisKey')}</Label>
                      <select
                        id="xAxisKey"
                        value={config.xAxisKey}
                        onChange={e => updateConfig({ xAxisKey: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      >
                        {Object.keys(data[0] || {}).map(key => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="xLabel">{t('barChart_xAxisLabel')}</Label>
                      <Input
                        id="xLabel"
                        value={config.xAxisLabel}
                        onChange={e => updateConfig({ xAxisLabel: e.target.value })}
                        placeholder={t('barChart_xAxisLabel')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Y Axis Configuration */}
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Y Axis</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="yLabel">{t('barChart_yAxisLabel')}</Label>
                      <Input
                        id="yLabel"
                        value={config.yAxisLabel}
                        onChange={e => updateConfig({ yAxisLabel: e.target.value })}
                        placeholder={t('barChart_yAxisLabel')}
                      />
                    </div>
                    <div>
                      <Label>{t('barChart_yAxisKeys')}</Label>
                      <div className="space-y-2 mt-2">
                        {Object.keys(data[0] || {})
                          .filter(key => typeof (data[0] || {})[key] === 'number')
                          .map(key => (
                            <div key={key} className="flex items-center space-x-2">
                              <Checkbox
                                id={`yAxis-${key}`}
                                checked={config.yAxisKeys.includes(key)}
                                onCheckedChange={checked => {
                                  if (checked) {
                                    updateConfig({ yAxisKeys: [...config.yAxisKeys, key] });
                                  } else {
                                    updateConfig({
                                      yAxisKeys: config.yAxisKeys.filter(k => k !== key),
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={`yAxis-${key}`} className="capitalize">
                                {key}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}

        {/* Refine Tab */}
        {activeTab === 'refine' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Basic Settings */}
            <div className="space-y-6">
              {/* Chart Settings */}
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {t('chartEditor_basicSettings')}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="width">{t('chartEditor_width')}</Label>
                        <Input
                          id="width"
                          type="number"
                          value={config.width}
                          onChange={e => updateConfig({ width: parseInt(e.target.value) || 800 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">{t('chartEditor_height')}</Label>
                        <Input
                          id="height"
                          type="number"
                          value={config.height}
                          onChange={e => updateConfig({ height: parseInt(e.target.value) || 400 })}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showLegend"
                          checked={config.showLegend}
                          onCheckedChange={checked => updateConfig({ showLegend: !!checked })}
                        />
                        <Label htmlFor="showLegend">{t('barChart_showLegend')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showGrid"
                          checked={config.showGrid}
                          onCheckedChange={checked => updateConfig({ showGrid: !!checked })}
                        />
                        <Label htmlFor="showGrid">{t('barChart_showGrid')}</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="animationDuration">
                        {t('chartEditor_animationDuration')}
                      </Label>
                      <Input
                        id="animationDuration"
                        type="number"
                        value={config.animationDuration}
                        onChange={e =>
                          updateConfig({ animationDuration: parseInt(e.target.value) || 1000 })
                        }
                        min="0"
                        max="5000"
                        step="100"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column: Colors */}
            <div className="space-y-6">
              {/* Color Configuration */}
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {t('barChart_colors')}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {config.yAxisKeys.map(key => (
                        <div key={key} className="flex items-center justify-between gap-3">
                          <Label className="capitalize text-sm font-medium">{key}</Label>
                          <input
                            type="color"
                            value={colors[key]?.light || '#3b82f6'}
                            onChange={e =>
                              setColors(prev => ({
                                ...prev,
                                [key]: {
                                  light: e.target.value,
                                  dark: e.target.value,
                                },
                              }))
                            }
                            className="w-8 h-8 rounded border border-border"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}

        {/* Annotate Tab */}
        {activeTab === 'annotate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Text Annotations */}
            <div className="space-y-6">
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {t('chartEditor_textLabels')}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">{t('barChart_title_field')}</Label>
                      <Input
                        id="title"
                        value={config.title}
                        onChange={e => updateConfig({ title: e.target.value })}
                        placeholder={t('chartEditor_chartTitle')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">{t('chartEditor_description')}</Label>
                      <textarea
                        id="description"
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                        rows={3}
                        placeholder={t('chartEditor_descriptionPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">{t('chartEditor_notes')}</Label>
                      <textarea
                        id="notes"
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                        rows={2}
                        placeholder={t('chartEditor_notesPlaceholder')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column: Data Source */}
            <div className="space-y-6">
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {t('chartEditor_dataSource')}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="dataSource">{t('chartEditor_dataSource')}</Label>
                      <Input id="dataSource" placeholder={t('chartEditor_dataSourcePlaceholder')} />
                    </div>
                    <div>
                      <Label htmlFor="dataLink">{t('chartEditor_dataLink')}</Label>
                      <Input id="dataLink" placeholder={t('chartEditor_dataLinkPlaceholder')} />
                    </div>
                    <div>
                      <Label htmlFor="byline">{t('chartEditor_byline')}</Label>
                      <Input id="byline" placeholder={t('chartEditor_bylinePlaceholder')} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Output */}
            <div className="space-y-6">
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <LayoutIcon className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {t('chartEditor_output')}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="locale">{t('chartEditor_outputLocale')}</Label>
                      <select
                        id="locale"
                        className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-foreground"
                      >
                        <option value="en-US">English (en-US)</option>
                        <option value="vi-VN">Tiếng Việt (vi-VN)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column: Footer & Export */}
            <div className="space-y-6">
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {t('chartEditor_footer')}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="dataDownload" defaultChecked />
                        <Label htmlFor="dataDownload">{t('chartEditor_dataDownload')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="imageDownload" />
                        <Label htmlFor="imageDownload">{t('chartEditor_imageDownload')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="embedLink" />
                        <Label htmlFor="embedLink">{t('chartEditor_embedLink')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="attribution" defaultChecked />
                        <Label htmlFor="attribution">{t('chartEditor_attribution')}</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="socialButtons" />
                        <Label htmlFor="socialButtons">{t('chartEditor_socialButtons')}</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Dataset & Configuration */}
          <div className="space-y-6">
            {/* Dataset Selection */}
            <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {t('barChart_datasetSelector')}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {/* Dataset Selector */}
                    <div>
                      <Label className="mb-3" htmlFor="dataset">
                        {t('barChart_datasetLabel')}
                      </Label>
                      <select
                        id="dataset"
                        value={selectedDataset}
                        onChange={e => handleDatasetChange(e.target.value)}
                        className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                      >
                        {Object.entries(datasets)
                          .filter(([_, dataset]) => 'xKey' in dataset && 'yKeys' in dataset)
                          .map(([key, dataset]) => (
                            <option key={key} value={key}>
                              {dataset.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Data Table Toggle */}
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => setShowDataTable(!showDataTable)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        {showDataTable ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        {showDataTable
                          ? 'Hide Data Table'
                          : t('barChart_dataPreview', 'Show Data Table')}
                      </Button>
                    </div>

                    {/* Data Table */}
                    {showDataTable && (
                      <div className="mt-4 overflow-auto max-h-96 border border-border rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              {Object.keys(data[0] || {}).map(key => (
                                <th
                                  key={key}
                                  className="px-4 py-2 text-left font-medium text-foreground"
                                >
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.slice(0, 10).map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-t border-border">
                                {Object.values(row).map((value, colIndex) => (
                                  <td key={colIndex} className="px-4 py-2 text-foreground">
                                    {typeof value === 'number'
                                      ? value.toLocaleString()
                                      : String(value)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Basic Configuration */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {t('barChart_configuration')}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Chart Title */}
                  <div>
                    <Label className="mb-3" htmlFor="title">
                      {t('barChart_title_field')}
                    </Label>
                    <Input
                      id="title"
                      value={config.title}
                      onChange={e => updateConfig({ title: e.target.value })}
                      placeholder="Enter chart title"
                      className="w-full"
                    />
                  </div>

                  {/* Chart Type */}
                  <div>
                    <Label className="mb-3" htmlFor="barType">
                      {t('barChart_barType')}
                    </Label>
                    <select
                      id="barType"
                      value={config.barType}
                      onChange={e =>
                        updateConfig({ barType: e.target.value as 'grouped' | 'stacked' })
                      }
                      className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="grouped">{t('barChart_grouped')}</option>
                      <option value="stacked">{t('barChart_stacked')}</option>
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showLegend"
                        checked={config.showLegend}
                        onCheckedChange={checked => updateConfig({ showLegend: !!checked })}
                      />
                      <Label className="mb-3" htmlFor="showLegend">
                        {t('barChart_showLegend')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showGrid"
                        checked={config.showGrid}
                        onCheckedChange={checked => updateConfig({ showGrid: !!checked })}
                      />
                      <Label htmlFor="showGrid">{t('barChart_showGrid')}</Label>
                    </div>
                  </div>

                  {/* Animation Duration */}
                  <div>
                    <Label className="mb-3" htmlFor="animation">
                      Animation Duration (ms)
                    </Label>
                    <Input
                      id="animation"
                      type="number"
                      value={config.animationDuration}
                      onChange={e =>
                        updateConfig({ animationDuration: parseInt(e.target.value) || 1000 })
                      }
                      min="0"
                      max="5000"
                      step="100"
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column: Axis Configuration */}
          <div className="space-y-6">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Axis Configuration</h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* X Axis Configuration */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">X Axis</h4>
                    <div>
                      <Label className="mb-3" htmlFor="xAxisLabel">
                        {t('barChart_xAxisLabel')}
                      </Label>
                      <Input
                        id="xAxisLabel"
                        value={config.xAxisLabel}
                        onChange={e => updateConfig({ xAxisLabel: e.target.value })}
                        placeholder="Enter X axis label"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="mb-3" htmlFor="xAxisKey">
                        {t('barChart_xAxisKey')}
                      </Label>
                      <select
                        id="xAxisKey"
                        value={config.xAxisKey}
                        onChange={e => updateConfig({ xAxisKey: e.target.value })}
                        className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                      >
                        {Object.keys(data[0] || {}).map(key => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Y Axis Configuration */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Y Axis</h4>
                    <div>
                      <Label className="mb-3" htmlFor="yAxisLabel">
                        {t('barChart_yAxisLabel')}
                      </Label>
                      <Input
                        id="yAxisLabel"
                        value={config.yAxisLabel}
                        onChange={e => updateConfig({ yAxisLabel: e.target.value })}
                        placeholder="Enter Y axis label"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="mb-3">{t('barChart_yAxisKeys')}</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {Object.keys(data[0] || {})
                          .filter(key => typeof (data[0] || {})[key] === 'number')
                          .map(key => (
                            <div key={key} className="flex items-center space-x-2">
                              <Checkbox
                                id={`yAxis-${key}`}
                                checked={config.yAxisKeys.includes(key)}
                                onCheckedChange={checked => {
                                  if (checked) {
                                    updateConfig({ yAxisKeys: [...config.yAxisKeys, key] });
                                  } else {
                                    updateConfig({
                                      yAxisKeys: config.yAxisKeys.filter(k => k !== key),
                                    });
                                  }
                                }}
                              />
                              <Label htmlFor={`yAxis-${key}`} className="text-sm">
                                {key}
                              </Label>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Color Configuration */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {t('barChart_colors')}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.yAxisKeys.map((key, index) => {
                    const currentColor = colors[key]?.light || `hsl(${index * 60}, 70%, 50%)`;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded border-2 border-border"
                          style={{ backgroundColor: currentColor }}
                        />
                        <Label className="flex-1 capitalize mb-3">{key}</Label>
                        <input
                          type="color"
                          value={currentColor}
                          onChange={e => {
                            const newColor = e.target.value;
                            setColors(prev => ({
                              ...prev,
                              [key]: { light: newColor, dark: newColor },
                            }));
                          }}
                          className="w-10 h-8 rounded border border-border cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Button onClick={resetToDefaults} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset to Defaults
          </Button>
          <Button onClick={exportConfig} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Configuration
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BarChartEditor;
