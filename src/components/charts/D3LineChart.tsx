import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { defaultColorsChart } from '@/utils/Utils';

function convertArrayToChartData(arrayData: (string | number)[][]): ChartDataPoint[] {
  if (!arrayData || arrayData.length === 0) {
    return [];
  }

  if (arrayData.length < 2) {
    console.warn('Array data must have at least 2 rows (headers + data)');
    return [];
  }

  // First row should contain headers
  const headers = arrayData[0] as string[];
  const dataRows = arrayData.slice(1);

  if (headers.length === 0) {
    console.warn('No headers found in first row');
    return [];
  }

  const chartData: ChartDataPoint[] = dataRows.map((row, rowIndex) => {
    const dataPoint: ChartDataPoint = {};
    headers.forEach((header, headerIndex) => {
      const value = row[headerIndex];

      // Handle undefined/null/N/A values
      if (value === undefined || value === null || value === 'N/A' || value === '') {
        console.warn(
          `Missing/invalid value at row ${rowIndex + 1}, column ${headerIndex} (${header}):`,
          value
        );
        // For the first column (usually category/label), use a placeholder; for numeric columns, use 0
        if (headerIndex === 0) {
          dataPoint[header] = `Unknown_${rowIndex + 1}`; // Placeholder for category
        } else {
          dataPoint[header] = 0; // Default to 0 for missing numeric values
        }
        return;
      }

      // Try to convert to number if it's a numeric string (strict check)
      if (typeof value === 'string') {
        // Clean the string (remove commas, spaces)
        const cleanedValue = value.replace(/[,\s]/g, '');
        // Only treat as numeric if the entire cleaned string is a valid number (no letters, dashes, etc.)
        const numericPattern = /^[+-]?\d+(?:\.\d+)?$/;
        if (numericPattern.test(cleanedValue)) {
          dataPoint[header] = parseFloat(cleanedValue);
        } else {
          // Keep as original string (useful for dates like '2024-01')
          dataPoint[header] = value;
        }
      } else {
        dataPoint[header] = value;
      }
    });

    return dataPoint;
  });

  return chartData;
}

export interface ChartDataPoint {
  [key: string]: number | string;
}

export interface D3LineChartProps {
  arrayData?: (string | number)[][]; // Array data input
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKeys: string[];
  disabledLines?: string[]; // New prop for disabled lines
  colors?: Record<string, { light: string; dark: string }>;
  seriesNames?: Record<string, string>; // Add series names mapping
  xAxisNames?: Record<string, string>; // Map X-axis values from ID to display name
  // Individual series configurations
  axisConfigs?: Record<
    string,
    {
      lineWidth?: number;
      pointRadius?: number;
      lineStyle?: 'solid' | 'dashed' | 'dotted';
      pointStyle?: 'circle' | 'square' | 'triangle' | 'diamond';
      opacity?: number;
      formatter?: string;
    }
  >;
  title?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showPoints?: boolean;
  xAxisStart?: 'auto' | 'zero'; // X-axis start option
  yAxisStart?: 'auto' | 'zero'; // Y-axis start option
  animationDuration?: number;
  curve?: d3.CurveFactory;
  yAxisFormatter?: (value: number) => string; // Add custom Y-axis formatter
  xAxisFormatter?: (value: number) => string; // Add custom X-axis formatter
  fontSize?: { axis: number; label: number; title: number }; // Add fontSize prop

  // Formatter type props for displaying in axis labels
  yFormatterType?:
    | 'currency'
    | 'percentage'
    | 'number'
    | 'decimal'
    | 'scientific'
    | 'bytes'
    | 'duration'
    | 'date'
    | 'custom';
  xFormatterType?:
    | 'currency'
    | 'percentage'
    | 'number'
    | 'decimal'
    | 'scientific'
    | 'bytes'
    | 'duration'
    | 'date'
    | 'custom';

  // New styling props
  lineWidth?: number;
  pointRadius?: number;
  gridOpacity?: number;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';

  // New axis props
  xAxisRotation?: number;
  yAxisRotation?: number;
  showAxisLabels?: boolean;
  showAxisTicks?: boolean;

  // New interaction props
  enableZoom?: boolean;
  enablePan?: boolean;
  zoomExtent?: number;
  showTooltip?: boolean;

  // New visual props
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  titleFontSize?: number;
  labelFontSize?: number;
  legendFontSize?: number;
  showPointValues?: boolean; // Show values on data points
}

const D3LineChart: React.FC<D3LineChartProps> = ({
  arrayData,
  width = 800,
  height = 600, // Reduced from 500 to 400 for better proportions
  margin = { top: 20, right: 40, bottom: 60, left: 60 }, // Optimized left margin for Y-axis
  xAxisKey,
  yAxisKeys,
  disabledLines = [], // Default to no disabled lines
  colors = defaultColorsChart,
  seriesNames = {}, // Default to empty object
  xAxisNames = {}, // X-axis names mapping from ID to display name
  axisConfigs = {}, // Individual series configurations
  title,
  yAxisLabel,
  xAxisLabel,
  showLegend = true,
  showGrid = true,
  showPoints = true,
  xAxisStart = 'auto', // Default to auto
  yAxisStart = 'auto', // Default to auto
  animationDuration = 1000,
  curve = d3.curveMonotoneX,
  yAxisFormatter, // Optional custom Y-axis formatter
  xAxisFormatter, // Optional custom X-axis formatter
  fontSize = { axis: 12, label: 14, title: 16 }, // Default fontSize

  // Formatter type props
  yFormatterType,
  xFormatterType,

  // New styling props with defaults
  lineWidth = 2,
  pointRadius = 4,
  gridOpacity = 0.3,
  legendPosition = 'bottom',

  // New axis props with defaults
  xAxisRotation = 0,
  yAxisRotation = 0,
  showAxisLabels = true,
  showAxisTicks = true,

  // New interaction props with defaults
  enableZoom = false,
  enablePan = false,
  zoomExtent = 8,
  showTooltip = true,

  // New visual props with defaults
  theme = 'auto',
  backgroundColor = 'transparent',
  titleFontSize = 16,
  labelFontSize = 12,
  legendFontSize = 11,
  showPointValues = false, // Default to not showing values on points
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width, height });

  // Tooltip management refs
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTooltipRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(
    null
  );

  // Helper function to get formatter symbol from formatter type
  const getFormatterSymbol = (formatterType?: string): string => {
    switch (formatterType) {
      case 'currency':
        return '$';
      case 'percentage':
        return '%';
      case 'bytes':
        return 'MB';
      case 'duration':
        return 'min';
      case 'date':
        return 'date';
      case 'decimal':
        return 'dec';
      case 'scientific':
        return 'sci';
      case 'number':
        return '#';
      case 'custom':
        return 'custom';
      default:
        return '';
    }
  };

  // Helper functions for tooltip management
  const clearTooltipTimeout = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  };

  const hideCurrentTooltip = () => {
    if (currentTooltipRef.current) {
      currentTooltipRef.current
        .transition()
        .duration(200) // Fast fade out transition
        .style('opacity', 0)
        .remove();
      currentTooltipRef.current = null;
    }
  };

  // Helper function for different point shapes
  const getPointPath = (style: string, radius: number): string => {
    const r = radius;
    switch (style) {
      case 'square':
        return `M${-r},${-r}L${r},${-r}L${r},${r}L${-r},${r}Z`;
      case 'triangle':
        return `M0,${-r}L${r * 0.866},${r * 0.5}L${-r * 0.866},${r * 0.5}Z`;
      case 'diamond':
        return `M0,${-r}L${r},0L0,${r}L${-r},0Z`;
      default: // circle
        return `M0,${-r}A${r},${r} 0 1,1 0,${r}A${r},${r} 0 1,1 0,${-r}`;
    }
  };

  // Update fontSize object with new props
  const responsiveFontSize = React.useMemo(
    () => ({
      axis: fontSize.axis,
      label: labelFontSize,
      title: titleFontSize,
    }),
    [fontSize.axis, labelFontSize, titleFontSize]
  );

  // Note: Suppress unused variable warning for xAxisNames (used in axis formatting and tooltips)
  void xAxisNames;

  // Convert arrayData to ChartDataPoint[] if provided
  const processedData = React.useMemo((): ChartDataPoint[] => {
    if (arrayData && arrayData.length > 0) {
      const converted = convertArrayToChartData(arrayData);

      // Validate the converted data
      if (converted.length === 0) {
        console.warn('No valid data after conversion');
        return [];
      }

      // Check if we have valid xAxisKey and yAxisKeys in the data
      const firstPoint = converted[0];
      const availableKeys = Object.keys(firstPoint);

      // Validate xAxisKey exists
      if (!availableKeys.includes(xAxisKey)) {
        return [];
      }

      // Validate yAxisKeys exist and have numeric values
      const validYAxisKeys = yAxisKeys.filter(key => {
        if (!availableKeys.includes(key)) {
          return false;
        }

        // Check if the key has numeric values
        const hasNumericValues = converted.some(point => {
          const value = point[key];
          return typeof value === 'number' && !isNaN(value);
        });

        if (!hasNumericValues) {
          return false;
        }

        return true;
      });

      if (validYAxisKeys.length === 0) {
        return [];
      }

      // Note: xAxisKey can contain string or numeric values (for categories or continuous data)

      return converted;
    }

    return [];
  }, [arrayData, xAxisKey, yAxisKeys]);

  // Monitor container size for responsiveness
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Better aspect ratio calculation for different screen sizes
        let aspectRatio = height / width;

        // Adjust aspect ratio based on screen size for better proportions
        if (containerWidth < 640) {
          aspectRatio = Math.min(aspectRatio * 1.2, 0.75); // Slightly taller on mobile but not too much
        } else if (containerWidth < 1024) {
          aspectRatio = Math.min(aspectRatio, 0.6); // Medium screens
        } else {
          aspectRatio = Math.min(aspectRatio, 0.5); // Desktop - wider ratio
        }

        const newWidth = Math.min(containerWidth - 16, width); // 16px for minimal padding
        let newHeight = newWidth * aspectRatio;

        // Add extra height for axis labels
        const hasXAxisLabel = xAxisLabel && showAxisLabels;

        if (hasXAxisLabel) {
          newHeight += containerWidth < 640 ? 35 : 40; // Extra space for X-axis label
        }

        // Adjust chart size when legend is bottom to make room for legend
        if (showLegend && legendPosition === 'bottom') {
          // Reduce chart height to make room for legend and add extra space
          newHeight = newHeight * 0.8; // Reduce chart to 80% to make room
          const legendExtraHeight = 150; // Extra space for bottom legend
          newHeight += legendExtraHeight;
        }

        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [width, height, showLegend, legendPosition, showAxisLabels, xAxisLabel]);

  // Monitor theme changes
  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'auto') {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      } else {
        setIsDarkMode(theme === 'dark');
      }
    };

    // Initial theme detection
    updateTheme();

    // Listen for theme changes only if theme is auto
    if (theme === 'auto') {
      const observer = new MutationObserver(updateTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      return () => observer.disconnect();
    }
  }, [theme]);

  // Cleanup tooltip timeout on unmount
  useEffect(() => {
    return () => {
      clearTooltipTimeout();
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    if (!processedData.length) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    // Additional validation before creating chart
    try {
      // Validate that we have the required keys
      const firstPoint = processedData[0];
      if (!firstPoint[xAxisKey]) {
        console.error(`xAxisKey '${xAxisKey}' not found in first data point:`, firstPoint);
        return;
      }

      const validYAxisKeys = yAxisKeys.filter(key =>
        Object.prototype.hasOwnProperty.call(firstPoint, key)
      );
      if (validYAxisKeys.length === 0) {
        console.error(`No valid yAxisKeys found in first data point:`, firstPoint);
        return;
      }
    } catch (error) {
      console.error('Error during data validation:', error);
      return;
    }

    // Use responsive dimensions
    const currentWidth = dimensions.width;
    const currentHeight = dimensions.height;

    // Get current theme colors for enabled lines only
    const getCurrentColors = () => {
      const theme = isDarkMode ? 'dark' : 'light';
      const result: Record<string, string> = {};
      const enabledLines = yAxisKeys.filter(key => !disabledLines.includes(key));
      enabledLines.forEach((key, index) => {
        const colorKey = colors[key] ? key : `line${index + 1}`;
        result[key] = colors[colorKey]?.[theme] || defaultColorsChart[`color${index + 1}`][theme];
      });
      return result;
    };

    const currentColors = getCurrentColors();

    // Theme-aware colors
    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const gridColor = isDarkMode ? '#4b5563' : '#9ca3af';
    const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';

    // Use backgroundColor prop or fallback to theme default
    const chartBackgroundColor =
      backgroundColor !== 'transparent' ? backgroundColor : isDarkMode ? '#111827' : '#ffffff';

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);

    // Responsive margin adjustments - optimized spacing with label support
    const hasXAxisLabel = xAxisLabel && showAxisLabels;
    const hasYAxisLabel = yAxisLabel && showAxisLabels;

    const responsiveMargin = {
      top: currentWidth < 640 ? Math.max(margin.top * 0.8, 15) : margin.top,
      right: currentWidth < 640 ? Math.max(margin.right * 0.7, 20) : margin.right,
      bottom:
        legendPosition === 'bottom'
          ? currentWidth < 640
            ? Math.max(margin.bottom * 2.5, 120) // Ensure minimum space for legend
            : Math.max(margin.bottom * 2.0, 100)
          : hasXAxisLabel
            ? currentWidth < 640
              ? Math.max(margin.bottom + 30, 50) // Ensure minimum 50px for X-axis label on mobile
              : Math.max(margin.bottom + 35, 55) // Ensure minimum 55px for X-axis label on desktop
            : currentWidth < 640
              ? Math.max(margin.bottom * 0.8, 25) // Minimum 25px on mobile
              : Math.max(margin.bottom, 30), // Minimum 30px for X-axis ticks
      left: hasYAxisLabel
        ? currentWidth < 640
          ? Math.max(margin.left * 0.7 + 20, 60) // Ensure minimum 60px for Y-axis label on mobile
          : Math.max(margin.left + 25, 70) // Ensure minimum 70px for Y-axis label on desktop
        : currentWidth < 640
          ? Math.max(margin.left * 0.7, 40) // Minimum 40px on mobile for Y-axis ticks
          : Math.max(margin.left, 50), // Minimum 50px for Y-axis ticks
    };

    // Set dimensions with validation
    const innerWidth = Math.max(currentWidth - responsiveMargin.left - responsiveMargin.right, 100);
    const innerHeight = Math.max(
      currentHeight - responsiveMargin.top - responsiveMargin.bottom,
      100
    );

    // Validate dimensions
    if (innerWidth < 50 || innerHeight < 50) {
      console.warn('⚠️  Chart dimensions too small, skipping render');
      return;
    }

    // Add background
    svg
      .append('rect')
      .attr('width', currentWidth)
      .attr('height', currentHeight)
      .attr('fill', chartBackgroundColor)
      .attr('rx', 8);

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${responsiveMargin.left},${responsiveMargin.top})`);

    // Enhanced scales with support for categorical X-axis
    const xValues = processedData.map(d => d[xAxisKey]);
    const hasStringXValues = xValues.some(v => typeof v === 'string');
    let xScale: any;

    if (hasStringXValues) {
      // Use ordinal scale for categorical data (like city names)
      const uniqueXValues = [...new Set(xValues)] as string[];

      xScale = d3.scaleBand().domain(uniqueXValues).range([0, innerWidth]).padding(0.1);
    } else {
      // Use linear scale for numeric data
      const numericXValues = xValues.filter(v => typeof v === 'number' && !isNaN(v)) as number[];
      const xExtent = d3.extent(numericXValues) as [number, number];

      if ((!xExtent[0] && xExtent[0] !== 0) || (!xExtent[1] && xExtent[1] !== 0)) {
        return;
      }

      // Dynamic X scale domain based on xAxisStart prop
      let xDomain: [number, number];
      if (xAxisStart === 'zero') {
        xDomain = [0, xExtent[1]];
      } else {
        // Default to 'auto' for all other cases
        xDomain = xExtent;
      }
      xScale = d3.scaleLinear().domain(xDomain).range([0, innerWidth]);
    }

    // Get all Y values and validate they're numeric
    const allYValues = processedData
      .flatMap(d => yAxisKeys.map(key => d[key] as number))
      .filter(v => typeof v === 'number' && !isNaN(v));

    if (allYValues.length === 0) {
      return;
    }

    const yExtent = d3.extent(allYValues) as [number, number];

    if ((!yExtent[0] && yExtent[0] !== 0) || (!yExtent[1] && yExtent[1] !== 0)) {
      return;
    }

    // Dynamic Y scale domain based on yAxisStart prop
    let yDomain: [number, number];

    if (yAxisStart === 'zero') {
      yDomain = [0, yExtent[1]];
    } else {
      // Default to 'auto' for all other cases
      yDomain = yExtent;
    }

    // Create Y scale - only use .nice() when starting from zero
    const yScale =
      yAxisStart === 'auto'
        ? d3.scaleLinear().domain(yDomain).range([innerHeight, 0])
        : d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);

    // Grid lines
    if (showGrid) {
      // Horizontal grid lines
      g.selectAll('.grid-line-horizontal')
        .data(yScale.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-line-horizontal')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', gridOpacity); // Use gridOpacity prop

      // Vertical grid lines - handle both scale types
      let xTickValues: any[];
      if (hasStringXValues) {
        // For categorical data, use domain values
        xTickValues = (xScale as any).domain();
      } else {
        // For numeric data, use ticks
        xTickValues = xScale.ticks();
      }

      g.selectAll('.grid-line-vertical')
        .data(xTickValues)
        .enter()
        .append('line')
        .attr('class', 'grid-line-vertical')
        .attr('x1', d => {
          if (hasStringXValues) {
            return (xScale as any)(d) + (xScale as any).bandwidth() / 2;
          } else {
            return xScale(d);
          }
        })
        .attr('x2', d => {
          if (hasStringXValues) {
            return (xScale as any)(d) + (xScale as any).bandwidth() / 2;
          } else {
            return xScale(d);
          }
        })
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', gridOpacity * 0.7); // Use gridOpacity prop (slightly less for vertical)
    }

    // X Axis with support for both categorical and numeric data
    let xAxis: any;

    if (hasStringXValues) {
      // For categorical data, use all unique values as ticks
      xAxis = d3
        .axisBottom(xScale)
        .tickSizeInner(showAxisTicks ? 6 : 0)
        .tickSizeOuter(showAxisTicks ? 6 : 0)
        .tickFormat((d: any) => {
          // Use xAxisNames to map ID to display name, fallback to original value
          const displayName = xAxisNames[String(d)] || String(d);
          return displayName;
        });
    } else {
      // For numeric data, use actual data values as ticks
      const uniqueXValues = [...new Set(processedData.map(d => d[xAxisKey] as number))].sort(
        (a, b) => a - b
      );
      xAxis = d3
        .axisBottom(xScale)
        .tickValues(uniqueXValues)
        .tickSizeInner(showAxisTicks ? 6 : 0)
        .tickSizeOuter(showAxisTicks ? 6 : 0)
        .tickFormat((d: any) => {
          const value = Number(d);
          if (xAxisFormatter && !isNaN(value)) {
            return xAxisFormatter(value);
          }
          // Use xAxisNames to map ID to display name for numeric values too
          const displayName = xAxisNames[String(d)] || d3.format('d')(value);
          return displayName;
        });
    }

    const xAxisGroup = g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);

    xAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${responsiveFontSize.axis}px`)
      .style('font-weight', '500')
      .attr('transform', `rotate(${xAxisRotation})`)
      .style('text-anchor', xAxisRotation === 0 ? 'middle' : xAxisRotation > 0 ? 'start' : 'end');

    xAxisGroup.select('.domain').attr('stroke', axisColor).attr('stroke-width', 2);

    if (showAxisTicks) {
      xAxisGroup.selectAll('.tick line').attr('stroke', axisColor);
    }

    // Y Axis with flexible formatting
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat(d => {
        const value = d.valueOf();
        // Use custom formatter if provided, otherwise use simple number formatting
        if (yAxisFormatter) {
          return yAxisFormatter(value);
        }
        return value.toLocaleString();
      })
      .tickSizeInner(showAxisTicks ? -5 : 0) // Control inner tick size
      .tickSizeOuter(showAxisTicks ? 6 : 0) // Control outer tick size
      .tickPadding(8); // More space between ticks and labels

    const yAxisGroup = g.append('g').call(yAxis);

    // Style Y-axis labels beautifully
    yAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${responsiveFontSize.axis}px`)
      .style('font-weight', '600')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .attr('text-anchor', 'end')
      .attr('x', -10) // Push labels further left for better spacing
      .attr('transform', `rotate(${yAxisRotation})`);

    // Style Y-axis domain line
    yAxisGroup
      .select('.domain')
      .attr('stroke', axisColor)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Style Y-axis tick lines
    if (showAxisTicks) {
      yAxisGroup
        .selectAll('.tick line')
        .attr('stroke', axisColor)
        .attr('stroke-width', 1)
        .attr('opacity', 0.6);
    }

    // Create lines for each enabled yAxisKey with individual configurations and enhanced validation
    const enabledLines = yAxisKeys.filter(key => !disabledLines.includes(key));

    enabledLines.forEach((key, index) => {
      // Validate that this key has valid data
      const keyData = processedData.filter(d => {
        const xVal = d[xAxisKey];
        const yVal = d[key] as number;

        // For categorical X-axis, validate string values; for numeric X-axis, validate numbers
        const isValidX = hasStringXValues
          ? typeof xVal === 'string' && xVal.length > 0
          : typeof xVal === 'number' && !isNaN(xVal);

        const isValidY = typeof yVal === 'number' && !isNaN(yVal);

        return isValidX && isValidY;
      });

      if (keyData.length === 0) {
        return;
      }

      const seriesConfig = axisConfigs[key] || {};

      // Get individual series configurations or fallback to global
      const seriesLineWidth = seriesConfig.lineWidth ?? lineWidth;
      const seriesPointRadius = seriesConfig.pointRadius ?? pointRadius;
      const seriesOpacity = seriesConfig.opacity ?? 1;
      const seriesLineStyle = seriesConfig.lineStyle ?? 'solid';
      const seriesPointStyle = seriesConfig.pointStyle ?? 'circle';

      // Custom line generator for this specific key with validation
      const keyLine = d3
        .line<ChartDataPoint>()
        .x(d => {
          const xVal = d[xAxisKey];
          let scaledVal: number;

          if (hasStringXValues) {
            // For categorical data, use band scale
            scaledVal = (xScale as any)(xVal) + (xScale as any).bandwidth() / 2;
          } else {
            // For numeric data, use linear scale
            scaledVal = xScale(xVal as number);
          }

          return isNaN(scaledVal) ? 0 : scaledVal;
        })
        .y(d => {
          const val = yScale(d[key] as number);
          return isNaN(val) ? 0 : val;
        })
        .curve(curve)
        .defined(d => {
          const xVal = d[xAxisKey];
          const yVal = d[key] as number;

          if (hasStringXValues) {
            return xVal !== undefined && xVal !== null && typeof yVal === 'number' && !isNaN(yVal);
          } else {
            return (
              typeof xVal === 'number' && !isNaN(xVal) && typeof yVal === 'number' && !isNaN(yVal)
            );
          }
        });

      // Add the line path with individual styling
      const path = g
        .append('path')
        .datum(processedData)
        .attr('fill', 'none')
        .attr('stroke', currentColors[key])
        .attr('stroke-width', seriesLineWidth)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-opacity', seriesOpacity)
        .style('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))')
        .style('opacity', 0);

      // Apply line style (dashed, dotted, etc.)
      if (seriesLineStyle === 'dashed') {
        path.attr('stroke-dasharray', `${seriesLineWidth * 3} ${seriesLineWidth * 2}`);
      } else if (seriesLineStyle === 'dotted') {
        path.attr('stroke-dasharray', `${seriesLineWidth} ${seriesLineWidth}`);
      }

      // Try to generate the path and handle errors
      try {
        const pathData = keyLine(processedData);
        if (pathData) {
          path.attr('d', pathData);
        } else {
          console.warn(`Failed to generate path data for key: ${key}`);
          path.remove();
          return;
        }
      } catch (error) {
        console.error(`Error generating path for key ${key}:`, error);
        path.remove();
        return;
      }

      // Animate the line
      const totalLength = path.node()?.getTotalLength() || 0;

      if (totalLength > 0) {
        path
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .style('opacity', 1)
          .transition()
          .duration(animationDuration)
          .ease(d3.easeQuadInOut)
          .attr('stroke-dashoffset', 0)
          .on('end', () => {
            // Restore original dash array for line styles
            if (seriesLineStyle === 'dashed') {
              path.attr('stroke-dasharray', `${seriesLineWidth * 3} ${seriesLineWidth * 2}`);
            } else if (seriesLineStyle === 'dotted') {
              path.attr('stroke-dasharray', `${seriesLineWidth} ${seriesLineWidth}`);
            } else {
              path.attr('stroke-dasharray', 'none');
            }
          });
      } else {
        path.style('opacity', 1);
      }

      // Add data points with individual styling and validation
      if (showPoints) {
        const validPoints = processedData.filter(d => {
          const xVal = d[xAxisKey];
          const yVal = d[key] as number;

          if (hasStringXValues) {
            return xVal !== undefined && xVal !== null && typeof yVal === 'number' && !isNaN(yVal);
          } else {
            return (
              typeof xVal === 'number' && !isNaN(xVal) && typeof yVal === 'number' && !isNaN(yVal)
            );
          }
        });

        g.selectAll(`.point-${index}`)
          .data(validPoints)
          .enter()
          .append('path')
          .attr('class', `point-${index}`)
          .attr('transform', d => {
            const xVal = d[xAxisKey];
            let x: number;

            if (hasStringXValues) {
              // For categorical data, use band scale
              x = (xScale as any)(xVal) + (xScale as any).bandwidth() / 2;
            } else {
              // For numeric data, use linear scale
              x = xScale(xVal as number);
            }

            const y = yScale(d[key] as number);

            if (isNaN(x) || isNaN(y)) {
              console.warn(`Invalid coordinates for point: x=${x}, y=${y}`);
              return 'translate(0,0)';
            }
            return `translate(${x}, ${y})`;
          })
          .attr('d', getPointPath(seriesPointStyle, 0))
          .attr('fill', currentColors[key])
          .attr('stroke', chartBackgroundColor)
          .attr('stroke-width', 2)
          .attr('opacity', seriesOpacity)
          .style('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))')
          .on('mouseenter', function (_event, d) {
            if (!showTooltip) return;

            // Clear any existing timeout to prevent auto-hide
            clearTooltipTimeout();

            // Enhanced tooltip on hover
            d3.select(this)
              .transition()
              .duration(200)
              .attr('d', getPointPath(seriesPointStyle, seriesPointRadius * 1.5))
              .attr('stroke-width', 3);

            // Hide current tooltip if exists (instant switch)
            hideCurrentTooltip();

            // Create enhanced tooltip
            const rawXValue = d[xAxisKey];
            const xValue = typeof rawXValue === 'number' ? rawXValue.toLocaleString() : rawXValue;
            // Use xAxisNames to get display name for X-axis value
            const xDisplayName = xAxisNames[String(rawXValue)] || xValue;
            const yValue = typeof d[key] === 'number' ? d[key].toLocaleString() : d[key];
            const seriesName = seriesNames[key] || key;

            const pointX = (() => {
              const xVal = d[xAxisKey];
              if (hasStringXValues) {
                return (xScale as any)(xVal) + (xScale as any).bandwidth() / 2;
              } else {
                return xScale(xVal as number);
              }
            })();
            const pointY = yScale(d[key] as number);

            if (isNaN(pointX) || isNaN(pointY)) {
              console.warn('Cannot show tooltip: invalid coordinates');
              return;
            }

            const tooltip = g
              .append('g')
              .attr('class', 'tooltip')
              .attr('transform', `translate(${pointX}, ${pointY - 25})`);

            // Set as current tooltip
            currentTooltipRef.current = tooltip;

            // Tooltip background with shadow - make it larger for more content
            tooltip
              .append('rect')
              .attr('x', -50)
              .attr('y', -35)
              .attr('width', 100)
              .attr('height', 45)
              .attr('fill', isDarkMode ? '#1f2937' : '#ffffff')
              .attr('stroke', currentColors[key])
              .attr('stroke-width', 2)
              .attr('rx', 6)
              .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
              .style('opacity', 0)
              .transition()
              .duration(200)
              .style('opacity', 0.95);

            // Series name
            tooltip
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('y', -25)
              .attr('fill', textColor)
              .style('font-size', `${Math.max(responsiveFontSize.axis - 1, 10)}px`)
              .style('font-weight', '600')
              .style('opacity', 0)
              .text(seriesName)
              .transition()
              .duration(200)
              .style('opacity', 1);

            // X value (use display name from xAxisNames)
            tooltip
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('y', -12)
              .attr('fill', textColor)
              .style('font-size', `${Math.max(responsiveFontSize.axis - 1, 10)}px`)
              .style('font-weight', '500')
              .style('opacity', 0)
              .text(`${xAxisLabel || 'X'}: ${xDisplayName}`)
              .transition()
              .duration(200)
              .style('opacity', 0.8);

            // Y value
            tooltip
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('y', 2)
              .attr('fill', textColor)
              .style('font-size', `${responsiveFontSize.axis}px`)
              .style('font-weight', '600')
              .style('opacity', 0)
              .text(`${yValue}`)
              .transition()
              .duration(200)
              .style('opacity', 1);

            // Tooltip will stay visible while hovering, no auto-hide timeout
          })
          .on('mouseleave', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('d', getPointPath(seriesPointStyle, seriesPointRadius))
              .attr('stroke-width', 2);

            // Hide tooltip immediately when not hovering
            clearTooltipTimeout();
            hideCurrentTooltip();
          })
          .transition()
          .delay(animationDuration + index * 100)
          .duration(300)
          .ease(d3.easeBackOut)
          .attr('d', getPointPath(seriesPointStyle, seriesPointRadius));

        // Add point values if showPointValues is enabled
        if (showPointValues) {
          g.selectAll(`.point-value-${index}`)
            .data(validPoints)
            .enter()
            .append('text')
            .attr('class', `point-value-${index}`)
            .attr('x', d => {
              const xVal = d[xAxisKey];
              if (hasStringXValues) {
                return (xScale as any)(xVal) + (xScale as any).bandwidth() / 2;
              } else {
                return xScale(xVal as number);
              }
            })
            .attr('y', d => {
              return yScale(d[key] as number) - seriesPointRadius - 8; // Position above the point
            })
            .attr('text-anchor', 'middle')
            .attr('fill', textColor)
            .style('font-size', `${Math.max(responsiveFontSize.axis - 2, 9)}px`)
            .style('font-weight', '600')
            .style('opacity', 0)
            .style(
              'text-shadow',
              isDarkMode ? '1px 1px 2px rgba(0,0,0,0.8)' : '1px 1px 2px rgba(255,255,255,0.8)'
            )
            .text(d => {
              const yValue = d[key] as number;
              if (yAxisFormatter) {
                return yAxisFormatter(yValue);
              }
              return typeof yValue === 'number' ? yValue.toLocaleString() : String(yValue);
            })
            .transition()
            .delay(animationDuration + index * 100 + 300) // Show after points are drawn
            .duration(300)
            .style('opacity', 0.8);
        }
      }
    });

    // Enhanced zoom and pan with mouse interactions
    if (enableZoom || enablePan) {
      let zoomLevel = 1;
      let translateX = 0;
      let translateY = 0;
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let dragStartTranslateX = 0;
      let dragStartTranslateY = 0;

      // Mouse wheel zoom - only if enableZoom is true
      if (enableZoom) {
        svg.on('wheel', function (event) {
          event.preventDefault();

          // Get mouse position relative to the chart
          const rect = svg.node()?.getBoundingClientRect();
          if (!rect) return;

          const mouseX = event.clientX - rect.left - responsiveMargin.left;
          const mouseY = event.clientY - rect.top - responsiveMargin.top;

          const delta = event.deltaY;
          const scaleFactor = delta > 0 ? 0.9 : 1.1;
          const newZoomLevel = zoomLevel * scaleFactor;

          // Limit zoom
          const clampedZoomLevel = Math.max(0.5, Math.min(zoomExtent, newZoomLevel));
          const actualScaleFactor = clampedZoomLevel / zoomLevel;

          // Calculate new translation to zoom at mouse position
          const newTranslateX = translateX + (mouseX - translateX) * (1 - actualScaleFactor);
          const newTranslateY = translateY + (mouseY - translateY) * (1 - actualScaleFactor);

          // Update zoom state
          zoomLevel = clampedZoomLevel;
          translateX = newTranslateX;
          translateY = newTranslateY;

          // Apply zoom and pan transform
          const transform = `translate(${responsiveMargin.left + translateX},${responsiveMargin.top + translateY}) scale(${zoomLevel})`;
          g.attr('transform', transform);
        });
      }

      // Mouse drag to pan - only if enablePan is true
      if (enablePan) {
        svg.on('mousedown', function (event) {
          if (event.button !== 0) return; // Only left mouse button

          isDragging = true;
          dragStartX = event.clientX;
          dragStartY = event.clientY;
          dragStartTranslateX = translateX;
          dragStartTranslateY = translateY;

          // Change cursor to grabbing
          svg.style('cursor', 'grabbing');

          // Prevent text selection during drag
          event.preventDefault();
        });

        svg.on('mousemove', function (event) {
          if (!isDragging) {
            // Show grab cursor when pan is enabled
            if (enablePan) {
              svg.style('cursor', 'grab');
            } else {
              svg.style('cursor', 'default');
            }
            return;
          }

          const deltaX = event.clientX - dragStartX;
          const deltaY = event.clientY - dragStartY;

          // Update translation based on drag distance
          translateX = dragStartTranslateX + deltaX;
          translateY = dragStartTranslateY + deltaY;

          // Apply pan transform
          const transform = `translate(${responsiveMargin.left + translateX},${responsiveMargin.top + translateY}) scale(${zoomLevel})`;
          g.attr('transform', transform);
        });

        svg.on('mouseup', function () {
          if (isDragging) {
            isDragging = false;

            // Reset cursor
            if (enablePan) {
              svg.style('cursor', 'grab');
            } else {
              svg.style('cursor', 'default');
            }
          }
        });

        // Handle mouse leave to stop dragging and hide tooltips
        svg.on('mouseleave', function () {
          if (isDragging) {
            isDragging = false;
            svg.style('cursor', 'default');
          }
          // Also hide any tooltips when leaving the chart area
          clearTooltipTimeout();
          hideCurrentTooltip();
        });
      }

      // Double-click to reset zoom and pan
      if (enableZoom || enablePan) {
        svg.on('dblclick', function () {
          zoomLevel = 1;
          translateX = 0;
          translateY = 0;

          svg.style('cursor', 'default');

          g.transition()
            .duration(300)
            .ease(d3.easeQuadOut)
            .attr(
              'transform',
              `translate(${responsiveMargin.left},${responsiveMargin.top}) scale(1)`
            );
        });
      }
    }

    // Global mouseleave handler for tooltip management (even when zoom/pan disabled)
    if (!enableZoom && !enablePan && showTooltip) {
      svg.on('mouseleave', function () {
        clearTooltipTimeout();
        hideCurrentTooltip();
      });
    }

    // Add axis labels with responsive font sizes
    if (xAxisLabel && showAxisLabels) {
      // Get X-axis formatter symbol
      const xFormatterSymbol = getFormatterSymbol(xFormatterType);
      const xLabelText = xFormatterSymbol ? `${xAxisLabel} (${xFormatterSymbol})` : xAxisLabel;

      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + (currentWidth < 768 ? 40 : 50))
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${responsiveFontSize.label}px`)
        .style('font-weight', '600')
        .text(xLabelText);
    }

    if (yAxisLabel && showAxisLabels) {
      // Get Y-axis formatter symbol
      const yFormatterSymbol = getFormatterSymbol(yFormatterType);
      const yLabelText = yFormatterSymbol ? `${yAxisLabel} (${yFormatterSymbol})` : yAxisLabel;

      g.append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -innerHeight / 2)
        .attr('y', currentWidth < 768 ? -55 : -65) // Increased distance from Y-axis
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${responsiveFontSize.label}px`)
        .style('font-weight', '600')
        .text(yLabelText);
    }

    // Add responsive legend directly in SVG
    if (showLegend) {
      const enabledLines = yAxisKeys.filter(key => !disabledLines.includes(key));

      // Responsive legend sizing based on screen width and position
      const getResponsiveLegendSizes = () => {
        const isMobile = currentWidth < 640;

        return {
          itemHeight: isMobile ? 18 : 20,
          padding: isMobile ? 8 : 10,
          itemSpacing: isMobile ? 3 : 5,
          fontSize: isMobile ? legendFontSize - 1 : legendFontSize,
          iconSize: isMobile ? 12 : 16,
          iconSpacing: isMobile ? 6 : 8,
        };
      };

      const legendSizes = getResponsiveLegendSizes();
      const totalLegendHeight =
        enabledLines.length * legendSizes.itemHeight +
        (enabledLines.length - 1) * legendSizes.itemSpacing +
        2 * legendSizes.padding;

      // Responsive legend positioning based on screen size and position
      const getResponsiveLegendPosition = () => {
        const isMobile = currentWidth < 640;
        const isTablet = currentWidth < 1024;

        switch (legendPosition) {
          case 'top':
            return {
              x: innerWidth / 2,
              y: isMobile ? 10 : 15,
            };
          case 'bottom': {
            const xLabelSpacing =
              xAxisLabel && showAxisLabels
                ? isMobile
                  ? 30
                  : isTablet
                    ? 35
                    : 40
                : isMobile
                  ? 15
                  : 20;
            return {
              x: innerWidth / 2,
              y: innerHeight + responsiveMargin.top + xLabelSpacing + (isMobile ? 15 : 25),
            };
          }
          case 'left':
            return {
              x: isMobile ? 10 : 15,
              y: isMobile ? 15 : 20,
            };
          case 'right':
          default: {
            const rightOffset = isMobile ? 120 : isTablet ? 140 : 150;
            return {
              x: Math.max(innerWidth - rightOffset, 10),
              y: isMobile ? 15 : 20,
            };
          }
        }
      };

      const legendPos = getResponsiveLegendPosition();
      const legendX = legendPos.x;
      const legendY = legendPos.y;

      // Create responsive legend background
      const legendGroup = g.append('g').attr('class', 'legend-group');

      // Calculate responsive legend dimensions
      const isHorizontal = legendPosition === 'top' || legendPosition === 'bottom';

      // Calculate optimal width for horizontal legends with even spacing
      const calculateLegendWidth = () => {
        if (!isHorizontal) return (currentWidth < 640 ? 100 : 120) + 2 * legendSizes.padding;

        // Calculate total text width for all items
        const totalTextWidth = enabledLines.reduce((total, key) => {
          const seriesName = seriesNames[key] || key;
          const maxTextLength = currentWidth < 640 ? 8 : currentWidth < 1024 ? 10 : 12;
          const displayName =
            seriesName.length > maxTextLength
              ? seriesName.substring(0, maxTextLength) + '...'
              : seriesName;
          return (
            total +
            displayName.length * (legendSizes.fontSize * 0.6) +
            legendSizes.iconSize +
            legendSizes.iconSpacing
          );
        }, 0);

        // Add minimum spacing between items
        const minSpacingBetweenItems = currentWidth < 640 ? 20 : 30;
        const totalSpacing = (enabledLines.length - 1) * minSpacingBetweenItems;

        return Math.max(totalTextWidth + totalSpacing + 2 * legendSizes.padding, 200);
      };

      const legendBgDimensions = {
        x: isHorizontal ? legendX - calculateLegendWidth() / 2 : legendX - legendSizes.padding,
        y: legendY - legendSizes.padding,
        width: isHorizontal
          ? calculateLegendWidth()
          : (currentWidth < 640 ? 100 : 120) + 2 * legendSizes.padding,
        height: isHorizontal ? legendSizes.itemHeight + 2 * legendSizes.padding : totalLegendHeight,
      };

      // Enhanced legend background with glass morphism effect
      legendGroup
        .append('rect')
        .attr('x', legendBgDimensions.x)
        .attr('y', legendBgDimensions.y)
        .attr('width', legendBgDimensions.width)
        .attr('height', legendBgDimensions.height)
        .attr('fill', isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(248, 250, 252, 0.9)')
        .attr('stroke', isDarkMode ? 'rgba(107, 114, 128, 0.3)' : 'rgba(209, 213, 219, 0.3)')
        .attr('stroke-width', 1)
        .attr('rx', currentWidth < 640 ? 8 : 12)
        .attr('ry', currentWidth < 640 ? 8 : 12)
        .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
        .style('backdrop-filter', 'blur(10px)')
        .style('transition', 'all 0.3s ease');

      // Add subtle gradient overlay
      const gradientId = `legend-gradient-${Math.random().toString(36).substr(2, 9)}`;
      const gradient = svg
        .append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)')
        .attr('stop-opacity', 1);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', isDarkMode ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.1)')
        .attr('stop-opacity', 1);

      legendGroup
        .append('rect')
        .attr('x', legendBgDimensions.x)
        .attr('y', legendBgDimensions.y)
        .attr('width', legendBgDimensions.width)
        .attr('height', legendBgDimensions.height)
        .attr('fill', `url(#${gradientId})`)
        .attr('rx', currentWidth < 640 ? 8 : 12)
        .attr('ry', currentWidth < 640 ? 8 : 12);

      // Enhanced legend items with modern design
      enabledLines.forEach((key, index) => {
        const colorKey = colors[key] ? key : `line${index + 1}`;
        const color =
          colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] ||
          Object.values(colors)[index % Object.keys(colors).length]?.[
            isDarkMode ? 'dark' : 'light'
          ] ||
          '#3b82f6';

        const seriesName = seriesNames[key] || key;

        // Calculate responsive text truncation
        const maxTextLength = currentWidth < 640 ? 8 : currentWidth < 1024 ? 10 : 12;
        const displayName =
          seriesName.length > maxTextLength
            ? seriesName.substring(0, maxTextLength) + '...'
            : seriesName;

        let itemX = legendX;
        let itemY = legendY;

        if (isHorizontal) {
          // Horizontal layout for top/bottom - distribute evenly across available width
          const totalWidth = legendBgDimensions.width - 2 * legendSizes.padding;
          const spaceBetweenItems = totalWidth / enabledLines.length;
          itemX = legendBgDimensions.x + legendSizes.padding + index * spaceBetweenItems;
          itemY = legendY;
        } else {
          // Vertical layout for left/right
          itemX = legendX;
          itemY = legendY + index * (legendSizes.itemHeight + legendSizes.itemSpacing);
        }

        // Create interactive legend item group
        const legendItem = legendGroup
          .append('g')
          .attr('class', 'legend-item')
          .style('cursor', 'pointer')
          .style('transition', 'all 0.2s ease');

        // Modern color indicator with rounded rectangle and glow effect
        const indicatorSize = currentWidth < 640 ? 12 : 16;
        const colorIndicator = legendItem
          .append('rect')
          .attr('x', itemX)
          .attr('y', itemY + (legendSizes.itemHeight - indicatorSize) / 2)
          .attr('width', indicatorSize)
          .attr('height', indicatorSize)
          .attr('rx', 3)
          .attr('ry', 3)
          .attr('fill', color)
          .style('filter', `drop-shadow(0 2px 4px ${color}40)`)
          .style('transition', 'all 0.2s ease');

        // Add subtle inner glow
        const glowId = `indicator-glow-${index}`;
        const glowFilter = svg
          .select('defs')
          .append('filter')
          .attr('id', glowId)
          .attr('x', '-50%')
          .attr('y', '-50%')
          .attr('width', '200%')
          .attr('height', '200%');

        glowFilter.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'coloredBlur');

        const feMerge = glowFilter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Enhanced legend text with better typography
        const legendText = legendItem
          .append('text')
          .attr('x', itemX + indicatorSize + legendSizes.iconSpacing + 2)
          .attr('y', itemY + legendSizes.itemHeight / 2)
          .attr('dy', '0.35em')
          .attr('fill', textColor)
          .style('font-size', `${legendSizes.fontSize}px`)
          .style('font-weight', '600')
          .style('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
          .style('letter-spacing', '0.025em')
          .style('transition', 'all 0.2s ease')
          .text(displayName);

        // Add interactive hover and click effects
        legendItem
          .on('mouseenter', function () {
            d3.select(this).style('transform', 'translateY(-1px)').style('opacity', '0.9');

            colorIndicator
              .style('filter', `drop-shadow(0 4px 8px ${color}60) url(#${glowId})`)
              .attr('width', indicatorSize + 2)
              .attr('height', indicatorSize + 2)
              .attr('x', itemX - 1)
              .attr('y', itemY + (legendSizes.itemHeight - indicatorSize) / 2 - 1);

            legendText.style('font-weight', '700').attr('fill', color);

            // Add hover tooltip effect
            const tooltip = legendGroup
              .append('g')
              .attr('class', 'legend-tooltip')
              .style('opacity', 0);

            tooltip
              .append('rect')
              .attr('x', itemX + indicatorSize + legendSizes.iconSpacing - 5)
              .attr('y', itemY - 25)
              .attr('width', Math.max(seriesName.length * 6 + 16, 80))
              .attr('height', 20)
              .attr('rx', 4)
              .attr('fill', isDarkMode ? '#1f2937' : '#374151')
              .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))');

            tooltip
              .append('text')
              .attr('x', itemX + indicatorSize + legendSizes.iconSpacing + 3)
              .attr('y', itemY - 10)
              .attr('fill', '#ffffff')
              .style('font-size', '11px')
              .style('font-weight', '500')
              .text(seriesName);

            tooltip.transition().duration(200).style('opacity', 1);
          })
          .on('mouseleave', function () {
            d3.select(this).style('transform', 'translateY(0px)').style('opacity', '1');

            colorIndicator
              .style('filter', `drop-shadow(0 2px 4px ${color}40)`)
              .attr('width', indicatorSize)
              .attr('height', indicatorSize)
              .attr('x', itemX)
              .attr('y', itemY + (legendSizes.itemHeight - indicatorSize) / 2);

            legendText.style('font-weight', '600').attr('fill', textColor);

            // Remove tooltip
            legendGroup.selectAll('.legend-tooltip').remove();
          })
          .on('click', function () {
            // Add ripple effect on click
            const ripple = legendGroup
              .append('circle')
              .attr('cx', itemX + indicatorSize / 2)
              .attr('cy', itemY + legendSizes.itemHeight / 2)
              .attr('r', 0)
              .attr('fill', color)
              .attr('opacity', 0.3);

            ripple.transition().duration(600).attr('r', 30).attr('opacity', 0).remove();

            // Visual feedback for the click
            d3.select(this)
              .transition()
              .duration(100)
              .style('transform', 'scale(0.95)')
              .transition()
              .duration(100)
              .style('transform', 'scale(1)');
          });
      });
    }
  }, [
    processedData,
    margin,
    xAxisKey,
    yAxisKeys,
    disabledLines,
    colors,
    axisConfigs,
    seriesNames,
    showLegend,
    showGrid,
    showPoints,
    animationDuration,
    curve,
    title,
    xAxisLabel,
    yAxisLabel,
    isDarkMode,
    dimensions,
    yAxisFormatter,
    xAxisFormatter,
    responsiveFontSize,
    xAxisStart,
    yAxisStart,
    lineWidth,
    pointRadius,
    gridOpacity,
    showTooltip,
    legendPosition,
    xAxisRotation,
    yAxisRotation,
    showAxisLabels,
    showAxisTicks,
    enableZoom,
    enablePan,
    zoomExtent,
    theme,
    backgroundColor,
    legendFontSize,
    yFormatterType,
    xFormatterType,
    showPointValues,
  ]);

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

      {/* Chart Container with integrated legend */}
      <div className="chart-container relative bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto chart-svg"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          style={{ display: 'block' }} // Ensure proper block display
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
};

export default D3LineChart;
