import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Save, Table, X, Minus, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import D3AreaChart from './D3AreaChart';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '../ui/toast-container';
import { convertArrayToChartData } from '@/utils/dataConverter';
import {
  sizePresets,
  type ColorConfig,
  curveOptions,
  type SeriesConfig,
  type AreaChartConfig,
  type FormatterConfig,
  type ChartDataPoint,
} from '../../types/chart';
import {
  BasicSettingsSection,
  ChartSettingsSection,
  AxisConfigurationSection,
  DataEditorSection,
  SeriesManagement,
} from '@/components/charts/ChartEditorShared';
import { getResponsiveDefaults, getResponsiveFontSize } from '@/helpers/chart';

// Props for AreaChart Editor
export interface AreaChartEditorProps {
  initialArrayData?: (string | number)[][]; // Array data input
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

  // Convert arrayData to ChartDataPoint[] if provided, or use sample data
  const processedInitialData = useMemo((): ChartDataPoint[] => {
    if (initialArrayData && initialArrayData.length > 0) {
      return convertArrayToChartData(initialArrayData);
    }
    return [];
  }, [initialArrayData]);

  const responsiveDefaults = getResponsiveDefaults();

  // Default configuration
  const defaultConfig: AreaChartConfig = {
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
    enablePan: false,
    zoomExtent: 10,
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
  const [config, setConfig] = useState<AreaChartConfig>(defaultConfig);
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

    updateColors(newColors);
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
          const importedSeries = importedData.seriesConfigs.map(
            (series: Partial<SeriesConfig>, index: number) => ({
              ...series,
              id: `series-${Date.now()}-${index}`,
            })
          );
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

  // Functions are now used by shared components, no need for no-op effect

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
                config={config}
                isCollapsed={collapsedSections.basicSettings}
                onToggleCollapse={() => toggleSection('basicSettings')}
                onUpdateConfig={updateConfig}
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
              <ChartSettingsSection
                config={config}
                isCollapsed={collapsedSections.displayOptions || false}
                onToggleCollapse={() => toggleSection('displayOptions')}
                onUpdateConfig={updateConfig}
                onUpdateChartSpecific={updateConfig}
                chartType="line"
                curveType={config.curve}
                curveOptions={curveOptions}
                showPoints={config.showPoints}
                lineWidth={config.lineWidth}
                pointRadius={config.pointRadius}
              />
            </motion.div>
            {/* Axis Configuration & Formatters*/}
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
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        {t('chart_editor_color_presets', 'Bảng màu có sẵn')}
                      </label>
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
