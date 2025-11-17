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
  // Preview variant: render without frame/background card
  variant?: 'default' | 'preview';
  // Show all X-axis ticks without sampling (useful for date data with compact formatting)
  showAllXAxisTicks?: boolean;
}

const D3LineChart: React.FC<D3LineChartProps> = ({
  arrayData,
  width = 800,
  height = 600, // Reduced from 500 to 400 for better proportions
  margin = { top: 60, right: 60, bottom: 60, left: 60 }, // Optimized left margin for Y-axis
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
  variant = 'default',
  showAllXAxisTicks = false, // Default to sampling ticks
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

    // Calculate dynamic width based on number of data points for categorical X-axis
    const xValues = processedData.map(d => d[xAxisKey]);
    const hasStringXValues = xValues.some(v => typeof v === 'string');

    // Minimum width per data point (adjust based on rotation)
    const minWidthPerPoint = xAxisRotation === 0 ? 60 : 30; // More space for horizontal labels
    const calculatedMinWidth = hasStringXValues
      ? Math.max(dimensions.width, processedData.length * minWidthPerPoint)
      : dimensions.width;

    // Use responsive dimensions (with dynamic width for categorical data)
    const currentWidth = calculatedMinWidth;
    const currentHeight = dimensions.height;

    // Auto-enable pan when chart is wider than container (due to many data points)
    const isChartExpanded = currentWidth > dimensions.width;
    const shouldEnablePan = enablePan || isChartExpanded;
    const shouldEnableZoom = enableZoom; // Keep zoom as user preference

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
      variant === 'preview'
        ? 'transparent'
        : backgroundColor !== 'transparent'
          ? backgroundColor
          : isDarkMode
            ? '#111827'
            : '#ffffff';

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
        showLegend && legendPosition === 'bottom'
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

    // Add background (skip in preview variant)
    if (variant !== 'preview') {
      svg
        .append('rect')
        .attr('width', currentWidth)
        .attr('height', currentHeight)
        .attr('fill', chartBackgroundColor)
        .attr('rx', 8);
    }

    // Add SVG title at the top, centered (like D3PieChart)
    if (title && title.trim() !== '') {
      svg
        .append('text')
        .attr('x', currentWidth / 2)
        .attr('y', Math.max(20, (titleFontSize || 16) * 1.2))
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${titleFontSize || 16}px`)
        .style('font-weight', 700)
        .text(title);
    }

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${responsiveMargin.left},${responsiveMargin.top})`);

    // Enhanced scales with support for categorical X-axis
    // xValues and hasStringXValues already calculated earlier for dynamic width
    let xScale: any;

    if (hasStringXValues) {
      // For categorical data (like dates or city names), preserve original order
      // Do NOT use Set to avoid losing duplicates and changing order
      const xDomain = processedData.map((d, idx) => {
        const val = d[xAxisKey];
        // For duplicate values, append index to make them unique for positioning
        return `${val}_${idx}`;
      });

      xScale = d3.scaleBand().domain(xDomain).range([0, innerWidth]).padding(0.1);
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
      // For categorical data (including date strings), show ALL labels
      const domainVals = (xScale as any).domain() as string[];

      // Show all labels - chart width already adjusted to fit all
      const tickVals: string[] = domainVals;

      xAxis = d3
        .axisBottom(xScale)
        .tickValues(tickVals)
        .tickSizeInner(showAxisTicks ? 6 : 0)
        .tickSizeOuter(showAxisTicks ? 6 : 0)
        .tickFormat((d: any) => {
          // Remove the _index suffix to get the original value
          const rawValue = String(d).replace(/_\d+$/, '');

          // Try to format as date if xAxisFormatter exists
          if (xAxisFormatter) {
            // Check if it's a date string (ISO format or timestamp)
            const dateTest = new Date(rawValue);
            if (!isNaN(dateTest.getTime())) {
              // It's a valid date, format it
              return xAxisFormatter(dateTest.getTime());
            }

            // Try as number
            const numValue = Number(rawValue);
            if (!isNaN(numValue)) {
              return xAxisFormatter(numValue);
            }
          }

          // Fallback to display name or raw value
          const displayName = xAxisNames[rawValue] || rawValue;
          return displayName;
        });
    } else {
      // For numeric data, use default linear scale behavior
      const uniqueXValues = [...new Set(processedData.map(d => d[xAxisKey] as number))].sort(
        (a, b) => a - b
      );

      // For numeric data, use D3's default tick algorithm
      const tickVals: number[] = uniqueXValues;

      xAxis = d3
        .axisBottom(xScale)
        .tickValues(tickVals)
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
        // Use custom formatter if provided, otherwise fallback to simple string
        if (yAxisFormatter) {
          return yAxisFormatter(value);
        }
        return String(value);
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
        .x((d, i) => {
          const xVal = d[xAxisKey];
          let scaledVal: number;

          if (hasStringXValues) {
            // For categorical data, use the indexed key for positioning
            const indexedKey = `${xVal}_${i}`;
            scaledVal = (xScale as any)(indexedKey) + (xScale as any).bandwidth() / 2;
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
          .attr('transform', (d, i) => {
            const xVal = d[xAxisKey];
            let x: number;

            if (hasStringXValues) {
              // For categorical data, use the indexed key for positioning
              const indexedKey = `${xVal}_${i}`;
              x = (xScale as any)(indexedKey) + (xScale as any).bandwidth() / 2;
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

            // Find the index of this data point in the original processedData
            const dataIndex = processedData.findIndex(item => item === d);

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
            const xValue =
              typeof rawXValue === 'number'
                ? xAxisFormatter
                  ? xAxisFormatter(rawXValue)
                  : String(rawXValue)
                : rawXValue;
            // Use xAxisNames to get display name for X-axis value
            const xDisplayName = xAxisNames[String(rawXValue)] || xValue;
            const yValue =
              typeof d[key] === 'number'
                ? yAxisFormatter
                  ? yAxisFormatter(d[key])
                  : String(d[key])
                : d[key];
            const seriesName = seriesNames[key] || key;

            const pointX = (() => {
              const xVal = d[xAxisKey];
              if (hasStringXValues) {
                // Use the indexed key to get correct position
                const indexedKey = `${xVal}_${dataIndex}`;
                return (xScale as any)(indexedKey) + (xScale as any).bandwidth() / 2;
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
            .attr('x', (d, i) => {
              const xVal = d[xAxisKey];
              if (hasStringXValues) {
                // Use the indexed key for positioning
                const indexedKey = `${xVal}_${i}`;
                return (xScale as any)(indexedKey) + (xScale as any).bandwidth() / 2;
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
              return String(yValue); // ép kiểu về string type
            })
            .transition()
            .delay(animationDuration + index * 100 + 300) // Show after points are drawn
            .duration(300)
            .style('opacity', 0.8);
        }
      }
    });

    // Enhanced zoom and pan with mouse interactions
    // Use shouldEnablePan instead of enablePan to auto-enable when chart is expanded
    if (shouldEnableZoom || shouldEnablePan) {
      let zoomLevel = 1;
      let translateX = 0;
      let translateY = 0;
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let dragStartTranslateX = 0;
      let dragStartTranslateY = 0;

      // Mouse wheel zoom - only if enableZoom is true
      if (shouldEnableZoom) {
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

      // Mouse drag to pan - only if shouldEnablePan is true (includes auto-enable)
      if (shouldEnablePan) {
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
            if (shouldEnablePan) {
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
            if (shouldEnablePan) {
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
      if (shouldEnableZoom || shouldEnablePan) {
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
      const isMobile = currentWidth < 640;
      const isTablet = currentWidth < 1024;
      const legendItemHeight = isMobile ? 20 : isTablet ? 22 : 25;
      const legendItems = enabledLines;

      // Legend dimensions depend on orientation and chart size
      let legendWidth = isMobile ? 120 : isTablet ? 140 : 150;
      let legendHeight = legendItems.length * legendItemHeight + (isMobile ? 15 : 20);

      // For horizontal legend (top/bottom)
      if (legendPosition === 'top' || legendPosition === 'bottom') {
        // Calculate width based on items laid out horizontally
        const itemWidth = isMobile ? 70 : isTablet ? 85 : 100;
        legendWidth = Math.min(innerWidth - 40, legendItems.length * itemWidth + 40);
        legendHeight = isMobile ? 40 : isTablet ? 45 : 50; // Fixed height for horizontal legend
      }

      const legendGroup = g.append('g').attr('class', 'legend-group');

      let legendX = 0;
      let legendY = 0;

      // Device-aware extra spacing to keep legend away from chart edges
      const extraLegendSpacing = isMobile ? 8 : isTablet ? 12 : 20;
      const legendSpacingFromChart = isMobile ? 35 : isTablet ? 65 : 85;

      switch (legendPosition) {
        case 'top':
          legendX = innerWidth / 2 - legendWidth / 2;
          legendY = -10;
          break;
        case 'bottom':
          legendX = innerWidth / 2 - legendWidth / 2;
          legendY = innerHeight + legendSpacingFromChart;
          break;
        case 'left':
          legendX = extraLegendSpacing;
          legendY = innerHeight / 2 - legendHeight * 2;
          break;
        case 'right':
        default:
          legendX = innerWidth - legendWidth - extraLegendSpacing;
          legendY = innerHeight / 2 - legendHeight * 2;
          break;
      }

      // Create legend background and a contents group we'll measure
      const legendBg = legendGroup
        .append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(248, 250, 252, 0.9)')
        .attr('stroke', isDarkMode ? 'rgba(107, 114, 128, 0.3)' : 'rgba(209, 213, 219, 0.3)')
        .attr('stroke-width', 1)
        .attr('rx', 8)
        .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))');

      const legendContents = legendGroup.append('g').attr('class', 'legend-contents');

      if (legendPosition === 'top' || legendPosition === 'bottom') {
        // Horizontal legend - items laid out horizontally
        const itemPadding = isMobile ? 6 : 8;

        // Build items inside legendContents and support up to 2 rows if needed
        const localIconSize = isMobile ? 12 : isTablet ? 13 : 14;
        const padX = isMobile ? 12 : 16;
        const padY = isMobile ? 8 : 10;
        const availableContentWidth = legendWidth - padX * 2;

        // Precompute display labels with increased character limits to show more text
        const itemsMeta = legendItems.map(key => {
          const label = seriesNames[key] || key;
          const maxLabelLength = isMobile ? 12 : isTablet ? 18 : 20;
          const displayLabel =
            label.length > maxLabelLength ? label.substring(0, maxLabelLength) + '...' : label;
          return { displayLabel, key };
        });

        // Use fixed per-item container width so all items align on a grid (not centered per-item)
        const itemContainerW = isMobile ? 100 : isTablet ? 120 : 140;

        const totalSingleWidth = itemContainerW * legendItems.length;
        const useTwoRows = totalSingleWidth > availableContentWidth && legendItems.length > 1;

        if (!useTwoRows) {
          // Single centered row - items aligned on grid
          let currentX = 0;
          legendItems.forEach((key, idx) => {
            const { displayLabel } = itemsMeta[idx];
            const legendItem = legendContents
              .append('g')
              .attr('class', `legend-item-${idx}`)
              .style('cursor', 'pointer')
              .attr('transform', `translate(${currentX}, 0)`);

            legendItem
              .append('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', localIconSize)
              .attr('height', localIconSize)
              .attr('rx', 3)
              .attr('fill', currentColors[key])
              .style('filter', `drop-shadow(0 2px 4px ${currentColors[key]}40)`);

            legendItem
              .append('text')
              .attr('x', localIconSize + itemPadding)
              .attr('y', localIconSize / 2)
              .attr('dy', '0.35em')
              .attr('fill', textColor)
              .style('font-size', `${legendFontSize}px`)
              .style('font-weight', '600')
              .text(displayLabel);

            legendItem
              .on('mouseenter', function () {
                d3.select(this).style('opacity', '0.8');
              })
              .on('mouseleave', function () {
                d3.select(this).style('opacity', '1');
              });

            currentX += itemContainerW;
          });
        } else {
          // Two-row layout using uniform item container width for consistent columns
          const firstRowCount = Math.ceil(legendItems.length / 2);
          const rowY = localIconSize + padY;

          // First row
          let x0 = 0;
          for (let i = 0; i < firstRowCount; i++) {
            const { displayLabel, key } = itemsMeta[i];
            const legendItem = legendContents
              .append('g')
              .attr('class', `legend-item-${i}`)
              .style('cursor', 'pointer')
              .attr('transform', `translate(${x0}, 0)`);

            legendItem
              .append('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', localIconSize)
              .attr('height', localIconSize)
              .attr('rx', 3)
              .attr('fill', currentColors[key])
              .style('filter', `drop-shadow(0 2px 4px ${currentColors[key]}40)`);

            legendItem
              .append('text')
              .attr('x', localIconSize + itemPadding)
              .attr('y', localIconSize / 2)
              .attr('dy', '0.35em')
              .attr('fill', textColor)
              .style('font-size', `${legendFontSize}px`)
              .style('font-weight', '600')
              .text(displayLabel);

            legendItem
              .on('mouseenter', function () {
                d3.select(this).style('opacity', '0.8');
              })
              .on('mouseleave', function () {
                d3.select(this).style('opacity', '1');
              });

            x0 += itemContainerW;
          }

          // Second row
          let x1 = 0;
          for (let j = firstRowCount; j < legendItems.length; j++) {
            const { displayLabel, key } = itemsMeta[j];
            const legendItem = legendContents
              .append('g')
              .attr('class', `legend-item-${j}`)
              .style('cursor', 'pointer')
              .attr('transform', `translate(${x1}, ${rowY})`);

            legendItem
              .append('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', localIconSize)
              .attr('height', localIconSize)
              .attr('rx', 3)
              .attr('fill', currentColors[key])
              .style('filter', `drop-shadow(0 2px 4px ${currentColors[key]}40)`);

            legendItem
              .append('text')
              .attr('x', localIconSize + itemPadding)
              .attr('y', localIconSize / 2)
              .attr('dy', '0.35em')
              .attr('fill', textColor)
              .style('font-size', `${legendFontSize}px`)
              .style('font-weight', '600')
              .text(displayLabel);

            legendItem
              .on('mouseenter', function () {
                d3.select(this).style('opacity', '0.8');
              })
              .on('mouseleave', function () {
                d3.select(this).style('opacity', '1');
              });

            x1 += itemContainerW;
          }
        }

        // Measure and center contents inside background, then resize background
        try {
          const bbox = (legendContents.node() as SVGGElement).getBBox();
          const extraWidth = isMobile ? 8 : isTablet ? 12 : 16;
          const desiredBgWidth = Math.max(
            bbox.width + padX * 2 + extraWidth,
            legendWidth + extraWidth
          );
          const desiredBgHeight = Math.max(bbox.height + padY * 2, legendHeight);

          // For top/bottom: center the background by desired width so it doesn't look left-shifted
          const bgX =
            legendPosition === 'top' || legendPosition === 'bottom'
              ? innerWidth / 2 - desiredBgWidth / 2
              : legendX;

          legendBg
            .attr('x', bgX)
            .attr('y', legendY)
            .attr('width', desiredBgWidth)
            .attr('height', desiredBgHeight);

          // center contents horizontally within the bg and vertically with some padding
          const contentsX = bgX + (desiredBgWidth - bbox.width) / 2;
          const contentsY = legendY + padY + (desiredBgHeight - (bbox.height + padY * 2)) / 2;
          legendContents.attr('transform', `translate(${contentsX}, ${contentsY})`);
        } catch {
          console.warn('legend bbox measurement failed');
        }
      } else {
        // Vertical legend (left/right)
        const iconSize = isMobile ? 14 : 16;

        let currentY = 0;
        legendItems.forEach((key, i) => {
          const label = seriesNames[key] || key;
          const displayLabel =
            label.length > (isMobile ? 10 : isTablet ? 12 : 15)
              ? label.substring(0, isMobile ? 10 : isTablet ? 12 : 15) + '...'
              : label;

          const legendItem = legendContents
            .append('g')
            .attr('class', `legend-item-${i}`)
            .style('cursor', 'pointer')
            .attr('transform', `translate(${isMobile ? 8 : 10}, ${currentY})`);

          // Color indicator
          legendItem
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', iconSize)
            .attr('height', iconSize)
            .attr('rx', 3)
            .attr('fill', currentColors[key])
            .style('filter', `drop-shadow(0 2px 4px ${currentColors[key]}40)`);

          // Label
          legendItem
            .append('text')
            .attr('x', iconSize + (isMobile ? 6 : 8))
            .attr('y', iconSize / 2)
            .attr('dy', '0.35em')
            .attr('fill', textColor)
            .style('font-size', `${legendFontSize}px`)
            .style('font-weight', '600')
            .text(displayLabel);

          // Hover effects
          legendItem
            .on('mouseenter', function () {
              d3.select(this).style('opacity', '0.8');
            })
            .on('mouseleave', function () {
              d3.select(this).style('opacity', '1');
            });

          currentY += legendItemHeight;
        });

        // Measure and position vertical contents
        try {
          const bbox = (legendContents.node() as SVGGElement).getBBox();
          const padX = isMobile ? 8 : 10;
          const padY = isMobile ? 8 : 10;
          const contentsX = legendX + padX;
          const contentsY = legendY + padY;
          legendContents.attr('transform', `translate(${contentsX}, ${contentsY})`);
          const extraWidthV = isMobile ? 6 : 10;
          legendBg
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('width', Math.max(bbox.width + padX * 2 + extraWidthV, legendWidth + extraWidthV))
            .attr('height', Math.max(bbox.height + padY * 2, legendHeight));
        } catch {
          console.warn('legend bbox measurement failed');
        }
      }
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
    variant,
    showAllXAxisTicks,
  ]);

  return (
    <div ref={containerRef} className="w-full">
      <div
        className={
          variant === 'preview'
            ? 'relative overflow-hidden'
            : 'chart-container relative bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden'
        }
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto chart-svg"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          style={{ display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Line chart${title ? `: ${title}` : ''}`}
        >
          {/* SVG Title, centered at the top, matching D3PieChart */}
          {title && title.trim() !== '' && (
            <text
              x={dimensions.width / 2}
              y={Math.max(20, (titleFontSize || 16) * 1.2)}
              textAnchor="middle"
              fill={isDarkMode ? '#f3f4f6' : '#1f2937'}
              style={{ fontSize: `${titleFontSize || 16}px`, fontWeight: 700 }}
              className="chart-title"
            >
              {title}
            </text>
          )}
        </svg>
      </div>
    </div>
  );
};

export default D3LineChart;
