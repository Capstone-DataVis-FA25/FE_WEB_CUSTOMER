import type { StructuredChartConfig } from '@/types/chart';
import type { ChartType } from '@/features/charts/chartTypes';

// Returns a consistent default StructuredChartConfig for given chart type and optional dataset name
export const getDefaultChartConfig = (chartType: ChartType): StructuredChartConfig => {
  const chartTypeName = chartType.charAt(0).toUpperCase() + chartType.slice(1);

  const baseConfig: StructuredChartConfig = {
    config: {
      title: `${chartTypeName}`,
      xLabel: 'X Axis',
      yLabel: 'Y Axis',
      xColumn: 0,
      width: 800,
      height: 400,
      margin: {
        top: 20,
        left: 80,
        right: 40,
        bottom: 60,
      },
      // Axis configuration
      xAxisKey: '',
      yAxisKeys: [],
      yAxisLabels: [],
      disabledLines: [],
      xAxisLabel: 'xAxisLabel',
      yAxisLabel: 'yAxisLabel',
      // Animation settings
      animationDuration: 1000,
      // Display settings
      showLegend: true,
      showGrid: true,
      showPoints: chartType === 'line',
      showPointValues: chartType === 'line',
      showValues: chartType === 'bar',
      showTooltip: true,
      enableZoom: false,
      enablePan: false,
      showAxisLabels: true,
      showAxisTicks: true,
      showDataLabels: false,
      // Chart-type specific settings
      lineType: 'basic' as const,
      curveType: 'curveMonotoneX' as const,
      curve: 'curveMonotoneX',
      strokeWidth: 2,
      lineWidth: 2,
      pointRadius: 4,
      // Axis formatting
      xAxisRotation: 0,
      yAxisRotation: 0,
      xAxisFormatterType: 'auto' as const,
      yAxisFormatterType: 'number' as const,
      // Colors & Theme
      theme: 'dark',
      backgroundColor: '#18181b',
      gridColor: '#e0e0e0',
      gridOpacity: 0.3,
      textColor: '#f3f4f6',
      colorPalette: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'],
      // Text & Font settings
      titleFontSize: 18,
      titleFontFamily: 'Arial, sans-serif',
      axisLabelFontSize: 12,
      labelFontSize: 12,
      axisLabelFontFamily: 'Arial, sans-serif',
      legendFontSize: 12,
      legendFontFamily: 'Arial, sans-serif',
      // Legend positioning
      legendPosition: 'bottom' as const,
      legendAlignment: 'center' as const,
      legendSize: 150,
      // Border & Visual effects
      borderWidth: 0,
      borderColor: '#23232a',
      shadowEffect: false,
      // Axis range & scale settings
      xAxisMin: null,
      xAxisMax: null,
      yAxisMin: null,
      yAxisMax: null,
      xAxisStart: 'auto',
      yAxisStart: 'auto',
      xAxisTickInterval: undefined,
      yAxisTickInterval: undefined,
      xAxisScale: 'linear' as const,
      yAxisScale: 'linear' as const,
      // Padding & Spacing
      titlePadding: 20,
      legendPadding: 15,
      axisPadding: 10,
      // Zoom & pan
      zoomLevel: 1,
      zoomExtent: 8,
    },
    formatters: {
      useYFormatter: true,
      useXFormatter: true,
      yFormatterType: 'number',
      xFormatterType: 'number',
      customYFormatter: '',
      customXFormatter: '',
    },
    seriesConfigs: [],
    chartType: chartType,
  };

  switch (chartType) {
    case 'line':
      return {
        ...baseConfig,
        config: {
          ...baseConfig.config,
          lineType: 'basic' as const,
          showPoints: true,
          showPointValues: true,
          curveType: 'curveMonotoneX' as const,
          strokeWidth: 2,
        },
      };
    case 'bar':
      return {
        ...baseConfig,
        config: {
          ...baseConfig.config,
          barType: 'grouped' as const,
          barWidth: 0.8,
          barGap: 0.2,
          showValues: true,
        },
      };
    case 'area':
      return {
        ...baseConfig,
        config: {
          ...baseConfig.config,
          areaType: 'basic' as const,
          showPoints: false,
          showPointValues: false,
          curveType: 'curveMonotoneX' as const,
          fillOpacity: 0.6,
          strokeWidth: 2,
        },
      };
    default:
      return baseConfig;
  }
};
