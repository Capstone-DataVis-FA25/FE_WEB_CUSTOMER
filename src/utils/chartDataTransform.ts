import type { Dataset } from '@/features/dataset/datasetAPI';
import type { Chart } from '@/features/charts/chartTypes';
import type { FormatterConfig } from '@/types/chart';

/**
 * Transform dataset headers into array format suitable for chart editors
 * @param dataset - Dataset object with headers
 * @returns Array format with headers as first row and data as subsequent rows
 */
export const transformDatasetToArray = (dataset: Dataset): unknown[][] => {
  if (!dataset.headers || dataset.headers.length === 0) {
    return [];
  }

  // Extract headers
  const headers = dataset.headers.map(header => header.name);

  // Find the maximum length of data arrays
  const maxLength = Math.max(...dataset.headers.map(header => header.data?.length || 0));

  // Transform data into rows
  const rows: unknown[][] = [headers];

  for (let i = 0; i < maxLength; i++) {
    const row = dataset.headers.map(header => header.data?.[i] || null);
    rows.push(row);
  }

  return rows;
};

/**
 * Extract chart configuration from API response with fallbacks
 * @param chart - Chart object from API with saved configuration
 * @param dataset - Dataset object for data context (optional)
 * @returns Chart configuration object with proper defaults
 */
export const extractChartConfig = (chart: Chart, dataset?: Dataset) => {
  console.log('📊 Extracting chart config from API:', {
    chartId: chart.id,
    chartName: chart.name,
    hasConfig: !!chart.config,
    hasConfiguration: !!chart.configuration,
    datasetId: chart.datasetId,
  });

  // Get saved configuration from API (can be in chart.config or chart.configuration)
  const savedConfig = chart.config || chart.configuration || {};
  console.log('📊 Saved config found:', savedConfig);

  // If we have dataset, try to get column information for fallbacks
  let availableColumns: string[] = [];
  let numericColumns: string[] = [];
  let stringColumns: string[] = [];

  if (dataset?.headers) {
    const headers = dataset.headers;
    availableColumns = headers.map(h => h.name);

    numericColumns = headers
      .filter(h => {
        const type = h.type?.toLowerCase();
        return (
          type === 'number' ||
          type === 'integer' ||
          type === 'numeric' ||
          type === 'float' ||
          type === 'double' ||
          type === 'decimal'
        );
      })
      .map(h => h.name);

    stringColumns = headers
      .filter(h => {
        const type = h.type?.toLowerCase();
        return type === 'string' || type === 'text' || type === 'varchar' || type === 'char';
      })
      .map(h => h.name);

    console.log('📊 Dataset columns analysis:', {
      total: availableColumns.length,
      numeric: numericColumns,
      string: stringColumns,
    });
  }

  // Create configuration with saved values + smart defaults
  const extractedConfig = {
    // Basic properties
    title: savedConfig.title || chart.name || 'Untitled Chart',
    xAxisLabel: savedConfig.xAxisLabel || stringColumns[0] || 'X Axis',
    yAxisLabel: savedConfig.yAxisLabel || 'Values',

    // Axis configuration - use saved values or intelligent defaults
    xAxisKey: savedConfig.xAxisKey || stringColumns[0] || availableColumns[0] || 'x',
    yAxisKeys:
      Array.isArray(savedConfig.yAxisKeys) && savedConfig.yAxisKeys.length > 0
        ? savedConfig.yAxisKeys
        : numericColumns.slice(0, 3).length > 0
          ? numericColumns.slice(0, 3)
          : availableColumns.length > 1
            ? availableColumns.slice(1, 4)
            : ['value1', 'value2', 'value3'],

    // Dimensions
    width: savedConfig.width || 800,
    height: savedConfig.height || 400,
    margin: savedConfig.margin || { top: 20, right: 40, bottom: 60, left: 80 },

    // Display options
    showLegend: savedConfig.showLegend !== undefined ? savedConfig.showLegend : true,
    showGrid: savedConfig.showGrid !== undefined ? savedConfig.showGrid : true,
    animationDuration: savedConfig.animationDuration || 1000,

    // Chart type specific options
    ...(chart.type === 'line' && {
      showPoints: savedConfig.showPoints !== undefined ? savedConfig.showPoints : true,
      curve: savedConfig.curve || 'curveMonotoneX',
      lineWidth: savedConfig.lineWidth || 2,
      pointRadius: savedConfig.pointRadius || 4,
      disabledLines: savedConfig.disabledLines || [],
    }),

    ...(chart.type === 'area' && {
      showPoints: savedConfig.showPoints !== undefined ? savedConfig.showPoints : false,
      showStroke: savedConfig.showStroke !== undefined ? savedConfig.showStroke : true,
      opacity: savedConfig.opacity || 0.7,
      stackedMode: savedConfig.stackedMode !== undefined ? savedConfig.stackedMode : false,
      curve: savedConfig.curve || 'curveMonotoneX',
      lineWidth: savedConfig.lineWidth || 2,
      pointRadius: savedConfig.pointRadius || 4,
      disabledLines: savedConfig.disabledLines || [],
    }),

    ...(chart.type === 'bar' && {
      barType: savedConfig.barType || 'grouped',
      barWidth: savedConfig.barWidth || 0.8,
      barSpacing: savedConfig.barSpacing || 0.1,
      disabledBars: savedConfig.disabledBars || [],
    }),

    // Advanced options
    xAxisStart: savedConfig.xAxisStart || 'auto',
    yAxisStart: savedConfig.yAxisStart || 'auto',
    gridOpacity: savedConfig.gridOpacity || 0.3,
    legendPosition: savedConfig.legendPosition || 'bottom',
    xAxisRotation: savedConfig.xAxisRotation || 0,
    yAxisRotation: savedConfig.yAxisRotation || 0,
    showAxisLabels: savedConfig.showAxisLabels !== undefined ? savedConfig.showAxisLabels : true,
    showAxisTicks: savedConfig.showAxisTicks !== undefined ? savedConfig.showAxisTicks : true,
    enableZoom: savedConfig.enableZoom !== undefined ? savedConfig.enableZoom : false,
    enablePan: savedConfig.enablePan !== undefined ? savedConfig.enablePan : false,
    zoomExtent: savedConfig.zoomExtent || 10,
    showTooltip: savedConfig.showTooltip !== undefined ? savedConfig.showTooltip : true,
    theme: savedConfig.theme || 'auto',
    backgroundColor: savedConfig.backgroundColor || '#ffffff',
    titleFontSize: savedConfig.titleFontSize || 16,
    labelFontSize: savedConfig.labelFontSize || 12,
    legendFontSize: savedConfig.legendFontSize || 11,
  };

  console.log('📊 Final extracted config:', {
    yAxisKeys: extractedConfig.yAxisKeys,
    xAxisKey: extractedConfig.xAxisKey,
    chartType: chart.type,
    title: extractedConfig.title,
  });

  return extractedConfig;
};

/**
 * Extract color configuration from API response with fallbacks
 * @param chart - Chart object from API with saved colors
 * @param yAxisKeys - Array of y-axis keys for colors
 * @returns Color configuration object
 */
export const extractColorConfig = (chart: Chart, yAxisKeys: string[]) => {
  const savedColors = (chart.config?.colors || chart.configuration?.colors || {}) as Record<
    string,
    unknown
  >;
  console.log('🎨 Extracting colors:', { savedColors, yAxisKeys });

  const defaultColors = [
    '#3b82f6',
    '#f97316',
    '#10b981',
    '#8b5cf6',
    '#f59e0b',
    '#ef4444',
    '#06b6d4',
    '#84cc16',
    '#ec4899',
    '#6b7280',
  ];

  const colorConfig: Record<string, { light: string; dark: string }> = {};

  yAxisKeys.forEach((key, index) => {
    const savedColor = savedColors[key];
    const defaultColor = defaultColors[index % defaultColors.length];

    if (typeof savedColor === 'string') {
      colorConfig[key] = { light: savedColor, dark: savedColor };
    } else if (savedColor && typeof savedColor === 'object' && 'light' in savedColor) {
      colorConfig[key] = savedColor as { light: string; dark: string };
    } else {
      colorConfig[key] = { light: defaultColor, dark: defaultColor };
    }
  });

  console.log('🎨 Final color config:', colorConfig);
  return colorConfig;
};

/**
 * Extract formatter configuration from API response with fallbacks
 * @param chart - Chart object from API with saved formatters
 * @returns Formatter configuration object
 */
export const extractFormatterConfig = (chart: Chart): Partial<FormatterConfig> => {
  const savedFormatters = (chart.config?.formatters ||
    chart.configuration?.formatters ||
    {}) as Record<string, unknown>;
  console.log('📄 Extracting formatters:', savedFormatters);

  const validFormatterTypes: FormatterConfig['yFormatterType'][] = [
    'currency',
    'percentage',
    'number',
    'decimal',
    'scientific',
    'bytes',
    'duration',
    'date',
    'custom',
  ];

  const isValidFormatterType = (type: unknown): type is FormatterConfig['yFormatterType'] => {
    return typeof type === 'string' && (validFormatterTypes as string[]).includes(type);
  };

  const formatterConfig: Partial<FormatterConfig> = {
    useYFormatter:
      typeof savedFormatters.useYFormatter === 'boolean' ? savedFormatters.useYFormatter : true,
    useXFormatter:
      typeof savedFormatters.useXFormatter === 'boolean' ? savedFormatters.useXFormatter : true,
    yFormatterType: isValidFormatterType(savedFormatters.yFormatterType)
      ? savedFormatters.yFormatterType
      : 'number',
    xFormatterType: isValidFormatterType(savedFormatters.xFormatterType)
      ? savedFormatters.xFormatterType
      : 'number',
    customYFormatter: (savedFormatters.customYFormatter as string) || '',
    customXFormatter: (savedFormatters.customXFormatter as string) || '',
  };

  console.log('📄 Final formatter config:', formatterConfig);
  return formatterConfig;
};
