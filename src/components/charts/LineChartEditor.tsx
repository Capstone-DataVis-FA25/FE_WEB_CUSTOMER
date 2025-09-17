import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import D3LineChart from '@/components/charts/D3LineChart';
import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  X,
  Save,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Table,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { convertArrayToChartData } from '@/utils/dataConverter';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/toast-container';
import {
  curveOptions,
  sizePresets,
  getResponsiveDefaults,
  type LineChartConfig as ChartConfig,
  type ColorConfig,
  type SeriesConfig,
  type FormatterConfig,
} from '@/types/chart';
import {
  DataEditorSection,
  BasicSettingsSection,
  ChartSettingsSection,
  AxisConfigurationSection,
} from '@/components/charts/ChartEditorShared';
import { getResponsiveFontSize, isColumnAvailableForSeries } from '@/helpers/chart';

// Props for LineChart Editor
export interface LineChartEditorProps {
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

const LineChartEditor: React.FC<LineChartEditorProps> = ({
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

  const responsiveDefaults = getResponsiveDefaults();

  // Default configuration
  const defaultConfig: ChartConfig = {
    width: responsiveDefaults.width,
    height: responsiveDefaults.height,
    margin: { top: 20, right: 40, bottom: 60, left: 80 },
    xAxisKey: Object.keys(processedInitialData[0] || {})[0] || 'x',
    yAxisKeys: Object.keys(processedInitialData[0] || {}).slice(1) || ['y'], // Lấy tất cả columns trừ column đầu tiên (xAxisKey)
    disabledLines: [], // Default to no disabled lines
    title: t('lineChart_editor_title'),
    xAxisLabel: t('lineChart_editor_xAxisLabel'),
    yAxisLabel: t('lineChart_editor_yAxisLabel'),
    showLegend: true,
    showGrid: true,
    showPoints: true,
    animationDuration: 1000,
    curve: 'curveMonotoneX',
    xAxisStart: 'auto', // Default to auto
    yAxisStart: 'auto', // Default to auto

    // New styling configs defaults
    lineWidth: 2,
    pointRadius: 4,
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
    line1: { light: '#3b82f6', dark: '#60a5fa' }, // Blue
    line2: { light: '#f97316', dark: '#fb923c' }, // Orange
    line3: { light: '#10b981', dark: '#34d399' }, // Green
    line4: { light: '#ef4444', dark: '#f87171' }, // Red
    line5: { light: '#8b5cf6', dark: '#a78bfa' }, // Purple
    line6: { light: '#06b6d4', dark: '#67e8f9' }, // Cyan
    line7: { light: '#84cc16', dark: '#a3e635' }, // Lime
    line8: { light: '#f59e0b', dark: '#fbbf24' }, // Amber
    line9: { light: '#ec4899', dark: '#f472b6' }, // Pink
    line10: { light: '#6366f1', dark: '#818cf8' }, // Indigo
    line11: { light: '#14b8a6', dark: '#5eead4' }, // Teal
    line12: { light: '#f43f5e', dark: '#fb7185' }, // Rose
    line13: { light: '#a855f7', dark: '#c084fc' }, // Violet
    line14: { light: '#22c55e', dark: '#4ade80' }, // Green-500
    line15: { light: '#ff6b35', dark: '#ff8566' }, // Red-Orange
    line16: { light: '#6d28d9', dark: '#8b5cf6' }, // Purple-700
    line17: { light: '#059669', dark: '#10b981' }, // Emerald-600
    line18: { light: '#dc2626', dark: '#ef4444' }, // Red-600
    line19: { light: '#7c3aed', dark: '#a78bfa' }, // Violet-600
    line20: { light: '#0891b2', dark: '#0ea5e9' }, // Sky-600
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
    chartSettings: true,
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

  // Toggle section collapse
  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Series management state
  const [seriesConfigs, setSeriesConfigs] = useState<SeriesConfig[]>(() => {
    return config.yAxisKeys.map((key, index) => {
      // Sử dụng màu từ defaultColors theo thứ tự, tránh trùng lặp
      const colorKeys = Object.keys(defaultColors);
      const colorIndex = index % colorKeys.length;
      const selectedColorKey = colorKeys[colorIndex];
      const selectedColor = defaultColors[selectedColorKey];

      return {
        id: `series-${index}`,
        name: key,
        dataColumn: key,
        color: selectedColor.light,
        visible: !config.disabledLines.includes(key),
      };
    });
  });

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

  // Helper function to get available columns for new series
  const getAvailableColumns = () => {
    return Object.keys(data[0] || {}).filter(
      key =>
        key !== config.xAxisKey && // Không được là xAxisKey
        !seriesConfigs.some(s => s.dataColumn === key)
    );
  };

  // Series management functions
  const updateSeriesConfig = (seriesId: string, updates: Partial<SeriesConfig>) => {
    setSeriesConfigs(prev => {
      const oldSeries = prev.find(s => s.id === seriesId);
      const updatedSeries = prev.map(series => {
        if (series.id === seriesId) {
          const updatedSeries = { ...series, ...updates };

          // Auto-update series name when dataColumn changes
          if (updates.dataColumn && updates.dataColumn !== series.dataColumn) {
            updatedSeries.name = updates.dataColumn;
          }

          return updatedSeries;
        }
        return series;
      });

      // Sync with chart config - use all series and manage visibility via disabledLines
      const allDataColumns = updatedSeries.map(s => s.dataColumn);
      const newDisabledLines = updatedSeries.filter(s => !s.visible).map(s => s.dataColumn);

      updateConfig({
        yAxisKeys: allDataColumns,
        disabledLines: newDisabledLines,
      });

      // Handle color sync when dataColumn changes
      if (updates.dataColumn && oldSeries && oldSeries.dataColumn !== updates.dataColumn) {
        const newColors = { ...colors };

        // Transfer color from old column to new column
        if (newColors[oldSeries.dataColumn]) {
          newColors[updates.dataColumn] = newColors[oldSeries.dataColumn];
          delete newColors[oldSeries.dataColumn];
        } else {
          // Create new color mapping if old one doesn't exist
          newColors[updates.dataColumn] = {
            light: oldSeries.color,
            dark: oldSeries.color,
          };
        }

        updateColors(newColors);
      }

      // Sync colors for color updates
      if (updates.color && oldSeries) {
        const targetColumn = updates.dataColumn || oldSeries.dataColumn;
        updateColors({
          ...colors,
          [targetColumn]: {
            light: updates.color,
            dark: updates.color,
          },
        });
      }

      return updatedSeries;
    });
  };

  const addSeries = () => {
    const availableColumns = getAvailableColumns();

    if (availableColumns.length > 0) {
      // Lấy danh sách màu đã được sử dụng
      const usedColors = seriesConfigs.map(s => s.color);

      // Tìm màu từ defaultColors chưa được sử dụng
      const colorKeys = Object.keys(defaultColors);
      let selectedColor = defaultColors[colorKeys[0]]; // Fallback color

      for (const colorKey of colorKeys) {
        const color = defaultColors[colorKey];
        if (!usedColors.includes(color.light)) {
          selectedColor = color;
          break;
        }
      }

      // Nếu tất cả màu trong defaultColors đã được sử dụng, tạo màu random
      if (usedColors.includes(selectedColor.light)) {
        const generateRandomColor = () => {
          const letters = '0123456789ABCDEF';
          let color = '#';
          for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        };

        let randomColor = generateRandomColor();
        // Đảm bảo màu random không trùng với màu đã có
        while (usedColors.includes(randomColor)) {
          randomColor = generateRandomColor();
        }

        selectedColor = {
          light: randomColor,
          dark: randomColor,
        };
      }

      const newSeries: SeriesConfig = {
        id: `series-${Date.now()}`,
        name: availableColumns[0],
        dataColumn: availableColumns[0],
        color: selectedColor.light,
        visible: true,
      };

      // Add color mapping for new series
      updateColors({
        ...colors,
        [newSeries.dataColumn]: {
          light: selectedColor.light,
          dark: selectedColor.dark,
        },
      });

      setSeriesConfigs(prev => {
        const updatedSeries = [...prev, newSeries];
        const allDataColumns = updatedSeries.map(s => s.dataColumn);
        const newDisabledLines = updatedSeries.filter(s => !s.visible).map(s => s.dataColumn);

        updateConfig({
          yAxisKeys: allDataColumns,
          disabledLines: newDisabledLines,
        });

        return updatedSeries;
      });
    }
  };

  const removeSeries = (seriesId: string) => {
    const seriesToRemove = seriesConfigs.find(s => s.id === seriesId);
    if (seriesToRemove && seriesConfigs.length > 1) {
      // Clean up color mapping
      const newColors = { ...colors };
      delete newColors[seriesToRemove.dataColumn];
      updateColors(newColors);

      setSeriesConfigs(prev => {
        const updatedSeries = prev.filter(s => s.id !== seriesId);
        const allDataColumns = updatedSeries.map(s => s.dataColumn);
        const newDisabledLines = updatedSeries.filter(s => !s.visible).map(s => s.dataColumn);

        updateConfig({
          yAxisKeys: allDataColumns,
          disabledLines: newDisabledLines,
        });

        return updatedSeries;
      });
    }
  };

  // Series reordering functions
  const moveSeriesUp = (seriesId: string) => {
    setSeriesConfigs(prev => {
      const currentIndex = prev.findIndex(s => s.id === seriesId);
      if (currentIndex > 0) {
        const updatedSeries = [...prev];
        [updatedSeries[currentIndex - 1], updatedSeries[currentIndex]] = [
          updatedSeries[currentIndex],
          updatedSeries[currentIndex - 1],
        ];

        // Update config with new order
        const allDataColumns = updatedSeries.map(s => s.dataColumn);
        const newDisabledLines = updatedSeries.filter(s => !s.visible).map(s => s.dataColumn);

        updateConfig({
          yAxisKeys: allDataColumns,
          disabledLines: newDisabledLines,
        });

        return updatedSeries;
      }
      return prev;
    });
  };

  const moveSeriesDown = (seriesId: string) => {
    setSeriesConfigs(prev => {
      const currentIndex = prev.findIndex(s => s.id === seriesId);
      if (currentIndex < prev.length - 1) {
        const updatedSeries = [...prev];
        [updatedSeries[currentIndex], updatedSeries[currentIndex + 1]] = [
          updatedSeries[currentIndex + 1],
          updatedSeries[currentIndex],
        ];

        // Update config with new order
        const allDataColumns = updatedSeries.map(s => s.dataColumn);
        const newDisabledLines = updatedSeries.filter(s => !s.visible).map(s => s.dataColumn);

        updateConfig({
          yAxisKeys: allDataColumns,
          disabledLines: newDisabledLines,
        });

        return updatedSeries;
      }
      return prev;
    });
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
          chartType: 'line-chart',
          exportedFrom: 'LineChartEditor',
          note: 'Configuration file - data not included',
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `line-chart-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess(t('lineChart_editor_configExported'));
    } catch (error) {
      console.error('Export error:', error);
      showError(t('lineChart_editor_invalidConfigFile'));
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

      showSuccess(t('lineChart_editor_resetToDefault'));
    } catch (error) {
      console.error('Reset error:', error);
      showError(t('lineChart_editor_invalidConfigFile'));
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
                id: `series-${Date.now()}-${index}`, // Generate new IDs
              })
            );
            setSeriesConfigs(newSeriesConfigs);
          }

          showSuccess(t('lineChart_editor_configImported'));
        } catch (parseError) {
          console.error('Parse error:', parseError);
          showError(t('lineChart_editor_invalidConfigFile'));
        }
      };
      input.click();
    } catch (error) {
      console.error('Import error:', error);
      showError(t('lineChart_editor_invalidConfigFile'));
    }
  };

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
              transition={{ duration: 0.6, delay: 0.1 }}
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
                onExportConfig={exportConfigToJSON}
                onImportConfig={importConfigFromJSON}
                onResetToDefault={resetToDefaultConfig}
                showConfigDropdown={showConfigDropdown}
                onToggleConfigDropdown={() => setShowConfigDropdown(!showConfigDropdown)}
                configDropdownRef={configDropdownRef}
              />
            </motion.div>

            {/* Chart Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              {/* Chart-Specific Settings */}
              <ChartSettingsSection
                chartType="line"
                config={{
                  xAxisLabel: config.xAxisLabel,
                  yAxisLabel: config.yAxisLabel,
                  animationDuration: config.animationDuration,
                  showLegend: config.showLegend,
                  showGrid: config.showGrid,
                  showTooltip: config.showTooltip,
                  enableZoom: config.enableZoom,
                  enablePan: config.enablePan,
                  zoomExtent: config.zoomExtent,
                  gridOpacity: config.gridOpacity,
                  legendPosition: config.legendPosition,
                  theme: config.theme,
                  backgroundColor: config.backgroundColor,
                  titleFontSize: config.titleFontSize,
                  labelFontSize: config.labelFontSize,
                  legendFontSize: config.legendFontSize,
                }}
                curveType={config.curve}
                curveOptions={curveOptions}
                showPoints={config.showPoints}
                lineWidth={config.lineWidth}
                pointRadius={config.pointRadius}
                isCollapsed={collapsedSections.chartSettings}
                onToggleCollapse={() => toggleSection('chartSettings')}
                onUpdateConfig={updateConfig}
                onUpdateChartSpecific={updateConfig}
              />
              {/* Chart Settings */}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              {/* Axis Configuration & Formatters */}
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
                  {/* Chart Title - Always Visible */}
                  {config.title && (
                    <div className="mb-4 text-center">
                      <h3
                        className="font-bold text-gray-900 dark:text-white"
                        style={{ fontSize: `${config.titleFontSize}px` }}
                      >
                        {config.title}
                      </h3>
                    </div>
                  )}
                  <D3LineChart
                    arrayData={
                      data.length > 0
                        ? [
                            [config.xAxisKey, ...config.yAxisKeys],
                            ...data.map(point => [
                              point[config.xAxisKey],
                              ...config.yAxisKeys.map(key => point[key]),
                            ]),
                          ]
                        : undefined
                    }
                    width={config.width}
                    height={config.height}
                    margin={config.margin}
                    xAxisKey={config.xAxisKey}
                    yAxisKeys={config.yAxisKeys}
                    disabledLines={config.disabledLines}
                    colors={colors}
                    seriesNames={Object.fromEntries(
                      seriesConfigs.map(series => [series.dataColumn, series.name])
                    )}
                    seriesConfigs={Object.fromEntries(
                      seriesConfigs.map(series => [
                        series.dataColumn,
                        {
                          lineWidth: series.lineWidth,
                          pointRadius: series.pointRadius,
                          lineStyle: series.lineStyle,
                          pointStyle: series.pointStyle,
                          opacity: series.opacity,
                          formatter: series.formatter,
                        },
                      ])
                    )}
                    title="" // Remove title from chart component since we show it above
                    xAxisLabel={config.xAxisLabel}
                    yAxisLabel={config.yAxisLabel}
                    showLegend={config.showLegend}
                    showGrid={config.showGrid}
                    showPoints={config.showPoints}
                    animationDuration={config.animationDuration}
                    curve={curveOptions[config.curve]}
                    yAxisFormatter={getYAxisFormatter}
                    xAxisFormatter={getXAxisFormatter}
                    fontSize={getResponsiveFontSize(config)}
                    xAxisStart={config.xAxisStart}
                    yAxisStart={config.yAxisStart}
                    // New styling props
                    lineWidth={config.lineWidth}
                    pointRadius={config.pointRadius}
                    gridOpacity={config.gridOpacity}
                    legendPosition={config.legendPosition}
                    // New axis props
                    xAxisRotation={config.xAxisRotation}
                    yAxisRotation={config.yAxisRotation}
                    showAxisLabels={config.showAxisLabels}
                    showAxisTicks={config.showAxisTicks}
                    // New interaction props
                    enableZoom={config.enableZoom}
                    showTooltip={config.showTooltip}
                    // New visual props
                    theme={config.theme}
                    backgroundColor={config.backgroundColor}
                    titleFontSize={config.titleFontSize}
                    labelFontSize={config.labelFontSize}
                    legendFontSize={config.legendFontSize}
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
                      {t('lineChart_editor_editChartData')}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('lineChart_editor_editDataDirectly')}
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
                    {t('lineChart_editor_addRow')}
                  </Button>
                  <Button
                    onClick={saveDataChanges}
                    size="sm"
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4" />
                    {t('lineChart_editor_saveChanges')}
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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-32">
                            {config.xAxisKey}
                          </th>
                          {config.yAxisKeys.map(key => (
                            <th
                              key={key}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-32"
                            >
                              {key}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                            {t('lineChart_editor_delete')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {tempData.map((point, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
                          >
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700/50">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                value={point[config.xAxisKey] as number}
                                onChange={e =>
                                  updateTempDataPoint(index, config.xAxisKey, e.target.value)
                                }
                                data-row={index}
                                data-col="0"
                                className="text-sm border-transparent bg-transparent hover:border-gray-300 focus:border-blue-500 dark:hover:border-gray-600 dark:focus:border-blue-400 rounded-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const nextInput = document.querySelector(
                                      `input[data-row="${index}"][data-col="1"]`
                                    ) as HTMLInputElement;
                                    if (nextInput) {
                                      nextInput.focus();
                                      nextInput.select();
                                    }
                                  } else if (e.key === 'Tab' && !e.shiftKey) {
                                    e.preventDefault();
                                    const nextInput = document.querySelector(
                                      `input[data-row="${index}"][data-col="1"]`
                                    ) as HTMLInputElement;
                                    if (nextInput) {
                                      nextInput.focus();
                                      nextInput.select();
                                    }
                                  }
                                }}
                              />
                            </td>
                            {config.yAxisKeys.map((key, colIndex) => (
                              <td key={key} className="px-4 py-2">
                                <Input
                                  type="number"
                                  value={point[key] as number}
                                  onChange={e => updateTempDataPoint(index, key, e.target.value)}
                                  data-row={index}
                                  data-col={colIndex + 1}
                                  className="text-sm border-transparent bg-transparent hover:border-gray-300 focus:border-blue-500 dark:hover:border-gray-600 dark:focus:border-blue-400 rounded-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const nextRowInput = document.querySelector(
                                        `input[data-row="${index + 1}"][data-col="${colIndex + 1}"]`
                                      ) as HTMLInputElement;
                                      if (nextRowInput) {
                                        nextRowInput.focus();
                                        nextRowInput.select();
                                      } else {
                                        // Nếu không có dòng tiếp theo, tạo dòng mới
                                        addTempDataPoint();
                                      }
                                    } else if (e.key === 'Tab' && !e.shiftKey) {
                                      e.preventDefault();
                                      const nextColIndex = colIndex + 2;
                                      if (nextColIndex <= config.yAxisKeys.length) {
                                        const nextInput = document.querySelector(
                                          `input[data-row="${index}"][data-col="${nextColIndex}"]`
                                        ) as HTMLInputElement;
                                        if (nextInput) {
                                          nextInput.focus();
                                          nextInput.select();
                                        }
                                      } else {
                                        // Chuyển sang dòng tiếp theo, cột đầu tiên
                                        const nextRowInput = document.querySelector(
                                          `input[data-row="${index + 1}"][data-col="0"]`
                                        ) as HTMLInputElement;
                                        if (nextRowInput) {
                                          nextRowInput.focus();
                                          nextRowInput.select();
                                        }
                                      }
                                    } else if (e.key === 'Tab' && e.shiftKey) {
                                      e.preventDefault();
                                      const prevColIndex = colIndex;
                                      if (prevColIndex >= 0) {
                                        const prevInput = document.querySelector(
                                          `input[data-row="${index}"][data-col="${prevColIndex}"]`
                                        ) as HTMLInputElement;
                                        if (prevInput) {
                                          prevInput.focus();
                                          prevInput.select();
                                        }
                                      } else if (index > 0) {
                                        // Chuyển về dòng trước, cột cuối
                                        const prevRowInput = document.querySelector(
                                          `input[data-row="${index - 1}"][data-col="${config.yAxisKeys.length}"]`
                                        ) as HTMLInputElement;
                                        if (prevRowInput) {
                                          prevRowInput.focus();
                                          prevRowInput.select();
                                        }
                                      }
                                    }
                                  }}
                                />
                              </td>
                            ))}
                            <td className="px-4 py-2 text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeTempDataPoint(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <span>{t('lineChart_editor_totalRows', { count: tempData.length })}</span>
                    <span>•</span>
                    <span>
                      {t('lineChart_editor_totalColumns', { count: 1 + config.yAxisKeys.length })}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="inline-flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                        Tab
                      </kbd>
                      <span>{t('lineChart_editor_moveHorizontally')} •</span>
                      <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                        Enter
                      </kbd>
                      <span>{t('lineChart_editor_moveDown')}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default LineChartEditor;
