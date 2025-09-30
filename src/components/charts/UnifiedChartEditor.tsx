import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

// D3 Chart Components
import D3LineChart from '@/components/charts/D3LineChart';
import D3BarChart from '@/components/charts/D3BarChart';
import D3AreaChart from '@/components/charts/D3AreaChart';

import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import { motion } from 'framer-motion';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Camera,
  Download,
  Settings,
  Upload,
  BarChart3,
  LineChart,
  AreaChart,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/toast-container';
import {
  curveOptions,
  sizePresets,
  getResponsiveDefaults,
  type LineChartConfig,
  type BarChartConfig,
  type AreaChartConfig,
  type ColorConfig,
  type SeriesConfig,
  type FormatterConfig,
  type BaseChartConfig,
  type StructuredChartConfig,
} from '@/types/chart';
import {
  DataEditorSection,
  BasicSettingsSection,
  ChartSettingsSection,
  AxisConfigurationSection,
  SeriesManagement,
} from '@/components/charts/ChartEditorShared';
import { defaultColorsChart } from '@/utils/Utils';
import type { ChartType } from '@/features/charts';

// Union type for all chart configs
export type UnifiedChartConfig = LineChartConfig | BarChartConfig | AreaChartConfig;

// Interface for dataset headers
interface DatasetHeader {
  id: string;
  name: string;
}

interface Dataset {
  headers: DatasetHeader[];
}

// Props for Unified Chart Editor
export interface UnifiedChartEditorProps {
  initialArrayData?: (string | number)[][];
  initialChartType?: ChartType;
  initialStructuredConfig?: StructuredChartConfig;
  onConfigChange?: (config: Record<string, unknown>) => void;
  // onDataChange?: (data: ChartDataPoint[]) => void; // removed unused prop
  onColorsChange?: (colors: ColorConfig) => void;
  onFormattersChange?: (formatters: FormatterConfig) => void;
  onChartTypeChange?: (chartType: ChartType) => void;
  dataset?: Dataset;
  allowChartTypeChange?: boolean;
}

const UnifiedChartEditor: React.FC<UnifiedChartEditorProps> = ({
  initialArrayData,
  initialChartType = 'line',
  initialStructuredConfig,
  onConfigChange,
  // onDataChange, // removed unused prop
  onColorsChange,
  onFormattersChange,
  onChartTypeChange,
  dataset,
  allowChartTypeChange = true,
}) => {
  const { t } = useTranslation();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  // State management
  const [chartType, setChartType] = useState<ChartType>(initialChartType);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartConfig, setChartConfig] = useState<UnifiedChartConfig | null>(null);
  const [colors, setColors] = useState<ColorConfig>({ ...defaultColorsChart });
  const [formatters, setFormatters] = useState<FormatterConfig>({
    useYFormatter: true,
    useXFormatter: true,
    yFormatterType: 'number',
    xFormatterType: 'number',
    customYFormatter: '',
    customXFormatter: '',
  });

  // Track initialStructuredConfig to prevent re-importing
  const initialConfigRef = useRef<StructuredChartConfig | null>(null);
  const hasUserEditedConfig = useRef(false);

  // Series management state
  const [seriesConfigs, setSeriesConfigs] = useState<SeriesConfig[]>([]);

  console.log('seriesConfigs: ', seriesConfigs);
  // UI state
  const [expandedSections, setExpandedSections] = useState({
    dataEditor: false,
    basicSettings: false,
    chartSettings: false,
    axisConfiguration: false,
    seriesManagement: false,
    chartActions: false,
  });

  // Helper function to decode ids to names using dataset.headers
  const decodeKeysToNames = useMemo(() => {
    return (keys: string | string[]): string | string[] => {
      if (!dataset?.headers) return keys;

      const keysArray = Array.isArray(keys) ? keys : [keys];
      const decodedNames = keysArray.map(keyId => {
        const header = dataset.headers.find((h: DatasetHeader) => h.id === keyId);
        return header ? header.name.toLowerCase() : keyId.toLowerCase();
      });

      return Array.isArray(keys) ? decodedNames : decodedNames[0];
    };
  }, [dataset?.headers]);

  // Helper function to encode names to ids using dataset.headers
  const encodeNamesToIds = useMemo(() => {
    return (keys: string | string[]): string | string[] => {
      if (!dataset?.headers) return keys;

      const keysArray = Array.isArray(keys) ? keys : [keys];
      const encodedIds = keysArray.map(keyName => {
        const header = dataset.headers.find(
          (h: DatasetHeader) => h.name.toLowerCase() === keyName.toLowerCase()
        );
        return header ? header.id : keyName; // Fallback to keyName if not found
      });

      return Array.isArray(keys) ? encodedIds : encodedIds[0];
    };
  }, [dataset]);

  // Convert arrayData to ChartDataPoint[] if provided
  const processedInitialData = useMemo((): ChartDataPoint[] => {
    if (initialArrayData && initialArrayData.length > 0) {
      // Use the conversion function from D3LineChart
      const convertArrayToChartData = (arrayData: (string | number)[][]): ChartDataPoint[] => {
        if (!arrayData || arrayData.length === 0) return [];

        if (arrayData.length < 2) {
          return [];
        }

        const headers = arrayData[0] as string[];
        const dataRows = arrayData.slice(1);

        if (headers.length === 0) {
          return [];
        }

        const chartData: ChartDataPoint[] = dataRows.map((row, rowIndex) => {
          const dataPoint: ChartDataPoint = {};
          headers.forEach((header, headerIndex) => {
            const value = row[headerIndex];

            if (value === undefined || value === null || value === 'N/A' || value === '') {
              if (headerIndex === 0) {
                dataPoint[header] = `Unknown_${rowIndex + 1}`;
              } else {
                dataPoint[header] = 0;
              }
              return;
            }

            if (typeof value === 'string') {
              const cleanedValue = value.replace(/[,\s]/g, '');
              const numValue = parseFloat(cleanedValue);
              if (!isNaN(numValue)) {
                dataPoint[header] = numValue;
              } else {
                dataPoint[header] = value;
              }
            } else {
              dataPoint[header] = value;
            }
          });
          return dataPoint;
        });

        return chartData;
      };

      return convertArrayToChartData(initialArrayData);
    }
    return [];
  }, [initialArrayData]);

  const responsiveDefaults = getResponsiveDefaults();

  // Create default config based on chart type following the JSON configuration sample structure
  const createDefaultConfig = useCallback(
    (type: ChartType, config?: any): UnifiedChartConfig => {
      // Base configuration structure following line-chart-config-2025-09-27.json
      const baseConfig: BaseChartConfig = {
        width: responsiveDefaults.width,
        height: responsiveDefaults.height,
        margin: { top: 20, right: 40, bottom: 60, left: 80 },
        xAxisKey: (() => {
          // Decode config.xAxisKey if provided, otherwise use first data column
          if (config?.xAxisKey) {
            return decodeKeysToNames(config.xAxisKey) as string;
          }
          return processedInitialData.length > 0
            ? Object.keys(processedInitialData[0])[0].toLowerCase()
            : 'x';
        })(),
        yAxisKeys: (() => {
          // Decode config.yAxisKeys if provided, otherwise use remaining data columns
          if (config?.yAxisKeys) {
            return decodeKeysToNames(config.yAxisKeys) as string[];
          }
          return processedInitialData.length > 0
            ? Object.keys(processedInitialData[0])
                .slice(1)
                .map(key => key.toLowerCase())
            : ['y']; // Take all columns except the first one (xAxisKey)
        })(),
        title:
          config?.title ||
          t(`${type}Chart_editor_title`) ||
          `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
        xAxisLabel: config?.xAxisLabel || t(`${type}Chart_editor_xAxisLabel`) || 'X Axis',
        yAxisLabel: config?.yAxisLabel || t(`${type}Chart_editor_yAxisLabel`) || 'Y Axis',
        showLegend: config?.showLegend ?? true,
        showGrid: config?.showGrid ?? true,
        animationDuration: config?.animationDuration ?? 1000,
        xAxisStart: config?.xAxisStart ?? 'auto',
        yAxisStart: config?.yAxisStart ?? 'auto',
        gridOpacity: config?.gridOpacity ?? 0.3,
        legendPosition: config?.legendPosition ?? 'bottom',
        xAxisRotation: config?.xAxisRotation ?? 0,
        yAxisRotation: config?.yAxisRotation ?? 0,
        showAxisLabels: config?.showAxisLabels ?? true,
        showAxisTicks: config?.showAxisTicks ?? true,
        enableZoom: config?.enableZoom ?? false,
        enablePan: config?.enablePan ?? false,
        zoomExtent: config?.zoomExtent ?? 10,
        showTooltip: config?.showTooltip ?? true,
        theme: config?.theme ?? 'auto',
        backgroundColor: config?.backgroundColor ?? 'transparent',
        titleFontSize: config?.titleFontSize ?? 16,
        labelFontSize: config?.labelFontSize ?? 12,
        legendFontSize: config?.legendFontSize ?? 12,
      };

      // Chart-specific configurations following the common config pattern
      switch (type) {
        case 'line': {
          return {
            ...baseConfig,
            disabledLines: config?.disabledLines
              ? (decodeKeysToNames(config.disabledLines) as string[])
              : [],
            showPoints: config?.showPoints ?? true,
            showPointValues: config?.showPointValues ?? false,
            curve: config?.curve ?? 'curveMonotoneX',
            lineWidth: config?.lineWidth ?? 2,
            pointRadius: config?.pointRadius ?? 3,
            ...config,
          } as LineChartConfig;
        }

        case 'bar': {
          return {
            ...baseConfig,
            disabledBars: config?.disabledBars
              ? (decodeKeysToNames(config.disabledBars) as string[])
              : [],
            barType: config?.barType ?? 'grouped',
            barWidth: config?.barWidth ?? 0,
            barSpacing: config?.barSpacing ?? 4,
            ...config,
          } as BarChartConfig;
        }

        case 'area': {
          return {
            ...baseConfig,
            disabledLines: config?.disabledLines
              ? (decodeKeysToNames(config.disabledLines) as string[])
              : [],
            showPoints: config?.showPoints ?? false,
            showPointValues: config?.showPointValues ?? false,
            showStroke: config?.showStroke ?? true,
            curve: config?.curve ?? 'curveMonotoneX',
            lineWidth: config?.lineWidth ?? 2,
            pointRadius: config?.pointRadius ?? 3,
            opacity: config?.opacity ?? 0.7,
            stackedMode: config?.stackedMode ?? true,
            ...config,
          } as AreaChartConfig;
        }

        default: {
          return {
            ...baseConfig,
            disabledLines: [],
            showPoints: true,
            showPointValues: false,
            curve: 'curveMonotoneX',
            lineWidth: 2,
            pointRadius: 3,
            ...config,
          } as LineChartConfig;
        }
      }
    },
    [decodeKeysToNames, processedInitialData, responsiveDefaults, t]
  );

  // Import config from initialConfig (similar to importConfigFromJSON but for internal use)
  const importFromInitialConfig = useCallback(
    (importData: StructuredChartConfig | null) => {
      try {
        if (!importData) {
          return;
        }

        // Handle structured config format {config: {...}, formatters: {...}, seriesConfigs: [...], chartType: "..."}
        const configToImport = importData.config;
        const formattersToImport = importData.formatters || {};
        const seriesConfigsToImport = importData.seriesConfigs || [];
        const chartTypeToImport = importData.chartType;

        // Handle chart type if included
        const targetChartType = chartTypeToImport || chartType;
        if (chartTypeToImport && chartTypeToImport !== chartType) {
          setChartType(chartTypeToImport);
        }

        // Decode config keys from ids back to names for current dataset
        const decodedConfig = {
          ...configToImport,
          xAxisKey: decodeKeysToNames(configToImport?.xAxisKey as string) as string,
          yAxisKeys: decodeKeysToNames(configToImport?.yAxisKeys as string[]) as string[],
          // Decode chart-specific disabled properties
          ...(targetChartType === 'line' || targetChartType === 'area'
            ? {
                disabledLines: decodeKeysToNames(
                  ((configToImport as Record<string, unknown>)?.disabledLines as string[]) || []
                ) as string[],
              }
            : {}),
          ...(targetChartType === 'bar'
            ? {
                disabledBars: decodeKeysToNames(
                  ((configToImport as Record<string, unknown>)?.disabledBars as string[]) || []
                ) as string[],
              }
            : {}),
        };

        // Create a proper UnifiedChartConfig by merging with defaults
        const defaultConfig = createDefaultConfig(targetChartType);
        const finalConfig = { ...defaultConfig, ...decodedConfig };

        // Set chart config
        setChartConfig(finalConfig);

        // Handle formatters
        const defaultFormatters = {
          useYFormatter: true,
          useXFormatter: true,
          yFormatterType: 'number' as const,
          xFormatterType: 'number' as const,
          customYFormatter: '',
          customXFormatter: '',
        };
        const mergedFormatters = {
          ...defaultFormatters,
          ...formatters,
          ...formattersToImport,
        };
        setFormatters(mergedFormatters);

        // Handle series configurations
        if (
          seriesConfigsToImport &&
          Array.isArray(seriesConfigsToImport) &&
          seriesConfigsToImport.length > 0
        ) {
          // Decode series dataColumn from ids back to names
          const decodedSeriesConfigs = seriesConfigsToImport.map(series => ({
            ...series,
            dataColumn: decodeKeysToNames(series.dataColumn) as string,
          }));
          setSeriesConfigs(decodedSeriesConfigs);

          // Update colors from series configurations
          const newColors = { ...colors };
          decodedSeriesConfigs.forEach(series => {
            if (series.color) {
              newColors[series.dataColumn] = {
                light: series.color,
                dark: series.color, // Use same color for dark mode for now
              };
            }
          });
          setColors(newColors);
        }
      } catch (error) {
        // Fallback to default config if import fails
        const defaultConfig = createDefaultConfig(chartType);
        setChartConfig(defaultConfig);
      }
    },
    [chartType, decodeKeysToNames, formatters, createDefaultConfig, colors]
  );

  // Initialize chart data and config (only once when component mounts)
  useEffect(() => {
    setChartData(processedInitialData);

    // Only create default config if no chartConfig exists and no initialStructuredConfig
    if (!chartConfig && !initialStructuredConfig) {
      const defaultConfig = createDefaultConfig(chartType);
      setChartConfig(defaultConfig);
    }
  }, [
    processedInitialData,
    chartConfig,
    chartType,
    createDefaultConfig,
    initialStructuredConfig,
    dataset?.headers,
  ]); // Dependencies để tránh stale closure

  // Track chart type changes
  useEffect(() => {
    // Chart type changed
  }, [chartType]);

  // Auto-generate series when needed (fallback only)
  useEffect(() => {
    // Only auto-generate if we have data, a config with yAxisKeys, but no series yet
    // AND we haven't tried to restore series from config yet
    if (
      chartData.length > 0 &&
      chartConfig &&
      chartConfig.yAxisKeys &&
      chartConfig.yAxisKeys.length > 0 &&
      seriesConfigs.length === 0
    ) {
      const colorKeys = Object.keys(defaultColorsChart);

      const autoGeneratedSeries = chartConfig.yAxisKeys.map((yKey: string, index: number) => {
        const colorKey = colorKeys[index % colorKeys.length];
        const color = defaultColorsChart[colorKey]?.light || '#3B82F6';

        return {
          id: `series-fallback-${Date.now()}-${index}`,
          name: yKey,
          dataColumn: yKey,
          color: color,
          visible: true,
        };
      });

      setSeriesConfigs(autoGeneratedSeries);

      // Also update colors
      const newColors = { ...colors };
      autoGeneratedSeries.forEach(series => {
        newColors[series.dataColumn] = {
          light: series.color,
          dark: series.color,
        };
      });
      setColors(newColors);
    }
  }, [chartData, chartConfig, seriesConfigs.length, colors]); // Only trigger when these change

  // Sync external chart type changes
  useEffect(() => {
    if (initialChartType !== chartType) {
      setChartType(initialChartType);
    }
  }, [initialChartType, chartType]);

  // Sync initialStructuredConfig changes (when ChartEditorPage sends new config)
  useEffect(() => {
    if (initialStructuredConfig) {
      // Check if initialStructuredConfig changed
      const configChanged =
        JSON.stringify(initialStructuredConfig) !== JSON.stringify(initialConfigRef.current);

      if (configChanged) {
        // Reset user edit flag when receiving new config (for reset functionality)
        hasUserEditedConfig.current = false;
        initialConfigRef.current = initialStructuredConfig;
        importFromInitialConfig(initialStructuredConfig);
      }
    }
  }, [initialStructuredConfig, importFromInitialConfig]);

  // Ensure chartConfig is always available
  const safeChartConfig = useMemo(() => {
    return chartConfig || createDefaultConfig(chartType);
  }, [chartConfig, chartType, createDefaultConfig]);

  // Auto-sync colors from series configs when they change
  useEffect(() => {
    if (seriesConfigs.length > 0) {
      const currentColors = colors; // Get current colors
      const needsSync = seriesConfigs.some(
        series => currentColors[series.dataColumn]?.light !== series.color
      );

      if (needsSync) {
        const newColors = { ...currentColors };
        seriesConfigs.forEach((series: SeriesConfig) => {
          newColors[series.dataColumn] = {
            light: series.color,
            dark: series.color,
          };
        });
        setColors(newColors);
      }
    }
  }, [seriesConfigs, colors]); // Include colors but it's OK since we check needsSync first

  // Synchronize seriesConfigs with yAxisKeys - add missing, remove extra
  useEffect(() => {
    if (chartConfig && chartConfig.yAxisKeys && chartConfig.yAxisKeys.length > 0) {
      setSeriesConfigs(prev => {
        const currentYAxisKeys = chartConfig.yAxisKeys;
        const existingSeries = prev.filter(series => currentYAxisKeys.includes(series.dataColumn));

        // Find missing keys that need new series
        const missingKeys = currentYAxisKeys.filter(
          key => !existingSeries.some(series => series.dataColumn === key)
        );

        // Create new series for missing keys
        const colorKeys = Object.keys(defaultColorsChart);
        const newSeries = missingKeys.map((yKey: string, index: number) => {
          const colorIndex = (existingSeries.length + index) % colorKeys.length;
          const colorKey = colorKeys[colorIndex];
          const color = defaultColorsChart[colorKey]?.light || '#3B82F6';

          return {
            id: `series-${Date.now()}-${index}`,
            name: yKey,
            dataColumn: yKey,
            color: color,
            visible: true,
          };
        });

        // Combine existing and new series, maintaining order of yAxisKeys
        const syncedSeries = currentYAxisKeys.map(key => {
          const existing = existingSeries.find(series => series.dataColumn === key);
          if (existing) {
            return existing;
          }
          return newSeries.find(series => series.dataColumn === key)!;
        });

        // Only update if there's actually a change
        if (JSON.stringify(prev.map(s => s.dataColumn)) !== JSON.stringify(currentYAxisKeys)) {
          // Update colors for new series
          const newColors = { ...colors };
          newSeries.forEach(series => {
            newColors[series.dataColumn] = {
              light: series.color,
              dark: series.color,
            };
          });

          // Remove colors for removed series
          prev.forEach(series => {
            if (!currentYAxisKeys.includes(series.dataColumn)) {
              delete newColors[series.dataColumn];
            }
          });

          setColors(newColors);
          onColorsChange?.(newColors);

          return syncedSeries;
        }

        return prev;
      });
    }
  }, [chartConfig?.yAxisKeys, colors, onColorsChange]);

  // Helper functions to safely access chart-specific properties
  const getChartSpecificProps = useMemo(() => {
    switch (chartType) {
      case 'line': {
        const config = safeChartConfig as LineChartConfig;
        return {
          curve: config.curve || 'curveMonotoneX',
          showPoints: config.showPoints || true,
          lineWidth: config.lineWidth || 2,
          pointRadius: config.pointRadius || 3,
          barType: 'grouped' as const,
          opacity: 0.7,
          stackedMode: true,
        };
      }
      case 'bar': {
        const config = safeChartConfig as BarChartConfig;
        return {
          curve: 'curveMonotoneX' as const,
          showPoints: true,
          lineWidth: 2,
          pointRadius: 3,
          barType: config.barType || 'grouped',
          opacity: 0.7,
          stackedMode: true,
        };
      }
      case 'area': {
        const config = safeChartConfig as AreaChartConfig;
        return {
          curve: config.curve || 'curveMonotoneX',
          showPoints: config.showPoints || false,
          lineWidth: config.lineWidth || 2,
          pointRadius: config.pointRadius || 3,
          barType: 'grouped' as const,
          opacity: config.opacity || 0.7,
          stackedMode: config.stackedMode || true,
        };
      }
      default:
        return {
          curve: 'curveMonotoneX' as const,
          showPoints: true,
          lineWidth: 2,
          pointRadius: 3,
          barType: 'grouped' as const,
          opacity: 0.7,
          stackedMode: true,
        };
    }
  }, [chartType, safeChartConfig]);

  const chartSpecificProps = getChartSpecificProps;

  // Handle config changes - following LineChartEditor pattern (lines 475-493)
  const updateConfig = useCallback(
    (newConfig: Partial<UnifiedChartConfig>) => {
      // Mark that user has edited config
      hasUserEditedConfig.current = true;

      // Always use safeChartConfig as the base to ensure we have a valid config
      const currentConfig = chartConfig || createDefaultConfig(chartType);
      const updatedConfig = { ...currentConfig, ...newConfig };

      setChartConfig(updatedConfig);

      // Encode names back to ids before sending to parent ChartEditor
      const encodedConfigForParent = {
        ...updatedConfig,
        xAxisKey: encodeNamesToIds(updatedConfig.xAxisKey) as string,
        yAxisKeys: encodeNamesToIds(updatedConfig.yAxisKeys) as string[],
        // Handle chart-specific disabled properties
        ...(chartType === 'line' || chartType === 'area'
          ? {
              disabledLines: encodeNamesToIds(
                (updatedConfig as any).disabledLines || []
              ) as string[],
            }
          : {}),
        ...(chartType === 'bar'
          ? {
              disabledBars: encodeNamesToIds((updatedConfig as any).disabledBars || []) as string[],
            }
          : {}),
      };

      // Auto-generate series if seriesConfigs is empty but yAxisKeys exist
      let workingSeriesConfigs = seriesConfigs;
      if (
        seriesConfigs.length === 0 &&
        updatedConfig.yAxisKeys &&
        updatedConfig.yAxisKeys.length > 0
      ) {
        const colorKeys = Object.keys(defaultColorsChart);

        workingSeriesConfigs = updatedConfig.yAxisKeys.map((yKey: string, index: number) => {
          const colorKey = colorKeys[index % colorKeys.length];
          const color = defaultColorsChart[colorKey]?.light || '#3B82F6';

          return {
            id: `series-${Date.now()}-${index}`,
            name: yKey,
            dataColumn: yKey,
            color: color,
            visible: true,
          };
        });

        // Update local seriesConfigs state for future use
        setSeriesConfigs(workingSeriesConfigs);
      }

      // Safely encode seriesConfigs with validation
      const encodedSeriesConfigs = workingSeriesConfigs.map(series => {
        // Validate series before encoding
        if (!series.dataColumn) {
          return {
            ...series,
            dataColumn: series.dataColumn || `unknown-${Date.now()}`,
          };
        }

        const encodedDataColumn = encodeNamesToIds(series.dataColumn) as string;
        return {
          ...series,
          dataColumn: encodedDataColumn,
        };
      });

      // Return the complete structure expected by ChartEditorPage
      const completeConfigStructure = {
        config: encodedConfigForParent,
        chartType: chartType,
        formatters: formatters,
        seriesConfigs: encodedSeriesConfigs,
      };

      onConfigChange?.(completeConfigStructure);
    },
    [
      chartConfig,
      onConfigChange,
      encodeNamesToIds,
      chartType,
      createDefaultConfig,
      formatters,
      seriesConfigs,
      setSeriesConfigs,
    ]
  );

  // Alias for consistency with other chart editors
  const handleConfigChange = useCallback(
    (newConfig: Partial<UnifiedChartConfig>) => {
      updateConfig(newConfig);
    },
    [updateConfig]
  );

  // Handle color and formatter changes
  // updateData function removed as it was unused

  const updateColors = useCallback(
    (newColors: ColorConfig) => {
      setColors(newColors);
      onColorsChange?.(newColors);
    },
    [onColorsChange]
  );

  const updateFormatters = useCallback(
    (updates: Partial<FormatterConfig>) => {
      const newFormatters = { ...formatters, ...updates };
      setFormatters(newFormatters);
      onFormattersChange?.(newFormatters);
    },
    [formatters, onFormattersChange]
  );

  // Alias for consistency
  // const handleDataChange = updateData; // removed unused variable
  const handleColorChange = updateColors;
  const handleFormatterChange = updateFormatters;

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Export configuration to JSON (config only, no data)
  const exportConfigToJSON = () => {
    try {
      if (!chartConfig) {
        showError('No configuration to export');
        return;
      }

      // Encode config keys back to ids for export
      const encodedConfig = {
        ...chartConfig,
        xAxisKey: encodeNamesToIds(chartConfig.xAxisKey) as string,
        yAxisKeys: encodeNamesToIds(chartConfig.yAxisKeys) as string[],
        // Handle chart-specific disabled properties
        ...(chartType === 'line' || chartType === 'area'
          ? {
              disabledLines: encodeNamesToIds((chartConfig as any).disabledLines || []) as string[],
            }
          : {}),
        ...(chartType === 'bar'
          ? {
              disabledBars: encodeNamesToIds((chartConfig as any).disabledBars || []) as string[],
            }
          : {}),
      };

      const exportData = {
        config: encodedConfig, // Use encoded config with ids
        formatters,
        seriesConfigs: seriesConfigs.map(series => ({
          ...series,
          // Encode dataColumn to id for export
          dataColumn: encodeNamesToIds(series.dataColumn) as string,
        })),
        chartType, // Include chart type in export
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${chartType}-chart-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess(t('chart_editor_configExported', 'Configuration exported'));
    } catch (error) {
      showError(t('chart_editor_invalidConfigFile', 'Export failed'));
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
          if (!importData.config || !importData.formatters) {
            throw new Error('Invalid configuration file structure');
          }

          // Handle chart type if included in import
          if (importData.chartType && importData.chartType !== chartType) {
            setChartType(importData.chartType);
          }

          // Decode config keys from ids back to names for current dataset
          const decodedConfig = {
            ...importData.config,
            xAxisKey: decodeKeysToNames(importData.config.xAxisKey) as string,
            yAxisKeys: decodeKeysToNames(importData.config.yAxisKeys) as string[],
            // Handle chart-specific disabled properties
            ...(chartType === 'line' || chartType === 'area'
              ? {
                  disabledLines: decodeKeysToNames(
                    importData.config.disabledLines || []
                  ) as string[],
                }
              : {}),
            ...(chartType === 'bar'
              ? {
                  disabledBars: decodeKeysToNames(importData.config.disabledBars || []) as string[],
                }
              : {}),
          };

          // Apply imported configuration
          updateConfig(decodedConfig);
          updateFormatters(importData.formatters);

          // Handle series configurations
          if (importData.seriesConfigs && Array.isArray(importData.seriesConfigs)) {
            const newSeriesConfigs = importData.seriesConfigs.map(
              (series: SeriesConfig, index: number) => {
                // Find the header for this series dataColumn to get the correct id
                const decodedDataColumn = decodeKeysToNames(series.dataColumn) as string;
                const header = dataset?.headers?.find(
                  (h: DatasetHeader) => h.name.toLowerCase() === decodedDataColumn.toLowerCase()
                );

                return {
                  ...series,
                  id: header ? header.id : `series-${Date.now()}-${index}`, // Use dataset header id
                  dataColumn: decodedDataColumn, // Use decoded name for current dataset
                };
              }
            );

            // Sync colors from imported series to colors object
            const newColors = { ...colors };
            newSeriesConfigs.forEach((series: SeriesConfig) => {
              newColors[series.dataColumn] = {
                light: series.color,
                dark: series.color,
              };
            });
            updateColors(newColors);
            setSeriesConfigs(newSeriesConfigs);
          }

          showSuccess(t('chart_editor_configImported', 'Configuration imported'));
        } catch (parseError) {
          showError(t('chart_editor_invalidConfigFile', 'Invalid configuration file'));
        }
      };
      input.click();
    } catch (error) {
      showError(t('chart_editor_invalidConfigFile', 'Import failed'));
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
        showError('Chart not found for export');
        return;
      }

      // Get chart title for filename
      const chartTitle = chartConfig?.title || `${chartType}-chart`;
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

        showSuccess(`Chart exported as SVG`);
      } else {
        // Export as raster image (PNG/JPEG)
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            showError('Cannot create canvas for image export');
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
                    showSuccess(`Chart exported as ${format.toUpperCase()}`);
                  } else {
                    showError('Cannot create image file');
                  }
                },
                `image/${format}`,
                format === 'jpeg' ? 0.9 : 1.0
              );
            } catch (drawError) {
              showError('Error drawing chart on canvas: ' + drawError);
            }
          };

          img.onerror = error => {
            showError(`${format.toUpperCase()} export failed. Please try SVG export instead.`);
          };

          // Set timeout for image loading
          setTimeout(() => {
            if (!img.complete) {
              showError('Timeout loading chart. Please try again or export as SVG.');
            }
          }, 5000);

          img.src = svgDataUrl;
        } catch (canvasError) {
          showError(
            `Error exporting as ${format.toUpperCase()}: ${canvasError}. Please try SVG export instead.`
          );
        }
      }
    } catch (error) {
      showError('Error exporting chart: ' + (error as Error).message);
    }
  };

  // Series management functions
  const getAvailableColumns = () => {
    return Object.keys(chartData[0] || {}).filter(
      key => key !== safeChartConfig.xAxisKey && !seriesConfigs.some(s => s.dataColumn === key)
    );
  };

  const updateSeriesConfig = (seriesId: string, updates: Partial<SeriesConfig>) => {
    // Validate that dataColumn is not the same as xAxisKey
    if (updates.dataColumn && updates.dataColumn === safeChartConfig.xAxisKey) {
      return; // Exit early to prevent the update
    }

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

      // Sync with chart config - use all series and manage visibility via disabled properties
      const allDataColumns = updatedSeries.map(s => s.dataColumn);
      const disabledColumns = updatedSeries.filter(s => !s.visible).map(s => s.dataColumn);

      const configUpdates: any = {
        yAxisKeys: allDataColumns,
      };

      if (chartType === 'line' || chartType === 'area') {
        configUpdates.disabledLines = disabledColumns;
      } else if (chartType === 'bar') {
        configUpdates.disabledBars = disabledColumns;
      }

      updateConfig(configUpdates);

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
            light: updates.color || oldSeries.color,
            dark: updates.color || oldSeries.color,
          };
        }
        handleColorChange(newColors);
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
    setSeriesConfigs(prev => {
      // Get available columns based on current state
      const currentAvailableColumns = Object.keys(chartData[0] || {}).filter(
        key => key !== safeChartConfig.xAxisKey && !prev.some(s => s.dataColumn === key)
      );

      if (currentAvailableColumns.length === 0) {
        return prev;
      }

      // Get list of used colors from current series
      const usedColors = prev.map(s => s.color);
      const colorKeys = Object.keys(defaultColorsChart);
      let selectedColor = defaultColorsChart[colorKeys[0]];

      // Find an unused color from defaultColors
      for (const colorKey of colorKeys) {
        const color = defaultColorsChart[colorKey];
        if (!usedColors.includes(color.light)) {
          selectedColor = color;
          break;
        }
      }

      // If all colors in defaultColors are used, generate a random color
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
        // Ensure random color is not already used
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
        name: currentAvailableColumns[0],
        dataColumn: currentAvailableColumns[0],
        color: selectedColor.light,
        visible: true,
      };

      // Update colors synchronously
      const newColors = {
        ...colors,
        [newSeries.dataColumn]: {
          light: selectedColor.light,
          dark: selectedColor.dark,
        },
      };

      setColors(newColors);
      onColorsChange?.(newColors);

      // Create updated series array
      const updatedSeries = [...prev, newSeries];
      const allDataColumns = updatedSeries.map(s => s.dataColumn);
      const disabledColumns = updatedSeries.filter(s => !s.visible).map(s => s.dataColumn);

      const configUpdates: any = {
        yAxisKeys: allDataColumns,
      };

      if (chartType === 'line' || chartType === 'area') {
        configUpdates.disabledLines = disabledColumns;
      } else if (chartType === 'bar') {
        configUpdates.disabledBars = disabledColumns;
      }

      updateConfig(configUpdates);

      return updatedSeries;
    });
  };

  const removeSeries = (seriesId: string) => {
    // Mark that user has manually edited series to prevent auto-regeneration
    hasUserEditedConfig.current = true;

    setSeriesConfigs(prev => {
      // Find the series to remove from the current state (prev)
      const seriesToRemove = prev.find(s => s.id === seriesId);

      if (!seriesToRemove || prev.length <= 1) {
        return prev; // Don't remove if it's the last series or not found
      }

      // Filter out the series to remove
      const updatedSeries = prev.filter(s => s.id !== seriesId);

      // Clean up color mapping using the series we found
      const newColors = { ...colors };
      delete newColors[seriesToRemove.dataColumn];

      // Update colors synchronously
      setColors(newColors);
      onColorsChange?.(newColors);

      // Prepare config updates
      const allDataColumns = updatedSeries.map(s => s.dataColumn);
      const disabledColumns = updatedSeries.filter(s => !s.visible).map(s => s.dataColumn);

      const configUpdates: any = {
        yAxisKeys: allDataColumns,
      };

      if (chartType === 'line' || chartType === 'area') {
        configUpdates.disabledLines = disabledColumns;
      } else if (chartType === 'bar') {
        configUpdates.disabledBars = disabledColumns;
      }

      // Update config with the new series data
      updateConfig(configUpdates);

      return updatedSeries;
    });
  };

  // Render the appropriate D3 chart component
  const renderChart = () => {
    if (!safeChartConfig || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('chart_editor_no_data', 'No data available. Please upload or enter data.')}
            </p>
          </div>
        </div>
      );
    }

    // Common props that are safe for all chart types
    const safeCommonProps = {
      data: chartData,
      arrayData:
        chartData.length > 0
          ? [
              [
                // Ensure xAxisKey is a string, not an array
                Array.isArray(safeChartConfig.xAxisKey)
                  ? safeChartConfig.xAxisKey[0]
                  : safeChartConfig.xAxisKey,
                // Ensure yAxisKeys are strings, not arrays
                ...(Array.isArray(safeChartConfig.yAxisKeys)
                  ? safeChartConfig.yAxisKeys
                  : [safeChartConfig.yAxisKeys]
                ).filter(key => typeof key === 'string' && key.length > 0),
              ],
              ...chartData.map(point => {
                const xKey = Array.isArray(safeChartConfig.xAxisKey)
                  ? safeChartConfig.xAxisKey[0]
                  : safeChartConfig.xAxisKey;
                const yKeys = Array.isArray(safeChartConfig.yAxisKeys)
                  ? safeChartConfig.yAxisKeys
                  : [safeChartConfig.yAxisKeys];

                return [
                  point[xKey],
                  ...yKeys.filter(key => typeof key === 'string').map(key => point[key]),
                ];
              }),
            ]
          : undefined,
      width: safeChartConfig.width,
      height: safeChartConfig.height,
      margin: safeChartConfig.margin,
      xAxisKey: Array.isArray(safeChartConfig.xAxisKey)
        ? safeChartConfig.xAxisKey[0]
        : safeChartConfig.xAxisKey,
      yAxisKeys: Array.isArray(safeChartConfig.yAxisKeys)
        ? safeChartConfig.yAxisKeys.filter(key => typeof key === 'string')
        : [safeChartConfig.yAxisKeys].filter(key => typeof key === 'string'),
      colors: colors,
      seriesNames: Object.fromEntries(
        seriesConfigs.map(series => [series.dataColumn, series.name])
      ),
      title: safeChartConfig.title,
      xAxisLabel: safeChartConfig.xAxisLabel,
      yAxisLabel: safeChartConfig.yAxisLabel,
      showLegend: safeChartConfig.showLegend,
      showGrid: safeChartConfig.showGrid,
      animationDuration: safeChartConfig.animationDuration,
      yAxisFormatter: formatters.useYFormatter
        ? (value: number) => {
            switch (formatters.yFormatterType) {
              case 'currency':
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(value);
              case 'percentage':
                return new Intl.NumberFormat('en-US', { style: 'percent' }).format(value / 100);
              case 'number':
                return new Intl.NumberFormat('en-US').format(value);
              case 'decimal':
                return value.toFixed(2);
              case 'scientific':
                return value.toExponential(2);
              case 'bytes':
                return new Intl.NumberFormat('en-US', { style: 'unit', unit: 'byte' }).format(
                  value
                );
              case 'duration':
                return new Intl.NumberFormat('en-US', { style: 'unit', unit: 'second' }).format(
                  value
                );
              case 'custom':
                return formatters.customYFormatter
                  ? formatters.customYFormatter.replace('{value}', value.toString())
                  : value.toString();
              default:
                return value.toString();
            }
          }
        : undefined,
      xAxisFormatter: formatters.useXFormatter
        ? (value: number) => {
            switch (formatters.xFormatterType) {
              case 'currency':
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(value);
              case 'percentage':
                return new Intl.NumberFormat('en-US', { style: 'percent' }).format(value / 100);
              case 'number':
                return new Intl.NumberFormat('en-US').format(value);
              case 'decimal':
                return value.toFixed(2);
              case 'scientific':
                return value.toExponential(2);
              case 'bytes':
                return new Intl.NumberFormat('en-US', { style: 'unit', unit: 'byte' }).format(
                  value
                );
              case 'duration':
                return new Intl.NumberFormat('en-US', { style: 'unit', unit: 'second' }).format(
                  value
                );
              case 'custom':
                return formatters.customXFormatter
                  ? formatters.customXFormatter.replace('{value}', value.toString())
                  : value.toString();
              default:
                return value.toString();
            }
          }
        : undefined,
      fontSize: {
        axis: safeChartConfig.labelFontSize,
        label: safeChartConfig.labelFontSize,
        title: safeChartConfig.titleFontSize,
      },
    };

    switch (chartType) {
      case 'line': {
        const lineConfig = safeChartConfig as LineChartConfig;
        return (
          <D3LineChart
            {...safeCommonProps}
            disabledLines={lineConfig.disabledLines}
            showPoints={lineConfig.showPoints}
            showPointValues={lineConfig.showPointValues}
            curve={curveOptions[lineConfig.curve as keyof typeof curveOptions]}
            lineWidth={lineConfig.lineWidth}
            pointRadius={lineConfig.pointRadius}
            // Chart-specific props that are supported by D3LineChart
            xAxisStart={lineConfig.xAxisStart}
            yAxisStart={lineConfig.yAxisStart}
            gridOpacity={lineConfig.gridOpacity}
            legendPosition={lineConfig.legendPosition}
            xAxisRotation={lineConfig.xAxisRotation}
            yAxisRotation={lineConfig.yAxisRotation}
            showAxisLabels={lineConfig.showAxisLabels}
            showAxisTicks={lineConfig.showAxisTicks}
            enableZoom={lineConfig.enableZoom}
            enablePan={lineConfig.enablePan}
            zoomExtent={lineConfig.zoomExtent}
            showTooltip={lineConfig.showTooltip}
            theme={lineConfig.theme}
            backgroundColor={lineConfig.backgroundColor}
            titleFontSize={lineConfig.titleFontSize}
            labelFontSize={lineConfig.labelFontSize}
            legendFontSize={lineConfig.legendFontSize}
            yFormatterType={formatters.useYFormatter ? formatters.yFormatterType : undefined}
            xFormatterType={formatters.useXFormatter ? formatters.xFormatterType : undefined}
          />
        );
      }

      case 'bar': {
        const barConfig = safeChartConfig as BarChartConfig;
        return (
          <D3BarChart
            {...safeCommonProps}
            yAxisKeys={safeChartConfig.yAxisKeys.filter(
              key => !(barConfig.disabledBars || []).includes(key)
            )}
            barType={barConfig.barType}
            barWidth={barConfig.barWidth}
            barSpacing={barConfig.barSpacing}
            // Bar chart specific props
            gridOpacity={barConfig.gridOpacity}
            legendPosition={barConfig.legendPosition}
            xAxisRotation={barConfig.xAxisRotation}
            yAxisRotation={barConfig.yAxisRotation}
            showAxisLabels={barConfig.showAxisLabels}
            showAxisTicks={barConfig.showAxisTicks}
            yAxisStart={barConfig.yAxisStart}
            theme={barConfig.theme}
            backgroundColor={barConfig.backgroundColor}
            showTooltip={barConfig.showTooltip}
            titleFontSize={barConfig.titleFontSize}
            labelFontSize={barConfig.labelFontSize}
            legendFontSize={barConfig.legendFontSize}
            enableZoom={barConfig.enableZoom}
            enablePan={barConfig.enablePan}
            zoomExtent={barConfig.zoomExtent}
          />
        );
      }

      case 'area': {
        const areaConfig = safeChartConfig as AreaChartConfig;
        // Create minimal props for D3AreaChart to avoid TypeScript errors
        const areaProps = {
          data: chartData,
          width: safeChartConfig.width,
          height: safeChartConfig.height,
          margin: safeChartConfig.margin,
          xAxisKey: Array.isArray(safeChartConfig.xAxisKey)
            ? safeChartConfig.xAxisKey[0]
            : safeChartConfig.xAxisKey,
          yAxisKeys: Array.isArray(safeChartConfig.yAxisKeys)
            ? safeChartConfig.yAxisKeys.filter(key => typeof key === 'string')
            : [safeChartConfig.yAxisKeys].filter(key => typeof key === 'string'),
          colors: colors,
          title: safeChartConfig.title,
          xAxisLabel: safeChartConfig.xAxisLabel,
          yAxisLabel: safeChartConfig.yAxisLabel,
          showLegend: safeChartConfig.showLegend,
          showGrid: safeChartConfig.showGrid,
          animationDuration: safeChartConfig.animationDuration,
          disabledLines: areaConfig.disabledLines,
          showPoints: areaConfig.showPoints,
          showStroke: areaConfig.showStroke,
          curve: curveOptions[areaConfig.curve as keyof typeof curveOptions],
          opacity: areaConfig.opacity,
          stackedMode: areaConfig.stackedMode,
          // Add zoom functionality to area chart
          enableZoom: areaConfig.enableZoom,
          enablePan: areaConfig.enablePan,
          zoomExtent: areaConfig.zoomExtent,
          showTooltip: areaConfig.showTooltip,
          theme: areaConfig.theme,
          backgroundColor: areaConfig.backgroundColor,
          gridOpacity: areaConfig.gridOpacity,
          legendPosition: areaConfig.legendPosition,
          xAxisRotation: areaConfig.xAxisRotation,
          yAxisRotation: areaConfig.yAxisRotation,
          showAxisLabels: areaConfig.showAxisLabels,
          showAxisTicks: areaConfig.showAxisTicks,
          titleFontSize: areaConfig.titleFontSize,
          labelFontSize: areaConfig.labelFontSize,
          legendFontSize: areaConfig.legendFontSize,
        };
        return <D3AreaChart {...areaProps} />;
      }

      default:
        return null;
    }
  };

  // Chart type options - memoized for performance
  const chartTypeOptions = useMemo(
    () => [
      { value: 'line', label: t('chart_type_line', 'Line Chart'), icon: LineChart },
      { value: 'bar', label: t('chart_type_bar', 'Bar Chart'), icon: BarChart3 },
      { value: 'area', label: t('chart_type_area', 'Area Chart'), icon: AreaChart },
    ],
    [t]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="w-full px-2">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Left Sidebar - Chart Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              {/* Chart Type Selector */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative z-50"
              >
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl overflow-visible">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {t('chart_editor_chartType', 'Chart Type')}
                    </h3>
                  </CardHeader>
                  <CardContent className="relative overflow-visible">
                    <div className="relative z-50">
                      <Select
                        value={chartType}
                        onValueChange={(value: string) => {
                          const newChartType = value as ChartType;
                          setChartType(newChartType);
                          // Create new config for the new chart type while preserving data mappings
                          const newConfig = createDefaultConfig(newChartType, {
                            ...chartConfig,
                            xAxisKey: chartConfig?.xAxisKey,
                            yAxisKeys: chartConfig?.yAxisKeys,
                            title: chartConfig?.title,
                          });
                          setChartConfig(newConfig);
                          onChartTypeChange?.(newChartType);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <div className="flex items-center gap-2 min-h-[20px]">
                            {(() => {
                              const selectedOption = chartTypeOptions.find(
                                opt => opt.value === chartType
                              );

                              if (chartType && selectedOption) {
                                return (
                                  <>
                                    {React.createElement(selectedOption.icon, {
                                      className: 'w-4 h-4 flex-shrink-0',
                                    })}
                                    <span className="truncate">{selectedOption.label}</span>
                                  </>
                                );
                              }
                              return (
                                <span className="text-gray-500">
                                  {t('chart_editor_select_type', 'Select chart type...')}
                                </span>
                              );
                            })()}
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {chartTypeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {React.createElement(option.icon, { className: 'w-4 h-4' })}
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              {/* Data Editor Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <DataEditorSection
                  isCollapsed={!expandedSections.dataEditor}
                  onToggleCollapse={() => toggleSection('dataEditor')}
                  data={chartData}
                  xAxisKey={safeChartConfig.xAxisKey}
                  yAxisKeys={safeChartConfig.yAxisKeys}
                  onOpenModal={() => {}}
                />
              </motion.div>

              {/* Basic Settings Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <BasicSettingsSection
                  isCollapsed={!expandedSections.basicSettings}
                  onToggleCollapse={() => toggleSection('basicSettings')}
                  config={safeChartConfig}
                  onUpdateConfig={handleConfigChange}
                  onApplySizePreset={presetName => {
                    const preset = sizePresets[presetName];
                    if (chartConfig && preset) {
                      handleConfigChange({
                        width: preset.width,
                        height: preset.height,
                      });
                    }
                  }}
                />
              </motion.div>

              {/* Chart Settings Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <ChartSettingsSection
                  isCollapsed={!expandedSections.chartSettings}
                  onToggleCollapse={() => toggleSection('chartSettings')}
                  config={safeChartConfig}
                  onUpdateConfig={handleConfigChange}
                  onUpdateChartSpecific={handleConfigChange}
                  chartType={chartType ?? 'line'}
                  curveType={chartSpecificProps.curve}
                  curveOptions={curveOptions}
                  showPoints={chartSpecificProps.showPoints}
                  lineWidth={chartSpecificProps.lineWidth}
                  pointRadius={chartSpecificProps.pointRadius}
                  barType={chartSpecificProps.barType}
                />
              </motion.div>

              {/* Axis Configuration Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <AxisConfigurationSection
                  isCollapsed={!expandedSections.axisConfiguration}
                  onToggleCollapse={() => toggleSection('axisConfiguration')}
                  config={safeChartConfig}
                  data={chartData}
                  formatters={formatters}
                  onUpdateConfig={handleConfigChange}
                  onUpdateFormatters={handleFormatterChange}
                />
              </motion.div>

              {/* Series Management Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
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
                        {expandedSections.seriesManagement && (
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
                            <Plus className="h-4 w-4 mr-1" /> {t('common.add', 'Add')}
                          </Button>
                        )}
                        {!expandedSections.seriesManagement ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {expandedSections.seriesManagement && (
                    <CardContent className="space-y-4">
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
                    </CardContent>
                  )}
                </Card>
              </motion.div>

              {/* Chart Actions Section - Import/Export */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
              >
                <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                  <CardHeader
                    className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded-t-lg"
                    onClick={() => toggleSection('chartActions')}
                  >
                    <div className="flex items-center justify-between w-full">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {t('chart_editor_chart_actions', 'Import / Export & More')}
                      </h3>
                      {expandedSections.chartActions ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                  {expandedSections.chartActions && (
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
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Chart Display */}
          <div className="lg:col-span-6 space-y-6">
            {/* Chart Display Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="sticky top-4 z-10"
            >
              <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 border-0 shadow-2xl">
                <CardContent className="p-6">
                  <div className="w-full h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    {renderChart()}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default UnifiedChartEditor;
