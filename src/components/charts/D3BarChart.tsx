import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { defaultColorsChart } from '@/utils/Utils';
import {
  renderD3Tooltip,
  createHeader,
  createStatLine,
  createPercentLine,
  createRankLine,
  createSeparator,
  type TooltipLine,
} from './ChartTooltip';

function convertArrayToChartData(arrayData: (string | number)[][]): ChartDataPoint[] {
  if (!arrayData || arrayData.length === 0) return [];

  const headers = arrayData[0];
  const dataRows = arrayData.slice(1);

  return dataRows.map(row => {
    const dataPoint: ChartDataPoint = {};
    headers.forEach((header, index) => {
      const value = row[index];

      // Skip null/undefined values
      if (value === null || value === undefined) {
        return;
      }

      if (index === 0) {
        // First column is typically the X-axis (categories)
        dataPoint[String(header)] = String(value);
      } else {
        // Other columns are numeric values
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        if (!isNaN(numValue)) {
          dataPoint[String(header)] = numValue;
        }
      }
    });
    return dataPoint;
  });
}

export interface ChartDataPoint {
  [key: string]: number | string;
}

export interface D3BarChartProps {
  arrayData?: (string | number)[][]; // Array data input
  data?: ChartDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKeys: string[];
  disabledBars?: string[]; // New prop for disabled bars (match LineChart disabledLines)
  colors?: Record<string, { light: string; dark: string }>;
  seriesNames?: Record<string, string>; // Add series names mapping (match LineChart)
  xAxisNames?: Record<string, string>; // Map X-axis values from ID to display name
  axisConfigs?: Record<
    string,
    {
      barWidth?: number;
      opacity?: number;
      formatter?: string;
    }
  >;
  title?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisStart?: 'auto' | 'zero'; // X-axis start option (match LineChart)
  yAxisStart?: 'auto' | 'zero' | number; // Y-axis start option (match LineChart)
  animationDuration?: number;
  yAxisFormatter?: (value: number) => string; // Add custom Y-axis formatter (match LineChart)
  xAxisFormatter?: (value: number) => string; // Add custom X-axis formatter (match LineChart)
  fontSize?: { axis: number; label: number; title: number }; // Add fontSize prop (match LineChart)

  // Formatter type props for displaying in axis labels (match LineChart)
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

  // Bar-specific props
  barType?: 'grouped' | 'stacked' | 'diverging';
  barWidth?: number;
  barSpacing?: number;

  // New styling props (match LineChart)
  gridOpacity?: number;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';

  // New axis props (match LineChart)
  xAxisRotation?: number;
  yAxisRotation?: number;
  showAxisLabels?: boolean;
  showAxisTicks?: boolean;

  // New interaction props (match LineChart)
  enableZoom?: boolean;
  enablePan?: boolean;
  zoomExtent?: number;
  showTooltip?: boolean;

  // New visual props (match LineChart)
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  titleFontSize?: number;
  labelFontSize?: number;
  legendFontSize?: number;
  showPointValues?: boolean; // Show values on bars (similar to LineChart showPointValues)
  // Preview variant: render without frame/background card
  variant?: 'default' | 'preview';
  // Show all X-axis ticks without sampling (useful for date data with compact formatting)
  showAllXAxisTicks?: boolean;
}

const D3BarChart: React.FC<D3BarChartProps> = ({
  data,
  arrayData,
  width = 800,
  height = 600,
  margin = { top: 20, right: 40, bottom: 60, left: 80 },
  xAxisKey,
  yAxisKeys,
  disabledBars = [], // Disabled bars (match LineChart disabledLines)
  colors = defaultColorsChart,
  seriesNames = {}, // Series names mapping (match LineChart)
  xAxisNames = {}, // X-axis names mapping from ID to display name
  axisConfigs = {}, // Individual series configurations (match LineChart)
  title,
  yAxisLabel,
  xAxisLabel,
  showLegend = true,
  showGrid = true,
  yAxisStart = 'zero', // Y-axis start option (match LineChart)
  animationDuration = 1000,
  yAxisFormatter, // Custom Y-axis formatter (match LineChart)
  xAxisFormatter, // Custom X-axis formatter (match LineChart)
  fontSize = { axis: 12, label: 14, title: 16 }, // Font size options (match LineChart)

  // Formatter types for axis labels (match LineChart)
  yFormatterType = 'number',
  xFormatterType = 'number',

  // Bar-specific props
  barType = 'grouped',
  barWidth,
  barSpacing = 0,

  // Styling props (match LineChart)
  gridOpacity = 0.5,
  legendPosition = 'bottom',

  // Axis props (match LineChart)
  xAxisRotation = 0,
  yAxisRotation = 0,
  showAxisLabels = true,
  showAxisTicks = true,

  // Interaction props (match LineChart)
  enableZoom = false,
  enablePan = false,
  zoomExtent = 8,
  showTooltip = true,

  // Visual props (match LineChart)
  theme = 'auto',
  backgroundColor = 'transparent',
  titleFontSize = 16,
  labelFontSize = 12,
  legendFontSize = 11,
  showPointValues = false, // Show values on bars (similar to LineChart showPointValues)
  variant = 'default',
  showAllXAxisTicks = false, // Default to sampling ticks
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width, height });
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);

  // Tooltip management refs (matching LineChart implementation)
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

  // Small helper: compute responsive margins (extracted to improve readability)
  const computeResponsiveMargin = (
    currentWidth: number,
    baseMargin: { top: number; right: number; bottom: number; left: number }
  ) => {
    // Calculate max Y value to determine if we need more space for labels
    let maxYValue = 0;
    if (processedData.length > 0) {
      if (barType === 'stacked') {
        maxYValue = Math.max(
          ...processedData.map(d =>
            yAxisKeys.reduce((sum, key) => sum + ((d[key] as number) || 0), 0)
          )
        );
      } else {
        maxYValue = Math.max(
          ...processedData.map(d => Math.max(...yAxisKeys.map(key => (d[key] as number) || 0)))
        );
      }
    }

    // Increase left margin based on the number of digits in max value
    const numDigits = Math.max(3, maxYValue.toString().replace(/[.,]/g, '').length);
    const extraLeftSpace = Math.max(0, (numDigits - 3) * 8); // 8px per extra digit

    const responsiveMargin = {
      top: currentWidth < 640 ? baseMargin.top * 0.8 : baseMargin.top,
      right: currentWidth < 640 ? baseMargin.right * 0.7 : baseMargin.right,
      bottom: currentWidth < 640 ? baseMargin.bottom * 0.8 : baseMargin.bottom,
      left: Math.max(
        currentWidth < 640 ? baseMargin.left * 0.8 : baseMargin.left,
        baseMargin.left + extraLeftSpace
      ),
    };

    // Reserve space for legend when positioned top/bottom to avoid overlap (matching LineChart behavior)
    if (showLegend && (legendPosition === 'top' || legendPosition === 'bottom')) {
      const isMobile = currentWidth < 640;
      const isTablet = currentWidth < 1024;
      const itemHeight = isMobile ? 18 : 20;
      const padding = isMobile ? 8 : 10;
      const legendBlock = itemHeight + padding * 2;
      const xLabelSpacing =
        xAxisLabel && showAxisLabels ? (isMobile ? 30 : isTablet ? 35 : 40) : isMobile ? 15 : 20;

      if (legendPosition === 'top') {
        responsiveMargin.top += legendBlock + 10;
      } else {
        const minBottom = isMobile ? 100 : 110;
        responsiveMargin.bottom = Math.max(baseMargin.bottom * 2.0, minBottom) + xLabelSpacing;
      }
    }

    return responsiveMargin;
  };

  // Helper functions for tooltip management (matching LineChart implementation)
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
        .style('opacity', 0);
      // Don't remove - keep for reuse
      // .remove();
      // currentTooltipRef.current = null;
    }
  };

  // Convert array to data
  const processedData = React.useMemo((): ChartDataPoint[] => {
    if (arrayData && arrayData.length > 0) return convertArrayToChartData(arrayData);
    return data || [];
  }, [arrayData, data]);

  // Update fontSize object with new props
  const responsiveFontSize = React.useMemo(
    () => ({
      axis: fontSize.axis,
      label: labelFontSize,
      title: titleFontSize,
    }),
    [fontSize.axis, labelFontSize, titleFontSize]
  );

  // Resize observer
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      let aspectRatio = height / width;
      if (containerWidth < 640) aspectRatio = Math.min(aspectRatio * 1.2, 0.75);
      else if (containerWidth < 1024) aspectRatio = Math.min(aspectRatio, 0.6);
      else aspectRatio = Math.min(aspectRatio, 0.5);

      const newWidth = Math.min(containerWidth - 16, width); // 16px for minimal padding
      let newHeight = newWidth * aspectRatio;

      // Auto-adjust height based on Y-axis value range to prevent label overlap
      if (processedData.length > 0) {
        // Calculate Y-axis range
        let maxValue: number;
        if (barType === 'stacked') {
          maxValue =
            Math.max(
              ...processedData.map(d =>
                yAxisKeys.reduce((sum, key) => sum + ((d[key] as number) || 0), 0)
              )
            ) || 0;
        } else {
          maxValue =
            Math.max(
              ...processedData.map(d => Math.max(...yAxisKeys.map(key => (d[key] as number) || 0)))
            ) || 0;
        }

        // Estimate number of Y-axis ticks (D3 usually creates ~5-10 ticks)
        const estimatedTicks = Math.min(10, Math.max(5, Math.floor(maxValue / 100)));
        const minSpacingPerTick = 40; // Minimum 40px between each tick label
        const requiredHeight = estimatedTicks * minSpacingPerTick + 100; // +100 for margins

        // If required height is more than current, increase height
        if (requiredHeight > newHeight) {
          newHeight = Math.min(requiredHeight, newHeight * 2); // Cap at 2x original
        }

        // For very large values, ensure enough space for long numbers
        if (maxValue > 10000) {
          newHeight = Math.max(newHeight, 500);
        }
      }

      // Add extra height for axis labels (matching LineChart exactly)
      const hasXAxisLabel = xAxisLabel && showAxisLabels;

      if (hasXAxisLabel) {
        newHeight += containerWidth < 640 ? 35 : 40; // Extra space for X-axis label
      }

      // Adjust chart size when legend is bottom to make room for legend (matching LineChart exactly)
      if (showLegend && legendPosition === 'bottom') {
        // Reduce chart height to make room for legend and add extra space
        newHeight = newHeight * 0.8; // Reduce chart to 80% to make room
        const legendExtraHeight = 150; // Extra space for bottom legend
        newHeight += legendExtraHeight;
      }

      setDimensions({ width: newWidth, height: newHeight });
    };
    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [
    width,
    height,
    showLegend,
    legendPosition,
    showAxisLabels,
    xAxisLabel,
    processedData,
    yAxisKeys,
    barType,
  ]);

  // Theme
  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'auto') setIsDarkMode(document.documentElement.classList.contains('dark'));
      else setIsDarkMode(theme === 'dark');
    };
    updateTheme();
    if (theme === 'auto') {
      const obs = new MutationObserver(updateTheme);
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => obs.disconnect();
    }
  }, [theme]);

  // Cleanup tooltip timeout on unmount (matching LineChart implementation)
  useEffect(() => {
    return () => {
      clearTooltipTimeout();
    };
  }, [clearTooltipTimeout]);

  useEffect(() => {
    if (!svgRef.current || !processedData.length) return;

    // Minimum width per data point (adjust based on rotation)
    const minWidthPerPoint = xAxisRotation === 0 ? 60 : 30; // More space for horizontal labels
    const calculatedMinWidth = Math.max(dimensions.width, processedData.length * minWidthPerPoint);

    const currentWidth = calculatedMinWidth;
    const currentHeight = dimensions.height;

    // Auto-enable pan when chart is wider than container (due to many data points)
    const isChartExpanded = currentWidth > dimensions.width;
    const shouldEnablePan = enablePan || isChartExpanded;
    const shouldEnableZoom = enableZoom; // Keep zoom as user preference

    // Coerce potentially string props from editor into numbers so updates take effect
    const effectiveBarWidthProp = typeof barWidth === 'string' ? parseFloat(barWidth) : barWidth;
    const effectiveBarSpacingProp =
      typeof barSpacing === 'string' ? parseFloat(barSpacing) : barSpacing;

    // Dev debug: show effective width/spacing to help debugging when adjusting controls
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        'D3BarChart debug: effectiveBarWidthProp=',
        effectiveBarWidthProp,
        'effectiveBarSpacingProp=',
        effectiveBarSpacingProp
      );
    }

    // Colors
    const getCurrentColors = () => {
      const mode = isDarkMode ? 'dark' : 'light';
      const result: Record<string, string> = {};
      yAxisKeys.forEach((key, index) => {
        const colorKey = colors[key] ? key : `bar${index + 1}`;
        result[key] = colors[colorKey]?.[mode] || defaultColorsChart[`color${index + 1}`][mode];
      });
      return result;
    };
    const currentColors = getCurrentColors();

    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const gridColor = isDarkMode ? '#4b5563' : '#9ca3af';
    const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';
    const bgColor =
      backgroundColor !== 'transparent' ? backgroundColor : isDarkMode ? '#111827' : '#ffffff';

    // Clear and setup
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current);

    const responsiveMargin = computeResponsiveMargin(currentWidth, margin);

    // Calculate legend height for top/bottom positioning
    const isMobile = currentWidth < 640;
    const isTablet = currentWidth < 1024;
    let legendHeightReserved = 0;

    if (showLegend && (legendPosition === 'top' || legendPosition === 'bottom')) {
      // Estimate legend height based on items and layout
      const enabledBarsCount = yAxisKeys.filter(key => !disabledBars.includes(key)).length;
      const itemContainerW = isMobile ? 100 : isTablet ? 120 : 140;
      const tempInnerWidth = currentWidth - responsiveMargin.left - responsiveMargin.right;
      const availableWidth = tempInnerWidth - (isMobile ? 24 : 32);
      const totalSingleWidth = itemContainerW * enabledBarsCount;
      const useTwoRows = totalSingleWidth > availableWidth && enabledBarsCount > 1;

      // Base height + padding
      const baseHeight = isMobile ? 40 : isTablet ? 45 : 50;
      const twoRowHeight = isMobile ? 70 : isTablet ? 80 : 90;
      legendHeightReserved = useTwoRows ? twoRowHeight : baseHeight;

      // Add spacing between legend and chart
      legendHeightReserved += isMobile ? 15 : isTablet ? 20 : 25;
    }

    const innerWidth = currentWidth - responsiveMargin.left - responsiveMargin.right;
    const innerHeight =
      currentHeight - responsiveMargin.top - responsiveMargin.bottom - legendHeightReserved;

    svg
      .append('rect')
      .attr('width', currentWidth)
      .attr('height', currentHeight)
      .attr('fill', bgColor)
      .attr('rx', 8);

    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', responsiveMargin.left)
      .attr('height', currentHeight)
      .attr('fill', isDarkMode ? '#111827' : '#f8fafc')
      .attr('opacity', 0.3);

    const g = svg
      .append('g')
      .attr(
        'transform',
        `translate(${responsiveMargin.left},${responsiveMargin.top + (legendPosition === 'top' ? legendHeightReserved : 0)})`
      );

    // Scales
    const xDomain = processedData.map((_, i) => String(i));

    const xScale = d3
      .scaleBand()
      .domain(xDomain) // Use original order from data
      .range([0, innerWidth])
      .padding(0.1); // Reduce padding for wider bars

    let maxValue: number;
    if (barType === 'stacked') {
      maxValue =
        d3.max(processedData, d => yAxisKeys.reduce((sum, key) => sum + (d[key] as number), 0)) ||
        0;
    } else {
      maxValue = d3.max(processedData, d => d3.max(yAxisKeys, key => d[key] as number) || 0) || 0;
    }

    let yMin = 0;
    if (yAxisStart === 'auto') yMin = 0;
    else if (yAxisStart === 'zero') yMin = 0;
    else if (typeof yAxisStart === 'number') yMin = yAxisStart;

    const yScale = d3
      .scaleLinear()
      .domain([yMin, maxValue * 1.1])
      .range([innerHeight, 0]);

    // Compute inner padding from barSpacing:
    // - If <= 1: treat as fraction (0..0.5)
    // - If > 1: treat as pixels and normalize by parent band width
    const normalizedPadding = (() => {
      const spacing = typeof effectiveBarSpacingProp === 'number' ? effectiveBarSpacingProp : 0.05;
      // If spacing is <= 1, treat as fraction of band (0..1)
      if (spacing <= 1) return Math.max(0, Math.min(0.45, spacing)); // allow up to 45% inner padding
      // If spacing > 1 treat as pixels and normalize by bandwidth
      const bw = xScale.bandwidth();
      if (bw <= 0) return 0.05;
      return Math.max(0, Math.min(0.45, spacing / bw));
    })();

    const xSubScale = d3
      .scaleBand()
      .domain(yAxisKeys)
      .range([0, xScale.bandwidth()])
      .padding(normalizedPadding);

    // Grid
    if (showGrid) {
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
        .attr('opacity', gridOpacity);

      g.selectAll('.grid-line-vertical')
        .data(xScale.domain())
        .enter()
        .append('line')
        .attr('class', 'grid-line-vertical')
        .attr('x1', d => (xScale(d) || 0) + xScale.bandwidth() / 2)
        .attr('x2', d => (xScale(d) || 0) + xScale.bandwidth() / 2)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', Math.max(0, Math.min(1, gridOpacity * 0.7)));
    }

    // X-Axis - show all labels (chart width already adjusted to fit all)
    const xAxis = d3.axisBottom(xScale).tickFormat((d, _) => {
      // d is the index string, map back to actual value
      const index = Number(d);
      const item = processedData[index];
      if (!item) return '';

      const rawValue = String(item[xAxisKey]);

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

    const xAxisGroup = g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);

    // Smart label handling: measure labels and adjust if needed
    const xLabels = xAxisGroup.selectAll('text');

    // Measure label widths to detect overlap
    let needsRotation = false;
    let maxLabelWidth = 0;

    try {
      // Only measure visible labels (non-empty text)
      let visibleLabelCount = 0;
      xLabels.each(function () {
        const text = (this as SVGTextElement).textContent;
        if (text && text.trim() !== '') {
          const bbox = (this as SVGTextElement).getBBox();
          if (bbox.width > maxLabelWidth) maxLabelWidth = bbox.width;
          visibleLabelCount++;
        }
      });

      // Calculate available space per visible label
      const availableSpacePerLabel =
        visibleLabelCount > 0 ? innerWidth / visibleLabelCount : innerWidth;

      // If average label width > 80% of available space, rotate
      if (maxLabelWidth > availableSpacePerLabel * 0.8) {
        needsRotation = true;
      }
    } catch (_) {
      needsRotation = xAxisRotation !== 0;
    }

    // Apply rotation if needed (either from prop or auto-detected)
    const finalRotation = needsRotation ? (xAxisRotation !== 0 ? xAxisRotation : -45) : 0;

    xLabels
      .attr('fill', textColor)
      .style('font-size', `${responsiveFontSize.axis}px`)
      .style('font-weight', '500')
      .attr('transform', `rotate(${finalRotation})`)
      .style('text-anchor', finalRotation === 0 ? 'middle' : finalRotation > 0 ? 'start' : 'end')
      .style('opacity', function () {
        // Ensure sampled-out labels are completely hidden
        const text = (this as SVGTextElement).textContent;
        return text && text.trim() !== '' ? 1 : 0;
      });

    xAxisGroup.select('.domain').attr('stroke', axisColor).attr('stroke-width', 2);
    if (showAxisTicks) xAxisGroup.selectAll('.tick line').attr('stroke', axisColor);
    else xAxisGroup.selectAll('.tick line').attr('opacity', 0);

    // Smart Y-axis formatter to prevent label overlap
    const formatYAxisValue = (value: number): string => {
      if (yAxisFormatter) return yAxisFormatter(value);
      // Fallback to simple number display if no formatter provided
      return String(value);
    };

    // Calculate optimal number of ticks based on chart height
    const optimalTickCount = Math.max(5, Math.min(10, Math.floor(innerHeight / 50)));

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(optimalTickCount) // Limit number of ticks to prevent overlap
      .tickFormat(d => formatYAxisValue(d.valueOf()))
      .tickSize(showAxisTicks ? -5 : 0)
      .tickPadding(10); // Increase padding for better spacing
    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${Math.max(10, responsiveFontSize.axis - 1)}px`) // Slightly smaller font
      .style('font-weight', '600')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .attr('text-anchor', 'end')
      .attr('x', -10)
      .attr('dy', '0.32em') // Better vertical centering
      .attr('transform', `rotate(${yAxisRotation})`);
    yAxisGroup
      .select('.domain')
      .attr('stroke', axisColor)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);
    if (showAxisTicks) {
      yAxisGroup
        .selectAll('.tick line')
        .attr('stroke', axisColor)
        .attr('stroke-width', 1)
        .attr('opacity', 0.6);
    } else {
      yAxisGroup.selectAll('.tick line').attr('opacity', 0);
    }

    // Bars
    if (barType === 'grouped') {
      yAxisKeys.forEach((key, keyIndex) => {
        // Get individual series configurations (matching LineChart approach)
        const seriesConfig = axisConfigs[key] || {};
        const seriesBarWidth = seriesConfig.barWidth ?? barWidth;
        const seriesOpacity = seriesConfig.opacity ?? 1;

        g.selectAll(`.bar-${keyIndex}`)
          .data(processedData)
          .enter()
          .append('rect')
          .attr('class', `bar-${keyIndex}`)
          .attr('x', (_d, i) => {
            const base = (xScale(String(i)) || 0) + (xSubScale(key) || 0);
            const subBW = xSubScale.bandwidth();
            // Use series-specific barWidth if available
            let bw = subBW;
            if (typeof seriesBarWidth === 'number' && !isNaN(seriesBarWidth)) {
              if (seriesBarWidth <= 0) bw = subBW;
              else if (seriesBarWidth > 0 && seriesBarWidth <= 1) bw = subBW * seriesBarWidth;
              else bw = Math.min(seriesBarWidth, subBW);
            }
            return base + (subBW - bw) / 2;
          })
          .attr('y', innerHeight)
          .attr('width', () => {
            const subBW = xSubScale.bandwidth();
            if (typeof seriesBarWidth !== 'number' || isNaN(seriesBarWidth) || seriesBarWidth <= 0)
              return subBW;
            if (seriesBarWidth <= 1) return subBW * seriesBarWidth; // fraction
            return Math.min(seriesBarWidth, subBW); // pixels
          })
          .attr('height', 0)
          .attr('fill', currentColors[key])
          .attr('opacity', seriesOpacity) // Apply series-specific opacity
          .attr('rx', 4)
          .attr('ry', 4)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
          .on('mouseover', function (_event, d) {
            if (!showTooltip) return;
            // Ensure no pending hide and remove previous tooltip immediately
            clearTooltipTimeout();
            // hideCurrentTooltip(); // Removed to prevent flickering

            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))')
              .attr('opacity', 0.8);

            // Calculate statistics for enhanced tooltip
            const currentValue = d[key] as number;
            const xDisplayName = xAxisNames[String(d[xAxisKey])] || String(d[xAxisKey]);
            const seriesDisplayName = seriesNames[key] || key;

            // Calculate total for this category (all series)
            const categoryTotal = yAxisKeys.reduce((sum, k) => sum + ((d[k] as number) || 0), 0);
            const percentOfCategory = categoryTotal > 0 ? (currentValue / categoryTotal) * 100 : 0;

            // Calculate average for this series across all data
            const seriesValues = processedData
              .map(item => item[key] as number)
              .filter(v => !isNaN(v));
            const seriesAverage =
              seriesValues.length > 0
                ? seriesValues.reduce((a, b) => a + b, 0) / seriesValues.length
                : 0;
            const diffFromAvg = currentValue - seriesAverage;
            const diffPercent = seriesAverage > 0 ? (diffFromAvg / seriesAverage) * 100 : 0;

            // Calculate rank (1 = highest value in this series)
            const sortedValues = [...seriesValues].sort((a, b) => b - a);
            const rank = sortedValues.indexOf(currentValue) + 1;

            // Build tooltip content
            const tooltipLines: Array<{
              text: string;
              fontSize: number;
              fontWeight: string;
              color?: string;
            }> = [
              { text: xDisplayName, fontSize: responsiveFontSize.axis + 1, fontWeight: '700' },
              {
                text: `${seriesDisplayName}: ${yAxisFormatter ? yAxisFormatter(currentValue) : currentValue}`,
                fontSize: responsiveFontSize.axis + 2,
                fontWeight: '800',
                color: currentColors[key],
              },
            ];

            // Add percentage if multiple series
            if (yAxisKeys.length > 1) {
              tooltipLines.push({
                text: `${percentOfCategory.toFixed(1)}% of total`,
                fontSize: responsiveFontSize.axis - 1,
                fontWeight: '500',
              });
            }

            // Add comparison with average
            const diffSign = diffFromAvg >= 0 ? '+' : '';
            const diffColor =
              diffFromAvg >= 0
                ? isDarkMode
                  ? '#10b981'
                  : '#059669'
                : isDarkMode
                  ? '#ef4444'
                  : '#dc2626';
            tooltipLines.push({
              text: `Avg: ${yAxisFormatter ? yAxisFormatter(seriesAverage) : seriesAverage} (${diffSign}${diffPercent.toFixed(1)}%)`,
              fontSize: responsiveFontSize.axis - 1,
              fontWeight: '500',
              color: diffColor,
            });

            // Add rank
            tooltipLines.push({
              text: `Rank: #${rank} of ${seriesValues.length}`,
              fontSize: responsiveFontSize.axis - 1,
              fontWeight: '500',
            });

            // Build tooltip using utility functions
            const tooltipLinesNew: TooltipLine[] = [
              createHeader(xDisplayName, { fontSize: responsiveFontSize.axis + 1 }),
              createStatLine(seriesDisplayName, currentValue, {
                fontSize: responsiveFontSize.axis + 2,
                fontWeight: '800',
                color: currentColors[key],
              }),
            ];

            // Add percentage if multiple series
            if (yAxisKeys.length > 1) {
              tooltipLinesNew.push(
                createStatLine('Of total', `${percentOfCategory.toFixed(1)}%`, {
                  fontSize: responsiveFontSize.axis - 1,
                  fontWeight: '500',
                })
              );
            }

            // Add comparison with average
            tooltipLinesNew.push(
              createStatLine('Average', seriesAverage, {
                fontSize: responsiveFontSize.axis - 1,
                fontWeight: '500',
              })
            );
            tooltipLinesNew.push(
              createPercentLine('vs Avg', diffPercent, {
                isDarkMode,
                showSign: true,
                fontSize: responsiveFontSize.axis - 1,
              })
            );

            // Add rank
            tooltipLinesNew.push(
              createRankLine(rank, seriesValues.length, { fontSize: responsiveFontSize.axis - 1 })
            );

            // Reuse existing tooltip or create new one
            let tooltip = currentTooltipRef.current;
            if (!tooltip || tooltip.empty()) {
              tooltip = g.append('g').attr('class', 'tooltip').style('opacity', 0);
              currentTooltipRef.current = tooltip;
            }

            const pointerX =
              (xScale(String(processedData.indexOf(d))) || 0) +
              (xSubScale(key) || 0) +
              xSubScale.bandwidth() / 2;
            const pointerY = yScale(d[key] as number);

            renderD3Tooltip(tooltip, {
              lines: tooltipLinesNew,
              isDarkMode,
              position: { x: pointerX, y: pointerY },
              containerWidth: innerWidth,
              containerHeight: innerHeight,
              preferPosition: 'above',
            });

            // Smooth fade in
            tooltip.style('opacity', 1);

            // Follow mouse
            d3.select(this).on('mousemove', function (moveEvent) {
              const [mx, my] = d3.pointer(moveEvent, g.node());
              renderD3Tooltip(tooltip, {
                lines: tooltipLinesNew,
                isDarkMode,
                position: { x: mx, y: my },
                containerWidth: innerWidth,
                containerHeight: innerHeight,
                preferPosition: 'above',
              });
            });
          })
          .on('mouseout', function () {
            d3.select(this).on('mousemove', null);
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
              .attr('opacity', 1);

            // Schedule tooltip hide so quick re-hovers don't cause flicker
            tooltipTimeoutRef.current = setTimeout(() => {
              hideCurrentTooltip();
            }, 150);
          })
          .transition()
          .delay(keyIndex * 100)
          .duration(animationDuration)
          .ease(d3.easeBackOut)
          .attr('y', d => yScale(d[key] as number))
          .attr('height', d => innerHeight - yScale(d[key] as number));

        // Note: Bar values are now shown as category totals outside the loop
      });
    }

    // Add aggregated values for grouped bars if showPointValues is enabled
    // Show one value per X-axis category (total of all series) instead of per bar
    if (barType === 'grouped' && showPointValues) {
      // Calculate totals for each x-axis category
      const categoryTotals = processedData.map(d => {
        const total = yAxisKeys
          .filter(k => !disabledBars.includes(k))
          .reduce((sum, key) => sum + ((d[key] as number) || 0), 0);
        return { xValue: d[xAxisKey], total };
      });

      g.selectAll('.grouped-bar-total')
        .data(categoryTotals)
        .enter()
        .append('text')
        .attr('class', 'grouped-bar-total')
        .attr('x', (_d, i) => (xScale(String(i)) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => {
          // Find the highest bar in this category group
          const maxValue = Math.max(
            ...yAxisKeys
              .filter(k => !disabledBars.includes(k))
              .map(k => {
                const dataPoint = processedData.find(p => p[xAxisKey] === d.xValue);
                return (dataPoint?.[k] as number) || 0;
              })
          );
          return yScale(maxValue) - 8;
        })
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${Math.max(responsiveFontSize.axis - 2, 10)}px`)
        .style('font-weight', '600')
        .style('opacity', 0)
        .style('stroke', isDarkMode ? '#111827' : '#ffffff')
        .style('stroke-width', '3px')
        .style('paint-order', 'stroke')
        .style('fill', textColor)
        .text(d => {
          return yAxisFormatter ? yAxisFormatter(d.total) : String(d.total);
        })
        .transition()
        .delay(animationDuration)
        .duration(300)
        .ease(d3.easeBackOut)
        .style('opacity', 1);
    }

    // Stacked bars logic
    if (barType === 'stacked') {
      const stackedData = d3
        .stack<ChartDataPoint>()
        .keys(yAxisKeys)
        .value((d, key) => d[key] as number)(processedData);
      stackedData.forEach((series, seriesIndex) => {
        g.selectAll(`.bar-stack-${seriesIndex}`)
          .data(series)
          .enter()
          .append('rect')
          .attr('class', `bar-stack-${seriesIndex}`)
          .attr('x', (_d, i) => xScale(String(i)) || 0)
          .attr('y', innerHeight)
          .attr('width', xScale.bandwidth())
          .attr('height', 0)
          .attr('fill', currentColors[yAxisKeys[seriesIndex]])
          .attr('rx', seriesIndex === 0 ? 4 : 0)
          .attr('ry', seriesIndex === 0 ? 4 : 0)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
          .on('mouseover', function (_event, d) {
            if (!showTooltip) return;
            clearTooltipTimeout();
            // hideCurrentTooltip(); // Removed to prevent flickering

            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))')
              .attr('opacity', 0.8);

            const currentKey = yAxisKeys[seriesIndex];
            const currentValue = d[1] - d[0];
            const xDisplayName = xAxisNames[String(d.data[xAxisKey])] || String(d.data[xAxisKey]);
            const seriesDisplayName = seriesNames[currentKey] || currentKey;

            // Calculate total for this stack (all series)
            const stackTotal = yAxisKeys.reduce((sum, k) => sum + ((d.data[k] as number) || 0), 0);
            const percentOfStack = stackTotal > 0 ? (currentValue / stackTotal) * 100 : 0;

            // Calculate cumulative percentage up to this layer
            let cumulativeValue = 0;
            for (let i = 0; i <= seriesIndex; i++) {
              cumulativeValue += (d.data[yAxisKeys[i]] as number) || 0;
            }
            const cumulativePercent = stackTotal > 0 ? (cumulativeValue / stackTotal) * 100 : 0;

            // Calculate average for this series
            const seriesValues = processedData
              .map(item => item[currentKey] as number)
              .filter(v => !isNaN(v));
            const seriesAverage =
              seriesValues.length > 0
                ? seriesValues.reduce((a, b) => a + b, 0) / seriesValues.length
                : 0;
            const diffFromAvg = currentValue - seriesAverage;
            const diffPercent = seriesAverage > 0 ? (diffFromAvg / seriesAverage) * 100 : 0;

            // Build tooltip content for stacked bars using utility functions
            const stackedTooltipLines: TooltipLine[] = [
              createHeader(xDisplayName, { fontSize: responsiveFontSize.axis + 1 }),
              createStatLine(seriesDisplayName, currentValue, {
                fontSize: responsiveFontSize.axis + 2,
                fontWeight: '800',
                color: currentColors[currentKey],
              }),
              createStatLine('Of stack', `${percentOfStack.toFixed(1)}%`, {
                fontSize: responsiveFontSize.axis - 1,
                fontWeight: '500',
              }),
              createStatLine('Cumulative', `${cumulativePercent.toFixed(1)}%`, {
                fontSize: responsiveFontSize.axis - 1,
                fontWeight: '500',
              }),
              createStatLine('Average', seriesAverage, {
                fontSize: responsiveFontSize.axis - 1,
                fontWeight: '500',
              }),
              createPercentLine('vs Avg', diffPercent, {
                isDarkMode,
                showSign: true,
                fontSize: responsiveFontSize.axis - 1,
              }),
              createSeparator(),
              createStatLine('Stack total', stackTotal, {
                fontSize: responsiveFontSize.axis - 1,
                fontWeight: '600',
              }),
            ];

            // Reuse existing tooltip or create new one
            let tooltip = currentTooltipRef.current;
            if (!tooltip || tooltip.empty()) {
              tooltip = g.append('g').attr('class', 'tooltip').style('opacity', 0);
              currentTooltipRef.current = tooltip;
            }

            const pointerX =
              (xScale(String(processedData.indexOf(d.data))) || 0) + xScale.bandwidth() / 2;
            const pointerY = yScale(d[1]);

            renderD3Tooltip(tooltip, {
              lines: stackedTooltipLines,
              isDarkMode,
              position: { x: pointerX, y: pointerY },
              containerWidth: innerWidth,
              containerHeight: innerHeight,
              preferPosition: 'above',
            });

            // Smooth fade in
            tooltip.style('opacity', 1);

            // Follow mouse
            d3.select(this).on('mousemove', function (moveEvent) {
              const [mx, my] = d3.pointer(moveEvent, g.node());
              renderD3Tooltip(tooltip, {
                lines: stackedTooltipLines,
                isDarkMode,
                position: { x: mx, y: my },
                containerWidth: innerWidth,
                containerHeight: innerHeight,
                preferPosition: 'above',
              });
            });
          })
          .on('mouseout', function () {
            d3.select(this).on('mousemove', null);
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
              .attr('opacity', 1);

            tooltipTimeoutRef.current = setTimeout(() => {
              hideCurrentTooltip();
            }, 150);
          })
          .transition()
          .delay(seriesIndex * 100)
          .duration(animationDuration)
          .ease(d3.easeBackOut)
          .attr('y', d => yScale(d[1]))
          .attr('height', d => yScale(d[0]) - yScale(d[1]));
      });

      // Add total values on top of stacked bars if showPointValues is enabled
      if (showPointValues) {
        // Calculate totals for each x-axis category
        const totals = processedData.map(d => {
          const total = yAxisKeys.reduce((sum, key) => sum + ((d[key] as number) || 0), 0);
          return { xValue: d[xAxisKey], total };
        });

        g.selectAll('.stacked-bar-total')
          .data(totals)
          .enter()
          .append('text')
          .attr('class', 'stacked-bar-total')
          .attr('x', d => (xScale(String(d.xValue)) || 0) + xScale.bandwidth() / 2)
          .attr('y', d => yScale(d.total) - 5)
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .style('font-size', `${Math.max(responsiveFontSize.axis - 3, 9)}px`)
          .style('font-weight', '500')
          .style('opacity', 0)
          .style('stroke', isDarkMode ? '#111827' : '#ffffff')
          .style('stroke-width', '3px')
          .style('paint-order', 'stroke')
          .style('fill', textColor)
          .text(d => {
            return yAxisFormatter ? yAxisFormatter(d.total) : String(d.total);
          })
          .transition()
          .delay(animationDuration)
          .duration(300)
          .ease(d3.easeBackOut)
          .style('opacity', 1);
      }
    }

    // Axis labels with formatter symbols (matching LineChart implementation)
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
        .attr('y', currentWidth < 768 ? -55 : -65)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${responsiveFontSize.label}px`)
        .style('font-weight', '600')
        .text(yLabelText);
    }

    // Add legend (matching PieChart implementation exactly)
    if (showLegend) {
      const enabledBars = yAxisKeys.filter(key => !disabledBars.includes(key));
      const isMobile = currentWidth < 640;
      const isTablet = currentWidth < 1024;

      // Calculate legend dimensions first to reserve space
      const legendItemHeight = isMobile ? 20 : isTablet ? 22 : 25;
      const legendItems = enabledBars;

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
      const legendSpacingFromChart = isMobile ? 35 : isTablet ? 65 : 85; // Increased spacing to avoid X-axis label overlap

      switch (legendPosition) {
        case 'top':
          legendX = innerWidth / 2 - legendWidth / 2;
          legendY = -legendHeightReserved - 10; // Position above the chart area
          break;
        case 'bottom':
          legendX = innerWidth / 2 - legendWidth / 2;
          legendY = innerHeight + legendSpacingFromChart; // Position below the chart area
          break;
        case 'left':
          // push legend slightly inward so it's not too close to the chart
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
        const itemContainerW = isMobile ? 100 : isTablet ? 120 : 140; // Fixed width per column slot

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
          const rowY = localIconSize + padY; // spacing between rows

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

    // Zoom behavior using d3.zoom
    const zoom = d3
      .zoom<Element, unknown>()
      .scaleExtent(shouldEnableZoom ? [0.5, zoomExtent] : [1, 1])
      .on('zoom', event => {
        const { x, y, k } = event.transform;
        g.attr(
          'transform',
          `translate(${x + responsiveMargin.left}, ${y + responsiveMargin.top}) scale(${k})`
        );
      });

    zoomBehaviorRef.current = zoom;

    if (shouldEnableZoom || shouldEnablePan) {
      svg.call(zoom as any);

      // Disable zoom on wheel if not enabled
      if (!shouldEnableZoom) {
        svg.on('wheel.zoom', null);
      }
      // Disable pan on mousedown if not enabled
      if (!shouldEnablePan) {
        svg.on('mousedown.zoom', null);
        svg.on('touchstart.zoom', null);
      }

      // Handle mouse leave to hide tooltips
      svg.on('mouseleave.tooltip', () => {
        clearTooltipTimeout();
        hideCurrentTooltip();
      });

      // Double click to reset
      svg.on('dblclick.zoom', () => {
        svg
          .transition()
          .duration(300)
          .call(zoom.transform as any, d3.zoomIdentity);
      });
    } else {
      svg.on('.zoom', null);
      // Global mouseleave if zoom disabled
      if (showTooltip) {
        svg.on('mouseleave.tooltip', () => {
          clearTooltipTimeout();
          hideCurrentTooltip();
        });
      }
    }
  }, [
    processedData,
    margin,
    xAxisKey,
    yAxisKeys,
    disabledBars, // Add missing legend dependency
    colors,
    seriesNames, // Add missing legend dependency
    xAxisNames, // Add missing legend dependency
    axisConfigs, // Add missing legend dependency
    showLegend,
    showGrid,
    animationDuration,
    title,
    xAxisLabel,
    yAxisLabel,
    isDarkMode,
    dimensions,
    yAxisFormatter,
    xAxisFormatter,
    fontSize,
    yFormatterType, // Add missing formatter dependency
    xFormatterType, // Add missing formatter dependency
    barType,
    gridOpacity,
    legendPosition, // Add missing legend dependency
    xAxisRotation,
    yAxisRotation,
    showAxisLabels,
    showAxisTicks,
    yAxisStart,
    backgroundColor,
    showTooltip,
    barWidth,
    barSpacing,
    titleFontSize,
    labelFontSize,
    legendFontSize,
    showPointValues, // Add missing dependency
    enableZoom,
    enablePan,
    zoomExtent,
    theme, // Add missing theme dependency
    responsiveFontSize.axis,
    responsiveFontSize.label,
    responsiveFontSize.title, // Add missing title font dependency
    showAllXAxisTicks, // Add showAllXAxisTicks dependency
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
          style={{ display: 'block' }} // Ensure proper block display
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
};

export default D3BarChart;
