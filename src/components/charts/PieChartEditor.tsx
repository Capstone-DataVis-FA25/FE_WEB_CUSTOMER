import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Minus,
  X,
  Save,
  Camera,
  Download,
  Upload,
  RotateCcw,
  Settings,
  Sliders,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
// i18n removed: using English-only strings
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/toast-container';
import { sizePresets, getResponsiveDefaults } from '@/types/chart';
import { defaultColorsChart } from '@/utils/Utils';
import { DataEditorSection, BasicSettingsSection } from '@/components/charts/ChartEditorShared';

import D3PieChart from '@/components/charts/D3PieChart';
import type { ChartDataPoint } from '@/components/charts/D3PieChart';

// Interface for dataset headers
interface DatasetHeader {
  id: string;
  name: string;
}

interface Dataset {
  headers: DatasetHeader[];
}

// Pie Chart specific config
export interface PieChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  labelKey: string;
  valueKey: string;
  title: string;
  showTitle: boolean;
  showLegend: boolean;
  showLabels: boolean;
  showPercentage: boolean;
  showSliceValues: boolean;
  animationDuration: number;
  enableAnimation: boolean;

  // Pie-specific
  innerRadius: number;
  cornerRadius: number;
  padAngle: number;
  startAngle: number;
  endAngle: number;
  sortSlices: 'ascending' | 'descending' | 'none';
  sliceOpacity: number;

  // Visual
  theme: 'light' | 'dark' | 'auto';
  backgroundColor: string;
  titleFontSize: number;
  titleColor: string;
  labelFontSize: number;
  labelColor: string;
  legendFontSize: number;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
  legendMaxItems: number;
  showTooltip: boolean;
  strokeWidth: number;
  strokeColor: string;
  hoverScale: number;
  enableHoverEffect: boolean;
}

export interface ColorConfig {
  [key: string]: { light: string; dark: string };
}

export interface FormatterConfig {
  useValueFormatter: boolean;
  valueFormatterType:
    | 'currency'
    | 'percentage'
    | 'number'
    | 'decimal'
    | 'scientific'
    | 'bytes'
    | 'duration'
    | 'date'
    | 'custom';
  customValueFormatter: string;
}

export interface PieChartEditorProps {
  initialArrayData?: (string | number)[][];
  initialConfig?: Partial<PieChartConfig>;
  initialColors?: ColorConfig;
  initialFormatters?: Partial<FormatterConfig>;
  onConfigChange?: (config: PieChartConfig) => void;
  onDataChange?: (data: ChartDataPoint[]) => void;
  onColorsChange?: (colors: ColorConfig) => void;
  onFormattersChange?: (formatters: FormatterConfig) => void;
  dataset?: Dataset;
  validationErrors?: {
    title?: boolean;
  };
}

const PieChartEditor: React.FC<PieChartEditorProps> = ({
  initialArrayData,
  initialConfig = {},
  initialColors = {},
  initialFormatters = {},
  onConfigChange,
  onDataChange,
  onColorsChange,
  onFormattersChange,
  dataset,
  validationErrors,
}) => {
  // translation hook removed; using English-only strings
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Helper functions
  const decodeKeysToNames = useMemo(() => {
    return (keys: string | string[]): string | string[] => {
      if (!dataset?.headers) return keys;
      const keysArray = Array.isArray(keys) ? keys : [keys];
      const decodedNames = keysArray.map(keyId => {
        const header = dataset.headers.find((h: DatasetHeader) => h.id === keyId);
        return header ? header.name : keyId;
      });
      return Array.isArray(keys) ? decodedNames : decodedNames[0];
    };
  }, [dataset]);

  const encodeNamesToIds = useMemo(() => {
    return (keys: string | string[]): string | string[] => {
      if (!dataset?.headers) return keys;
      const keysArray = Array.isArray(keys) ? keys : [keys];
      const encodedIds = keysArray.map(keyName => {
        const header = dataset.headers.find((h: DatasetHeader) => h.name === keyName);
        return header ? header.id : keyName;
      });
      return Array.isArray(keys) ? encodedIds : encodedIds[0];
    };
  }, [dataset]);

  // Process initial data
  const processedInitialData = useMemo((): ChartDataPoint[] => {
    if (initialArrayData && initialArrayData.length > 0) {
      const headers = initialArrayData[0] as string[];
      const dataRows = initialArrayData.slice(1);
      return dataRows.map((row, rowIndex) => {
        const dataPoint: ChartDataPoint = {};
        headers.forEach((header, headerIndex) => {
          const value = row[headerIndex];
          if (value === undefined || value === null || value === 'N/A' || value === '') {
            dataPoint[header] = headerIndex === 0 ? `Unknown ${rowIndex + 1}` : 0;
            return;
          }
          if (typeof value === 'string') {
            const numValue = parseFloat(value);
            dataPoint[header] = !isNaN(numValue) ? numValue : value;
          } else {
            dataPoint[header] = value;
          }
        });
        return dataPoint;
      });
    }
    return [];
  }, [initialArrayData]);

  const responsiveDefaults = getResponsiveDefaults();

  // Default config
  const defaultConfig: PieChartConfig = {
    width: responsiveDefaults.width,
    height: responsiveDefaults.height,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    labelKey: (() => {
      if (initialConfig.labelKey) return decodeKeysToNames(initialConfig.labelKey) as string;
      return processedInitialData.length > 0 ? Object.keys(processedInitialData[0])[0] : 'label';
    })(),
    valueKey: (() => {
      if (initialConfig.valueKey) return decodeKeysToNames(initialConfig.valueKey) as string;
      return processedInitialData.length > 0
        ? Object.keys(processedInitialData[0])[1] || 'value'
        : 'value';
    })(),
    title: 'Pie Chart',
    showTitle: true,
    showLegend: true,
    showLabels: true,
    showPercentage: true,
    showSliceValues: false,
    animationDuration: 1000,
    enableAnimation: true,
    innerRadius: 0,
    cornerRadius: 0,
    padAngle: 0,
    startAngle: 0,
    endAngle: 360,
    sortSlices: 'descending',
    sliceOpacity: 1,
    theme: 'auto',
    backgroundColor: 'transparent',
    titleFontSize: 16,
    titleColor: 'auto',
    labelFontSize: 12,
    labelColor: 'auto',
    legendFontSize: 11,
    legendPosition: 'bottom',
    legendMaxItems: 10,
    showTooltip: true,
    strokeWidth: 2,
    strokeColor: '#ffffff',
    hoverScale: 1.05,
    enableHoverEffect: true,
    ...initialConfig,
  };

  const defaultFormatters: FormatterConfig = {
    useValueFormatter: true,
    valueFormatterType: 'number',
    customValueFormatter: '',
    ...initialFormatters,
  };

  // State
  const [config, setConfig] = useState<PieChartConfig>(defaultConfig);
  const [colors, setColors] = useState<ColorConfig>({ ...defaultColorsChart, ...initialColors });
  const [data, setData] = useState<ChartDataPoint[]>(processedInitialData);
  const [formatters, setFormatters] = useState<FormatterConfig>(defaultFormatters);
  const [showDataModal, setShowDataModal] = useState(false);
  const [tempData, setTempData] = useState<ChartDataPoint[]>(processedInitialData);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basicSettings: true,
    pieSettings: true,
    displayOptions: true,
    dataEditor: true,
    chartActions: true,
  });

  // Sync data
  useEffect(() => {
    if (
      processedInitialData.length > 0 &&
      JSON.stringify(processedInitialData) !== JSON.stringify(data)
    ) {
      setData(processedInitialData);
      setTempData(processedInitialData);
    }
  }, [processedInitialData, data]);

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Formatter
  const getValueFormatter = useMemo(() => {
    if (!formatters.useValueFormatter) return undefined;
    switch (formatters.valueFormatterType) {
      case 'currency':
        return (value: number) =>
          `$${Math.abs(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
      case 'percentage':
        return (value: number) => `${value.toFixed(1)}%`;
      case 'number':
        return (value: number) => Math.abs(value).toLocaleString('en-US');
      case 'decimal':
        return (value: number) => value.toFixed(2);
      case 'scientific':
        return (value: number) => value.toExponential(2);
      case 'bytes':
        return (value: number) => {
          const units = ['B', 'KB', 'MB', 'GB', 'TB'];
          let i = 0;
          let val = value;
          while (val >= 1024 && i < units.length - 1) {
            val /= 1024;
            i++;
          }
          return `${val.toFixed(2)} ${units[i]}`;
        };
      case 'duration':
        return (value: number) => {
          const hours = Math.floor(value / 3600);
          const minutes = Math.floor((value % 3600) / 60);
          const seconds = Math.floor(value % 60);
          return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
        };
      case 'date':
        return (value: number) => new Date(value).toLocaleDateString();
      case 'custom':
        if (formatters.customValueFormatter) {
          try {
            return new Function('value', formatters.customValueFormatter) as (
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
  const updateConfig = useCallback(
    (newConfig: Partial<PieChartConfig>) => {
      setConfig(prevConfig => {
        const updatedConfig = { ...prevConfig, ...newConfig };
        const encodedConfigForParent = {
          ...updatedConfig,
          labelKey: encodeNamesToIds(updatedConfig.labelKey) as string,
          valueKey: encodeNamesToIds(updatedConfig.valueKey) as string,
        };
        onConfigChange?.(encodedConfigForParent);
        return updatedConfig;
      });
    },
    [onConfigChange, encodeNamesToIds]
  );

  const configKeysRef = useRef<{ labelKey: string; valueKey: string }>({
    labelKey: '',
    valueKey: '',
  });

  useEffect(() => {
    if (data.length > 0 && dataset?.headers) {
      const availableHeaders = dataset.headers;
      const newLabelKey = availableHeaders.length > 0 ? availableHeaders[0].name : 'label';
      const newValueKey = availableHeaders.length > 1 ? availableHeaders[1].name : 'value';
      const keysChanged = config.labelKey !== newLabelKey || config.valueKey !== newValueKey;
      const differentFromRef =
        configKeysRef.current.labelKey !== newLabelKey ||
        configKeysRef.current.valueKey !== newValueKey;
      if (keysChanged && differentFromRef) {
        configKeysRef.current = { labelKey: newLabelKey, valueKey: newValueKey };
        updateConfig({ labelKey: newLabelKey, valueKey: newValueKey });
      }
    } else if (data.length > 0) {
      const availableKeys = Object.keys(data[0]);
      const newLabelKey = availableKeys[0] || 'label';
      const newValueKey = availableKeys[1] || 'value';
      const keysChanged = config.labelKey !== newLabelKey || config.valueKey !== newValueKey;
      const differentFromRef =
        configKeysRef.current.labelKey !== newLabelKey ||
        configKeysRef.current.valueKey !== newValueKey;
      if (keysChanged && differentFromRef) {
        configKeysRef.current = { labelKey: newLabelKey, valueKey: newValueKey };
        updateConfig({ labelKey: newLabelKey, valueKey: newValueKey });
      }
    }
  }, [data, dataset, config.labelKey, config.valueKey, updateConfig]);

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
    const numValue = parseFloat(value);
    newTempData[index] = {
      ...newTempData[index],
      [key]: key === config.labelKey ? value : isNaN(numValue) ? 0 : numValue,
    };
    setTempData(newTempData);
  };

  const addTempDataPoint = () => {
    const newPoint: ChartDataPoint = {
      [config.labelKey]: `Category ${tempData.length + 1}`,
      [config.valueKey]: 0,
    };
    const newTempData = [...tempData, newPoint];
    setTempData(newTempData);
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

  const applySizePreset = (presetKey: keyof typeof sizePresets) => {
    const preset = sizePresets[presetKey];
    if (presetKey === 'responsive') {
      const responsive = getResponsiveDefaults();
      updateConfig({ width: responsive.width, height: responsive.height });
    } else {
      updateConfig({ width: preset.width, height: preset.height });
    }
  };

  const exportConfigToJSON = () => {
    try {
      const encodedConfig = {
        ...config,
        labelKey: encodeNamesToIds(config.labelKey) as string,
        valueKey: encodeNamesToIds(config.valueKey) as string,
      };
      const exportData = {
        config: encodedConfig,
        formatters,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pie-chart-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Configuration exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      showError('Failed to export configuration');
    }
  };

  const resetToDefaultConfig = () => {
    try {
      const resetConfig = {
        ...defaultConfig,
        labelKey: Object.keys(data[0] || {})[0] || 'label',
        valueKey: Object.keys(data[0] || {})[1] || 'value',
      };
      updateConfig(resetConfig);
      updateColors(defaultColorsChart);
      updateFormatters(defaultFormatters);
      showSuccess('Reset to default configuration');
    } catch (error) {
      console.error('Reset error:', error);
      showError('Failed to reset configuration');
    }
  };

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
          if (importedData.config) {
            const decodedConfig = {
              ...importedData.config,
              labelKey: decodeKeysToNames(importedData.config.labelKey) as string,
              valueKey: decodeKeysToNames(importedData.config.valueKey) as string,
            };
            updateConfig(decodedConfig);
          }
          if (importedData.formatters) {
            updateFormatters(importedData.formatters);
          }
          showSuccess('Configuration imported successfully');
        } catch (parseError) {
          console.error('Parse error:', parseError);
          showError('Invalid configuration file');
        }
      };
      input.click();
    } catch (error) {
      console.error('Import error:', error);
      showError('Failed to import configuration');
    }
  };

  const exportChartAsImage = async (format: 'png' | 'jpeg' | 'svg' = 'png') => {
    try {
      const chartContainer = document.querySelector('.chart-container');
      const svgElement = chartContainer?.querySelector('svg') || document.querySelector('svg');
      if (!svgElement) {
        showError('Chart not found');
        return;
      }
      const chartTitle = config.title || 'pie-chart';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${chartTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}`;

      if (format === 'svg') {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        downloadLink.download = `${filename}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
        showSuccess('Chart exported successfully');
      } else {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const svgString = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
          canvas.width = svgElement.clientWidth || 800;
          canvas.height = svgElement.clientHeight || 600;
          if (format === 'jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          canvas.toBlob(
            blob => {
              if (!blob) return;
              const blobUrl = URL.createObjectURL(blob);
              const downloadLink = document.createElement('a');
              downloadLink.href = blobUrl;
              downloadLink.download = `${filename}.${format}`;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              URL.revokeObjectURL(blobUrl);
              showSuccess('Chart exported successfully');
            },
            format === 'png' ? 'image/png' : 'image/jpeg',
            1.0
          );
        };
        img.src = url;
      }
    } catch (error) {
      console.error('Export image error:', error);
      showError('Failed to export chart: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="w-full px-2">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Configuration Panel - Left (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Editor */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <DataEditorSection
                data={data}
                xAxisKey={config.labelKey}
                yAxisKeys={[config.valueKey]}
                isCollapsed={collapsedSections.dataEditor}
                onToggleCollapse={() => toggleSection('dataEditor')}
                onOpenModal={openDataModal}
              />
            </motion.div>

            {/* Basic Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
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
                validationErrors={
                  validationErrors ? { title: !!validationErrors.title } : undefined
                }
              />
            </motion.div>

            {/* Pie Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
                  onClick={() => toggleSection('pieSettings')}
                >
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Sliders className="h-5 w-5" />
                      {'Chart Settings'}
                    </h3>
                    {collapsedSections.pieSettings ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {!collapsedSections.pieSettings && (
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">{'Label Column'}</Label>
                        <select
                          value={config.labelKey}
                          onChange={e => updateConfig({ labelKey: e.target.value })}
                          className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                        >
                          {Object.keys(data[0] || {}).map(key => (
                            <option key={key} value={key}>
                              {key}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs">{'Value Column'}</Label>
                        <select
                          value={config.valueKey}
                          onChange={e => updateConfig({ valueKey: e.target.value })}
                          className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                        >
                          {Object.keys(data[0] || {}).map(key => (
                            <option key={key} value={key}>
                              {key}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs">
                          {'Inner Radius (Donut)'}: {config.innerRadius}
                        </Label>
                        <input
                          type="range"
                          min="0"
                          max="150"
                          value={config.innerRadius}
                          onChange={e => updateConfig({ innerRadius: parseInt(e.target.value) })}
                          className="w-full mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">
                          {'Corner Radius'}: {config.cornerRadius}
                        </Label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={config.cornerRadius}
                          onChange={e => updateConfig({ cornerRadius: parseInt(e.target.value) })}
                          className="w-full mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">
                          {'Pad Angle'}: {config.padAngle.toFixed(2)}
                        </Label>
                        <input
                          type="range"
                          min="0"
                          max="0.1"
                          step="0.01"
                          value={config.padAngle}
                          onChange={e => updateConfig({ padAngle: parseFloat(e.target.value) })}
                          className="w-full mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">{'Sort Slices'}</Label>
                        <select
                          value={config.sortSlices}
                          onChange={e =>
                            updateConfig({
                              sortSlices: e.target.value as 'ascending' | 'descending' | 'none',
                            })
                          }
                          className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                        >
                          <option value="descending">Descending</option>
                          <option value="ascending">Ascending</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Display Options */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
                  onClick={() => toggleSection('displayOptions')}
                >
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      {'Display Options'}
                    </h3>
                    {collapsedSections.displayOptions ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {!collapsedSections.displayOptions && (
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {/* Title Settings */}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{'Show Title'}</Label>
                        <input
                          type="checkbox"
                          checked={config.showTitle}
                          onChange={e => updateConfig({ showTitle: e.target.checked })}
                          className="w-4 h-4"
                        />
                      </div>

                      {/* Legend Settings */}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{'Show Legend'}</Label>
                        <input
                          type="checkbox"
                          checked={config.showLegend}
                          onChange={e => updateConfig({ showLegend: e.target.checked })}
                          className="w-4 h-4"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">{'Legend Position'}</Label>
                        <select
                          value={config.legendPosition}
                          onChange={e =>
                            updateConfig({
                              legendPosition: e.target.value as 'top' | 'bottom' | 'left' | 'right',
                            })
                          }
                          className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                        >
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-xs">
                          {'Legend Max Items'}: {config.legendMaxItems}
                        </Label>
                        <input
                          type="range"
                          min="3"
                          max="20"
                          value={config.legendMaxItems}
                          onChange={e => updateConfig({ legendMaxItems: parseInt(e.target.value) })}
                          className="w-full mt-1"
                        />
                      </div>

                      {/* Labels Settings */}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{'Show Labels'}</Label>
                        <input
                          type="checkbox"
                          checked={config.showLabels}
                          onChange={e => updateConfig({ showLabels: e.target.checked })}
                          className="w-4 h-4"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{'Show Percentage'}</Label>
                        <input
                          type="checkbox"
                          checked={config.showPercentage}
                          onChange={e => updateConfig({ showPercentage: e.target.checked })}
                          className="w-4 h-4"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{'Show Slice Values'}</Label>
                        <input
                          type="checkbox"
                          checked={config.showSliceValues}
                          onChange={e => updateConfig({ showSliceValues: e.target.checked })}
                          className="w-4 h-4"
                        />
                      </div>

                      {/* Visual Effects */}
                      <div>
                        <Label className="text-xs">
                          {'Slice Opacity'}: {config.sliceOpacity.toFixed(2)}
                        </Label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={config.sliceOpacity}
                          onChange={e => updateConfig({ sliceOpacity: parseFloat(e.target.value) })}
                          className="w-full mt-1"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{'Enable Hover Effect'}</Label>
                        <input
                          type="checkbox"
                          checked={config.enableHoverEffect}
                          onChange={e => updateConfig({ enableHoverEffect: e.target.checked })}
                          className="w-4 h-4"
                        />
                      </div>

                      {config.enableHoverEffect && (
                        <div>
                          <Label className="text-xs">
                            {'Hover Scale'}: {config.hoverScale.toFixed(2)}
                          </Label>
                          <input
                            type="range"
                            min="1"
                            max="1.2"
                            step="0.01"
                            value={config.hoverScale}
                            onChange={e => updateConfig({ hoverScale: parseFloat(e.target.value) })}
                            className="w-full mt-1"
                          />
                        </div>
                      )}

                      {/* Animation Settings */}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{'Enable Animation'}</Label>
                        <input
                          type="checkbox"
                          checked={config.enableAnimation}
                          onChange={e => updateConfig({ enableAnimation: e.target.checked })}
                          className="w-4 h-4"
                        />
                      </div>

                      {config.enableAnimation && (
                        <div>
                          <Label className="text-xs">
                            {'Animation Duration'}: {config.animationDuration}ms
                          </Label>
                          <input
                            type="range"
                            min="0"
                            max="2000"
                            step="100"
                            value={config.animationDuration}
                            onChange={e =>
                              updateConfig({ animationDuration: parseInt(e.target.value) })
                            }
                            className="w-full mt-1"
                          />
                        </div>
                      )}

                      {/* Tooltip */}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{'Show Tooltip'}</Label>
                        <input
                          type="checkbox"
                          checked={config.showTooltip}
                          onChange={e => updateConfig({ showTooltip: e.target.checked })}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Chart Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg h-20"
                  onClick={() => toggleSection('chartActions')}
                >
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      {'Import / Export & More'}
                    </h3>
                    {collapsedSections.chartActions ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {!collapsedSections.chartActions && (
                  <CardContent className="space-y-4">
                    {/* Export Image Section */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        {'Export Image'}
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
                        {'Config Management'}
                      </Label>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          onClick={exportConfigToJSON}
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center gap-2 text-xs justify-start bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-400"
                        >
                          <Download className="h-3 w-3" />
                          {'Export Config JSON'}
                        </Button>
                        <Button
                          onClick={importConfigFromJSON}
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center gap-2 text-xs justify-start bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                        >
                          <Upload className="h-3 w-3" />
                          {'Import Config JSON'}
                        </Button>
                        <Button
                          onClick={resetToDefaultConfig}
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center gap-2 text-xs justify-start text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {'Reset to Default'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Chart Preview - Right (6 cols) */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl chart-container">
                <CardContent className="p-6">
                  <D3PieChart
                    arrayData={[
                      [config.labelKey, config.valueKey],
                      ...data.map(d => [d[config.labelKey], d[config.valueKey]]),
                    ]}
                    width={config.width}
                    height={config.height}
                    margin={config.margin}
                    labelKey={config.labelKey}
                    valueKey={config.valueKey}
                    colors={colors}
                    title={config.title}
                    showTitle={config.showTitle}
                    showLegend={config.showLegend}
                    showLabels={config.showLabels}
                    showPercentage={config.showPercentage}
                    showSliceValues={config.showSliceValues}
                    animationDuration={config.enableAnimation ? config.animationDuration : 0}
                    valueFormatter={getValueFormatter}
                    valueFormatterType={formatters.valueFormatterType}
                    innerRadius={config.innerRadius}
                    cornerRadius={config.cornerRadius}
                    padAngle={config.padAngle}
                    startAngle={config.startAngle}
                    endAngle={config.endAngle}
                    sortSlices={config.sortSlices}
                    sliceOpacity={config.sliceOpacity}
                    theme={config.theme}
                    backgroundColor={config.backgroundColor}
                    titleFontSize={config.titleFontSize}
                    titleColor={config.titleColor}
                    labelFontSize={config.labelFontSize}
                    labelColor={config.labelColor}
                    legendFontSize={config.legendFontSize}
                    legendPosition={config.legendPosition}
                    legendMaxItems={config.legendMaxItems}
                    showTooltip={config.showTooltip}
                    strokeWidth={config.strokeWidth}
                    strokeColor={config.strokeColor}
                    hoverScale={config.enableHoverEffect ? config.hoverScale : 1}
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeDataModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-bold">{'Edit Chart Data'}</h3>
                <Button variant="ghost" size="sm" onClick={closeDataModal}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 overflow-auto max-h-[60vh]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border p-2">#</th>
                      {Object.keys(tempData[0] || {}).map(key => (
                        <th key={key} className="border p-2">
                          {key}
                        </th>
                      ))}
                      <th className="border p-2">{'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempData.map((point, index) => (
                      <tr key={index}>
                        <td className="border p-2 text-center">{index + 1}</td>
                        {Object.keys(point).map((key, colIndex) => (
                          <td key={key} className="border p-2">
                            <Input
                              value={point[key]}
                              onChange={e => updateTempDataPoint(index, key, e.target.value)}
                              data-row={index}
                              data-col={colIndex}
                            />
                          </td>
                        ))}
                        <td className="border p-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTempDataPoint(index)}
                            disabled={tempData.length <= 1}
                          >
                            <Minus className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Button onClick={addTempDataPoint} className="mt-4 w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  {'Add Row'}
                </Button>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-4 justify-end">
                <Button variant="outline" onClick={closeDataModal}>
                  {'Cancel'}
                </Button>
                <Button onClick={saveDataChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  {'Save Changes'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default PieChartEditor;
