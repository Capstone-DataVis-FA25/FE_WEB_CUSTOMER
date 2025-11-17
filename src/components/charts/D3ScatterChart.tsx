import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { getAxisRequirementDescription } from '../../utils/chartValidation';

// Default color scheme matching LineChart
const defaultColorsChart: Record<string, { light: string; dark: string }> = {
  color1: { light: '#3b82f6', dark: '#60a5fa' },
  color2: { light: '#ef4444', dark: '#f87171' },
  color3: { light: '#10b981', dark: '#34d399' },
  color4: { light: '#f59e0b', dark: '#fbbf24' },
  color5: { light: '#8b5cf6', dark: '#a78bfa' },
  color6: { light: '#ec4899', dark: '#f472b6' },
  color7: { light: '#06b6d4', dark: '#22d3ee' },
  color8: { light: '#84cc16', dark: '#a3e635' },
};

import {
  renderD3Tooltip,
  createHeader,
  createStatLine,
  createSeparator,
  type TooltipLine,
} from './ChartTooltip';

export interface ScatterDataPoint {
  [key: string]: number | string;
}

export interface D3ScatterChartProps {
  arrayData?: (string | number)[][];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKey: string;
  yAxisKeys?: string[];
  colorKey?: string; // Key for color grouping
  sizeKey?: string; // Key for bubble size
  colors?: Record<string, { light: string; dark: string }>;
  // Optional explicit series colors mapping (keyed by header/display name)
  seriesColors?: Record<string, string>;

  // Styling props
  pointRadius?: number;
  minPointRadius?: number;
  maxPointRadius?: number;
  pointOpacity?: number;

  // Title and labels
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;

  // Display options
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showAxisLabels?: boolean;
  showAxisTicks?: boolean;

  // Grid styling
  gridOpacity?: number;

  // Legend options
  legendFontSize?: number;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';

  // Axis configuration
  xAxisStart?: 'auto' | 'zero';
  yAxisStart?: 'auto' | 'zero';
  xAxisRotation?: number;

  // Formatters
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: number) => string;

  // Font sizes
  fontSize?: { axis: number; label: number; title: number };
  titleFontSize?: number;
  labelFontSize?: number;

  // Theme and background
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;

  // Animation
  animationDuration?: number;

  // Regression line
  showRegressionLine?: boolean;
  regressionLineColor?: string;
  regressionLineWidth?: number;
  // Optional series name for single-series scatter (used for legend)
  seriesName?: string;
  seriesNames?: Record<string, string>;

  // Zoom and Pan
  enableZoom?: boolean;
  enablePan?: boolean;
  zoomExtent?: number;
  // Preview variant: render without frame/background card
  variant?: 'default' | 'preview';
}

// Convert array data to scatter data format
function convertArrayToScatterData(arrayData: (string | number)[][]): ScatterDataPoint[] {
  if (!arrayData || arrayData.length === 0) {
    return [];
  }

  if (arrayData.length < 2) {
    console.warn('Array data must have at least 2 rows (headers + data)');
    return [];
  }

  const headers = arrayData[0] as string[];
  const dataRows = arrayData.slice(1);

  if (headers.length === 0) {
    console.warn('No headers found in first row');
    return [];
  }

  const scatterData: ScatterDataPoint[] = dataRows.map((row, rowIndex) => {
    const dataPoint: ScatterDataPoint = {};
    headers.forEach((header, headerIndex) => {
      const value = row[headerIndex];

      // Handle undefined/null/N/A values
      if (value === undefined || value === null || value === 'N/A' || value === '') {
        console.warn(
          `Missing/invalid value at row ${rowIndex + 1}, column ${headerIndex} (${header}):`,
          value
        );
        if (headerIndex === 0) {
          dataPoint[header] = `Row ${rowIndex + 1}`;
        } else {
          dataPoint[header] = 0;
        }
        return;
      }

      // Try to convert to number if it's a numeric string
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

  return scatterData;
}

// Validate processed scatter data (objects) for given x/y keys
function validateScatterDataObjects(
  data: ScatterDataPoint[],
  xKey: string,
  yKey: string
): { validCount: number; total: number; invalidRows: number[] } {
  let validCount = 0;
  const invalidRows: number[] = [];
  data.forEach((d, i) => {
    const x = Number(d[xKey]);
    const y = Number(d[yKey]);
    if (!isNaN(x) && !isNaN(y)) validCount++;
    else invalidRows.push(i + 1); // 1-based for easier messages
  });
  return { validCount, total: data.length, invalidRows };
}

// Suggest pairs of keys that have at least `minValid` numeric rows
function suggestNumericPairsFromObjects(
  data: ScatterDataPoint[],
  minValid = 2
): Array<[string, string]> {
  if (!data || data.length === 0) return [];
  const keys = Object.keys(data[0]);
  // Count numeric occurrences per key
  const counts: Record<string, number> = {};
  keys.forEach(k => {
    counts[k] = data.reduce((acc, d) => (!isNaN(Number(d[k])) ? acc + 1 : acc), 0);
  });

  const numericKeys = keys.filter(k => counts[k] >= minValid);
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < numericKeys.length; i++) {
    for (let j = i + 1; j < numericKeys.length; j++) {
      pairs.push([numericKeys[i], numericKeys[j]]);
    }
  }
  return pairs;
}

const D3ScatterChart: React.FC<D3ScatterChartProps> = ({
  arrayData,
  width = 800,
  height = 600,
  margin = { top: 20, right: 40, bottom: 60, left: 60 },
  xAxisKey,
  yAxisKey,
  yAxisKeys,
  colorKey,
  sizeKey,
  colors = defaultColorsChart,
  seriesColors,

  // Styling props
  pointRadius = 5,
  minPointRadius = 3,
  maxPointRadius = 15,
  pointOpacity = 0.7,

  // Title and labels
  title,
  xAxisLabel,
  yAxisLabel,

  // Display options
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showAxisLabels = true,
  showAxisTicks = true,

  // Grid styling
  gridOpacity = 0.3,

  // Legend options
  legendFontSize = 11,

  // Axis configuration
  xAxisStart = 'auto',
  yAxisStart = 'auto',
  xAxisRotation = 0,

  // Formatters
  yAxisFormatter,
  xAxisFormatter,

  // Font sizes
  fontSize = { axis: 12, label: 14, title: 16 },
  titleFontSize = 16,
  labelFontSize = 12,

  // Theme and background
  theme = 'auto',
  backgroundColor = 'transparent',

  // Animation
  animationDuration = 400,

  // Regression line
  showRegressionLine = false,
  regressionLineColor,
  regressionLineWidth = 2,
  seriesName,
  seriesNames,
  // legendPosition = 'top',

  // Zoom and Pan
  enableZoom = false,
  enablePan = false,
  zoomExtent = 10,
  variant = 'default',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Chart dimensions follow container size (responsive) but honor default props as maximums
  const [dimensions, setDimensions] = useState({ width, height });

  // Responsive font sizes (match LineChart)
  const responsiveFontSize = useMemo(
    () => ({
      axis: fontSize.axis,
      label: labelFontSize,
      title: titleFontSize,
    }),
    [fontSize.axis, labelFontSize, titleFontSize]
  );

  // Process data
  const processedData = useMemo(() => convertArrayToScatterData(arrayData || []), [arrayData]);

  // Adaptive styling based on data size for performance
  const adaptiveStyles = useMemo(() => {
    const dataSize = processedData?.length || 0;

    // For large datasets, reduce point size and increase opacity
    let adaptiveRadius = pointRadius;
    let adaptiveOpacity = pointOpacity;

    if (dataSize > 2000) {
      adaptiveRadius = Math.max(minPointRadius, pointRadius * 0.4);
      adaptiveOpacity = Math.min(pointOpacity, 0.3);
    } else if (dataSize > 1000) {
      adaptiveRadius = Math.max(minPointRadius, pointRadius * 0.6);
      adaptiveOpacity = Math.min(pointOpacity, 0.5);
    } else if (dataSize > 500) {
      adaptiveRadius = Math.max(minPointRadius, pointRadius * 0.8);
      adaptiveOpacity = Math.min(pointOpacity, 0.6);
    }

    return { radius: adaptiveRadius, opacity: adaptiveOpacity };
  }, [processedData, pointRadius, minPointRadius, pointOpacity]);

  // Determine if current selection is valid for scatter and prepare a clearer error UI
  const validationInfo = useMemo(() => {
    if (!processedData || processedData.length === 0 || !xAxisKey || !yAxisKey) {
      return {
        isInvalid: true,
        validCount: 0,
        total: processedData?.length || 0,
        invalidRows: [],
        suggestions: [] as Array<[string, string]>,
        xReq: getAxisRequirementDescription('scatter', 'x'),
        yReq: getAxisRequirementDescription('scatter', 'y'),
      };
    }
    const val = validateScatterDataObjects(processedData, xAxisKey, yAxisKey);
    if (val.validCount < 2) {
      const suggestions = suggestNumericPairsFromObjects(processedData, 2).slice(0, 4);
      return {
        isInvalid: true,
        ...val,
        suggestions,
        xReq: getAxisRequirementDescription('scatter', 'x'),
        yReq: getAxisRequirementDescription('scatter', 'y'),
      };
    }
    return {
      isInvalid: false,
      ...val,
      suggestions: [] as Array<[string, string]>,
      xReq: '',
      yReq: '',
    };
  }, [processedData, xAxisKey, yAxisKey]);

  // Get theme-specific colors
  const themeColors = useMemo(() => {
    const colorEntries = Object.entries(colors);
    return colorEntries.reduce(
      (acc, [key, value]) => {
        if (typeof value === 'object' && 'light' in value) {
          acc[key] = isDarkMode ? value.dark : value.light;
        } else {
          acc[key] = value as string;
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }, [colors, isDarkMode]);

  // Series colors passed from chart config (direct hex values keyed by header name)
  const seriesColorsMap = React.useMemo(() => {
    return seriesColors || {};
  }, [seriesColors]);

  // Detect theme changes
  useEffect(() => {
    if (theme === 'auto') {
      const checkTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
      };

      checkTheme();
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      return () => observer.disconnect();
    } else {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);

  // Remove ResizeObserver: chart size strictly follows props

  // Monitor container size for responsiveness (make scatter fill the inner container similar to LineChart)
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const dataSize = processedData?.length || 0;

        // Calculate size multiplier based on data density
        let sizeMultiplier = 1;
        if (dataSize > 5000) {
          sizeMultiplier = 2.5; // Significantly larger for very dense data
        } else if (dataSize > 3000) {
          sizeMultiplier = 2.0;
        } else if (dataSize > 2000) {
          sizeMultiplier = 1.7;
        } else if (dataSize > 1000) {
          sizeMultiplier = 1.4;
        } else if (dataSize > 500) {
          sizeMultiplier = 1.2;
        }

        let aspectRatio = height / width;

        if (containerWidth < 640) {
          aspectRatio = Math.min(aspectRatio * 1.2, 0.75);
        } else if (containerWidth < 1024) {
          aspectRatio = Math.min(aspectRatio, 0.6);
        } else {
          aspectRatio = Math.min(aspectRatio, 0.5);
        }

        // Apply size multiplier to both dimensions for large datasets
        const baseWidth = Math.min(containerWidth - 16, width);
        const newWidth = baseWidth * Math.min(sizeMultiplier, 2); // Cap at 2x to avoid too large
        let newHeight = newWidth * aspectRatio * Math.min(sizeMultiplier, 2);

        // Check if labels will be displayed (either explicit prop or fallback to key name)
        const hasXAxisLabel = showAxisLabels && (xAxisLabel || xAxisKey);
        if (hasXAxisLabel) {
          newHeight += containerWidth < 640 ? 35 : 40;
        }

        if (showLegend) {
          // Reserve space for legend at bottom
          newHeight = newHeight * 0.8;
          const legendExtraHeight = 150;
          newHeight += legendExtraHeight;
        }

        const finalWidth = Math.max(Math.floor(newWidth), 100);
        const finalHeight = Math.max(Math.floor(newHeight), 100);

        // Only update if dimensions changed significantly (>5px) to avoid unnecessary re-renders
        setDimensions(prev => {
          const widthDiff = Math.abs(prev.width - finalWidth);
          const heightDiff = Math.abs(prev.height - finalHeight);
          if (widthDiff > 5 || heightDiff > 5) {
            return { width: finalWidth, height: finalHeight };
          }
          return prev;
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [
    width,
    height,
    showLegend,
    showAxisLabels,
    xAxisLabel,
    yAxisLabel,
    xAxisKey,
    yAxisKey,
    processedData,
  ]);
  // Helper: Calculate linear regression
  const calculateLinearRegression = (xVals: number[], yVals: number[]) => {
    const n = xVals.length;
    const sumX = d3.sum(xVals);
    const sumY = d3.sum(yVals);
    const sumXY = d3.sum(xVals.map((x, i) => x * yVals[i]));
    const sumXX = d3.sum(xVals.map(x => x * x));

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  // Main chart rendering with tooltip and legend
  useEffect(() => {
    if (!processedData || processedData.length === 0 || !svgRef.current || !xAxisKey || !yAxisKey) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const chartWidth = dimensions.width;
    const chartHeight = dimensions.height;

    // Responsive margin adjustments (match LineChart behavior) so axis labels and
    // left Y axis ticks are not clipped. Calculate a responsive margin based on
    // container width and whether axis labels/legend are present.
    // Check if labels will be displayed (either explicit prop or fallback to key name)
    const hasXAxisLabel = showAxisLabels && (xAxisLabel || xAxisKey);
    const hasYAxisLabel = showAxisLabels && (yAxisLabel || yAxisKey);
    // Legend position isn't passed explicitly for scatter props in some flows;
    // default to 'top' which matches the defaultBaseChartConfig.
    const legendPosition: string = 'top';

    // Calculate dynamic bottom margin based on X-axis label length
    let xAxisLabelExtraSpace = 0;
    if (hasXAxisLabel) {
      const displayLabel = xAxisLabel || xAxisKey;
      const labelLength = displayLabel.length;
      // For very long labels, add more space
      if (labelLength > 50) {
        xAxisLabelExtraSpace = 40;
      } else if (labelLength > 30) {
        xAxisLabelExtraSpace = 20;
      } else if (labelLength > 20) {
        xAxisLabelExtraSpace = 10;
      }
    }

    // Calculate dynamic left margin based on Y-axis label length
    let yAxisLabelExtraSpace = 0;
    if (hasYAxisLabel) {
      const displayLabel = yAxisLabel || yAxisKey;
      const labelLength = displayLabel.length;
      // For very long labels, add more space
      if (labelLength > 50) {
        yAxisLabelExtraSpace = 30;
      } else if (labelLength > 30) {
        yAxisLabelExtraSpace = 20;
      } else if (labelLength > 20) {
        yAxisLabelExtraSpace = 10;
      }
    }

    let responsiveMargin = {
      top: chartWidth < 640 ? Math.max(margin.top * 0.8, 15) : margin.top,
      right: chartWidth < 640 ? Math.max(margin.right * 0.7, 20) : margin.right,
      bottom:
        legendPosition === 'bottom'
          ? chartWidth < 640
            ? Math.max(margin.bottom * 2.5, 120)
            : Math.max(margin.bottom * 2.0, 100)
          : hasXAxisLabel
            ? chartWidth < 640
              ? Math.max(margin.bottom + 30 + xAxisLabelExtraSpace, 50)
              : Math.max(margin.bottom + 35 + xAxisLabelExtraSpace, 55)
            : chartWidth < 640
              ? Math.max(margin.bottom * 0.8, 25)
              : Math.max(margin.bottom, 30),
      left: hasYAxisLabel
        ? chartWidth < 640
          ? Math.max(margin.left * 0.7 + 20 + yAxisLabelExtraSpace, 60)
          : Math.max(margin.left + 25 + yAxisLabelExtraSpace, 70)
        : chartWidth < 640
          ? Math.max(margin.left * 0.7, 40)
          : Math.max(margin.left, 50),
    };

    let innerWidth = Math.max(chartWidth - responsiveMargin.left - responsiveMargin.right, 100);
    let innerHeight = Math.max(chartHeight - responsiveMargin.top - responsiveMargin.bottom, 100);

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // Validate selected X/Y keys on processed data
    const validation = validateScatterDataObjects(processedData, xAxisKey, yAxisKey);
    // Debug logs for validation
    try {
      console.groupCollapsed && console.groupCollapsed('[D3ScatterChart] validation');
      console.debug('[D3ScatterChart] processedData.length=', processedData.length);
      console.debug('[D3ScatterChart] keys=', Object.keys(processedData[0] || {}));
      console.debug('[D3ScatterChart] xAxisKey, yAxisKey=', xAxisKey, yAxisKey);
      console.debug('[D3ScatterChart] validation=', validation);
    } catch (e) {
      /* ignore */
    } finally {
      try {
        console.groupEnd && console.groupEnd();
      } catch (e) {
        /* ignore */
      }
    }
    if (validation.validCount < 2) {
      // We'll show a nicer HTML overlay in the JSX; skip SVG text here
      return;
    }

    // Create numeric arrays for scales and regression
    const xValues = processedData.map(d => +d[xAxisKey]).filter(v => !isNaN(v));
    const yValues = processedData.map(d => +d[yAxisKey]).filter(v => !isNaN(v));

    // Debug: show sample converted rows and extents
    try {
      console.groupCollapsed && console.groupCollapsed('[D3ScatterChart] sample conversion');
      const sample = processedData.slice(0, 6).map((d, i) => ({
        row: i + 1,
        rawX: d[xAxisKey],
        rawY: d[yAxisKey],
        numX: Number(d[xAxisKey]),
        numY: Number(d[yAxisKey]),
        valid: !isNaN(Number(d[xAxisKey])) && !isNaN(Number(d[yAxisKey])),
      }));
      console.debug('[D3ScatterChart] sampleRows=', sample);
      console.debug(
        '[D3ScatterChart] xValues.length=',
        xValues.length,
        'yValues.length=',
        yValues.length
      );
      console.debug(
        '[D3ScatterChart] xExtent=',
        d3.extent(xValues),
        'yExtent=',
        d3.extent(yValues)
      );
    } catch (e) {
      /* ignore */
    } finally {
      try {
        console.groupEnd && console.groupEnd();
      } catch (e) {
        /* ignore */
      }
    }

    // Before drawing, expand left margin if Y tick labels are very long
    try {
      const yExt = d3.extent(yValues) as [number, number];
      const yDomain: [number, number] = [yAxisStart === 'zero' ? 0 : yExt[0], yExt[1]];
      const yScaleForMeasure = d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);
      const fontPx = fontSize.axis || 12;
      const formatter = (v: number) => (yAxisFormatter ? yAxisFormatter(v) : `${v}`);

      const measureSvgText = (text: string, fontSizePx: number) => {
        const m = svg
          .append('text')
          .attr('x', -9999)
          .attr('y', -9999)
          .style('font-size', `${fontSizePx}px`)
          .style('font-family', 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif')
          .text(text);
        const w = (m.node() as SVGTextElement).getBBox().width;
        m.remove();
        return w;
      };

      let maxTickWidth = 0;
      yScaleForMeasure.ticks(8).forEach(t => {
        const label = formatter(+t);
        const w = measureSvgText(label, fontPx);
        if (w > maxTickWidth) maxTickWidth = w;
      });

      const extraForYAxisLabel = hasYAxisLabel ? 24 : 0;
      const neededLeft = Math.ceil(maxTickWidth + 16 + extraForYAxisLabel);
      if (neededLeft > responsiveMargin.left) {
        responsiveMargin = { ...responsiveMargin, left: neededLeft };
        innerWidth = Math.max(chartWidth - responsiveMargin.left - responsiveMargin.right, 100);
        innerHeight = Math.max(chartHeight - responsiveMargin.top - responsiveMargin.bottom, 100);
      }
    } catch (_) {
      /* keep base margins */
    }

    // Set background
    svg
      .append('rect')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', backgroundColor)
      .attr('rx', 8);

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${responsiveMargin.left},${responsiveMargin.top})`);

    const xExtent = d3.extent(xValues) as [number, number];
    const yExtent = d3.extent(yValues) as [number, number];

    // Apply axis start config
    const xDomain: [number, number] = [
      xAxisStart === 'zero' ? 0 : xAxisStart === 'auto' ? xExtent[0] : xExtent[0],
      xExtent[1],
    ];
    const yDomain: [number, number] = [
      yAxisStart === 'zero' ? 0 : yAxisStart === 'auto' ? yExtent[0] : yExtent[0],
      yExtent[1],
    ];

    const xScale = d3.scaleLinear().domain(xDomain).nice().range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);

    // Color scale
    let colorScale: d3.ScaleOrdinal<string, string> | undefined;
    if (colorKey) {
      const uniqueCategories = Array.from(new Set(processedData.map(d => String(d[colorKey]))));
      const categoryColors = uniqueCategories.map(
        (cat, i) => seriesColorsMap[cat] || themeColors[cat] || d3.schemeCategory10[i % 10]
      );
      colorScale = d3.scaleOrdinal<string>().domain(uniqueCategories).range(categoryColors);
    }

    // Size scale
    let sizeScale: d3.ScaleLinear<number, number> | undefined;
    if (sizeKey) {
      const sizeValues = processedData.map(d => +d[sizeKey]).filter(v => !isNaN(v));
      sizeScale = d3
        .scaleLinear()
        .domain(d3.extent(sizeValues) as [number, number])
        .range([minPointRadius, maxPointRadius]);
    }

    // Grid lines
    const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
    const textColor = isDarkMode ? '#e5e7eb' : '#374151';

    if (showGrid) {
      chartGroup
        .selectAll('.grid-line-x')
        .data(xScale.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-line-x')
        .attr('x1', (d: d3.NumberValue) => xScale(+d))
        .attr('x2', (d: d3.NumberValue) => xScale(+d))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('opacity', gridOpacity);

      chartGroup
        .selectAll('.grid-line-y')
        .data(yScale.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-line-y')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', (d: d3.NumberValue) => yScale(+d))
        .attr('y2', (d: d3.NumberValue) => yScale(+d))
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('opacity', gridOpacity);
    }

    // X Axis with adaptive tick density to prevent overlap
    if (showAxisTicks) {
      // Calculate optimal number of X-axis ticks based on chart width
      const minLabelWidth = 40; // Minimum space needed per label (px)
      const optimalXTickCount = Math.max(5, Math.min(15, Math.floor(innerWidth / minLabelWidth)));

      const xAxis = d3.axisBottom(xScale).ticks(optimalXTickCount);
      if (xAxisFormatter) {
        xAxis.tickFormat(d => xAxisFormatter(+d));
      }

      const xAxisGroup = chartGroup
        .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis);

      // Smart label handling: measure labels and adjust if needed
      const xLabels = xAxisGroup.selectAll('text');

      // Measure label widths to detect overlap
      let needsRotation = false;
      let maxLabelWidth = 0;

      try {
        xLabels.each(function () {
          const bbox = (this as SVGTextElement).getBBox();
          if (bbox.width > maxLabelWidth) maxLabelWidth = bbox.width;
        });

        // If average label width > available space per tick, rotate
        const availableSpacePerTick = innerWidth / optimalXTickCount;
        if (maxLabelWidth > availableSpacePerTick * 0.8) {
          needsRotation = true;
        }
      } catch (_) {
        // Fallback: use rotation prop
        needsRotation = xAxisRotation !== 0;
      }

      // Apply rotation if needed (either from prop or auto-detected)
      const finalRotation = needsRotation ? (xAxisRotation !== 0 ? xAxisRotation : -45) : 0;

      xLabels
        .attr('fill', textColor)
        .attr('font-size', fontSize.axis || 12)
        .attr('transform', `rotate(${finalRotation})`)
        .style('text-anchor', finalRotation !== 0 ? 'end' : 'middle')
        .style('font-weight', '500');

      // Y Axis (dynamic tick density to prevent overlap)
      const minTickSpacing = (fontSize.axis || 12) * 1.6;
      const approxMaxTicks = Math.max(2, Math.floor(innerHeight / Math.max(8, minTickSpacing)));
      const yAxis = d3.axisLeft(yScale).ticks(Math.min(10, approxMaxTicks));
      if (yAxisFormatter) {
        yAxis.tickFormat(d => yAxisFormatter(+d));
      }
      const yAxisGroup = chartGroup.append('g').call(yAxis);
      const yTickText = yAxisGroup
        .selectAll('text')
        .attr('fill', textColor)
        .attr('font-size', fontSize.axis || 12);

      // Add full value tooltip for long labels
      try {
        yTickText.each(function (d: any) {
          const el = d3.select(this);
          const full = yAxisFormatter ? yAxisFormatter(+d) : `${d}`;
          el.append('title').text(full);
        });
      } catch (_) {
        /* noop */
      }
    }

    // Axis labels (match LineChart)
    if (showAxisLabels) {
      // Use xAxisLabel if provided, otherwise use xAxisKey as fallback
      const displayXLabel = xAxisLabel || xAxisKey;
      if (displayXLabel) {
        // Calculate Y position with extra padding outside the chart
        // Add 15px padding for better spacing
        const yOffset = Math.min(margin.bottom - 10, 100) + 15;

        const xLabelText = chartGroup
          .append('text')
          .attr('x', innerWidth / 2)
          .attr('y', innerHeight + yOffset)
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .style('font-size', `${responsiveFontSize.label}px`)
          .style('font-weight', '600')
          .text(displayXLabel);

        // Check if label is too long and needs wrapping
        const textNode = xLabelText.node() as SVGTextElement;
        if (textNode) {
          const bbox = textNode.getBBox();
          // If label is wider than available space, wrap it
          if (bbox.width > innerWidth - 40) {
            xLabelText.remove();

            // Split text into multiple lines
            const words = displayXLabel.split(/\s+/);
            const lineHeight = responsiveFontSize.label * 1.2;
            const maxWidth = innerWidth - 40;

            const textElement = chartGroup
              .append('text')
              .attr('x', innerWidth / 2)
              .attr('y', innerHeight + yOffset - lineHeight / 2)
              .attr('text-anchor', 'middle')
              .attr('fill', textColor)
              .style('font-size', `${responsiveFontSize.label}px`)
              .style('font-weight', '600');

            let line: string[] = [];
            let lineNumber = 0;

            words.forEach((word, i) => {
              line.push(word);
              const testLine = line.join(' ');

              const tspan = textElement.append('tspan').text(testLine);
              const tspanNode = tspan.node() as SVGTSpanElement;

              if (tspanNode && tspanNode.getComputedTextLength() > maxWidth && line.length > 1) {
                line.pop();
                tspan.text(line.join(' '));

                line = [word];
                lineNumber++;

                textElement
                  .append('tspan')
                  .attr('x', innerWidth / 2)
                  .attr('dy', lineHeight)
                  .text(word);
              } else if (i === words.length - 1) {
                // Last word
              } else {
                tspan.remove();
              }
            });
          }
        }
      }
      // Use yAxisLabel if provided, otherwise use yAxisKey as fallback
      const displayYLabel = yAxisLabel || yAxisKey;
      if (displayYLabel) {
        // Calculate X position based on label length
        const labelLength = displayYLabel.length;
        let xOffset = dimensions.width < 768 ? -55 : -65;

        // Add more space for longer labels
        if (labelLength > 50) {
          xOffset -= 20;
        } else if (labelLength > 30) {
          xOffset -= 10;
        } else if (labelLength > 20) {
          xOffset -= 5;
        }

        chartGroup
          .append('text')
          .attr('transform', `rotate(-90)`)
          .attr('x', -innerHeight / 2)
          .attr('y', xOffset)
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .style('font-size', `${responsiveFontSize.label}px`)
          .style('font-weight', '600')
          .text(displayYLabel);
      }
    }

    // Title is rendered above the chart, not inside SVG

    // Draw points with support for multiple Y-series
    // Prefer explicit prop `yAxisKeys`, then keys from `seriesNames`, then fallback to single `yAxisKey`
    const seriesNamesKeys = seriesNames ? Object.keys(seriesNames) : undefined;
    const keysToRender: string[] =
      Array.isArray((yAxisKeys as any) || []) && (yAxisKeys as any).length > 0
        ? (yAxisKeys as string[])
        : Array.isArray(seriesNamesKeys) && seriesNamesKeys.length > 0
          ? seriesNamesKeys
          : [yAxisKey];

    // If colorKey is provided and no explicit multiple y keys, we'll fallback to color grouping per point
    if (keysToRender && keysToRender.length > 1) {
      keysToRender.forEach((key, idx) => {
        const seriesLabel = (seriesNames && seriesNames[key]) || key;
        const seriesColor =
          (seriesColorsMap && seriesColorsMap[key]) ||
          themeColors[key] ||
          Object.values(themeColors)[idx] ||
          '#3b82f6';

        const validPoints = processedData.filter(d => !isNaN(+d[xAxisKey]) && !isNaN(+d[key]));

        chartGroup
          .selectAll(`.scatter-point-${idx}`)
          .data(validPoints)
          .enter()
          .append('circle')
          .attr('class', `scatter-point scatter-point-${idx}`)
          .attr('cx', (d: ScatterDataPoint) => xScale(+d[xAxisKey]))
          .attr('cy', (d: ScatterDataPoint) => yScale(+d[key]))
          .attr('r', 0)
          .attr('fill', seriesColor)
          .attr('opacity', adaptiveStyles.opacity)
          .style('cursor', showTooltip ? 'pointer' : 'default')
          .style('transition', 'all 0.2s ease')
          .on('mouseover', function (event, d) {
            if (!showTooltip) return;

            // Bring hovered point to front and enlarge
            d3.select(this)
              .raise()
              .transition()
              .duration(150)
              .attr(
                'r',
                (sizeKey && sizeScale ? sizeScale(+d[sizeKey]) : adaptiveStyles.radius) * 1.5
              )
              .attr('opacity', 1)
              .attr('stroke', isDarkMode ? '#fff' : '#000')
              .attr('stroke-width', 2);

            // Dim other points
            chartGroup
              .selectAll('.scatter-point')
              .filter(function () {
                return this !== event.currentTarget;
              })
              .transition()
              .duration(150)
              .attr('opacity', adaptiveStyles.opacity * 0.3);

            // No need to remove - renderD3Tooltip will clear and update content
            // IMPORTANT: Must clear old tooltip content before drawing new one
            tooltipGroup.selectAll('*').remove();

            const xVal = xAxisFormatter ? xAxisFormatter(+d[xAxisKey]) : String(d[xAxisKey]);
            const yVal = yAxisFormatter ? yAxisFormatter(+d[key]) : String(d[key]);

            // Build comprehensive tooltip with all available data
            const lines: string[] = [];

            // Add series label as header if available
            if (seriesLabel && seriesLabel !== key) {
              lines.push(`📊 ${seriesLabel}`);
            }

            // Add X and Y values with clear labels
            lines.push(`📈 ${xAxisKey}: ${xVal}`);
            lines.push(`📉 ${seriesLabel}: ${yVal}`);

            // Add other important columns (non-numeric or identifier columns)
            const allKeys = Object.keys(d);
            const otherKeys = allKeys
              .filter(
                k =>
                  k !== xAxisKey &&
                  k !== key &&
                  k !== colorKey &&
                  k !== sizeKey &&
                  d[k] !== undefined &&
                  d[k] !== null &&
                  d[k] !== ''
              )
              .slice(0, 3); // Limit to 3 additional fields

            if (otherKeys.length > 0) {
              lines.push(''); // Empty line as separator
              otherKeys.forEach(k => {
                const val = typeof d[k] === 'number' ? d[k].toLocaleString() : String(d[k]);
                lines.push(`• ${k}: ${val}`);
              });
            }

            // Add color category if available
            if (colorKey && d[colorKey]) {
              lines.push(''); // Empty line as separator
              lines.push(`🏷️ ${colorKey}: ${d[colorKey]}`);
            }

            // Add size value if available
            if (sizeKey && d[sizeKey]) {
              const sizeVal =
                typeof d[sizeKey] === 'number' ? d[sizeKey].toLocaleString() : String(d[sizeKey]);
              lines.push(`📏 ${sizeKey}: ${sizeVal}`);
            }

            const textColorLocal = isDarkMode ? '#fff' : '#222';

            const textEl = tooltipGroup
              .append('text')
              .attr('fill', textColorLocal)
              .style('font-size', '12px')
              .style('font-family', 'system-ui, -apple-system, sans-serif');

            lines.forEach((line, i) => {
              const tspan = textEl
                .append('tspan')
                .attr('x', 12)
                .attr('y', 14 + i * 18)
                .text(line);

              // Make first line (header) bold
              if (i === 0 && seriesLabel && seriesLabel !== key) {
                tspan.style('font-weight', '600').style('font-size', '13px');
              }

              // Reduce spacing for empty lines
              if (line === '') {
                tspan.attr('y', 14 + i * 18 - 6);
              }
            });

            const bbox = (textEl.node() as SVGTextElement).getBBox();

            tooltipGroup
              .insert('rect', 'text')
              .attr('width', bbox.width + 20)
              .attr('height', bbox.height + 10)
              .attr('fill', isDarkMode ? '#222' : '#fff')
              .attr('stroke', isDarkMode ? '#eee' : '#333')
              .attr('rx', 8)
              .attr('opacity', 0.95);

            const mouse = d3.pointer(event, chartGroup.node());
            const tooltipWidth = bbox.width + 20;
            const tooltipHeight = bbox.height + 10;

            // Always position tooltip above the point
            let tx = mouse[0] - tooltipWidth / 2; // Center horizontally on point
            let ty = mouse[1] - tooltipHeight - 15; // Position above with 15px gap

            // Adjust horizontal position if tooltip goes off left/right edges
            if (tx < 0) {
              tx = 5; // Minimum left padding
            } else if (tx + tooltipWidth > innerWidth) {
              tx = innerWidth - tooltipWidth - 5; // Maximum right padding
            }

            // If tooltip would go off top, position below the point instead
            if (ty < 0) {
              ty = mouse[1] + 15; // Position below with 15px gap
            }

            tooltipGroup.attr('transform', `translate(${tx},${ty})`);

            // Smooth fade in
            tooltipGroup.transition().duration(200).style('opacity', 1);
          })
          .on('mouseout', function () {
            // Restore point size and opacity
            d3.select(this)
              .transition()
              .duration(150)
              .attr('r', (d: any) =>
                sizeKey && sizeScale ? sizeScale(+d[sizeKey]) : adaptiveStyles.radius
              )
              .attr('opacity', adaptiveStyles.opacity)
              .attr('stroke', 'none');

            // Restore all points opacity
            chartGroup
              .selectAll('.scatter-point')
              .transition()
              .duration(150)
              .attr('opacity', adaptiveStyles.opacity);

            // Smooth fade out instead of immediate remove
            tooltipGroup.transition().duration(150).style('opacity', 0);
          })
          .transition()
          .duration(animationDuration)
          .attr('r', (d: ScatterDataPoint) =>
            sizeKey && sizeScale ? sizeScale(+d[sizeKey]) : adaptiveStyles.radius
          );
      });
    } else {
      // Fallback behavior: color by colorKey or single yAxisKey
      chartGroup
        .selectAll('.scatter-point')
        .data(processedData)
        .enter()
        .append('circle')
        .attr('class', 'scatter-point')
        .attr('cx', (d: ScatterDataPoint) => xScale(+d[xAxisKey]))
        .attr('cy', (d: ScatterDataPoint) => yScale(+d[yAxisKey]))
        .attr('r', 0)
        .attr('fill', (d: ScatterDataPoint) =>
          colorKey && colorScale
            ? colorScale(String(d[colorKey]))
            : (seriesColorsMap && seriesColorsMap[seriesName || yAxisKey]) ||
              themeColors[seriesName || yAxisKey] ||
              themeColors['color1'] ||
              '#3b82f6'
        )
        .attr('opacity', adaptiveStyles.opacity)
        .style('cursor', showTooltip ? 'pointer' : 'default')
        .on('mouseover', function (event, d) {
          if (!showTooltip) return;

          // Bring hovered point to front and enlarge
          d3.select(this)
            .raise()
            .transition()
            .duration(150)
            .attr(
              'r',
              (sizeKey && sizeScale ? sizeScale(+d[sizeKey]) : adaptiveStyles.radius) * 1.5
            )
            .attr('opacity', 1)
            .attr('stroke', isDarkMode ? '#fff' : '#000')
            .attr('stroke-width', 2);

          // Dim other points
          chartGroup
            .selectAll('.scatter-point')
            .filter(function () {
              return this !== event.currentTarget;
            })
            .transition()
            .duration(150)
            .attr('opacity', adaptiveStyles.opacity * 0.3);

          // No need to remove - renderD3Tooltip will clear and update content
          // tooltipGroup.selectAll('*').remove();

          const xVal = xAxisFormatter ? xAxisFormatter(+d[xAxisKey]) : String(d[xAxisKey]);
          const yVal = yAxisFormatter ? yAxisFormatter(+d[yAxisKey]) : String(d[yAxisKey]);

          // Build comprehensive tooltip using utility functions
          const scatterTooltipLines: TooltipLine[] = [];

          // Add series name as header if available
          if (seriesName && seriesName !== yAxisKey) {
            scatterTooltipLines.push(createHeader(seriesName, { fontSize: 13 }));
          }

          // Add X and Y values with clear labels
          scatterTooltipLines.push(
            createStatLine(xAxisKey, xVal, { fontSize: 12, fontWeight: '600' })
          );
          scatterTooltipLines.push(
            createStatLine(yAxisKey, yVal, { fontSize: 12, fontWeight: '600' })
          );

          // Add other important columns (non-numeric or identifier columns)
          const allKeys = Object.keys(d);
          const otherKeys = allKeys
            .filter(
              k =>
                k !== xAxisKey &&
                k !== yAxisKey &&
                k !== colorKey &&
                k !== sizeKey &&
                d[k] !== undefined &&
                d[k] !== null &&
                d[k] !== ''
            )
            .slice(0, 3); // Limit to 3 additional fields

          if (otherKeys.length > 0) {
            scatterTooltipLines.push(createSeparator());
            otherKeys.forEach(k => {
              const val = typeof d[k] === 'number' ? d[k].toLocaleString() : String(d[k]);
              scatterTooltipLines.push(createStatLine(k, val, { fontSize: 11 }));
            });
          }

          // Add color category if available
          if (colorKey && d[colorKey]) {
            scatterTooltipLines.push(createSeparator());
            scatterTooltipLines.push(
              createStatLine(colorKey, String(d[colorKey]), {
                fontSize: 11,
                fontWeight: '500',
              })
            );
          }

          // Add size value if available
          if (sizeKey && d[sizeKey]) {
            const sizeVal =
              typeof d[sizeKey] === 'number' ? d[sizeKey].toLocaleString() : String(d[sizeKey]);
            scatterTooltipLines.push(
              createStatLine(sizeKey, sizeVal, { fontSize: 11, fontWeight: '500' })
            );
          }

          // Get pointer position
          const mouse = d3.pointer(event, chartGroup.node());

          // Render tooltip using utility function
          renderD3Tooltip(tooltipGroup, {
            lines: scatterTooltipLines,
            isDarkMode,
            position: { x: mouse[0], y: mouse[1] },
            containerWidth: innerWidth,
            containerHeight: innerHeight,
            preferPosition: 'above',
          });

          // Smooth fade in
          tooltipGroup.transition().duration(200).style('opacity', 1);
        })
        .on('mouseout', function () {
          // Restore point size and opacity
          d3.select(this)
            .transition()
            .duration(150)
            .attr('r', (d: any) =>
              sizeKey && sizeScale ? sizeScale(+d[sizeKey]) : adaptiveStyles.radius
            )
            .attr('opacity', adaptiveStyles.opacity)
            .attr('stroke', 'none');

          // Restore all points opacity
          chartGroup
            .selectAll('.scatter-point')
            .transition()
            .duration(150)
            .attr('opacity', adaptiveStyles.opacity);

          // Smooth fade out instead of immediate remove
          tooltipGroup.transition().duration(150).style('opacity', 0);
        })
        .transition()
        .duration(animationDuration)
        .attr('r', (d: ScatterDataPoint) =>
          sizeKey && sizeScale ? sizeScale(+d[sizeKey]) : adaptiveStyles.radius
        );
    }

    // Legend (top-centered pill style like the screenshot)
    if (showLegend) {
      // Build legend items - always show X and Y axis labels for scatter chart
      let items: Array<{ label: string; color: string }> = [];

      // For multi-series scatter, show series names
      if (keysToRender && keysToRender.length > 1) {
        items = keysToRender.map((k, idx) => ({
          label: (seriesNames && seriesNames[k]) || k,
          color:
            (seriesColorsMap && seriesColorsMap[k]) ||
            themeColors[k] ||
            Object.values(themeColors)[idx] ||
            '#3b82f6',
        }));
      }
      // For single series with color categories, show categories only if > 1
      else if (colorKey && colorScale) {
        const categories = colorScale.domain();
        // If only 1 category or want to show X/Y instead, show X/Y labels
        if (categories.length <= 1) {
          const xLabel = xAxisLabel || xAxisKey;
          const yLabel = yAxisLabel || yAxisKey;
          items = [
            {
              label: `${xLabel}`,
              color: themeColors['color1'] || '#3b82f6',
            },
            {
              label: `${yLabel}`,
              color: themeColors['color2'] || '#10b981',
            },
          ];
        } else {
          items = categories.map(cat => ({
            label: cat,
            color: colorScale ? colorScale(cat) : '#3b82f6',
          }));
        }
      }
      // Default: always show X and Y axis column names
      else {
        const xLabel = xAxisLabel || xAxisKey;
        const yLabel = yAxisLabel || yAxisKey;
        items = [
          {
            label: `${xLabel}`,
            color: themeColors['color1'] || '#3b82f6',
          },
          {
            label: `${yLabel}`,
            color: themeColors['color2'] || '#10b981',
          },
        ];
      }

      // Measure approximate widths (chars * factor) to compute pill width
      const fontSizePx = legendFontSize || 12;
      const iconSize = 12;
      const itemSpacing = 18; // space between items
      const paddingX = 14;
      const paddingY = 8;

      // Increased multiplier from 0.6 to 0.7 for more accurate width estimation
      const estimatedTextWidth = (s: string) =>
        Math.max(8, Math.min(200, s.length * (fontSizePx * 0.7)));
      const itemsWidth = items.reduce(
        (acc, it) => acc + iconSize + 6 + estimatedTextWidth(it.label),
        0
      );
      const totalSpacing = Math.max(0, (items.length - 1) * itemSpacing);
      const pillWidth = itemsWidth + totalSpacing + paddingX * 2;
      const pillHeight = iconSize + paddingY * 2;

      const pillX = Math.max(12, (dimensions.width - pillWidth) / 2);
      const pillY = Math.max(8, Math.min(margin.top / 2 || 12, 40));

      const legendGroup = svg.append('g').attr('class', 'legend-group');

      // Background pill
      legendGroup
        .append('rect')
        .attr('x', pillX)
        .attr('y', pillY)
        .attr('rx', pillHeight / 2)
        .attr('ry', pillHeight / 2)
        .attr('width', pillWidth)
        .attr('height', pillHeight)
        .attr('fill', isDarkMode ? 'rgba(17,24,39,0.85)' : 'rgba(255,255,255,0.92)')
        .attr('stroke', isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)')
        .attr('stroke-width', 1)
        .style('filter', 'drop-shadow(0 6px 14px rgba(2,6,23,0.35))');

      // Render items horizontally inside the pill
      let cursorX = pillX + paddingX;
      items.forEach(it => {
        // color square (rounded)
        legendGroup
          .append('rect')
          .attr('x', cursorX)
          .attr('y', pillY + (pillHeight - iconSize) / 2)
          .attr('width', iconSize)
          .attr('height', iconSize)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('fill', it.color || '#3b82f6');

        cursorX += iconSize + 6;

        // text
        legendGroup
          .append('text')
          .attr('x', cursorX)
          .attr('y', pillY + pillHeight / 2 + Math.round(fontSizePx / 3))
          .attr('font-size', fontSizePx)
          .attr('fill', textColor)
          .style('font-weight', 600)
          .text(it.label);

        cursorX += estimatedTextWidth(it.label) + itemSpacing;
      });
    }

    // Regression line
    if (showRegressionLine && xValues.length > 1) {
      const regression = calculateLinearRegression(xValues, yValues);
      const regressionColor = regressionLineColor || (isDarkMode ? '#ef4444' : '#dc2626');

      chartGroup
        .append('line')
        .attr('class', 'regression-line')
        .attr('x1', xScale(xDomain[0]))
        .attr('y1', yScale(regression.slope * xDomain[0] + regression.intercept))
        .attr('x2', xScale(xDomain[1]))
        .attr('y2', yScale(regression.slope * xDomain[1] + regression.intercept))
        .attr('stroke', regressionColor)
        .attr('stroke-width', regressionLineWidth)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.7);
    }

    // Tooltip group created AFTER all points/lines so it renders on top
    // Initialize with opacity 0 for smooth fade in on hover
    // Remove any existing tooltip group first to prevent duplicates
    chartGroup.selectAll('.scatter-tooltip-group').remove();

    const tooltipGroup = chartGroup
      .append('g')
      .attr('class', 'scatter-tooltip-group')
      .style('opacity', 0)
      .style('pointer-events', 'none'); // Prevent tooltip from interfering with mouse events

    // Zoom and Pan
    if (enableZoom || enablePan) {
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, zoomExtent])
        .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
          const transform = event.transform;
          chartGroup.attr(
            'transform',
            `translate(${responsiveMargin.left},${responsiveMargin.top}) scale(${transform.k}) translate(${transform.x},${transform.y})`
          );
        });

      if (!enableZoom) {
        zoom.scaleExtent([1, 1]); // Disable zoom
      }
      if (!enablePan) {
        zoom.translateExtent([
          [0, 0],
          [0, 0],
        ]); // Disable pan
      }

      svg.call(zoom as any);
    }
  }, [
    processedData,
    dimensions,
    margin,
    xAxisKey,
    yAxisKey,
    colorKey,
    sizeKey,
    pointRadius,
    minPointRadius,
    maxPointRadius,
    pointOpacity,
    title,
    xAxisLabel,
    yAxisLabel,
    showGrid,
    showLegend,
    showTooltip,
    showAxisLabels,
    showAxisTicks,
    gridOpacity,
    legendFontSize,
    xAxisStart,
    yAxisStart,
    xAxisRotation,
    yAxisFormatter,
    xAxisFormatter,
    fontSize,
    titleFontSize,
    labelFontSize,
    backgroundColor,
    animationDuration,
    showRegressionLine,
    regressionLineColor,
    regressionLineWidth,
    themeColors,
    isDarkMode,
    enableZoom,
    enablePan,
    zoomExtent,
    adaptiveStyles,
  ]);

  // NOTE: To ensure the scatter chart is always as large as LineChart, BarChart, and AreaChart,
  // make sure the parent container does NOT restrict width/height. This div uses 100% width/height.
  // If the chart appears small, check parent CSS/layout.

  // Info banner for large datasets
  const dataSize = processedData?.length || 0;
  const showDataSizeInfo = dataSize > 1000;

  return (
    <div ref={containerRef} className="w-full">
      {title && title.trim() !== '' && (
        <h3
          className="font-bold text-gray-900 dark:text-white text-center mb-4"
          style={{ fontSize: `${responsiveFontSize.title}px` }}
        >
          {title}
        </h3>
      )}

      {showDataSizeInfo && (
        <div className="mb-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Displaying <strong>{dataSize.toLocaleString()}</strong> points. Chart size has been
              automatically expanded for better visibility.
              {(enableZoom || enablePan) && ' Use zoom/pan for detailed exploration.'}
            </span>
          </div>
        </div>
      )}

      <div
        className={
          variant === 'preview'
            ? 'relative overflow-hidden'
            : 'chart-container relative bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-auto'
        }
      >
        {/* Error overlay for invalid numeric selection */}
        {validationInfo.isInvalid && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            <div className="max-w-[90%] md:max-w-[70%] rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 shadow-lg px-4 py-3 md:px-6 md:py-5">
              <div className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Scatter chart requirements
              </div>
              <ul className="text-xs md:text-sm text-gray-700 dark:text-gray-200 list-disc pl-5 space-y-1 mb-2">
                <li>X-axis must be numeric (continuous)</li>
                <li>Y-axis must be numeric values</li>
              </ul>
              {validationInfo.suggestions && validationInfo.suggestions.length > 0 && (
                <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Try pairs:</span>
                  <span className="ml-2 inline-flex flex-wrap gap-2 align-middle">
                    {validationInfo.suggestions.map((p, i) => (
                      <span
                        key={`${p[0]}-${p[1]}-${i}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200/70 dark:border-blue-800/60"
                      >
                        {p[0]}
                        <span className="opacity-70">/</span>
                        {p[1]}
                      </span>
                    ))}
                  </span>
                </div>
              )}
              <div className="mt-2 text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
                Selected: X = {xAxisKey || '—'}, Y = {yAxisKey || '—'}
              </div>
            </div>
          </div>
        )}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto chart-svg"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          style={{ display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
};

export default D3ScatterChart;
