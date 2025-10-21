import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  TrendingUp,
  Table,
  Camera,
  Download,
  Settings,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  SeriesManagement,
} from '@/components/charts/ChartEditorShared';
import { getResponsiveFontSize } from '@/helpers/chart';
import { defaultColorsChart } from '@/utils/Utils';

// Interface for dataset headers
interface DatasetHeader {
  id: string;
  name: string;
}

interface Dataset {
  headers: DatasetHeader[];
}

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
  dataset?: Dataset; // Dataset prop with proper typing
  validationErrors?: {
    title?: boolean;
    xAxisLabel?: boolean;
    yAxisLabel?: boolean;
    seriesNames?: Record<string, boolean>;
  };
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
  dataset,
  validationErrors,
}) => {
  const { t } = useTranslation();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Map curve option keys to actual d3 curve factories
  const curveFactoryMap: Record<keyof typeof curveOptions, d3.CurveFactory> = {
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

  // Helper function to decode ids to names using dataset.headers
  const decodeKeysToNames = useMemo(() => {
    return (keys: string | string[]): string | string[] => {
      if (!dataset?.headers) return keys;

      const keysArray = Array.isArray(keys) ? keys : [keys];
      const decodedNames = keysArray.map(keyId => {
        const header = dataset.headers.find((h: DatasetHeader) => h.id === keyId);
        return header ? header.name.toLowerCase() : keyId.toLowerCase(); // Convert to lowercase
      });

      return Array.isArray(keys) ? decodedNames : decodedNames[0];
    };
  }, [dataset]);

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

  // Convert arrayData to ChartDataPoint[] if provided - now using internal conversion
  const processedInitialData = useMemo((): ChartDataPoint[] => {
    if (initialArrayData && initialArrayData.length > 0) {
      // Simple conversion function for LineChartEditor
      const convertToChartData = (arrayData: (string | number)[][]) => {
        if (!arrayData || arrayData.length === 0) return [];

        const headers = arrayData[0] as string[];
        const dataRows = arrayData.slice(1);

        return dataRows.map((row, rowIndex) => {
          const dataPoint: ChartDataPoint = {};
          headers.forEach((header, index) => {
            const value = row[index];

            // Handle undefined/null/N/A values
            if (value === undefined || value === null || value === 'N/A' || value === '') {
              // For the first column (usually city/category), use a placeholder; for numeric columns, use 0
              dataPoint[header] = index === 0 ? `Unknown_${rowIndex + 1}` : 0;
              return;
            }

            if (typeof value === 'string') {
              const numValue = parseFloat(value);

              if (!isNaN(numValue)) {
                // Keep as number, don't convert to string with toFixed
                dataPoint[header] = numValue;
              } else {
                dataPoint[header] = value; // Keep as string if not numeric
              }
            } else {
              dataPoint[header] = value;
            }
          });
          return dataPoint;
        });
      };

      const dataAfter = convertToChartData(initialArrayData);
      return dataAfter;
    }

    return [];
  }, [initialArrayData]);

  const responsiveDefaults = getResponsiveDefaults();

  // Default configuration with decoded keys
  const defaultConfig: ChartConfig = {
    width: responsiveDefaults.width,
    height: responsiveDefaults.height,
    margin: { top: 20, right: 40, bottom: 60, left: 80 },
    xAxisKey: (() => {
      // Decode initialConfig.xAxisKey if provided, otherwise use first data column
      if (initialConfig.xAxisKey) {
        return decodeKeysToNames(initialConfig.xAxisKey) as string;
      }
      return processedInitialData.length > 0
        ? Object.keys(processedInitialData[0])[0].toLowerCase()
        : 'x';
    })(),
    yAxisKeys: (() => {
      // Decode initialConfig.yAxisKeys if provided, otherwise use remaining data columns
      if (initialConfig.yAxisKeys) {
        return decodeKeysToNames(initialConfig.yAxisKeys) as string[];
      }
      return processedInitialData.length > 0
        ? Object.keys(processedInitialData[0])
            .slice(1)
            .map(key => key.toLowerCase())
        : ['y']; // Lấy tất cả columns trừ column đầu tiên (xAxisKey)
    })(),
    disabledLines: initialConfig.disabledLines
      ? (decodeKeysToNames(initialConfig.disabledLines) as string[])
      : [], // Default to no disabled lines
    title: t('lineChart_editor_title'),
    xAxisLabel: t('lineChart_editor_xAxisLabel'),
    yAxisLabel: t('lineChart_editor_yAxisLabel'),
    showLegend: true,
    showGrid: true,
    showPoints: true,
    showPointValues: true,
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
  const [colors, setColors] = useState<ColorConfig>({ ...defaultColorsChart, ...initialColors });
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
    chartActions: true, // Keep chart actions expanded by default for easy access
  });

  // Effect to sync data when initialArrayData changes
  useEffect(() => {
    // Only update data state if processedInitialData has actually changed
    if (
      processedInitialData.length > 0 &&
      JSON.stringify(processedInitialData) !== JSON.stringify(data)
    ) {
      setData(processedInitialData);
      setTempData(processedInitialData);
    }
  }, [processedInitialData, data]); // Only run when processedInitialData or data changes

  // Effect to update axisConfigs when dataset headers change
  useEffect(() => {
    if (dataset?.headers && config.yAxisKeys.length > 0) {
      setaxisConfigs(prevConfigs => {
        const newConfigs = config.yAxisKeys.map((key, index) => {
          // Find the header with matching name (case insensitive)
          const header = dataset.headers.find(
            (h: DatasetHeader) => h.name.toLowerCase() === key.toLowerCase()
          );

          const colorKeys = Object.keys(defaultColorsChart);
          const colorIndex = index % colorKeys.length;
          const selectedColorKey = colorKeys[colorIndex];
          const selectedColor = defaultColorsChart[selectedColorKey];

          // Use header.id if found, otherwise fallback to series-index
          const seriesId = header ? header.id : `series-${index}`;

          // Try to preserve existing config if it exists
          const existingConfig = prevConfigs.find(c => c.dataColumn === key);

          return {
            id: seriesId, // Use dataset header id instead of generated id
            name: key,
            dataColumn: key,
            color: existingConfig?.color || selectedColor.light,
            visible:
              existingConfig?.visible !== undefined
                ? existingConfig.visible
                : !config.disabledLines.includes(key),
          };
        });

        return newConfigs;
      });
    }
  }, [dataset, config.yAxisKeys, config.disabledLines]); // axisConfigs is not needed in dependencies as it's the state being set

  // Toggle section collapse
  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Series management state
  const [axisConfigs, setaxisConfigs] = useState<SeriesConfig[]>(() => {
    return config.yAxisKeys.map((key, index) => {
      // Sử dụng màu từ defaultColors theo thứ tự, tránh trùng lặp
      const colorKeys = Object.keys(defaultColorsChart);
      const colorIndex = index % colorKeys.length;
      const selectedColorKey = colorKeys[colorIndex];
      const selectedColor = defaultColorsChart[selectedColorKey];

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
  const updateConfig = useCallback(
    (newConfig: Partial<ChartConfig>) => {
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);

      // Encode names back to ids before sending to parent ChartEditor
      const encodedConfigForParent = {
        ...updatedConfig,
        xAxisKey: encodeNamesToIds(updatedConfig.xAxisKey) as string,
        yAxisKeys: encodeNamesToIds(updatedConfig.yAxisKeys) as string[],
        disabledLines: encodeNamesToIds(updatedConfig.disabledLines || []) as string[],
      };

      onConfigChange?.(encodedConfigForParent);
    },
    [config, onConfigChange, encodeNamesToIds]
  );

  // Special handler for axis configuration to handle xAxisKey conflicts with yAxisKeys
  const updateAxisConfig = useCallback(
    (newConfig: Partial<ChartConfig>) => {
      let updatedConfig = { ...config, ...newConfig };

      // If xAxisKey is being changed, remove it from yAxisKeys if it exists there
      if (newConfig.xAxisKey) {
        // Clean up: Remove the new X-axis key from Y-axis keys if it was previously there
        updatedConfig = {
          ...updatedConfig,
          yAxisKeys: updatedConfig.yAxisKeys.filter(key => key !== newConfig.xAxisKey),
        };

        // Also remove from axisConfigs
        setaxisConfigs(prev => {
          const newConfigs = prev.filter(series => series.dataColumn !== newConfig.xAxisKey);
          return newConfigs;
        });

        // Remove from colors config
        setColors(prev => {
          const newColors = { ...prev };
          if (newConfig.xAxisKey && newColors[newConfig.xAxisKey]) {
            delete newColors[newConfig.xAxisKey];
          }
          return newColors;
        });
      }

      setConfig(updatedConfig);

      // Encode names back to ids before sending to parent ChartEditor
      const encodedConfigForParent = {
        ...updatedConfig,
        xAxisKey: encodeNamesToIds(updatedConfig.xAxisKey) as string,
        yAxisKeys: encodeNamesToIds(updatedConfig.yAxisKeys) as string[],
        disabledLines: encodeNamesToIds(updatedConfig.disabledLines || []) as string[],
      };

      onConfigChange?.(encodedConfigForParent);
    },
    [config, onConfigChange, encodeNamesToIds, showSuccess, t, axisConfigs]
  );

  // Effect to update config when data structure changes - using ref to prevent infinite loop
  const configKeysRef = useRef<{ xAxisKey: string; yAxisKeys: string[] }>({
    xAxisKey: '',
    yAxisKeys: [],
  });

  useEffect(() => {
    if (data.length > 0 && dataset?.headers) {
      // Use dataset headers instead of just data keys
      const availableHeaders = dataset.headers;

      // Handle the case where config keys might be arrays
      const currentXAxisKey = Array.isArray(config.xAxisKey) ? config.xAxisKey[0] : config.xAxisKey;
      const currentYAxisKeys = Array.isArray(config.yAxisKeys)
        ? config.yAxisKeys
        : [config.yAxisKeys];

      // Use header names for keys (assuming headers have 'name' property)
      const newXAxisKey =
        availableHeaders.length > 0 ? availableHeaders[0].name.toLowerCase() : 'x';
      const newYAxisKeys =
        availableHeaders.length > 1
          ? availableHeaders.slice(1).map((header: DatasetHeader) => header.name.toLowerCase())
          : ['y'];

      // Only update if keys have actually changed and different from last update
      const keysChanged =
        currentXAxisKey !== newXAxisKey ||
        JSON.stringify(currentYAxisKeys) !== JSON.stringify(newYAxisKeys);

      const differentFromRef =
        configKeysRef.current.xAxisKey !== newXAxisKey ||
        JSON.stringify(configKeysRef.current.yAxisKeys) !== JSON.stringify(newYAxisKeys);

      if (keysChanged && differentFromRef) {
        configKeysRef.current = { xAxisKey: newXAxisKey, yAxisKeys: newYAxisKeys };
        updateConfig({
          xAxisKey: newXAxisKey,
          yAxisKeys: newYAxisKeys,
        });
      }
    } else if (data.length > 0) {
      // Fallback to original logic if no dataset headers
      const availableKeys = Object.keys(data[0]);

      const currentXAxisKey = Array.isArray(config.xAxisKey) ? config.xAxisKey[0] : config.xAxisKey;
      const currentYAxisKeys = Array.isArray(config.yAxisKeys)
        ? config.yAxisKeys
        : [config.yAxisKeys];

      const newXAxisKey = availableKeys[0]?.toLowerCase() || 'x';
      const newYAxisKeys =
        availableKeys.slice(1).length > 0
          ? availableKeys.slice(1).map(key => key.toLowerCase())
          : ['y'];

      const keysChanged =
        currentXAxisKey !== newXAxisKey ||
        JSON.stringify(currentYAxisKeys) !== JSON.stringify(newYAxisKeys);

      const differentFromRef =
        configKeysRef.current.xAxisKey !== newXAxisKey ||
        JSON.stringify(configKeysRef.current.yAxisKeys) !== JSON.stringify(newYAxisKeys);

      if (keysChanged && differentFromRef) {
        configKeysRef.current = { xAxisKey: newXAxisKey, yAxisKeys: newYAxisKeys };
        updateConfig({
          xAxisKey: newXAxisKey,
          yAxisKeys: newYAxisKeys,
        });
      }
    }
  }, [data, dataset, config.xAxisKey, config.yAxisKeys, updateConfig]); // Include all dependencies but use ref to prevent infinite loop

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
        !axisConfigs.some(s => s.dataColumn === key) // Không được sử dụng bởi series khác
    );
  };

  // Helper function to get available columns for editing existing series
  const getAvailableColumnsForSeries = (seriesId: string) => {
    const availableForSeries = Object.keys(data[0] || {}).filter(
      key =>
        key !== config.xAxisKey && // Không được là xAxisKey
        !axisConfigs.some(s => s.id !== seriesId && s.dataColumn === key) // Không được sử dụng bởi series khác (trừ series hiện tại)
    );
    return availableForSeries;
  };

  // Series management functions
  const updateSeriesConfig = (seriesId: string, updates: Partial<SeriesConfig>) => {
    // Validate that dataColumn is not the same as xAxisKey
    if (updates.dataColumn && updates.dataColumn === config.xAxisKey) {
      showError(
        t(
          'chart_editor_axis_conflict_error',
          `Cannot use "${updates.dataColumn}" as Y-axis because it's already the X-axis`
        )
      );
      return; // Exit early to prevent the update
    }

    setaxisConfigs(prev => {
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
      const usedColors = axisConfigs.map(s => s.color);

      // Tìm màu từ defaultColors chưa được sử dụng
      const colorKeys = Object.keys(defaultColorsChart);
      let selectedColor = defaultColorsChart[colorKeys[0]]; // Fallback color

      for (const colorKey of colorKeys) {
        const color = defaultColorsChart[colorKey];
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

      setaxisConfigs(prev => {
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
    const seriesToRemove = axisConfigs.find(s => s.id === seriesId);
    if (seriesToRemove && axisConfigs.length > 1) {
      // Clean up color mapping
      const newColors = { ...colors };
      delete newColors[seriesToRemove.dataColumn];
      updateColors(newColors);

      setaxisConfigs(prev => {
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

    // Update colors for yAxisKeys
    config.yAxisKeys.forEach((key, index) => {
      const baseColor = colors[index % colors.length];
      newColors[key] = {
        light: baseColor,
        dark: baseColor,
      };
    });

    updateColors(newColors);

    // Update series configs to reflect the new colors
    setaxisConfigs(prev =>
      prev.map((series, index) => ({
        ...series,
        color: colors[index % colors.length],
      }))
    );
  };

  // Export configuration to JSON (config only, no data)
  const exportConfigToJSON = () => {
    try {
      // Encode config keys back to ids for export
      const encodedConfig = {
        ...config,
        xAxisKey: encodeNamesToIds(config.xAxisKey) as string,
        yAxisKeys: encodeNamesToIds(config.yAxisKeys) as string[],
        disabledLines: encodeNamesToIds(config.disabledLines) as string[],
      };

      const exportData = {
        config: encodedConfig, // Use encoded config with ids
        formatters,
        axisConfigs: axisConfigs.map(series => ({
          ...series,
          // Encode dataColumn to id for export
          dataColumn: encodeNamesToIds(series.dataColumn) as string,
        })),
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
      updateColors(defaultColorsChart);
      updateFormatters(defaultFormatters);

      // Reset series configs
      const resetaxisConfigs = resetConfig.yAxisKeys.map((key, index) => {
        const colorKeys = Object.keys(defaultColorsChart);
        const colorIndex = index % colorKeys.length;
        const selectedColorKey = colorKeys[colorIndex];
        const selectedColor = defaultColorsChart[selectedColorKey];

        return {
          id: `series-${Date.now()}-${index}`,
          name: key,
          dataColumn: key,
          color: selectedColor.light,
          visible: true,
        };
      });

      setaxisConfigs(resetaxisConfigs);

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
          if (!importData.config || !importData.formatters) {
            throw new Error('Invalid configuration file structure');
          }

          // Decode config keys from ids back to names for current dataset
          const decodedConfig = {
            ...importData.config,
            xAxisKey: decodeKeysToNames(importData.config.xAxisKey) as string,
            yAxisKeys: decodeKeysToNames(importData.config.yAxisKeys) as string[],
            disabledLines: decodeKeysToNames(importData.config.disabledLines || []) as string[],
          };

          // Apply imported configuration
          updateConfig(decodedConfig);
          updateFormatters(importData.formatters);

          // Handle series configurations
          if (importData.axisConfigs && Array.isArray(importData.axisConfigs)) {
            const newaxisConfigs = importData.axisConfigs.map(
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
            setaxisConfigs(newaxisConfigs);
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
      const chartTitle = config.title || 'line-chart';
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
              transition={{ duration: 0.6, delay: 0.15 }}
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
              transition={{ duration: 0.6, delay: 0.15 }}
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
                  showPointValues: config.showPointValues,
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
                validationErrors={
                  validationErrors
                    ? {
                        xAxisLabel: validationErrors.xAxisLabel,
                        yAxisLabel: validationErrors.yAxisLabel,
                      }
                    : undefined
                }
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
                onUpdateConfig={updateAxisConfig}
                onUpdateFormatters={updateFormatters}
              />
            </motion.div>

            {/* Series Management */}
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
                      series={axisConfigs}
                      onUpdateSeries={updateSeriesConfig}
                      onAddSeries={addSeries}
                      onRemoveSeries={removeSeries}
                      onMoveSeriesUp={(seriesId: string) => {
                        const index = axisConfigs.findIndex(s => s.id === seriesId);
                        if (index > 0) {
                          const newSeries = [...axisConfigs];
                          [newSeries[index], newSeries[index - 1]] = [
                            newSeries[index - 1],
                            newSeries[index],
                          ];
                          setaxisConfigs(newSeries);
                        }
                      }}
                      onMoveSeriesDown={(seriesId: string) => {
                        const index = axisConfigs.findIndex(s => s.id === seriesId);
                        if (index < axisConfigs.length - 1) {
                          const newSeries = [...axisConfigs];
                          [newSeries[index], newSeries[index + 1]] = [
                            newSeries[index + 1],
                            newSeries[index],
                          ];
                          setaxisConfigs(newSeries);
                        }
                      }}
                      availableColumns={getAvailableColumns()}
                      getAvailableColumnsForSeries={getAvailableColumnsForSeries}
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

            {/* Chart Actions Section - Combined Config Management and Export */}
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
                            [
                              // Ensure xAxisKey is a string, not an array
                              Array.isArray(config.xAxisKey) ? config.xAxisKey[0] : config.xAxisKey,
                              // Ensure yAxisKeys are strings, not arrays
                              ...(Array.isArray(config.yAxisKeys)
                                ? config.yAxisKeys
                                : [config.yAxisKeys]
                              ).filter(key => typeof key === 'string' && key.length > 0),
                            ],
                            ...data.map(point => {
                              const xKey = Array.isArray(config.xAxisKey)
                                ? config.xAxisKey[0]
                                : config.xAxisKey;
                              const yKeys = Array.isArray(config.yAxisKeys)
                                ? config.yAxisKeys
                                : [config.yAxisKeys];

                              return [
                                point[xKey],
                                ...yKeys
                                  .filter(key => typeof key === 'string')
                                  .map(key => point[key]),
                              ];
                            }),
                          ]
                        : undefined
                    }
                    width={config.width}
                    height={config.height}
                    margin={config.margin}
                    xAxisKey={Array.isArray(config.xAxisKey) ? config.xAxisKey[0] : config.xAxisKey}
                    yAxisKeys={
                      Array.isArray(config.yAxisKeys)
                        ? config.yAxisKeys.filter(key => typeof key === 'string')
                        : [config.yAxisKeys].filter(key => typeof key === 'string')
                    }
                    disabledLines={config.disabledLines}
                    colors={colors}
                    seriesNames={Object.fromEntries(
                      axisConfigs.map(series => [series.dataColumn, series.name])
                    )}
                    axisConfigs={Object.fromEntries(
                      axisConfigs.map(series => [
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
                    showPointValues={config.showPointValues}
                    animationDuration={config.animationDuration}
                    curve={curveFactoryMap[config.curve]}
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
                    enablePan={config.enablePan}
                    zoomExtent={config.zoomExtent}
                    showTooltip={config.showTooltip}
                    // New visual props
                    theme={config.theme}
                    backgroundColor={config.backgroundColor}
                    titleFontSize={config.titleFontSize}
                    labelFontSize={config.labelFontSize}
                    legendFontSize={config.legendFontSize}
                    // Formatter type props for axis labels
                    yFormatterType={
                      formatters.useYFormatter ? formatters.yFormatterType : undefined
                    }
                    xFormatterType={
                      formatters.useXFormatter ? formatters.xFormatterType : undefined
                    }
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
                a{/* Footer Info */}
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
