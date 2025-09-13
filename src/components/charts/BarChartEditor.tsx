import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Table,
  Save,
  X,
  Settings,
  Database,
  Sliders,
  TrendingUp,
  Edit3,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { convertArrayToChartData } from '@/utils/dataConverter';
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
  initialArrayData?: (string | number)[][]; // Array data input
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
  initialArrayData,
  initialConfig = {},
  initialColors = {},
  initialFormatters = {},
  onConfigChange,
  onDataChange,
  onColorsChange,
  onFormattersChange,
}) => {
  const { t } = useTranslation();

  // Convert arrayData to ChartDataPoint[] if provided
  const processedInitialData = useMemo((): ChartDataPoint[] => {
    if (initialArrayData && initialArrayData.length > 0) {
      return convertArrayToChartData(initialArrayData);
    }
    return [];
  }, [initialArrayData]);

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
    xAxisKey: Object.keys(processedInitialData[0] || {})[0] || 'x',
    yAxisKeys: Object.keys(processedInitialData[0] || {}).slice(1) || ['y'], // Lấy tất cả columns trừ column đầu tiên (xAxisKey)
    disabledBars: [], // Default to no disabled bars
    title: t('barChart_editor_title') || 'Bar Chart',
    xAxisLabel: t('barChart_editor_xAxisLabel') || 'X Axis',
    yAxisLabel: t('barChart_editor_yAxisLabel') || 'Y Axis',
    showLegend: true,
    showGrid: true,
    animationDuration: 1000,
    barType: 'grouped',
    ...initialConfig,
  };

  const defaultColors: ColorConfig = {
    // Sales data specific colors
    month: { light: '#374151', dark: '#9ca3af' },
    ecommerce: { light: '#16a34a', dark: '#22c55e' },
    retail: { light: '#9333ea', dark: '#a855f7' },
    wholesale: { light: '#c2410c', dark: '#ea580c' },
    // Generic bar colors
    bar1: { light: '#3b82f6', dark: '#60a5fa' }, // Blue
    bar2: { light: '#f97316', dark: '#fb923c' }, // Orange
    bar3: { light: '#10b981', dark: '#34d399' }, // Green
    bar4: { light: '#ef4444', dark: '#f87171' }, // Red
    bar5: { light: '#8b5cf6', dark: '#a78bfa' }, // Purple
    bar6: { light: '#06b6d4', dark: '#67e8f9' }, // Cyan
    bar7: { light: '#84cc16', dark: '#a3e635' }, // Lime
    bar8: { light: '#f59e0b', dark: '#fbbf24' }, // Amber
    bar9: { light: '#ec4899', dark: '#f472b6' }, // Pink
    bar10: { light: '#6366f1', dark: '#818cf8' }, // Indigo
    bar11: { light: '#14b8a6', dark: '#5eead4' }, // Teal
    bar12: { light: '#f43f5e', dark: '#fb7185' }, // Rose
    bar13: { light: '#a855f7', dark: '#c084fc' }, // Violet
    bar14: { light: '#22c55e', dark: '#4ade80' }, // Green-500
    bar15: { light: '#ff6b35', dark: '#ff8566' }, // Red-Orange
    bar16: { light: '#6d28d9', dark: '#8b5cf6' }, // Purple-700
    bar17: { light: '#059669', dark: '#10b981' }, // Emerald-600
    bar18: { light: '#dc2626', dark: '#ef4444' }, // Red-600
    bar19: { light: '#7c3aed', dark: '#a78bfa' }, // Violet-600
    bar20: { light: '#0891b2', dark: '#0ea5e9' }, // Sky-600
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
  const [data, setData] = useState<ChartDataPoint[]>(processedInitialData);
  const [formatters, setFormatters] = useState<FormatterConfig>(defaultFormatters);
  const [showDataModal, setShowDataModal] = useState(false);
  const [tempData, setTempData] = useState<ChartDataPoint[]>(processedInitialData);

  // Collapse state for sections - THÊM MỚI
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basicSettings: false, // Open basic settings by default
    axisConfiguration: true,
    displayOptions: true,
    seriesManagement: true,
    dataEditor: true,
  });

  // Config management dropdown state - THÊM MỚI
  const [showConfigDropdown, setShowConfigDropdown] = useState(false);
  const configDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside - THÊM MỚI
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

  // Toggle section collapse - THÊM MỚI
  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

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
    // Handle both string and number values based on the key
    let processedValue: string | number;
    if (key === config.xAxisKey) {
      // X-axis might be string or number
      processedValue = isNaN(Number(value)) ? value : Number(value);
    } else {
      // Y-axis values should be numbers
      processedValue = parseFloat(value) || 0;
    }
    newTempData[index] = { ...newTempData[index], [key]: processedValue };
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

  // Export config to JSON file
  const exportConfigToJSON = () => {
    const exportData = {
      config,
      colors,
      formatters,
      timestamp: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `bar-chart-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import config from JSON file
  const importConfigFromJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async event => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedData = JSON.parse(text);

        if (importedData.config) {
          setConfig(importedData.config);
        }
        if (importedData.colors) {
          setColors(importedData.colors);
        }
        if (importedData.formatters) {
          setFormatters(importedData.formatters);
        }
      } catch (error) {
        console.error('Import error:', error);
      }
    };
    input.click();
  };

  // Reset to default configuration
  const resetToDefaultConfig = () => {
    setConfig({
      title: 'Bar Chart',
      xAxisKey: 'name',
      yAxisKeys: ['value'],
      width: 800,
      height: 400,
      margin: { top: 20, right: 30, bottom: 40, left: 40 },
      xAxisLabel: '',
      yAxisLabel: '',
      showLegend: true,
      showGrid: true,
      animationDuration: 750,
      disabledBars: [],
      barType: 'grouped',
    });
    setColors({
      value: { light: '#3b82f6', dark: '#60a5fa' },
    });
    setFormatters({
      useYFormatter: true,
      useXFormatter: true,
      yFormatterType: 'number',
      xFormatterType: 'number',
      customYFormatter: '',
      customXFormatter: '',
    });
  };

  // Apply color preset
  const applyColorPreset = (preset: 'default' | 'warm' | 'cool' | 'pastel') => {
    const colorPresets = {
      default: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
      warm: ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a'],
      cool: ['#0ea5e9', '#0891b2', '#059669', '#7c3aed', '#c026d3', '#db2777'],
      pastel: ['#93c5fd', '#fca5a5', '#86efac', '#fde047', '#c4b5fd', '#67e8f9'],
    };

    const colors = colorPresets[preset];
    const newColors: ColorConfig = {};

    config.yAxisKeys.forEach((key, index) => {
      const baseColor = colors[index % colors.length];
      newColors[key] = {
        light: baseColor,
        dark: baseColor,
      };
    });

    setColors(newColors);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="w-full px-2">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Configuration Panel - SIDEBAR BÊN TRÁI */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. DATA EDITOR SECTION */}
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
                    {t('barChart_editor_dataEditor', 'Chỉnh sửa dữ liệu')}
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
                        {t('barChart_editor_editData', 'Edit')}
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
                            {t('barChart_editor_dataPreview', 'Data Preview')}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                          {t('barChart_editor_editDataDescription', 'Click edit to modify data')}
                        </p>

                        {/* Data Preview Table */}
                        {data && data.length > 0 && (
                          <div className="mt-3 max-h-48 overflow-auto">
                            <table className="w-full text-xs border border-gray-200 dark:border-gray-600">
                              <thead>
                                <tr className="bg-gray-100 dark:bg-gray-700">
                                  {Object.keys(data[0]).map(key => (
                                    <th
                                      key={key}
                                      className="px-2 py-1 text-left border border-gray-200 dark:border-gray-600"
                                    >
                                      {key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {data.slice(0, 5).map((row, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-600"
                                  >
                                    {Object.values(row).map((value, valueIndex) => (
                                      <td
                                        key={valueIndex}
                                        className="px-2 py-1 border border-gray-200 dark:border-gray-600"
                                      >
                                        {String(value)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                                {data.length > 5 && (
                                  <tr>
                                    <td
                                      colSpan={Object.keys(data[0]).length}
                                      className="px-2 py-1 text-center text-gray-500 italic"
                                    >
                                      ... và {data.length - 5} dòng khác
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* 2. BASIC SETTINGS SECTION */}
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
                      {t('barChart_editor_basicSettings', 'Cài đặt cơ bản')}
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
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Config
                          </Button>
                          {showConfigDropdown && (
                            <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                              <Button
                                onClick={() => {
                                  exportConfigToJSON();
                                  setShowConfigDropdown(false);
                                }}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Export Config
                              </Button>
                              <Button
                                onClick={() => {
                                  importConfigFromJSON();
                                  setShowConfigDropdown(false);
                                }}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Import Config
                              </Button>
                              <Button
                                onClick={() => {
                                  resetToDefaultConfig();
                                  setShowConfigDropdown(false);
                                }}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start"
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset to Default
                              </Button>
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
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Kích thước có sẵn
                      </Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                          onClick={() => updateConfig({ width: 300, height: 200 })}
                          variant={
                            config.width === 300 && config.height === 200 ? 'default' : 'outline'
                          }
                          size="sm"
                          className="text-xs h-8"
                        >
                          Nhỏ (300x200)
                        </Button>
                        <Button
                          onClick={() => updateConfig({ width: 400, height: 250 })}
                          variant={
                            config.width === 400 && config.height === 250 ? 'default' : 'outline'
                          }
                          size="sm"
                          className="text-xs h-8"
                        >
                          Nhỏ vừa (400x250)
                        </Button>
                        <Button
                          onClick={() => updateConfig({ width: 600, height: 375 })}
                          variant={
                            config.width === 600 && config.height === 375 ? 'default' : 'outline'
                          }
                          size="sm"
                          className="text-xs h-8"
                        >
                          Trung bình (600x375)
                        </Button>
                        <Button
                          onClick={() => updateConfig({ width: 800, height: 500 })}
                          variant={
                            config.width === 800 && config.height === 500 ? 'default' : 'outline'
                          }
                          size="sm"
                          className="text-xs h-8"
                        >
                          Lớn (800x500)
                        </Button>
                        <Button
                          onClick={() => updateConfig({ width: 1000, height: 625 })}
                          variant={
                            config.width === 1000 && config.height === 625 ? 'default' : 'outline'
                          }
                          size="sm"
                          className="text-xs h-8"
                        >
                          Rất lớn (1000x625)
                        </Button>
                        <Button
                          onClick={() => updateConfig({ width: 1200, height: 400 })}
                          variant={
                            config.width === 1200 && config.height === 400 ? 'default' : 'outline'
                          }
                          size="sm"
                          className="text-xs h-8"
                        >
                          Rộng (1200x400)
                        </Button>
                        <Button
                          onClick={() => updateConfig({ width: 1400, height: 350 })}
                          variant={
                            config.width === 1400 && config.height === 350 ? 'default' : 'outline'
                          }
                          size="sm"
                          className="text-xs h-8"
                        >
                          Siêu rộng (1400x350)
                        </Button>
                        <Button
                          onClick={() => updateConfig({ width: 500, height: 500 })}
                          variant={
                            config.width === 500 && config.height === 500 ? 'default' : 'outline'
                          }
                          size="sm"
                          className="text-xs h-8"
                        >
                          Vuông (500x500)
                        </Button>
                      </div>
                    </div>

                    {/* Custom Size */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Kích thước tùy chỉnh
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">
                            Chiều rộng
                          </Label>
                          <Input
                            type="number"
                            value={config.width}
                            onChange={e => updateConfig({ width: parseInt(e.target.value) || 600 })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">
                            Chiều cao
                          </Label>
                          <Input
                            type="number"
                            value={config.height}
                            onChange={e =>
                              updateConfig({ height: parseInt(e.target.value) || 400 })
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Chart Title */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Tiêu đề biểu đồ
                      </Label>
                      <Input
                        value={config.title}
                        onChange={e => updateConfig({ title: e.target.value })}
                        placeholder="Nhập tiêu đề..."
                      />
                    </div>

                    {/* Axis Labels */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Nhãn trục X
                        </Label>
                        <Input
                          value={config.xAxisLabel}
                          onChange={e => updateConfig({ xAxisLabel: e.target.value })}
                          placeholder="Nhãn X..."
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">
                          Nhãn trục Y
                        </Label>
                        <Input
                          value={config.yAxisLabel}
                          onChange={e => updateConfig({ yAxisLabel: e.target.value })}
                          placeholder="Nhãn Y..."
                        />
                      </div>
                    </div>

                    {/* Display Options */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showLegend"
                          checked={config.showLegend}
                          onCheckedChange={checked => updateConfig({ showLegend: !!checked })}
                        />
                        <Label htmlFor="showLegend" className="text-sm">
                          Hiển thị chú thích
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showGrid"
                          checked={config.showGrid}
                          onCheckedChange={checked => updateConfig({ showGrid: !!checked })}
                        />
                        <Label htmlFor="showGrid" className="text-sm">
                          Hiển thị lưới
                        </Label>
                      </div>
                    </div>

                    {/* Bar Type */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Kiểu cột
                      </Label>
                      <select
                        value={config.barType}
                        onChange={e =>
                          updateConfig({ barType: e.target.value as 'grouped' | 'stacked' })
                        }
                        className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="grouped">Nhóm</option>
                        <option value="stacked">Xếp chồng</option>
                      </select>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* 3. AXIS CONFIGURATION SECTION */}
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
                      {t('barChart_editor_axisConfiguration', 'Cấu Hình Trục & Định Dạng')}
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
                    {/* X-Axis Key Selection */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Khóa trục X
                      </Label>
                      <select
                        value={config.xAxisKey}
                        onChange={e => updateConfig({ xAxisKey: e.target.value })}
                        className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {Object.keys(data[0] || {}).map(key => (
                          <option key={key} value={key}>
                            {key}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Animation Duration */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Thời gian hoạt ảnh (ms)
                      </Label>
                      <Input
                        type="number"
                        value={config.animationDuration}
                        onChange={e =>
                          updateConfig({ animationDuration: parseInt(e.target.value) || 750 })
                        }
                        className="w-full"
                        min="0"
                        max="3000"
                        step="250"
                      />
                    </div>

                    {/* Margin Configuration */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                        Lề biểu đồ
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">Trên</Label>
                          <Input
                            type="number"
                            value={config.margin.top}
                            onChange={e =>
                              updateConfig({
                                margin: { ...config.margin, top: parseInt(e.target.value) || 0 },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">Phải</Label>
                          <Input
                            type="number"
                            value={config.margin.right}
                            onChange={e =>
                              updateConfig({
                                margin: { ...config.margin, right: parseInt(e.target.value) || 0 },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">Dưới</Label>
                          <Input
                            type="number"
                            value={config.margin.bottom}
                            onChange={e =>
                              updateConfig({
                                margin: { ...config.margin, bottom: parseInt(e.target.value) || 0 },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">Trái</Label>
                          <Input
                            type="number"
                            value={config.margin.left}
                            onChange={e =>
                              updateConfig({
                                margin: { ...config.margin, left: parseInt(e.target.value) || 0 },
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Formatter Options */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="useYFormatter"
                            checked={formatters.useYFormatter}
                            onCheckedChange={checked =>
                              updateFormatters({ useYFormatter: !!checked })
                            }
                          />
                          <Label htmlFor="useYFormatter" className="text-sm">
                            Định dạng trục Y
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
                            <option value="number">Số</option>
                            <option value="currency">Tiền tệ</option>
                            <option value="percentage">Phần trăm</option>
                            <option value="decimal">Thập phân</option>
                          </select>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id="useXFormatter"
                            checked={formatters.useXFormatter}
                            onCheckedChange={checked =>
                              updateFormatters({ useXFormatter: !!checked })
                            }
                          />
                          <Label htmlFor="useXFormatter" className="text-sm">
                            Định dạng trục X
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
                            <option value="string">Chuỗi</option>
                            <option value="number">Số</option>
                            <option value="date">Ngày</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* 4. SERIES MANAGEMENT SECTION */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
                  onClick={() => toggleSection('seriesManagement')}
                >
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      {t('barChart_editor_seriesManagement', 'Quản Lý Chuỗi Dữ Liệu')} (
                      {config.yAxisKeys.length})
                    </h3>
                    {collapsedSections.seriesManagement ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {!collapsedSections.seriesManagement && (
                  <CardContent className="space-y-4">
                    {/* Y-Axis Keys Management */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Chuỗi dữ liệu ({config.yAxisKeys.length})
                        </Label>
                        <Button onClick={addYAxisKey} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Thêm
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {config.yAxisKeys.map((key, index) => (
                          <div
                            key={key}
                            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
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
                                  backgroundColor:
                                    colors[key]?.light || `hsl(${index * 60}, 70%, 50%)`,
                                  borderColor: colors[key]?.dark || `hsl(${index * 60}, 70%, 40%)`,
                                }}
                              />
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {key}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={colors[key]?.light || `hsl(${index * 60}, 70%, 50%)`}
                                onChange={e => updateColor(key, 'light', e.target.value)}
                                className="w-8 h-8 border rounded cursor-pointer"
                                title="Màu sáng"
                              />
                              <input
                                type="color"
                                value={colors[key]?.dark || `hsl(${index * 60}, 70%, 40%)`}
                                onChange={e => updateColor(key, 'dark', e.target.value)}
                                className="w-8 h-8 border rounded cursor-pointer"
                                title="Màu tối"
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
                      </div>
                    </div>

                    {/* Color Preset Buttons */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Bảng màu có sẵn
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => applyColorPreset('default')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Mặc định
                        </Button>
                        <Button
                          onClick={() => applyColorPreset('warm')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Ấm áp
                        </Button>
                        <Button
                          onClick={() => applyColorPreset('cool')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Mát mẻ
                        </Button>
                        <Button
                          onClick={() => applyColorPreset('pastel')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Pastel
                        </Button>
                      </div>
                    </div>

                    {/* Series Statistics */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>Tổng chuỗi: {config.yAxisKeys.length}</div>
                      <div>
                        Đang hiển thị: {config.yAxisKeys.length - config.disabledBars.length}
                      </div>
                      <div>Đã ẩn: {config.disabledBars.length}</div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Chart Display Area - BÊN PHẢI */}
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
                  {/* Chart Title - Always Visible */}
                  {config.title && (
                    <div className="mb-4 text-center">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {config.title}
                      </h3>
                    </div>
                  )}
                  <D3BarChart
                    data={data}
                    width={config.width}
                    height={config.height}
                    margin={config.margin}
                    xAxisKey={config.xAxisKey}
                    yAxisKeys={config.yAxisKeys.filter(key => !config.disabledBars.includes(key))}
                    colors={colors}
                    title=""
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
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {t('barChart_editor_editChartData', 'Edit Chart Data')}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t(
                        'barChart_editor_editDataDirectly',
                        'Edit data directly in the table below'
                      )}
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
                    {t('barChart_editor_addRow', 'Add Row')}
                  </Button>
                  <Button
                    onClick={saveDataChanges}
                    size="sm"
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4" />
                    {t('barChart_editor_saveChanges', 'Save Changes')}
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
                          <th className="w-12 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                            #
                          </th>
                          {tempData.length > 0 &&
                            Object.keys(tempData[0]).map(key => (
                              <th
                                key={key}
                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 min-w-[120px]"
                              >
                                {key}
                              </th>
                            ))}
                          <th className="w-12 px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {tempData.map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">
                              {rowIndex + 1}
                            </td>
                            {Object.entries(row).map(([key, value]) => (
                              <td
                                key={key}
                                className="px-1 py-1 border-r border-gray-200 dark:border-gray-600"
                              >
                                <Input
                                  value={value?.toString() || ''}
                                  onChange={e => updateTempDataPoint(rowIndex, key, e.target.value)}
                                  className="h-8 text-sm border-0 bg-transparent focus:bg-white dark:focus:bg-gray-700 focus:ring-1 focus:ring-blue-500"
                                  placeholder={`Enter ${key}`}
                                />
                              </td>
                            ))}
                            <td className="px-3 py-2">
                              <Button
                                onClick={() => removeTempDataPoint(rowIndex)}
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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

                {/* Data Summary */}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {tempData.length} {t('lineChart_editor_rows', 'rows')} ×{' '}
                    {tempData.length > 0 ? Object.keys(tempData[0]).length : 0}{' '}
                    {t('lineChart_editor_columns', 'columns')}
                  </span>
                  <span className="text-xs">
                    {t(
                      'lineChart_editor_tipUseTabNavigation',
                      'Tip: Use Tab to navigate between cells'
                    )}
                  </span>
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
