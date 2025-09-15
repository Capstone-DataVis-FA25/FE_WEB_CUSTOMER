import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Table,
  X,
  Minus,
  Database,
  Edit3,
  Settings,
  RotateCcw,
  Upload,
  Download,
  Sliders,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import D3AreaChart from './D3AreaChart';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '../ui/toast-container';
import { convertArrayToChartData } from '@/utils/dataConverter';
import {
  sizePresets,
  type ColorConfig,
  curveOptions,
  type SeriesConfig,
  type ChartConfig,
  type FormatterConfig,
  type ChartDataPoint,
} from '../../types/chart';
import {
  getResponsiveDefaults,
  getResponsiveFontSize,
  isColumnAvailableForSeries,
} from '@/helpers/chart';

// Props for AreaChart Editor
export interface AreaChartEditorProps {
  initialArrayData?: (string | number)[][]; // Array data input
  initialConfig?: Partial<ChartConfig>;
  initialColors?: ColorConfig;
  initialFormatters?: Partial<FormatterConfig>;
  onConfigChange?: (config: ChartConfig) => void;
  onDataChange?: (data: ChartDataPoint[]) => void;
  onColorsChange?: (colors: ColorConfig) => void;
  onFormattersChange?: (formatters: FormatterConfig) => void;
  title?: string;
  description?: string;
}

const AreaChartEditor: React.FC<AreaChartEditorProps> = ({
  initialArrayData,
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
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Convert arrayData to ChartDataPoint[] if provided, or use sample data
  const processedInitialData = useMemo((): ChartDataPoint[] => {
    if (initialArrayData && initialArrayData.length > 0) {
      return convertArrayToChartData(initialArrayData);
    }

    // Default sample data for area chart when no data is provided
    return [
      { month: 1, sales: 120, marketing: 80, support: 40 },
      { month: 2, sales: 150, marketing: 95, support: 55 },
      { month: 3, sales: 180, marketing: 110, support: 70 },
      { month: 4, sales: 200, marketing: 125, support: 85 },
      { month: 5, sales: 165, marketing: 100, support: 60 },
      { month: 6, sales: 220, marketing: 140, support: 95 },
      { month: 7, sales: 250, marketing: 160, support: 110 },
      { month: 8, sales: 280, marketing: 180, support: 130 },
      { month: 9, sales: 310, marketing: 200, support: 145 },
      { month: 10, sales: 290, marketing: 185, support: 125 },
      { month: 11, sales: 320, marketing: 210, support: 155 },
      { month: 12, sales: 350, marketing: 230, support: 170 },
    ];
  }, [initialArrayData]);

  const responsiveDefaults = getResponsiveDefaults();

  // Default configuration
  const defaultConfig: ChartConfig = {
    width: responsiveDefaults.width,
    height: responsiveDefaults.height,
    margin: { top: 20, right: 40, bottom: 60, left: 80 },
    xAxisKey: Object.keys(processedInitialData[0] || {})[0] || 'month',
    yAxisKeys: Object.keys(processedInitialData[0] || {}).filter(
      key => typeof (processedInitialData[0] || {})[key] === 'number'
    ) || ['sales', 'marketing', 'support'],
    disabledLines: [],
    title: t('areaChart_editor_title') || 'Monthly Department Performance',
    xAxisLabel: t('areaChart_editor_xAxisLabel') || 'Month',
    yAxisLabel: t('areaChart_editor_yAxisLabel') || 'Performance Value',
    showLegend: true,
    showGrid: true,
    showPoints: false,
    showStroke: true,
    animationDuration: 1000,
    curve: 'curveMonotoneX',
    opacity: 0.7,
    stackedMode: true,
    // sensible defaults for the added fields
    xAxisStart: 'auto',
    yAxisStart: 'auto',
    lineWidth: 2,
    pointRadius: 3,
    gridOpacity: 0.3,
    legendPosition: 'bottom',
    xAxisRotation: 0,
    yAxisRotation: 0,
    showAxisLabels: true,
    showAxisTicks: true,
    enableZoom: false,
    showTooltip: true,
    theme: 'auto',
    backgroundColor: 'transparent',
    titleFontSize: 16,
    labelFontSize: 12,
    legendFontSize: 11,
    ...initialConfig,
  };

  const defaultColors: ColorConfig = {
    sales: { light: '#3b82f6', dark: '#60a5fa' },
    marketing: { light: '#f97316', dark: '#fb923c' },
    support: { light: '#10b981', dark: '#34d399' },
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
  const [config, setConfig] = useState<ChartConfig>(defaultConfig);
  const [colors, setColors] = useState<ColorConfig>(defaultColors);
  const [data, setData] = useState<ChartDataPoint[]>(processedInitialData);
  const [formatters, setFormatters] = useState<FormatterConfig>(defaultFormatters);
  const [showDataModal, setShowDataModal] = useState(false);
  const [tempData, setTempData] = useState<ChartDataPoint[]>(processedInitialData);

  // Collapse state for sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basicSettings: true,
    axisConfiguration: true,
    displayOptions: true,
    seriesManagement: true,
    dataEditor: true,
  });

  // Config management dropdown state
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);
  const configDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (configDropdownRef.current && !configDropdownRef.current.contains(event.target as Node)) {
        setShowConfigDropdown(false);
      }
    };

    if (showConfigDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showConfigDropdown]);

  // Synchronize tempData with data changes
  useEffect(() => {
    setTempData([...data]);
  }, [data]);

  // Toggle section collapse
  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Series management state
  const [seriesConfigs, setSeriesConfigs] = useState<SeriesConfig[]>(() =>
    config.yAxisKeys.map((key, index) => {
      const colorKeys = Object.keys(defaultColors);
      const colorIndex = index % colorKeys.length;
      const selectedColorKey = colorKeys[colorIndex];
      const selectedColor = defaultColors[selectedColorKey];

      return {
        id: `series-${index}`,
        name: key,
        dataColumn: key,
        color: selectedColor?.light || '#3b82f6',
        visible: !config.disabledLines.includes(key),
      };
    })
  );

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
  const updateConfig = (newConfig: Partial<ChartConfig>) => {
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

  // Helper to get available columns for series management
  const getAvailableColumns = () =>
    Object.keys(data[0] || {}).filter(
      k => k !== config.xAxisKey && !seriesConfigs.some(s => s.dataColumn === k)
    );

  const updateSeriesConfig = (seriesId: string, updates: Partial<SeriesConfig>) => {
    setSeriesConfigs(prev => {
      const oldSeries = prev.find(s => s.id === seriesId);
      const updatedSeries = prev.map(s => (s.id === seriesId ? { ...s, ...updates } : s));

      // Sync chart config yAxisKeys & disabledLines
      const allDataColumns = updatedSeries.map(s => s.dataColumn);
      const newDisabledLines = updatedSeries.filter(s => !s.visible).map(s => s.dataColumn);

      updateConfig({ yAxisKeys: allDataColumns, disabledLines: newDisabledLines });

      // If dataColumn changed, ensure colors mapping transfers
      if (updates.dataColumn && oldSeries && oldSeries.dataColumn !== updates.dataColumn) {
        const newColors = { ...colors };
        if (newColors[oldSeries.dataColumn]) {
          newColors[updates.dataColumn] = newColors[oldSeries.dataColumn];
          delete newColors[oldSeries.dataColumn];
        } else {
          newColors[updates.dataColumn] = {
            light: updates.color || '#6366f1',
            dark: updates.color || '#6366f1',
          };
        }
        updateColors(newColors);
      }

      if (updates.color && oldSeries) {
        const target = updates.dataColumn || oldSeries.dataColumn;
        updateColors({
          ...colors,
          [target]: { light: updates.color, dark: updates.color },
        });
      }

      return updatedSeries;
    });
  };

  const addSeries = () => {
    const available = getAvailableColumns();
    const newKey = available.length > 0 ? available[0] : `series${seriesConfigs.length + 1}`;
    // Add a new series config
    setSeriesConfigs(prev => {
      const newSeries: SeriesConfig = {
        id: `series-${Date.now()}`,
        name: newKey,
        dataColumn: newKey,
        color: '#6366f1',
        visible: true,
      };
      const updated = [...prev, newSeries];
      updateConfig({
        yAxisKeys: updated.map(s => s.dataColumn),
        disabledLines: updated.filter(s => !s.visible).map(s => s.dataColumn),
      });
      return updated;
    });

    // Add a color for the new series
    updateColors({ ...colors, [newKey]: { light: '#6366f1', dark: '#818cf8' } });

    // If the column doesn't exist in the data, add it with random values
    if (!data.some(d => Object.keys(d).includes(newKey))) {
      const newData = data.map(point => ({
        ...point,
        [newKey]: Math.floor(Math.random() * 100) + 50,
      }));
      updateData(newData);
    }
  };

  const removeSeries = (seriesId: string) => {
    const s = seriesConfigs.find(x => x.id === seriesId);
    if (!s || seriesConfigs.length <= 1) return;

    const newColors = { ...colors };
    delete newColors[s.dataColumn];
    updateColors(newColors);

    setSeriesConfigs(prev => {
      const updated = prev.filter(x => x.id !== seriesId);
      updateConfig({
        yAxisKeys: updated.map(s => s.dataColumn),
        disabledLines: updated.filter(s => !s.visible).map(s => s.dataColumn),
      });
      return updated;
    });
  };

  const moveSeriesUp = (seriesId: string) => {
    setSeriesConfigs(prev => {
      const idx = prev.findIndex(s => s.id === seriesId);
      if (idx > 0) {
        const updated = [...prev];
        [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
        updateConfig({
          yAxisKeys: updated.map(s => s.dataColumn),
          disabledLines: updated.filter(s => !s.visible).map(s => s.dataColumn),
        });
        return updated;
      }
      return prev;
    });
  };

  const moveSeriesDown = (seriesId: string) => {
    setSeriesConfigs(prev => {
      const idx = prev.findIndex(s => s.id === seriesId);
      if (idx >= 0 && idx < prev.length - 1) {
        const updated = [...prev];
        [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
        updateConfig({
          yAxisKeys: updated.map(s => s.dataColumn),
          disabledLines: updated.filter(s => !s.visible).map(s => s.dataColumn),
        });
        return updated;
      }
      return prev;
    });
  };

  // Export configuration to JSON (config only, no data)
  const exportConfigToJSON = () => {
    try {
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        config,
        colors,
        formatters,
        seriesConfigs: seriesConfigs.map(series => ({
          ...series,
          // Don't export the id since it will be regenerated on import
          id: undefined,
        })),
        // Include metadata for reference
        metadata: {
          chartType: 'area-chart',
          exportedFrom: 'AreaChartEditor',
          note: 'Configuration file - data not included',
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `area-chart-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess(t('areaChart_editor_configExported'));
    } catch (error) {
      console.error('Export error:', error);
      showError(t('areaChart_editor_invalidConfigFile'));
    }
  };

  // Reset configuration to default
  const resetToDefaultConfig = () => {
    try {
      // Reset to default configuration
      const resetConfig = {
        ...defaultConfig,
        xAxisKey: Object.keys(data[0] || {})[0] || 'x',
        yAxisKeys: Object.keys(data[0] || {}).slice(1) || ['y'],
      };

      updateConfig(resetConfig);
      updateColors(defaultColors);
      updateFormatters(defaultFormatters);

      // Reset series configs
      const resetSeriesConfigs = resetConfig.yAxisKeys.map((key, index) => {
        const colorKeys = Object.keys(defaultColors);
        const colorIndex = index % colorKeys.length;
        const selectedColorKey = colorKeys[colorIndex];
        const selectedColor = defaultColors[selectedColorKey];

        return {
          id: `series-${Date.now()}-${index}`,
          name: key,
          dataColumn: key,
          color: selectedColor.light,
          visible: true,
        };
      });

      setSeriesConfigs(resetSeriesConfigs);

      showSuccess(t('areaChart_editor_resetToDefault'));
    } catch (error) {
      console.error('Reset error:', error);
      showError(t('areaChart_editor_invalidConfigFile'));
    }
  };

  // Import configuration from JSON
  const importConfigFromJSON = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async event => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          const text = await file.text();
          const importedData = JSON.parse(text);

          // Basic validation
          if (
            !importedData.config ||
            !importedData.colors ||
            !importedData.formatters ||
            !importedData.seriesConfigs
          ) {
            throw new Error('Invalid config file structure');
          }

          updateConfig(importedData.config);
          updateColors(importedData.colors);
          updateFormatters(importedData.formatters);

          // Regenerate series configs with new IDs
          const importedSeries = importedData.seriesConfigs.map((series: any, index: number) => ({
            ...series,
            id: `series-${Date.now()}-${index}`,
          }));
          setSeriesConfigs(importedSeries);

          showSuccess(t('areaChart_editor_configImported'));
        } catch (parseError) {
          console.error('Import parse error:', parseError);
          showError(t('areaChart_editor_invalidConfigFile'));
        }
      };
      input.click();
    } catch (error) {
      console.error('Import error:', error);
      showError(t('areaChart_editor_invalidConfigFile'));
    }
  };

  // Small no-op effect to reference helper functions/refs so TS doesn't mark them as unused
  useEffect(() => {
    // referencing helpers/refs prevents "declared but its value is never read" TypeScript errors
    // No runtime effect.
    if (!configDropdownRef.current) {
      // touch functions to avoid unused warnings
      void addSeries;
      void removeSeries;
      void updateSeriesConfig;
      void moveSeriesUp;
      void moveSeriesDown;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="w-full px-2">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Editor */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader
                  className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
                  onClick={() => toggleSection('dataEditor')}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {t('areaChart_editor_dataEditor')}
                  </h3>
                  <div className="flex items-center gap-2">
                    {!collapsedSections.dataEditor && (
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          openDataModal();
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        {t('areaChart_editor_editData')}
                      </Button>
                    )}
                    {collapsedSections.dataEditor ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {!collapsedSections.dataEditor && (
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mt-2">
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <Table className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {t('areaChart_editor_dataPreview')}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                          {t('areaChart_editor_editDataDescription')}
                        </p>
                      </div>

                      {/* Table Preview */}
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                #
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {config.xAxisKey}
                              </th>
                              {config.yAxisKeys.map(key => (
                                <th
                                  key={key}
                                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                                >
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                            {data.slice(0, 5).map((point, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              >
                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                  {point[config.xAxisKey] as number}
                                </td>
                                {config.yAxisKeys.map(key => (
                                  <td
                                    key={key}
                                    className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                                  >
                                    {point[key] as number}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {data.length > 5 && (
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                          {t('areaChart_editor_dataPreviewMore', { total: data.length })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
            {/* Basic Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
                  onClick={() => toggleSection('basicSettings')}
                >
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {t('lineChart_editor_basicSettings')}
                    </h3>
                    <div className="flex items-center gap-2">
                      {!collapsedSections.basicSettings && (
                        <div className="relative" ref={configDropdownRef}>
                          <Button
                            onClick={e => {
                              e.stopPropagation();
                              setShowConfigDropdown(!showConfigDropdown);
                            }}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title={t('lineChart_editor_configManagement')}
                          >
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">
                              {t('lineChart_editor_configManagement')}
                            </span>
                            <ChevronDown className="h-3 w-3" />
                          </Button>

                          {/* Dropdown Menu */}
                          {showConfigDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-50 overflow-hidden">
                              <div className="py-2">
                                {/* Header */}
                                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    {t('lineChart_editor_configManagement')}
                                  </h4>
                                </div>

                                {/* Export/Import Actions */}
                                <div className="px-2 py-1">
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      exportConfigToJSON();
                                      setShowConfigDropdown(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md flex items-center gap-3 transition-colors"
                                  >
                                    <Download className="h-4 w-4 text-green-600" />
                                    <div>
                                      <div className="font-medium">
                                        {t('lineChart_editor_downloadConfig')}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('lineChart_editor_exportSettingsAsJSON')}
                                      </div>
                                    </div>
                                  </button>
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      importConfigFromJSON();
                                      setShowConfigDropdown(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md flex items-center gap-3 transition-colors"
                                  >
                                    <Upload className="h-4 w-4 text-blue-600" />
                                    <div>
                                      <div className="font-medium">
                                        {t('lineChart_editor_uploadConfig')}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('lineChart_editor_loadSettingsFromJSON')}
                                      </div>
                                    </div>
                                  </button>
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-600 mx-2"></div>

                                {/* Reset Action */}
                                <div className="px-2 py-1">
                                  <button
                                    onClick={e => {
                                      e.stopPropagation();
                                      resetToDefaultConfig();
                                      setShowConfigDropdown(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md flex items-center gap-3 transition-colors"
                                  >
                                    <RotateCcw className="h-4 w-4 text-orange-600" />
                                    <div>
                                      <div className="font-medium">
                                        {t('lineChart_editor_resetToDefault')}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {t('lineChart_editor_restoreDefaultSettings')}
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {collapsedSections.basicSettings ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {!collapsedSections.basicSettings && (
                  <CardContent className="space-y-4">
                    {/* Size Presets */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('lineChart_editor_sizePresets')}
                      </Label>
                      <div className="grid grid-cols-2 gap-2 mt-2 max-h overflow-y-auto">
                        {Object.entries(sizePresets).map(([key, preset]) => (
                          <Button
                            key={key}
                            variant={
                              (preset.width === config.width && preset.height === config.height) ||
                              (key === 'responsive' && preset.width === 0)
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => applySizePreset(key as keyof typeof sizePresets)}
                            className="text-xs h-8 justify-start hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            {t(preset.labelKey)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Width and Height */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('lineChart_editor_customSize')}
                      </Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">
                            {t('lineChart_editor_width')}
                          </Label>
                          <Input
                            type="number"
                            value={config.width}
                            onChange={e => {
                              const newWidth = parseInt(e.target.value);
                              if (!isNaN(newWidth) && newWidth > 0) {
                                updateConfig({ width: newWidth });
                              }
                            }}
                            className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            min="1"
                            step="10"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">
                            {t('lineChart_editor_height')}
                          </Label>
                          <Input
                            type="number"
                            value={config.height}
                            onChange={e => {
                              const newHeight = parseInt(e.target.value);
                              if (!isNaN(newHeight) && newHeight > 0) {
                                updateConfig({ height: newHeight });
                              }
                            }}
                            className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            min="1"
                            step="10"
                          />
                        </div>
                      </div>
                      <div className="text-center mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {t('lineChart_editor_currentSize')}: {config.width} × {config.height}px |{' '}
                          {t('lineChart_editor_ratio')}: {(config.width / config.height).toFixed(2)}
                          :1
                        </p>
                      </div>
                    </div>

                    {/* Padding Configuration */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('lineChart_editor_padding')}
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
                              {t('lineChart_editor_chartArea')}
                            </span>
                          </div>
                        </div>

                        {/* Padding Values Display */}
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div>
                              <span className="text-gray-600 dark:text-gray-300">
                                {t('lineChart_editor_top')}:
                              </span>
                              <div className="font-mono">{config.margin.top}px</div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-300">
                                {t('lineChart_editor_right')}:
                              </span>
                              <div className="font-mono">{config.margin.right}px</div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-300">
                                {t('lineChart_editor_bottom')}:
                              </span>
                              <div className="font-mono">{config.margin.bottom}px</div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-300">
                                {t('lineChart_editor_left')}:
                              </span>
                              <div className="font-mono">{config.margin.left}px</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('lineChart_editor_title_chart')}
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
                          {t('lineChart_editor_xAxisLabel')}
                        </Label>
                        <Input
                          value={config.xAxisLabel}
                          onChange={e => updateConfig({ xAxisLabel: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {t('lineChart_editor_yAxisLabel')}
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
                        {t('lineChart_editor_animationDuration')}
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
                        {t('lineChart_editor_curveType')}
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
                        {t('lineChart_editor_displayOptions')}
                      </Label>
                      <div className="flex items-center space-x-2 mt-1 mb-1">
                        <Checkbox
                          id="showLegend"
                          checked={config.showLegend}
                          onCheckedChange={checked => updateConfig({ showLegend: !!checked })}
                        />
                        <Label
                          htmlFor="showLegend"
                          className="text-sm font-medium text-gray-900 dark:text-gray-100"
                        >
                          {t('lineChart_editor_showLegend')}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 mb-1">
                        <Checkbox
                          id="showGrid"
                          checked={config.showGrid}
                          onCheckedChange={checked => updateConfig({ showGrid: !!checked })}
                        />
                        <Label
                          htmlFor="showGrid"
                          className="text-sm font-medium text-gray-900 dark:text-gray-100"
                        >
                          {t('lineChart_editor_showGrid')}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 mb-1">
                        <Checkbox
                          id="showPoints"
                          checked={config.showPoints}
                          onCheckedChange={checked => updateConfig({ showPoints: !!checked })}
                        />
                        <Label
                          htmlFor="showPoints"
                          className="text-sm font-medium text-gray-900 dark:text-gray-100"
                        >
                          {t('lineChart_editor_showPoints')}
                        </Label>
                      </div>

                      {/* Styling Configuration */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                          {t('lineChart_editor_defaultStyling')}
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Line Width */}
                          <div>
                            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {t('lineChart_editor_lineWidth')}
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={config.lineWidth}
                              onChange={e =>
                                updateConfig({ lineWidth: parseInt(e.target.value) || 2 })
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Point Size */}
                          <div>
                            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {t('lineChart_editor_pointSize')}
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max="15"
                              value={config.pointRadius}
                              onChange={e =>
                                updateConfig({ pointRadius: parseInt(e.target.value) || 4 })
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Chart Configuration */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                          {t('lineChart_editor_chartSettings')}
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Grid Opacity */}
                          <div>
                            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {t('lineChart_editor_gridOpacity')}
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="1"
                              step="0.1"
                              value={config.gridOpacity}
                              onChange={e =>
                                updateConfig({ gridOpacity: parseFloat(e.target.value) || 0.3 })
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Legend Position */}
                          <div>
                            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {t('lineChart_editor_legendPosition')}
                            </Label>
                            <select
                              value={config.legendPosition}
                              onChange={e =>
                                updateConfig({
                                  legendPosition: e.target.value as
                                    | 'top'
                                    | 'bottom'
                                    | 'left'
                                    | 'right',
                                })
                              }
                              className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="top">{t('lineChart_editor_top')}</option>
                              <option value="bottom">{t('lineChart_editor_bottom')}</option>
                              <option value="left">{t('lineChart_editor_left')}</option>
                              <option value="right">{t('lineChart_editor_right')}</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Configuration */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                          {t('lineChart_editor_interactiveOptions')}
                        </h4>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="showTooltip"
                              checked={config.showTooltip}
                              onCheckedChange={checked => updateConfig({ showTooltip: !!checked })}
                            />
                            <Label
                              htmlFor="showTooltip"
                              className="text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              {t('lineChart_editor_showTooltip')}
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="enableZoom"
                              checked={config.enableZoom}
                              onCheckedChange={checked => updateConfig({ enableZoom: !!checked })}
                            />
                            <Label
                              htmlFor="enableZoom"
                              className="text-sm font-medium text-gray-900 dark:text-gray-100"
                            >
                              {t('lineChart_editor_enableZoom')}
                            </Label>
                          </div>
                        </div>
                      </div>

                      {/* Theme Configuration */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                          {t('lineChart_editor_themeColors')}
                        </h4>

                        <div className="grid grid-cols-2 gap-4 mb-2">
                          {/* Theme */}
                          <div>
                            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {t('lineChart_editor_theme')}
                            </Label>
                            <select
                              value={config.theme}
                              onChange={e =>
                                updateConfig({ theme: e.target.value as 'light' | 'dark' | 'auto' })
                              }
                              className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="auto">{t('lineChart_editor_auto')}</option>
                              <option value="light">{t('lineChart_editor_light')}</option>
                              <option value="dark">{t('lineChart_editor_dark')}</option>
                            </select>
                          </div>

                          {/* Background Color */}
                          <div>
                            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {t('lineChart_editor_backgroundColor')}
                            </Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={
                                  config.backgroundColor === 'transparent'
                                    ? '#ffffff'
                                    : config.backgroundColor
                                }
                                onChange={e => updateConfig({ backgroundColor: e.target.value })}
                                className="h-10 flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateConfig({ backgroundColor: 'transparent' })}
                                className="px-3 h-10 text-xs"
                                title={t('lineChart_editor_resetToTransparent')}
                              >
                                {t('lineChart_editor_transparent')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Font Size Configuration */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                          {t('lineChart_editor_fontSizes')}
                        </h4>

                        <div className="grid grid-cols-3 gap-4">
                          {/* Title Font Size */}
                          <div>
                            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {t('lineChart_editor_titleSize')}
                            </Label>
                            <Input
                              type="number"
                              min="8"
                              max="36"
                              value={config.titleFontSize}
                              onChange={e =>
                                updateConfig({ titleFontSize: parseInt(e.target.value) || 16 })
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Label Font Size */}
                          <div>
                            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {t('lineChart_editor_labelSize')}
                            </Label>
                            <Input
                              type="number"
                              min="6"
                              max="24"
                              value={config.labelFontSize}
                              onChange={e =>
                                updateConfig({ labelFontSize: parseInt(e.target.value) || 12 })
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Legend Font Size */}
                          <div>
                            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {t('lineChart_editor_legendSize')}
                            </Label>
                            <Input
                              type="number"
                              min="6"
                              max="20"
                              value={config.legendFontSize}
                              onChange={e =>
                                updateConfig({ legendFontSize: parseInt(e.target.value) || 11 })
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
            {/* Axis Configuration & Formatters*/}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
                  onClick={() => toggleSection('axisConfiguration')}
                >
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Sliders className="h-5 w-5" />
                      {t('lineChart_editor_axisConfigurationFormatters')}
                    </h3>
                    {collapsedSections.axisConfiguration ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {!collapsedSections.axisConfiguration && (
                  <CardContent className="space-y-4">
                    {/* X-Axis Column Selection */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('lineChart_editor_xAxisColumn')}
                      </Label>
                      <select
                        value={config.xAxisKey}
                        onChange={e => updateConfig({ xAxisKey: e.target.value })}
                        className="mt-1 w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        {Object.keys(data[0] || {}).map(column => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* X-Axis Start Configuration */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('x_axis_start')}
                      </Label>
                      <div className="space-y-2 mt-2">
                        <select
                          value={
                            typeof config.xAxisStart === 'number' ? 'custom' : config.xAxisStart
                          }
                          onChange={e => {
                            if (e.target.value === 'custom') {
                              updateConfig({ xAxisStart: 0 });
                            } else {
                              updateConfig({ xAxisStart: e.target.value as 'auto' | 'zero' });
                            }
                          }}
                          className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="auto">{t('lineChart_editor_axisAutoFromMin')}</option>
                          <option value="zero">{t('lineChart_editor_axisZeroStart')}</option>
                          <option value="custom">{t('lineChart_editor_axisCustomValue')}</option>
                        </select>

                        {typeof config.xAxisStart === 'number' && (
                          <Input
                            type="number"
                            value={config.xAxisStart}
                            onChange={e => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                updateConfig({ xAxisStart: value });
                              }
                            }}
                            placeholder={t('lineChart_editor_enterStartValue')}
                            className="h-9 text-sm"
                          />
                        )}
                      </div>
                    </div>

                    {/* Y-Axis Start Configuration */}
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('y_axis_start')}
                      </Label>
                      <div className="space-y-2 mt-2">
                        <select
                          value={
                            typeof config.yAxisStart === 'number' ? 'custom' : config.yAxisStart
                          }
                          onChange={e => {
                            if (e.target.value === 'custom') {
                              updateConfig({ yAxisStart: 0 });
                            } else {
                              updateConfig({ yAxisStart: e.target.value as 'auto' | 'zero' });
                            }
                          }}
                          className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="auto">{t('lineChart_editor_axisAutoFromMin')}</option>
                          <option value="zero">{t('lineChart_editor_axisZeroStart')}</option>
                          <option value="custom">{t('lineChart_editor_axisCustomValue')}</option>
                        </select>

                        {typeof config.yAxisStart === 'number' && (
                          <Input
                            type="number"
                            value={config.yAxisStart}
                            onChange={e => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                updateConfig({ yAxisStart: value });
                              }
                            }}
                            placeholder={t('lineChart_editor_enterStartValue')}
                            className="h-9 text-sm"
                          />
                        )}
                      </div>
                    </div>

                    {/* Preview of current axis settings */}
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{t('x_axis_start')}:</span>
                          <span className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded">
                            {config.xAxisStart === 'auto'
                              ? 'Auto (min data)'
                              : config.xAxisStart === 'zero'
                                ? 'From 0'
                                : `From ${config.xAxisStart}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">{t('y_axis_start')}:</span>
                          <span className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded">
                            {config.yAxisStart === 'auto'
                              ? 'Auto (min data)'
                              : config.yAxisStart === 'zero'
                                ? 'From 0'
                                : `From ${config.yAxisStart}`}
                          </span>
                        </div>
                        <div className="text-center mt-2 pt-2 border-t border-blue-300 dark:border-blue-600">
                          <span className="text-blue-600 dark:text-blue-300 font-medium">
                            {t('lineChart_editor_chartWillUpdate')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Axis Labels & Appearance */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                        {t('lineChart_editor_axisLabelsAppearance')}
                      </h4>

                      <div className="space-y-4">
                        {/* Show Axis Labels */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showAxisLabels"
                            checked={config.showAxisLabels}
                            onCheckedChange={checked => updateConfig({ showAxisLabels: !!checked })}
                          />
                          <Label
                            htmlFor="showAxisLabels"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          >
                            {t('lineChart_editor_showAxisLabels')}
                          </Label>
                        </div>

                        {/* Show Axis Ticks */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="showAxisTicks"
                            checked={config.showAxisTicks}
                            onCheckedChange={checked => updateConfig({ showAxisTicks: !!checked })}
                          />
                          <Label
                            htmlFor="showAxisTicks"
                            className="text-sm font-medium text-gray-900 dark:text-gray-100"
                          >
                            {t('lineChart_editor_showAxisTicks')}
                          </Label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* X-Axis Rotation */}
                          <div>
                            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {t('lineChart_editor_xAxisLabelRotation')}
                            </Label>
                            <Input
                              type="number"
                              min="-90"
                              max="90"
                              value={config.xAxisRotation}
                              onChange={e =>
                                updateConfig({ xAxisRotation: parseInt(e.target.value) || 0 })
                              }
                              className="mt-1"
                            />
                          </div>

                          {/* Y-Axis Rotation */}
                          <div>
                            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {t('lineChart_editor_yAxisLabelRotation')}
                            </Label>
                            <Input
                              type="number"
                              min="-90"
                              max="90"
                              value={config.yAxisRotation}
                              onChange={e =>
                                updateConfig({ yAxisRotation: parseInt(e.target.value) || 0 })
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Formatters Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {t('lineChart_editor_formatters')}
                      </h4>
                      <div className="space-y-4">
                        {/* Y Axis Formatter */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
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
                              {t('lineChart_editor_yAxisFormatter')}
                            </Label>
                          </div>

                          {formatters.useYFormatter && (
                            <div className="space-y-2 ml-6">
                              <select
                                value={formatters.yFormatterType}
                                onChange={e =>
                                  updateFormatters({
                                    yFormatterType: e.target
                                      .value as FormatterConfig['yFormatterType'],
                                  })
                                }
                                className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              >
                                <option value="number">{t('lineChart_editor_number')}</option>
                                <option value="currency">{t('lineChart_editor_currency')}</option>
                                <option value="percentage">
                                  {t('lineChart_editor_percentage')}
                                </option>
                                <option value="decimal">{t('lineChart_editor_decimal')}</option>
                                <option value="scientific">
                                  {t('lineChart_editor_scientific')}
                                </option>
                                <option value="bytes">{t('lineChart_editor_bytes')}</option>
                                <option value="duration">{t('lineChart_editor_duration')}</option>
                                <option value="date">{t('lineChart_editor_date')}</option>
                                <option value="custom">{t('lineChart_editor_custom')}</option>
                              </select>

                              {formatters.yFormatterType === 'custom' && (
                                <Input
                                  placeholder="e.g., `${value.toFixed(2)}M`"
                                  value={formatters.customYFormatter}
                                  onChange={e =>
                                    updateFormatters({ customYFormatter: e.target.value })
                                  }
                                  className="text-sm"
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* X Axis Formatter */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
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
                              {t('lineChart_editor_xAxisFormatter')}
                            </Label>
                          </div>

                          {formatters.useXFormatter && (
                            <div className="space-y-2 ml-6">
                              <select
                                value={formatters.xFormatterType}
                                onChange={e =>
                                  updateFormatters({
                                    xFormatterType: e.target
                                      .value as FormatterConfig['xFormatterType'],
                                  })
                                }
                                className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              >
                                <option value="number">{t('lineChart_editor_number')}</option>
                                <option value="currency">{t('lineChart_editor_currency')}</option>
                                <option value="percentage">
                                  {t('lineChart_editor_percentage')}
                                </option>
                                <option value="decimal">{t('lineChart_editor_decimal')}</option>
                                <option value="scientific">
                                  {t('lineChart_editor_scientific')}
                                </option>
                                <option value="bytes">{t('lineChart_editor_bytes')}</option>
                                <option value="duration">{t('lineChart_editor_duration')}</option>
                                <option value="date">{t('lineChart_editor_date')}</option>
                                <option value="custom">{t('lineChart_editor_custom')}</option>
                              </select>

                              {formatters.xFormatterType === 'custom' && (
                                <Input
                                  placeholder="e.g., `${new Date(value).getFullYear()}`"
                                  value={formatters.customXFormatter}
                                  onChange={e =>
                                    updateFormatters({ customXFormatter: e.target.value })
                                  }
                                  className="text-sm"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
            {/* Series Management */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader
                  className="flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
                  onClick={() => toggleSection('seriesManagement')}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t('lineChart_editor_seriesManagement')} ({seriesConfigs.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    {!collapsedSections.seriesManagement && (
                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          addSeries();
                        }}
                        size="sm"
                        variant="outline"
                        className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={getAvailableColumns().length === 0}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('lineChart_editor_addSeries')}
                      </Button>
                    )}
                    {collapsedSections.seriesManagement ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {!collapsedSections.seriesManagement && (
                  <CardContent className="space-y-4">
                    {seriesConfigs.map((series, index) => (
                      <div key={series.id} className="relative group">
                        {/* Series Card */}
                        <div
                          className={`p-6 border-2 rounded-lg transition-all duration-200 ${
                            series.visible
                              ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 dark:border-blue-600'
                              : 'border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 opacity-60'
                          }`}
                        >
                          {/* Series Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 text-white text-sm font-bold rounded-full shadow-sm">
                                {index + 1}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={series.visible}
                                    onCheckedChange={checked =>
                                      updateSeriesConfig(series.id, { visible: !!checked })
                                    }
                                    className="w-4 h-4"
                                  />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('lineChart_editor_seriesVisible')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {seriesConfigs.length > 1 && (
                              <div className="flex items-center gap-1">
                                {/* Move Up Button */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => moveSeriesUp(series.id)}
                                  disabled={index === 0}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30"
                                  title="Move Up"
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>

                                {/* Move Down Button */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => moveSeriesDown(series.id)}
                                  disabled={index === seriesConfigs.length - 1}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-30"
                                  title="Move Down"
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>

                                {/* Delete Button */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeSeries(series.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title="Delete Series"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Series Configuration Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                {t('lineChart_editor_seriesName')}
                              </Label>
                              <Input
                                value={series.name}
                                onChange={e =>
                                  updateSeriesConfig(series.id, { name: e.target.value })
                                }
                                className="h-9 text-sm bg-white dark:bg-gray-800"
                                placeholder={t('lineChart_editor_seriesNamePlaceholder')}
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                {t('lineChart_editor_dataColumn')}
                              </Label>
                              <select
                                value={series.dataColumn}
                                onChange={e =>
                                  updateSeriesConfig(series.id, { dataColumn: e.target.value })
                                }
                                className="w-full h-9 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                {Object.keys(data[0] || {})
                                  .filter(key =>
                                    isColumnAvailableForSeries(
                                      seriesConfigs,
                                      config,
                                      key,
                                      series.id
                                    )
                                  )
                                  .map(column => (
                                    <option key={column} value={column}>
                                      {column}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>

                          {/* Color Configuration */}
                          <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {t('lineChart_editor_colorConfiguration')}
                            </Label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Light Theme Color */}
                              <div className="space-y-2">
                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                  {t('lineChart_editor_lightTheme')}
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="color"
                                    value={colors[series.dataColumn]?.light || series.color}
                                    onChange={e => {
                                      updateColors({
                                        ...colors,
                                        [series.dataColumn]: {
                                          ...colors[series.dataColumn],
                                          light: e.target.value,
                                        },
                                      });
                                      updateSeriesConfig(series.id, { color: e.target.value });
                                    }}
                                    className="w-12 h-9 p-1 border rounded cursor-pointer"
                                  />
                                  <Input
                                    value={colors[series.dataColumn]?.light || series.color}
                                    onChange={e => {
                                      updateColors({
                                        ...colors,
                                        [series.dataColumn]: {
                                          ...colors[series.dataColumn],
                                          light: e.target.value,
                                        },
                                      });
                                      updateSeriesConfig(series.id, { color: e.target.value });
                                    }}
                                    className="flex-1 h-9 text-sm bg-white dark:bg-gray-800"
                                    placeholder="#000000"
                                  />
                                </div>
                              </div>

                              {/* Dark Theme Color */}
                              <div className="space-y-2">
                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                  {t('lineChart_editor_darkTheme')}
                                </Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="color"
                                    value={colors[series.dataColumn]?.dark || series.color}
                                    onChange={e => {
                                      updateColors({
                                        ...colors,
                                        [series.dataColumn]: {
                                          ...colors[series.dataColumn],
                                          dark: e.target.value,
                                        },
                                      });
                                    }}
                                    className="w-12 h-9 p-1 border rounded cursor-pointer"
                                  />
                                  <Input
                                    value={colors[series.dataColumn]?.dark || series.color}
                                    onChange={e => {
                                      updateColors({
                                        ...colors,
                                        [series.dataColumn]: {
                                          ...colors[series.dataColumn],
                                          dark: e.target.value,
                                        },
                                      });
                                    }}
                                    className="flex-1 h-9 text-sm bg-white dark:bg-gray-800"
                                    placeholder="#000000"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Individual Series Styling */}
                          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                              {t('lineChart_editor_individualSeriesStyling')}
                            </Label>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              {/* Line Width */}
                              <div>
                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                  {t('lineChart_editor_lineWidth')}
                                </Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={series.lineWidth || config.lineWidth}
                                  onChange={e => {
                                    const value = parseInt(e.target.value);
                                    updateSeriesConfig(series.id, {
                                      lineWidth: value || undefined,
                                    });
                                  }}
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Point Radius */}
                              <div>
                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                  {t('lineChart_editor_pointSize')}
                                </Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="15"
                                  value={series.pointRadius || config.pointRadius}
                                  onChange={e => {
                                    const value = parseInt(e.target.value);
                                    updateSeriesConfig(series.id, {
                                      pointRadius: value || undefined,
                                    });
                                  }}
                                  className="h-8 text-sm"
                                />
                              </div>

                              {/* Line Style */}
                              <div>
                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                  {t('lineChart_editor_lineStyle')}
                                </Label>
                                <select
                                  value={series.lineStyle || 'solid'}
                                  onChange={e =>
                                    updateSeriesConfig(series.id, {
                                      lineStyle: e.target.value as 'solid' | 'dashed' | 'dotted',
                                    })
                                  }
                                  className="w-full h-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2"
                                >
                                  <option value="solid">{t('lineChart_editor_solid')}</option>
                                  <option value="dashed">{t('lineChart_editor_dashed')}</option>
                                  <option value="dotted">{t('lineChart_editor_dotted')}</option>
                                </select>
                              </div>

                              {/* Point Style */}
                              <div>
                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                  {t('lineChart_editor_pointStyle')}
                                </Label>
                                <select
                                  value={series.pointStyle || 'circle'}
                                  onChange={e =>
                                    updateSeriesConfig(series.id, {
                                      pointStyle: e.target.value as
                                        | 'circle'
                                        | 'square'
                                        | 'triangle'
                                        | 'diamond',
                                    })
                                  }
                                  className="w-full h-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2"
                                >
                                  <option value="circle">{t('lineChart_editor_circle')}</option>
                                  <option value="square">{t('lineChart_editor_square')}</option>
                                  <option value="triangle">{t('lineChart_editor_triangle')}</option>
                                  <option value="diamond">{t('lineChart_editor_diamond')}</option>
                                </select>
                              </div>

                              {/* Opacity */}
                              <div>
                                <Label className="text-xs text-gray-600 dark:text-gray-400">
                                  {t('lineChart_editor_opacityPercent')}
                                </Label>
                                <Input
                                  type="number"
                                  min="10"
                                  max="100"
                                  value={Math.round((series.opacity || 1) * 100)}
                                  onChange={e =>
                                    updateSeriesConfig(series.id, {
                                      opacity: parseInt(e.target.value) / 100 || 1,
                                    })
                                  }
                                  className="h-8 text-sm"
                                  placeholder="100"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Chart Preview & Data Editor */}
          <div className="lg:col-span-6 space-y-6">
            {/* Chart Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sticky top-4 z-10"
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
                    opacity={config.opacity}
                    stackedMode={config.stackedMode}
                    yAxisFormatter={getYAxisFormatter}
                    xAxisFormatter={getXAxisFormatter}
                    fontSize={getResponsiveFontSize(config)}
                  />
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
                      {t('areaChart_editor_editChartData')}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('areaChart_editor_editDataDescription')}
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
                    {t('areaChart_editor_addRow')}
                  </Button>
                  <Button
                    onClick={saveDataChanges}
                    size="sm"
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4" />
                    {t('areaChart_editor_saveChanges')}
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
                  <div className="text-xs">{t('areaChart_editor_dataEditTip')}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default AreaChartEditor;
