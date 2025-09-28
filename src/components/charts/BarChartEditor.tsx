import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Table,
  Save,
  X,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Camera,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/useToast';
import { convertArrayToChartData } from '@/utils/dataConverter';
import D3BarChart from './D3BarChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ToastContainer from '@/components/ui/toast-container';

import {
  sizePresets,
  type ChartDataPoint,
  type BarChartConfig,
  type ColorConfig,
  type FormatterConfig,
} from '@/types/chart';
import {
  DataEditorSection,
  BasicSettingsSection,
  ChartSettingsSection,
  AxisConfigurationSection,
  SeriesManagement,
} from '@/components/charts/ChartEditorShared';

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
  const { toasts, showSuccess, showError, removeToast } = useToast();

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
    xAxisStart: 'auto', // Default to auto
    yAxisStart: 'auto', // Default to auto

    // New styling configs defaults
    barWidth: 0,
    barSpacing: 4,
    gridOpacity: 0.3,
    legendPosition: 'bottom',

    // New axis configs defaults
    xAxisRotation: 0,
    yAxisRotation: 0,
    showAxisLabels: true,
    showAxisTicks: true,

    // New interaction configs defaults
    enableZoom: false,
    enablePan: false,
    zoomExtent: 8,
    showTooltip: true,

    // New visual configs defaults
    theme: 'auto',
    backgroundColor: 'transparent',
    titleFontSize: 16,
    labelFontSize: 12,
    legendFontSize: 11,

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

  // Series management state (like LineChart): each series maps to a data column
  type SeriesConfig = {
    id: string;
    name: string;
    dataColumn: string;
    color: string;
    visible: boolean;
  };

  const [seriesConfigs, setSeriesConfigs] = useState<SeriesConfig[]>(() => {
    const colorKeys = Object.keys(defaultColors);
    return (defaultConfig.yAxisKeys || []).map((key, index) => {
      const colorKey = colorKeys[index % colorKeys.length];
      const selected = defaultColors[colorKey] || { light: '#3b82f6', dark: '#60a5fa' };
      return {
        id: `series-${index}`,
        name: key,
        dataColumn: key,
        color: selected.light,
        visible: !defaultConfig.disabledBars?.includes?.(key),
      };
    });
  });

  // Collapse state for sections - THÊM MỚI
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basicSettings: true, // Open basic settings by default
    chartSettings: true,
    axisConfiguration: true,
    displayOptions: true,
    seriesManagement: true,
    dataEditor: true,
    importExport: true, // Add missing section
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

  // Helper: shallow array equality
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arraysEqual = (a: any[], b: any[]) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

  // Keep config.yAxisKeys and disabledBars in sync with seriesConfigs
  useEffect(() => {
    const yKeys = seriesConfigs.map(s => s.dataColumn);
    const disabled = seriesConfigs.filter(s => !s.visible).map(s => s.dataColumn);
    if (!arraysEqual(yKeys, config.yAxisKeys) || !arraysEqual(disabled, config.disabledBars)) {
      updateConfig({ yAxisKeys: yKeys, disabledBars: disabled });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesConfigs]);

  // Effect to sync data when initialArrayData changes
  useEffect(() => {
    console.log('BarChart Process initial data', processedInitialData);
    console.log('BarChart Data tracking before update', data);

    // Only update data state if processedInitialData has actually changed
    if (
      processedInitialData.length > 0 &&
      JSON.stringify(processedInitialData) !== JSON.stringify(data)
    ) {
      setData(processedInitialData);
      setTempData(processedInitialData);
      console.log(
        'BarChart Updated data state to match processedInitialData',
        processedInitialData
      );
    }
  }, [processedInitialData]); // Only run when processedInitialData changes

  // Effect to update config when data structure changes
  useEffect(() => {
    console.log('BarChart Config data structure effect running');
    console.log('BarChart Current data:', data);
    console.log('BarChart Current config xAxisKey:', config.xAxisKey);
    console.log('BarChart Current config yAxisKeys:', config.yAxisKeys);

    if (data.length > 0) {
      const availableKeys = Object.keys(data[0]);
      console.log('BarChart Available keys from data:', availableKeys);

      // Handle the case where config keys might be arrays
      const currentXAxisKey = Array.isArray(config.xAxisKey) ? config.xAxisKey[0] : config.xAxisKey;
      const currentYAxisKeys = Array.isArray(config.yAxisKeys)
        ? config.yAxisKeys
        : [config.yAxisKeys];

      console.log('BarChart Processed current xAxisKey:', currentXAxisKey);
      console.log('BarChart Processed current yAxisKeys:', currentYAxisKeys);

      const newXAxisKey = availableKeys[0] || 'x';
      const newYAxisKeys = availableKeys.slice(1).length > 0 ? availableKeys.slice(1) : ['y'];

      console.log('BarChart Calculated new xAxisKey:', newXAxisKey);
      console.log('BarChart Calculated new yAxisKeys:', newYAxisKeys);

      // Only update if keys have actually changed
      if (
        currentXAxisKey !== newXAxisKey ||
        JSON.stringify(currentYAxisKeys) !== JSON.stringify(newYAxisKeys)
      ) {
        console.log('BarChart Updating config due to data structure change');
        updateConfig({
          xAxisKey: newXAxisKey,
          yAxisKeys: newYAxisKeys,
        });
      } else {
        console.log('BarChart Config keys are already correct, no update needed');
      }
    } else {
      console.log('BarChart No data available to determine keys');
    }
  }, [data]); // Run when data changes

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

  // Note: Y-axis keys are managed by seriesConfigs now

  // Series helpers similar to LineChart
  const getAvailableColumns = () => {
    return Object.keys(data[0] || {}).filter(
      key => key !== config.xAxisKey && !seriesConfigs.some(s => s.dataColumn === key)
    );
  };

  const updateSeriesConfig = (seriesId: string, updates: Partial<SeriesConfig>) => {
    setSeriesConfigs(prev => {
      const oldSeries = prev.find(s => s.id === seriesId);
      const updated = prev.map(s => {
        if (s.id !== seriesId) return s;
        const next = { ...s, ...updates } as SeriesConfig;
        if (updates.dataColumn && updates.dataColumn !== s.dataColumn) {
          next.name = updates.dataColumn;
        }
        return next;
      });

      // If dataColumn changed, sync colors mapping key to new column
      if (updates.dataColumn && oldSeries && oldSeries.dataColumn !== updates.dataColumn) {
        const newColors = { ...colors };
        if (newColors[oldSeries.dataColumn]) {
          newColors[updates.dataColumn] = newColors[oldSeries.dataColumn];
          delete newColors[oldSeries.dataColumn];
          updateColors(newColors);
        } else if (!newColors[updates.dataColumn]) {
          // Seed with current series color
          updateColors({
            ...newColors,
            [updates.dataColumn]: { light: oldSeries.color, dark: oldSeries.color },
          });
        }
      }

      return updated;
    });
  };

  const addSeries = () => {
    const available = getAvailableColumns();
    if (available.length === 0) return;
    const nextColumn = available[0];
    // pick a non-used color from defaultColors
    const usedColors = seriesConfigs.map(s => s.color);
    const palette = Object.values(defaultColors);
    let chosen = palette[0];
    for (const c of palette) {
      if (!usedColors.includes(c.light)) {
        chosen = c;
        break;
      }
    }
    setSeriesConfigs(prev => [
      ...prev,
      {
        id: `series-${prev.length}`,
        name: nextColumn,
        dataColumn: nextColumn,
        color: chosen.light,
        visible: true,
      },
    ]);
    if (!colors[nextColumn]) {
      updateColors({ ...colors, [nextColumn]: { light: chosen.light, dark: chosen.dark } });
    }
  };

  const removeSeries = (seriesId: string) => {
    if (seriesConfigs.length <= 1) return;
    const toRemove = seriesConfigs.find(s => s.id === seriesId);
    setSeriesConfigs(prev => prev.filter(s => s.id !== seriesId));
    if (toRemove) {
      const nc = { ...colors } as ColorConfig;
      delete nc[toRemove.dataColumn];
      updateColors(nc);
    }
  };

  // Export configuration to JSON (config only, no data)
  const exportConfigToJSON = () => {
    try {
      console.log('🔄 EXPORTING CONFIG:');

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
          chartType: 'bar-chart',
          exportedFrom: 'BarChartEditor',
          note: 'Configuration file - data not included',
        },
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

      showSuccess(t('barChart_editor_configExported'));
    } catch (error) {
      console.error('Export error:', error);
      showError(t('barChart_editor_invalidConfigFile'));
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

      showSuccess(t('barChart_editor_resetToDefault'));
    } catch (error) {
      console.error('Reset error:', error);
      showError(t('barChart_editor_invalidConfigFile'));
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
          const importData = JSON.parse(text);

          console.log('🔄 IMPORTING CONFIG:');

          // Validate the imported data structure
          if (!importData.config || !importData.colors || !importData.formatters) {
            throw new Error('Invalid configuration file structure');
          }

          // Apply imported configuration
          updateConfig(importData.config);
          updateColors(importData.colors);
          updateFormatters(importData.formatters);

          // Handle series configurations
          if (importData.seriesConfigs && Array.isArray(importData.seriesConfigs)) {
            const newSeriesConfigs = importData.seriesConfigs.map(
              (series: SeriesConfig, index: number) => ({
                ...series,
                id: `series-${Date.now()}-${index}`, // Regenerate IDs
              })
            );
            setSeriesConfigs(newSeriesConfigs);
          }

          showSuccess(t('barChart_editor_configImported'));
        } catch (parseError) {
          console.error('Parse error:', parseError);
          showError(t('barChart_editor_invalidConfigFile'));
        }
      };
      input.click();
    } catch (error) {
      console.error('Import error:', error);
      showError(t('barChart_editor_invalidConfigFile'));
    }
  };

  // Helper function to create better SVG data URL
  const createSVGDataURL = (svgElement: SVGElement): string => {
    const svgClone = svgElement.cloneNode(true) as SVGElement;

    // Ensure SVG has proper dimensions and namespace
    const width = svgElement.clientWidth || 800;
    const height = svgElement.clientHeight || 600;

    svgClone.setAttribute('width', width.toString());
    svgClone.setAttribute('height', height.toString());
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Get all styles and ensure they're embedded
    const stylesheets = Array.from(document.styleSheets);
    let styles = '';

    stylesheets.forEach(stylesheet => {
      try {
        const rules = Array.from(stylesheet.cssRules);
        rules.forEach(rule => {
          if (rule.cssText.includes('svg') || rule.cssText.includes('.chart')) {
            styles += rule.cssText + '\n';
          }
        });
      } catch {
        // Cross-origin stylesheets might cause errors
      }
    });

    if (styles) {
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      svgClone.insertBefore(styleElement, svgClone.firstChild);
    }

    const svgString = new XMLSerializer().serializeToString(svgClone);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  };

  // Export chart as image
  const exportChartAsImage = async (format: 'png' | 'jpeg' | 'svg' = 'png') => {
    try {
      // Find the SVG element within the chart container
      const chartContainer = document.querySelector('.chart-container');
      const svgElement = chartContainer?.querySelector('svg') || document.querySelector('svg');

      if (!svgElement) {
        showError('Không tìm thấy biểu đồ để xuất');
        return;
      }

      // Get chart title for filename
      const chartTitle = config.title || 'bar-chart';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${chartTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}`;

      if (format === 'svg') {
        // Export as SVG - preserve vector format
        const svgData = new XMLSerializer().serializeToString(svgElement);

        // Clean up the SVG and add proper styling
        const cleanSvgData = svgData.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink=');

        const svgBlob = new Blob([cleanSvgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const a = document.createElement('a');
        a.href = svgUrl;
        a.download = `${filename}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(svgUrl);

        showSuccess(`Đã xuất biểu đồ thành file SVG`);
      } else {
        // Export as raster image (PNG/JPEG)
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            showError('Không thể tạo canvas để xuất ảnh');
            return;
          }

          // Clone SVG and ensure it has proper dimensions
          const svgClone = svgElement.cloneNode(true) as SVGElement;

          // Get actual dimensions
          const svgWidth = svgElement.clientWidth || 800;
          const svgHeight = svgElement.clientHeight || 600;
          const scaleFactor = 2; // For better quality

          // Set canvas size
          canvas.width = svgWidth * scaleFactor;
          canvas.height = svgHeight * scaleFactor;
          ctx.scale(scaleFactor, scaleFactor);

          // Set explicit dimensions on cloned SVG
          svgClone.setAttribute('width', svgWidth.toString());
          svgClone.setAttribute('height', svgHeight.toString());
          svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

          // Set background color for JPEG
          if (format === 'jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, svgWidth, svgHeight);
          }

          // Convert SVG to data URL using helper function
          const svgDataUrl = createSVGDataURL(svgElement);

          const img = new Image();
          img.crossOrigin = 'anonymous'; // Enable CORS

          img.onload = () => {
            try {
              ctx.drawImage(img, 0, 0, svgWidth, svgHeight);

              // Convert canvas to blob and download
              canvas.toBlob(
                blob => {
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${filename}.${format}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showSuccess(`Đã xuất biểu đồ thành file ${format.toUpperCase()}`);
                  } else {
                    showError('Không thể tạo file ảnh');
                  }
                },
                `image/${format}`,
                format === 'jpeg' ? 0.9 : 1.0
              );
            } catch (drawError) {
              console.error('Canvas draw error:', drawError);
              showError('Lỗi khi vẽ biểu đồ lên canvas: ' + drawError);
            }
          };

          img.onerror = error => {
            console.error('Image load error:', error);
            // Fallback: Provide user instructions
            const instructions =
              format === 'png'
                ? 'Để xuất PNG, vui lòng:\n1. Nhấn F12 → Console → gõ: document.querySelector(".chart-container").style.backgroundColor = "white"\n2. Nhấn chuột phải vào biểu đồ → "Save image as..." → chọn PNG'
                : 'Để xuất JPEG, vui lòng:\n1. Nhấn F12 → Console → gõ: document.querySelector(".chart-container").style.backgroundColor = "white"\n2. Nhấn chuột phải vào biểu đồ → "Save image as..." → chọn JPEG';

            showError(
              `Xuất ${format.toUpperCase()} tự động thất bại.\n${instructions}\nHoặc xuất SVG rồi chuyển đổi bằng công cụ khác.`
            );
          };

          // Set timeout for image loading
          setTimeout(() => {
            if (!img.complete) {
              showError('Timeout khi tải biểu đồ. Vui lòng thử lại hoặc xuất SVG.');
            }
          }, 5000);

          img.src = svgDataUrl;
        } catch (canvasError) {
          console.error('Canvas export error:', canvasError);
          showError(
            `Lỗi khi xuất ${format.toUpperCase()}: ${canvasError}. Vui lòng thử xuất SVG thay thế.`
          );
        }
      }
    } catch (error) {
      console.error('Export image error:', error);
      showError('Lỗi khi xuất ảnh: ' + (error as Error).message);
    }
  };

  // When config is externally changed (import/reset), regenerate seriesConfigs to match
  useEffect(() => {
    const colsFromSeries = seriesConfigs.map(s => s.dataColumn);
    const disabledFromSeries = seriesConfigs.filter(s => !s.visible).map(s => s.dataColumn);
    const yKeys = config.yAxisKeys || [];
    const disabled = config.disabledBars || [];
    const sameCols = arraysEqual(colsFromSeries, yKeys);
    const sameDisabled = arraysEqual(disabledFromSeries, disabled);
    if (!sameCols || !sameDisabled) {
      const keys = yKeys;
      const newSeries = keys.map((key, idx) => {
        const palette = Object.values(defaultColors);
        const chosen = palette[idx % palette.length] || { light: '#3b82f6', dark: '#60a5fa' };
        const existing = colors[key]?.light || chosen.light;
        return {
          id: `series-${idx}`,
          name: key,
          dataColumn: key,
          color: existing,
          visible: !disabled.includes(key),
        };
      });
      setSeriesConfigs(newSeries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.yAxisKeys, config.disabledBars]);

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

  // Function to convert editor config to simple chart config format
  const getSimpleChartConfig = () => {
    return {
      config: {
        width: config.width,
        height: config.height,
        margin: config.margin,
        xAxisKey: config.xAxisKey,
        yAxisKeys: config.yAxisKeys,
        title: config.title,
        xAxisLabel: config.xAxisLabel,
        yAxisLabel: config.yAxisLabel,
        showLegend: config.showLegend,
        showGrid: config.showGrid,
        animationDuration: config.animationDuration,
        barType: config.barType,
        gridOpacity: config.gridOpacity,
        legendPosition: config.legendPosition,
        xAxisRotation: config.xAxisRotation,
        yAxisRotation: config.yAxisRotation,
        showAxisLabels: config.showAxisLabels,
        showAxisTicks: config.showAxisTicks,
        yAxisStart: config.yAxisStart,
        theme: config.theme,
        backgroundColor: config.backgroundColor,
        showTooltip: config.showTooltip,
        barWidth: config.barWidth,
        barSpacing: config.barSpacing,
        titleFontSize: config.titleFontSize,
        labelFontSize: config.labelFontSize,
        legendFontSize: config.legendFontSize,
        enableZoom: config.enableZoom,
        enablePan: config.enablePan,
        zoomExtent: config.zoomExtent,
      },
    };
  };

  // Function to save chart to database (example implementation)
  const saveChartToDatabase = async () => {
    try {
      // Get the simplified chart configuration
      const chartConfig = getSimpleChartConfig();

      // Here you would typically call your API to save the chart
      // For example:
      // const response = await createChart({
      //   name: config.title || 'Untitled Chart',
      //   type: 'bar',
      //   config: JSON.stringify(chartConfig),
      //   datasetId: // your dataset ID
      // });

      // Return success or handle response
      return { success: true, config: chartConfig };
    } catch (error) {
      console.error('Error saving chart:', error);
      return { success: false, error };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="w-full px-2">
        {/* Action Bar - NEW */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={saveChartToDatabase}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {t('chart_editor_save_chart', 'Save Chart')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Configuration Panel - SIDEBAR BÊN TRÁI */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. DATA EDITOR SECTION */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <DataEditorSection
                data={data}
                xAxisKey={config.xAxisKey}
                yAxisKeys={config.yAxisKeys}
                isCollapsed={collapsedSections.dataEditor}
                onToggleCollapse={() => toggleSection('dataEditor')}
                onOpenModal={openDataModal}
              />
            </motion.div>

            {/* Basic Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <BasicSettingsSection
                config={{
                  width: config.width,
                  height: config.height,
                  margin: config.margin,
                  title: config.title,
                }}
                isCollapsed={collapsedSections.basicSettings}
                onToggleCollapse={() => toggleSection('basicSettings')}
                onUpdateConfig={updates => updateConfig(updates)}
                onApplySizePreset={applySizePreset}
              />
            </motion.div>

            {/* Chart-Specific Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ChartSettingsSection
                chartType="bar"
                config={{
                  xAxisLabel: config.xAxisLabel,
                  yAxisLabel: config.yAxisLabel,
                  animationDuration: config.animationDuration,
                  showLegend: config.showLegend,
                  showGrid: config.showGrid,
                  showTooltip: config.showTooltip,
                  enableZoom: config.enableZoom,
                  enablePan: config.enablePan || false,
                  zoomExtent: config.zoomExtent || 8,
                  gridOpacity: config.gridOpacity,
                  legendPosition: config.legendPosition,
                  theme: config.theme,
                  backgroundColor: config.backgroundColor,
                  titleFontSize: config.titleFontSize,
                  labelFontSize: config.labelFontSize,
                  legendFontSize: config.legendFontSize,
                }}
                barType={config.barType}
                barWidth={config.barWidth}
                barSpacing={config.barSpacing}
                isCollapsed={collapsedSections.chartSettings}
                onToggleCollapse={() => toggleSection('chartSettings')}
                onUpdateConfig={updateConfig}
                onUpdateChartSpecific={updateConfig}
              />
            </motion.div>

            {/* Axis Configuration & Formatters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <AxisConfigurationSection
                config={{
                  xAxisKey: config.xAxisKey,
                  xAxisStart: config.xAxisStart || 'auto',
                  yAxisStart: config.yAxisStart || 'auto',
                  showAxisLabels: config.showAxisLabels,
                  showAxisTicks: config.showAxisTicks,
                  xAxisRotation: config.xAxisRotation,
                  yAxisRotation: config.yAxisRotation,
                }}
                data={data}
                formatters={formatters}
                isCollapsed={collapsedSections.axisConfiguration}
                onToggleCollapse={() => toggleSection('axisConfiguration')}
                onUpdateConfig={updateConfig}
                onUpdateFormatters={updateFormatters}
              />
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
                      {t('chart_editor_seriesManagement')}
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
                          <Plus className="h-4 w-4 mr-1" /> {t('common.add', 'Thêm')}
                        </Button>
                      )}
                      {collapsedSections.seriesManagement ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {!collapsedSections.seriesManagement && (
                  <CardContent className="space-y-4">
                    {/* Series Management using shared component */}
                    <SeriesManagement
                      series={seriesConfigs}
                      onUpdateSeries={updateSeriesConfig}
                      onAddSeries={addSeries}
                      onRemoveSeries={removeSeries}
                      onMoveSeriesUp={(seriesId: string) => {
                        const index = seriesConfigs.findIndex(s => s.id === seriesId);
                        if (index > 0) {
                          const newSeries = [...seriesConfigs];
                          [newSeries[index], newSeries[index - 1]] = [
                            newSeries[index - 1],
                            newSeries[index],
                          ];
                          setSeriesConfigs(newSeries);
                        }
                      }}
                      onMoveSeriesDown={(seriesId: string) => {
                        const index = seriesConfigs.findIndex(s => s.id === seriesId);
                        if (index < seriesConfigs.length - 1) {
                          const newSeries = [...seriesConfigs];
                          [newSeries[index], newSeries[index + 1]] = [
                            newSeries[index + 1],
                            newSeries[index],
                          ];
                          setSeriesConfigs(newSeries);
                        }
                      }}
                      availableColumns={getAvailableColumns()}
                    />

                    {/* Color Preset Buttons */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        {t('chart_editor_color_presets', 'Bảng màu có sẵn')}
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => applyColorPreset('default')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {t('chart_editor_preset_default', 'Mặc định')}
                        </Button>
                        <Button
                          onClick={() => applyColorPreset('warm')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {t('chart_editor_preset_warm', 'Ấm áp')}
                        </Button>
                        <Button
                          onClick={() => applyColorPreset('cool')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {t('chart_editor_preset_cool', 'Mát mẻ')}
                        </Button>
                        <Button
                          onClick={() => applyColorPreset('pastel')}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {t('chart_editor_preset_pastel', 'Pastel')}
                        </Button>
                      </div>
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
                    // Advanced wiring
                    gridOpacity={config.gridOpacity}
                    legendPosition={config.legendPosition}
                    xAxisRotation={config.xAxisRotation}
                    yAxisRotation={config.yAxisRotation}
                    showAxisLabels={config.showAxisLabels}
                    showAxisTicks={config.showAxisTicks}
                    yAxisStart={config.yAxisStart}
                    theme={config.theme}
                    backgroundColor={config.backgroundColor}
                    showTooltip={config.showTooltip}
                    barWidth={config.barWidth}
                    barSpacing={config.barSpacing}
                    // Font size settings
                    titleFontSize={config.titleFontSize}
                    labelFontSize={config.labelFontSize}
                    legendFontSize={config.legendFontSize}
                    // Zoom settings
                    enableZoom={config.enableZoom}
                    enablePan={config.enablePan}
                    zoomExtent={config.zoomExtent}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Import/Export Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
              <CardHeader
                className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
                onClick={() => toggleSection('importExport')}
              >
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t('chart_editor_chart_actions', 'Import / Export & More')}
                  </h3>
                  {collapsedSections.importExport ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </CardHeader>
              {!collapsedSections.importExport && (
                <CardContent className="space-y-4">
                  {/* Export Image Section */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      {t('chart_editor_export_image', 'Export Image')}
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => exportChartAsImage('png')}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                      >
                        <Download className="h-3 w-3" />
                        PNG
                      </Button>
                      <Button
                        onClick={() => exportChartAsImage('jpeg')}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800"
                      >
                        <Download className="h-3 w-3" />
                        JPEG
                      </Button>
                      <Button
                        onClick={() => exportChartAsImage('svg')}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800"
                      >
                        <Download className="h-3 w-3" />
                        SVG
                      </Button>
                    </div>
                  </div>

                  {/* Config Management Section */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {t('chart_editor_config_management', 'Config Management')}
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        onClick={exportConfigToJSON}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2 text-xs justify-start bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-400"
                      >
                        <Download className="h-3 w-3" />
                        {t('chart_editor_export_config', 'Export Config JSON')}
                      </Button>
                      <Button
                        onClick={importConfigFromJSON}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2 text-xs justify-start bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                      >
                        <Upload className="h-3 w-3" />
                        {t('chart_editor_import_config', 'Import Config JSON')}
                      </Button>
                      <Button
                        onClick={resetToDefaultConfig}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2 text-xs justify-start text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {t('chart_editor_reset_config', 'Reset to Default')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
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
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default BarChartEditor;
