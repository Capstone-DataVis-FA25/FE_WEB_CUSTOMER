import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import D3LineChart from '@/components/charts/D3LineChart';
import type { ChartDataPoint } from '@/components/charts/D3LineChart';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Plus, 
  Minus,
  Edit3,
  X,
  Save,
  Table
} from 'lucide-react';
import * as d3 from 'd3';
import { useTranslation } from 'react-i18next';
import { convertArrayToChartData } from '@/utils/dataConverter';

// LineChart configuration interface
export interface LineChartConfig {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKeys: string[];
  disabledLines: string[]; // New field for disabled lines
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  showLegend: boolean;
  showGrid: boolean;
  showPoints: boolean;
  animationDuration: number;
  curve: keyof typeof curveOptions;
  xAxisStart: "auto" | "zero" | number; // New field for X-axis start
  yAxisStart: "auto" | "zero" | number; // New field for Y-axis start
}

// Formatter configuration
export interface FormatterConfig {
  useYFormatter: boolean;
  useXFormatter: boolean;
  yFormatterType: 'currency' | 'percentage' | 'number' | 'decimal' | 'scientific' | 'bytes' | 'duration' | 'date' | 'custom';
  xFormatterType: 'currency' | 'percentage' | 'number' | 'decimal' | 'scientific' | 'bytes' | 'duration' | 'date' | 'custom';
  customYFormatter: string;
  customXFormatter: string;
}

// Series configuration interface for Data Series management
export interface SeriesConfig {
  id: string;
  name: string;
  dataColumn: string;
  color: string;
  visible: boolean;
}

// Color configuration
export type ColorConfig = Record<string, { light: string; dark: string }>;

// Common chart size presets
const sizePresets = {
  tiny: { width: 300, height: 200, labelKey: 'lineChart_editor_preset_tiny' },
  small: { width: 400, height: 250, labelKey: 'lineChart_editor_preset_small' },
  medium: { width: 600, height: 375, labelKey: 'lineChart_editor_preset_medium' },
  large: { width: 800, height: 500, labelKey: 'lineChart_editor_preset_large' },
  xlarge: { width: 1000, height: 625, labelKey: 'lineChart_editor_preset_xlarge' },
  wide: { width: 1200, height: 400, labelKey: 'lineChart_editor_preset_wide' },
  ultrawide: { width: 1400, height: 350, labelKey: 'lineChart_editor_preset_ultrawide' },
  square: { width: 500, height: 500, labelKey: 'lineChart_editor_preset_square' },
  presentation: { width: 1024, height: 768, labelKey: 'lineChart_editor_preset_presentation' },
  mobile: { width: 350, height: 300, labelKey: 'lineChart_editor_preset_mobile' },
  tablet: { width: 768, height: 480, labelKey: 'lineChart_editor_preset_tablet' },
  responsive: { width: 0, height: 0, labelKey: 'lineChart_editor_preset_responsive' }
};

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
  initialArrayData?: (string | number)[][]; // Array data input
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
      height: Math.max(300, Math.min(containerWidth / aspectRatio, 600)) // Min 300px, max 600px
    };
  };

  const responsiveDefaults = getResponsiveDefaults();

  // Default configuration
  const defaultConfig: LineChartConfig = {
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
    xAxisStart: "auto", // Default to auto
    yAxisStart: "auto", // Default to auto
    ...initialConfig
  };

  const defaultColors: ColorConfig = {
    line1: { light: "#3b82f6", dark: "#60a5fa" }, // Blue
    line2: { light: "#f97316", dark: "#fb923c" }, // Orange  
    line3: { light: "#10b981", dark: "#34d399" }, // Green
    line4: { light: "#ef4444", dark: "#f87171" }, // Red
    line5: { light: "#8b5cf6", dark: "#a78bfa" }, // Purple
    line6: { light: "#06b6d4", dark: "#67e8f9" }, // Cyan
    line7: { light: "#84cc16", dark: "#a3e635" }, // Lime
    line8: { light: "#f59e0b", dark: "#fbbf24" }, // Amber
    line9: { light: "#ec4899", dark: "#f472b6" }, // Pink
    line10: { light: "#6366f1", dark: "#818cf8" }, // Indigo
    line11: { light: "#14b8a6", dark: "#5eead4" }, // Teal
    line12: { light: "#f43f5e", dark: "#fb7185" }, // Rose
    line13: { light: "#a855f7", dark: "#c084fc" }, // Violet
    line14: { light: "#22c55e", dark: "#4ade80" }, // Green-500
    line15: { light: "#ff6b35", dark: "#ff8566" }, // Red-Orange
    line16: { light: "#6d28d9", dark: "#8b5cf6" }, // Purple-700
    line17: { light: "#059669", dark: "#10b981" }, // Emerald-600
    line18: { light: "#dc2626", dark: "#ef4444" }, // Red-600
    line19: { light: "#7c3aed", dark: "#a78bfa" }, // Violet-600
    line20: { light: "#0891b2", dark: "#0ea5e9" }, // Sky-600
    ...initialColors
  };

  const defaultFormatters: FormatterConfig = {
    useYFormatter: true,
    useXFormatter: true,
    yFormatterType: 'number',
    xFormatterType: 'number',
    customYFormatter: '',
    customXFormatter: '',
    ...initialFormatters
  };

  // State management
  const [config, setConfig] = useState<LineChartConfig>(defaultConfig);
  const [colors, setColors] = useState<ColorConfig>(defaultColors);
  const [data, setData] = useState<ChartDataPoint[]>(processedInitialData);
  const [formatters, setFormatters] = useState<FormatterConfig>(defaultFormatters);
  const [showDataModal, setShowDataModal] = useState(false);
  const [tempData, setTempData] = useState<ChartDataPoint[]>(processedInitialData);
  
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
        visible: !config.disabledLines.includes(key)
      };
    });
  });

  // Calculate responsive fontSize based on chart dimensions
  const getResponsiveFontSize = () => {
    const baseSize = Math.min(config.width, config.height);
    if (baseSize <= 300) return { axis: 10, label: 12, title: 14 };
    if (baseSize <= 500) return { axis: 11, label: 13, title: 16 };
    if (baseSize <= 700) return { axis: 12, label: 14, title: 18 };
    if (baseSize <= 900) return { axis: 13, label: 15, title: 20 };
    return { axis: 14, label: 16, title: 22 };
  };

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
          if (value >= 1024*1024*1024) return `${(value / (1024*1024*1024)).toFixed(1)}GB`;
          if (value >= 1024*1024) return `${(value / (1024*1024)).toFixed(1)}MB`;
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
          if (value >= 1024*1024*1024) return `${(value / (1024*1024*1024)).toFixed(1)}GB`;
          if (value >= 1024*1024) return `${(value / (1024*1024)).toFixed(1)}MB`;
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
            return new Function('value', `return ${formatters.customXFormatter}`) as (value: number) => string;
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

  // Helper function to get available columns for new series
  const getAvailableColumns = () => {
    return Object.keys(data[0] || {}).filter(key => 
      key !== config.xAxisKey && // Không được là xAxisKey
      !seriesConfigs.some(s => s.dataColumn === key)
    );
  };

  // Helper function to check if a column is available for a specific series
  const isColumnAvailableForSeries = (column: string, seriesId: string) => {
    const isNotXAxis = column !== config.xAxisKey; // Không được là xAxisKey
    const currentSeries = seriesConfigs.find(s => s.id === seriesId);
    const isCurrentColumn = currentSeries?.dataColumn === column;
    const isUsedByOther = seriesConfigs.some(s => s.id !== seriesId && s.dataColumn === column);
    
    return isNotXAxis && (isCurrentColumn || !isUsedByOther);
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
        disabledLines: newDisabledLines 
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
            dark: oldSeries.color
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
            dark: updates.color 
          }
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
          dark: randomColor
        };
      }
      
      const newSeries: SeriesConfig = {
        id: `series-${Date.now()}`,
        name: availableColumns[0],
        dataColumn: availableColumns[0],
        color: selectedColor.light,
        visible: true
      };
      
      // Add color mapping for new series
      updateColors({
        ...colors,
        [newSeries.dataColumn]: {
          light: selectedColor.light,
          dark: selectedColor.dark
        }
      });
      
      setSeriesConfigs(prev => {
        const updatedSeries = [...prev, newSeries];
        const allDataColumns = updatedSeries.map(s => s.dataColumn);
        const newDisabledLines = updatedSeries.filter(s => !s.visible).map(s => s.dataColumn);
        
        updateConfig({ 
          yAxisKeys: allDataColumns,
          disabledLines: newDisabledLines
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
          disabledLines: newDisabledLines
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
      [config.xAxisKey]: tempData.length > 0 ? Math.max(...tempData.map(d => d[config.xAxisKey] as number)) + 1 : 1,
    };
    
    config.yAxisKeys.forEach(key => {
      newPoint[key] = 0;
    });
    
    const newTempData = [...tempData, newPoint];
    setTempData(newTempData);
    
    // Focus vào input đầu tiên của dòng mới sau khi component re-render
    setTimeout(() => {
      const newRowIndex = newTempData.length - 1;
      const firstInput = document.querySelector(`input[data-row="${newRowIndex}"][data-col="0"]`) as HTMLInputElement;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 py-8">
      <div className="container mx-auto px-4">
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
                    {t('lineChart_editor_basicSettings')}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Size Presets */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_sizePresets')}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2 max-h overflow-y-auto">
                      {Object.entries(sizePresets).map(([key, preset]) => (
                        <Button
                          key={key}
                          variant={
                            (preset.width === config.width && preset.height === config.height) || 
                            (key === 'responsive' && preset.width === 0) 
                              ? "default" 
                              : "outline"
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
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Custom Size</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">{t('lineChart_editor_width')}</Label>
                        <Input
                          type="number"
                          value={config.width}
                          onChange={(e) => {
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
                        <Label className="text-xs text-gray-600 dark:text-gray-400">{t('lineChart_editor_height')}</Label>
                        <Input
                          type="number"
                          value={config.height}
                          onChange={(e) => {
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
                        Current: {config.width} × {config.height}px | 
                        Ratio: {(config.width / config.height).toFixed(2)}:1
                      </p>
                    </div>
                  </div>

                  {/* Padding Configuration */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Padding (Margin)</Label>
                    <div className="mt-2">
                      {/* Visual Padding Editor */}
                      <div className="relative bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        {/* Top */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <Input
                            type="number"
                            value={config.margin.top}
                            onChange={(e) => {
                              const newTop = parseInt(e.target.value) || 0;
                              updateConfig({ 
                                margin: { ...config.margin, top: Math.max(0, newTop) }
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
                            onChange={(e) => {
                              const newLeft = parseInt(e.target.value) || 0;
                              updateConfig({ 
                                margin: { ...config.margin, left: Math.max(0, newLeft) }
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
                            onChange={(e) => {
                              const newRight = parseInt(e.target.value) || 0;
                              updateConfig({ 
                                margin: { ...config.margin, right: Math.max(0, newRight) }
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
                            onChange={(e) => {
                              const newBottom = parseInt(e.target.value) || 0;
                              updateConfig({ 
                                margin: { ...config.margin, bottom: Math.max(0, newBottom) }
                              });
                            }}
                            className="w-16 h-8 text-xs text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                            min="0"
                          />
                        </div>
                        
                        {/* Center Chart Area Representation */}
                        <div className="bg-white dark:bg-gray-600 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded h-20 flex items-center justify-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Chart Area</span>
                        </div>
                      </div>
                      
                      {/* Padding Values Display */}
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Top:</span>
                            <div className="font-mono">{config.margin.top}px</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Right:</span>
                            <div className="font-mono">{config.margin.right}px</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Bottom:</span>
                            <div className="font-mono">{config.margin.bottom}px</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Left:</span>
                            <div className="font-mono">{config.margin.left}px</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_title_chart')}</Label>
                    <Input
                      value={config.title}
                      onChange={(e) => updateConfig({ title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_xAxisLabel')}</Label>
                      <Input
                        value={config.xAxisLabel}
                        onChange={(e) => updateConfig({ xAxisLabel: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_yAxisLabel')}</Label>
                      <Input
                        value={config.yAxisLabel}
                        onChange={(e) => updateConfig({ yAxisLabel: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_animationDuration')}</Label>
                    <Input
                      type="number"
                      value={config.animationDuration}
                      onChange={(e) => updateConfig({ animationDuration: parseInt(e.target.value) || 1000 })}
                      className="mt-1 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_curveType')}</Label>
                    <select
                      value={config.curve}
                      onChange={(e) => updateConfig({ curve: e.target.value as keyof typeof curveOptions })}
                      className="w-full h-10 mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

            {/* Axis Configuration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Axis Configuration
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* X-Axis Start Configuration */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">X-Axis Start</Label>
                    <div className="space-y-2 mt-2">
                      <select
                        value={typeof config.xAxisStart === "number" ? "custom" : config.xAxisStart}
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            updateConfig({ xAxisStart: 0 });
                          } else {
                            updateConfig({ xAxisStart: e.target.value as "auto" | "zero" });
                          }
                        }}
                        className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="auto">Auto (từ giá trị min của data)</option>
                        <option value="zero">Zero (bắt đầu từ 0)</option>
                        <option value="custom">Custom (giá trị tùy chỉnh)</option>
                      </select>
                      
                      {typeof config.xAxisStart === "number" && (
                        <Input
                          type="number"
                          value={config.xAxisStart}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              updateConfig({ xAxisStart: value });
                            }
                          }}
                          placeholder="Nhập giá trị bắt đầu"
                          className="h-9 text-sm"
                        />
                      )}
                    </div>
                  </div>

                  {/* Y-Axis Start Configuration */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Y-Axis Start</Label>
                    <div className="space-y-2 mt-2">
                      <select
                        value={typeof config.yAxisStart === "number" ? "custom" : config.yAxisStart}
                        onChange={(e) => {
                          if (e.target.value === "custom") {
                            updateConfig({ yAxisStart: 0 });
                          } else {
                            updateConfig({ yAxisStart: e.target.value as "auto" | "zero" });
                          }
                        }}
                        className="w-full h-9 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="auto">Auto (từ giá trị min của data)</option>
                        <option value="zero">Zero (bắt đầu từ 0)</option>
                        <option value="custom">Custom (giá trị tùy chỉnh)</option>
                      </select>
                      
                      {typeof config.yAxisStart === "number" && (
                        <Input
                          type="number"
                          value={config.yAxisStart}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              updateConfig({ yAxisStart: value });
                            }
                          }}
                          placeholder="Nhập giá trị bắt đầu"
                          className="h-9 text-sm"
                        />
                      )}
                    </div>
                  </div>

                  {/* Preview of current axis settings */}
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">X-Axis Start:</span>
                        <span className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded">
                          {config.xAxisStart === "auto" ? "Auto (min data)" : 
                           config.xAxisStart === "zero" ? "From 0" : 
                           `From ${config.xAxisStart}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Y-Axis Start:</span>
                        <span className="font-mono bg-white dark:bg-gray-700 px-2 py-1 rounded">
                          {config.yAxisStart === "auto" ? "Auto (min data)" : 
                           config.yAxisStart === "zero" ? "From 0" : 
                           `From ${config.yAxisStart}`}
                        </span>
                      </div>
                      <div className="text-center mt-2 pt-2 border-t border-blue-300 dark:border-blue-600">
                        <span className="text-blue-600 dark:text-blue-300 font-medium">
                          Chart sẽ cập nhật theo cấu hình trên
                        </span>
                      </div>
                    </div>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('lineChart_editor_displayOptions')}</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showLegend"
                      checked={config.showLegend}
                      onCheckedChange={(checked) => updateConfig({ showLegend: !!checked })}
                    />
                    <Label htmlFor="showLegend" className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_showLegend')}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showGrid"
                      checked={config.showGrid}
                      onCheckedChange={(checked) => updateConfig({ showGrid: !!checked })}
                    />
                    <Label htmlFor="showGrid" className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_showGrid')}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showPoints"
                      checked={config.showPoints}
                      onCheckedChange={(checked) => updateConfig({ showPoints: !!checked })}
                    />
                    <Label htmlFor="showPoints" className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_showPoints')}</Label>
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('lineChart_editor_formatters')}</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {/* Y Axis Formatter */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="useYFormatter"
                          checked={formatters.useYFormatter}
                          onCheckedChange={(checked) => updateFormatters({ useYFormatter: !!checked })}
                        />
                        <Label htmlFor="useYFormatter" className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_yAxisFormatter')}</Label>
                      </div>

                      {formatters.useYFormatter && (
                        <div className="space-y-2 ml-6">
                          <select
                            value={formatters.yFormatterType}
                            onChange={(e) => updateFormatters({ yFormatterType: e.target.value as FormatterConfig['yFormatterType'] })}
                            className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          >
                            <option value="number">{t('lineChart_editor_number')}</option>
                            <option value="currency">{t('lineChart_editor_currency')}</option>
                            <option value="percentage">{t('lineChart_editor_percentage')}</option>
                            <option value="decimal">{t('lineChart_editor_decimal')}</option>
                            <option value="scientific">{t('lineChart_editor_scientific')}</option>
                            <option value="bytes">{t('lineChart_editor_bytes')}</option>
                            <option value="duration">{t('lineChart_editor_duration')}</option>
                            <option value="date">{t('lineChart_editor_date')}</option>
                            <option value="custom">{t('lineChart_editor_custom')}</option>
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

                    {/* X Axis Formatter */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="useXFormatter"
                          checked={formatters.useXFormatter}
                          onCheckedChange={(checked) => updateFormatters({ useXFormatter: !!checked })}
                        />
                        <Label htmlFor="useXFormatter" className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_xAxisFormatter')}</Label>
                      </div>

                      {formatters.useXFormatter && (
                        <div className="space-y-2 ml-6">
                          <select
                            value={formatters.xFormatterType}
                            onChange={(e) => updateFormatters({ xFormatterType: e.target.value as FormatterConfig['xFormatterType'] })}
                            className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          >
                            <option value="number">{t('lineChart_editor_number')}</option>
                            <option value="currency">{t('lineChart_editor_currency')}</option>
                            <option value="percentage">{t('lineChart_editor_percentage')}</option>
                            <option value="decimal">{t('lineChart_editor_decimal')}</option>
                            <option value="scientific">{t('lineChart_editor_scientific')}</option>
                            <option value="bytes">{t('lineChart_editor_bytes')}</option>
                            <option value="duration">{t('lineChart_editor_duration')}</option>
                            <option value="date">{t('lineChart_editor_date')}</option>
                            <option value="custom">{t('lineChart_editor_custom')}</option>
                          </select>

                          {formatters.xFormatterType === 'custom' && (
                            <Input
                              placeholder="e.g., `${new Date(value).getFullYear()}`"
                              value={formatters.customXFormatter}
                              onChange={(e) => updateFormatters({ customXFormatter: e.target.value })}
                              className="text-sm"
                            />
                          )}
                        </div>
                      )}
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
                <CardContent className="p-4 sm:p-6">
                  <D3LineChart
                    arrayData={data.length > 0 ? [
                      [config.xAxisKey, ...config.yAxisKeys],
                      ...data.map(point => [
                        point[config.xAxisKey],
                        ...config.yAxisKeys.map(key => point[key])
                      ])
                    ] : undefined}
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
                    fontSize={getResponsiveFontSize()}
                    xAxisStart={config.xAxisStart}
                    yAxisStart={config.yAxisStart}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* X-Axis Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t('lineChart_editor_xAxisConfiguration')}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('lineChart_editor_xAxisColumn')}</Label>
                    <select
                      value={config.xAxisKey}
                      onChange={(e) => updateConfig({ xAxisKey: e.target.value })}
                      className="mt-1 w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      {Object.keys(data[0] || {}).map(column => (
                        <option key={column} value={column}>{column}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Data Series Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t('lineChart_editor_seriesManagement')} ({seriesConfigs.length})
                  </h3>
                  <Button 
                    onClick={addSeries} 
                    size="sm" 
                    variant="outline" 
                    className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={getAvailableColumns().length === 0}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t('lineChart_editor_addSeries')}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {seriesConfigs.map((series, index) => (
                    <div key={series.id} className="relative group">
                      {/* Series Card */}
                      <div className={`p-6 border-2 rounded-lg transition-all duration-200 ${
                        series.visible 
                          ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 dark:border-blue-600' 
                          : 'border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 opacity-60'
                      }`}>
                        
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
                                  onCheckedChange={(checked) => updateSeriesConfig(series.id, { visible: !!checked })}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('lineChart_editor_seriesVisible')}</span>
                              </div>
                            </div>
                          </div>
                          {seriesConfigs.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeSeries(series.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <X className="h-4 w-4" />
                            </Button>
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
                              onChange={(e) => updateSeriesConfig(series.id, { name: e.target.value })}
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
                              onChange={(e) => updateSeriesConfig(series.id, { dataColumn: e.target.value })}
                              className="w-full h-9 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {Object.keys(data[0] || {}).filter(key => 
                                isColumnAvailableForSeries(key, series.id)
                              ).map(column => (
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
                                  onChange={(e) => {
                                    updateColors({
                                      ...colors,
                                      [series.dataColumn]: {
                                        ...colors[series.dataColumn],
                                        light: e.target.value
                                      }
                                    });
                                    updateSeriesConfig(series.id, { color: e.target.value });
                                  }}
                                  className="w-12 h-9 p-1 border rounded cursor-pointer"
                                />
                                <Input
                                  value={colors[series.dataColumn]?.light || series.color}
                                  onChange={(e) => {
                                    updateColors({
                                      ...colors,
                                      [series.dataColumn]: {
                                        ...colors[series.dataColumn],
                                        light: e.target.value
                                      }
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
                                  onChange={(e) => {
                                    updateColors({
                                      ...colors,
                                      [series.dataColumn]: {
                                        ...colors[series.dataColumn],
                                        dark: e.target.value
                                      }
                                    });
                                  }}
                                  className="w-12 h-9 p-1 border rounded cursor-pointer"
                                />
                                <Input
                                  value={colors[series.dataColumn]?.dark || series.color}
                                  onChange={(e) => {
                                    updateColors({
                                      ...colors,
                                      [series.dataColumn]: {
                                        ...colors[series.dataColumn],
                                        dark: e.target.value
                                      }
                                    });
                                  }}
                                  className="flex-1 h-9 text-sm bg-white dark:bg-gray-800"
                                  placeholder="#000000"
                                />
                              </div>
                            </div>
                          </div>
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
                    <Table className="h-5 w-5" />
                    {t('lineChart_editor_dataEditor')}
                  </h3>
                  <div className="flex gap-2">
                    <Button 
                      onClick={openDataModal} 
                      size="sm" 
                      variant="outline"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      {t('lineChart_editor_editData')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <Table className="h-4 w-4" />
                        <span className="text-sm font-medium">{t('lineChart_editor_dataPreview')}</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        {t('lineChart_editor_editDataDescription')}
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
                            {config.yAxisKeys.map((key) => (
                              <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                          {data.slice(0, 5).map((point, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                {index + 1}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                {point[config.xAxisKey] as number}
                              </td>
                              {config.yAxisKeys.map((key) => (
                                <td key={key} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                                  {point[key] as number}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {data.length > 5 && (
                        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
                          {t('lineChart_editor_moreRows', { count: data.length - 5 })}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center py-2 text-gray-500 dark:text-gray-400">
                      <p className="text-sm">
                        {t('lineChart_editor_totalDataPoints', { count: data.length })}
                      </p>
                    </div>
                  </div>
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
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
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
                          {config.yAxisKeys.map((key) => (
                            <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-32">
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
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700/50">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2">
                              <Input
                                type="number"
                                value={point[config.xAxisKey] as number}
                                onChange={(e) => updateTempDataPoint(index, config.xAxisKey, e.target.value)}
                                data-row={index}
                                data-col="0"
                                className="text-sm border-transparent bg-transparent hover:border-gray-300 focus:border-blue-500 dark:hover:border-gray-600 dark:focus:border-blue-400 rounded-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const nextInput = document.querySelector(`input[data-row="${index}"][data-col="1"]`) as HTMLInputElement;
                                    if (nextInput) {
                                      nextInput.focus();
                                      nextInput.select();
                                    }
                                  } else if (e.key === 'Tab' && !e.shiftKey) {
                                    e.preventDefault();
                                    const nextInput = document.querySelector(`input[data-row="${index}"][data-col="1"]`) as HTMLInputElement;
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
                                  onChange={(e) => updateTempDataPoint(index, key, e.target.value)}
                                  data-row={index}
                                  data-col={colIndex + 1}
                                  className="text-sm border-transparent bg-transparent hover:border-gray-300 focus:border-blue-500 dark:hover:border-gray-600 dark:focus:border-blue-400 rounded-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const nextRowInput = document.querySelector(`input[data-row="${index + 1}"][data-col="${colIndex + 1}"]`) as HTMLInputElement;
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
                                        const nextInput = document.querySelector(`input[data-row="${index}"][data-col="${nextColIndex}"]`) as HTMLInputElement;
                                        if (nextInput) {
                                          nextInput.focus();
                                          nextInput.select();
                                        }
                                      } else {
                                        // Chuyển sang dòng tiếp theo, cột đầu tiên
                                        const nextRowInput = document.querySelector(`input[data-row="${index + 1}"][data-col="0"]`) as HTMLInputElement;
                                        if (nextRowInput) {
                                          nextRowInput.focus();
                                          nextRowInput.select();
                                        }
                                      }
                                    } else if (e.key === 'Tab' && e.shiftKey) {
                                      e.preventDefault();
                                      const prevColIndex = colIndex;
                                      if (prevColIndex >= 0) {
                                        const prevInput = document.querySelector(`input[data-row="${index}"][data-col="${prevColIndex}"]`) as HTMLInputElement;
                                        if (prevInput) {
                                          prevInput.focus();
                                          prevInput.select();
                                        }
                                      } else if (index > 0) {
                                        // Chuyển về dòng trước, cột cuối
                                        const prevRowInput = document.querySelector(`input[data-row="${index - 1}"][data-col="${config.yAxisKeys.length}"]`) as HTMLInputElement;
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
                    <span>{t('lineChart_editor_totalColumns', { count: 1 + config.yAxisKeys.length })}</span>
                  </div>
                  <div className="text-xs">
                    <span className="inline-flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Tab</kbd>
                      <span>{t('lineChart_editor_moveHorizontally')} •</span>
                      <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">Enter</kbd>
                      <span>{t('lineChart_editor_moveDown')}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LineChartEditor;