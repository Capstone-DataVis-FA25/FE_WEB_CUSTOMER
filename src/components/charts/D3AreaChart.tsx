import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ColorConfig } from '../../types/chart';
import { defaultColorsChart } from '@/utils/Utils';
import {
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  MOBILE_MARGIN_TOP_FACTOR,
  MOBILE_MARGIN_RIGHT_FACTOR,
  MOBILE_MARGIN_BOTTOM_FACTOR,
  MOBILE_MARGIN_LEFT_FACTOR,
} from '@/constants/response-breakpoint';
import {
  renderD3Tooltip,
  createHeader,
  createStatLine,
  createPercentLine,
  createRankLine,
  createSeparator,
} from './ChartTooltip';

export interface ChartDataPoint {
  [key: string]: number | string;
}

// Small helper types
interface ExtraMargins {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface D3AreaChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKeys: string[];
  disabledLines?: string[]; // New prop for disabled areas (similar to line chart)
  colors?: ColorConfig;
  title?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showPoints?: boolean;
  showStroke?: boolean; // Whether to show stroke lines on areas
  animationDuration?: number;
  curve?: d3.CurveFactory;
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: number) => string;
  fontSize?: { axis: number; label: number; title: number };
  opacity?: number; // Control area opacity
  stackedMode?: boolean; // Whether to stack areas or overlay them

  // New styling props matching line and bar charts
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
  showPointValues?: boolean;

  // Preview variant: render without frame/background card
  variant?: 'default' | 'preview';
}

const D3AreaChart: React.FC<D3AreaChartProps> = ({
  data,
  width = 800,
  height = 600,
  margin = { top: 20, right: 40, bottom: 60, left: 80 }, // Same as line chart
  xAxisKey,
  yAxisKeys,
  disabledLines = [], // Default to no disabled areas
  colors = defaultColorsChart,
  title,
  yAxisLabel,
  xAxisLabel,
  showLegend = true,
  showGrid = true,
  showPoints = false, // Areas typically don't show points by default
  showStroke = true,
  animationDuration = 1000,
  curve = d3.curveMonotoneX,
  yAxisFormatter,
  xAxisFormatter,
  fontSize = { axis: 12, label: 14, title: 16 },
  opacity = 0.7,
  stackedMode = false,

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
  showPointValues = false,
  variant = 'default',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [paddingVersion, setPaddingVersion] = useState<number>(0);
  const extraMarginsRef = useRef<ExtraMargins>({ left: 0, right: 0, top: 0, bottom: 0 });
  const adjustmentAppliedRef = useRef<boolean>(false);
  const prevConfigRef = useRef<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width,
    height,
  });

  // Monitor container size for responsiveness
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let aspectRatio = height / width;

        if (containerWidth < MOBILE_BREAKPOINT) {
          aspectRatio = Math.min(aspectRatio * 1.2, 0.75);
        } else if (containerWidth < TABLET_BREAKPOINT) {
          aspectRatio = Math.min(aspectRatio, 0.6);
        } else {
          aspectRatio = Math.min(aspectRatio, 0.5);
        }

        const newWidth = Math.min(containerWidth - 16, width);
        const newHeight = newWidth * aspectRatio;
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [width, height]);

  // Monitor theme changes
  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'auto') {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      } else {
        setIsDarkMode(theme === 'dark');
      }
    };

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

  useEffect(() => {
    if (!svgRef.current || !data.length) {
      // Clear SVG if no data
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
      return;
    }

    // Validate that xAxisKey exists in data
    if (!data[0] || !(xAxisKey in data[0])) {
      console.error('D3AreaChart: xAxisKey not found in data:', xAxisKey);
      return;
    }

    // Validate that at least one yAxisKey exists in data
    const validYKeys = yAxisKeys.filter(key => key in data[0]);
    if (validYKeys.length === 0) {
      console.error('D3AreaChart: No valid yAxisKeys found in data:', yAxisKeys);
      return;
    }

    // Calculate dynamic width based on number of data points
    const xValues = data.map(d => d[xAxisKey]);
    const hasStringXValues = xValues.some(v => typeof v === 'string');
    // Minimum width per data point (adjust based on rotation)
    const minWidthPerPoint = xAxisRotation === 0 ? 60 : 30; // More space for horizontal labels
    const calculatedMinWidth = hasStringXValues
      ? Math.max(dimensions.width, data.length * minWidthPerPoint)
      : dimensions.width;

    const currentWidth = calculatedMinWidth;
    const currentHeight = dimensions.height;

    // Auto-enable pan when chart is wider than container (due to many data points)
    const isChartExpanded = currentWidth > dimensions.width;
    const shouldEnablePan = enablePan || isChartExpanded;
    const shouldEnableZoom = enableZoom; // Keep zoom as user preference

    // Reset auto-adjust state only when key chart inputs change (avoid infinite loops)
    const configKey = `${data.length}-${dimensions.width}-${dimensions.height}-${xAxisKey}-${yAxisKeys.join(',')}-${xAxisRotation}-${yAxisRotation}`;
    if (prevConfigRef.current !== configKey) {
      prevConfigRef.current = configKey;
      adjustmentAppliedRef.current = false;
      extraMarginsRef.current = { left: 0, right: 0, top: 0, bottom: 0 };
    }

    // Get current theme colors for enabled areas only
    const getCurrentColors = () => {
      const theme = isDarkMode ? 'dark' : 'light';
      const result: Record<string, string> = {};
      const enabledAreas = yAxisKeys.filter(key => !disabledLines.includes(key));
      enabledAreas.forEach((key, index) => {
        const colorKey = colors[key] ? key : `area${index + 1}`;
        result[key] = colors[colorKey]?.[theme] || defaultColorsChart[`color${index + 1}`][theme];
      });
      return result;
    };

    const currentColors = getCurrentColors();

    // Theme-aware colors
    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const gridColor = isDarkMode ? '#4b5563' : '#9ca3af';
    const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';
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

    // Responsive margin adjustments
    const baseResponsiveMargin = {
      top: currentWidth < MOBILE_BREAKPOINT ? margin.top * MOBILE_MARGIN_TOP_FACTOR : margin.top,
      right:
        currentWidth < MOBILE_BREAKPOINT ? margin.right * MOBILE_MARGIN_RIGHT_FACTOR : margin.right,
      bottom:
        currentWidth < MOBILE_BREAKPOINT
          ? margin.bottom * MOBILE_MARGIN_BOTTOM_FACTOR
          : margin.bottom,
      left:
        currentWidth < MOBILE_BREAKPOINT ? margin.left * MOBILE_MARGIN_LEFT_FACTOR : margin.left,
    };

    // (Removed left-bias cap) Keep base responsive margins symmetric so
    // any automatic extra padding can be distributed evenly to center the plot.

    const responsiveMargin = {
      top: baseResponsiveMargin.top + (extraMarginsRef.current.top || 0),
      right: baseResponsiveMargin.right + (extraMarginsRef.current.right || 0),
      bottom: baseResponsiveMargin.bottom + (extraMarginsRef.current.bottom || 0),
      left: baseResponsiveMargin.left + (extraMarginsRef.current.left || 0),
    };

    // Reserve space for legend when positioned top/bottom to avoid overlap (match LineChart behavior)
    if (showLegend && (legendPosition === 'top' || legendPosition === 'bottom')) {
      const isMobile = currentWidth < MOBILE_BREAKPOINT;
      const isTablet = currentWidth < TABLET_BREAKPOINT;
      const itemHeight = isMobile ? 18 : 20;
      const padding = isMobile ? 8 : 10;
      const legendBlock = itemHeight + padding * 2;
      const xLabelSpacing =
        xAxisLabel && showAxisLabels ? (isMobile ? 30 : isTablet ? 35 : 40) : isMobile ? 15 : 20;

      if (legendPosition === 'top') {
        // extra space for legend + small gap
        responsiveMargin.top += legendBlock + 10;
      } else {
        // ensure enough bottom margin for legend and x-axis label
        const minBottom = isMobile ? 100 : 110;
        responsiveMargin.bottom = Math.max(margin.bottom * 2.0, minBottom) + xLabelSpacing;
      }
    }

    // Set dimensions
    const innerWidth = currentWidth - responsiveMargin.left - responsiveMargin.right;
    const innerHeight = currentHeight - responsiveMargin.top - responsiveMargin.bottom;

    // Add background (skip in preview variant)
    if (variant !== 'preview') {
      svg
        .append('rect')
        .attr('width', currentWidth)
        .attr('height', currentHeight)
        .attr('fill', chartBackgroundColor)
        .attr('rx', 8);
    }

    // Removed Y-axis background overlay - it created unwanted visual effect

    // Create main group and center the plotting area horizontally by computing
    // the left translate such that the inner plotting area is centered inside
    // the overall SVG width. This is more accurate than averaging margins.
    const centeredLeft = Math.max(8, Math.floor((currentWidth - innerWidth) / 2));
    const g = svg
      .append('g')
      .attr('transform', `translate(${centeredLeft},${responsiveMargin.top})`);

    // Scales
    // Detect whether X values are numeric or categorical. If categorical (e.g. "Platform"),
    // use a point scale so positions are generated for each category instead of numeric values.
    const rawXValues = data.map(d => d[xAxisKey]);
    const xAreNumbers = rawXValues.every(
      v => typeof v === 'number' || (!isNaN(Number(v)) && v !== null && v !== '')
    );

    let xScale: any;
    if (xAreNumbers) {
      xScale = d3
        .scaleLinear()
        .domain(d3.extent(data, d => Number(d[xAxisKey])) as [number, number])
        .range([0, innerWidth]);
    } else {
      const categories = Array.from(new Set(rawXValues.map(v => String(v))));
      xScale = d3.scalePoint().domain(categories).range([0, innerWidth]).padding(0.5);
    }

    let yScale: d3.ScaleLinear<number, number>;

    if (stackedMode) {
      // For stacked areas, filter out disabled areas
      const enabledKeys = yAxisKeys.filter(key => !disabledLines.includes(key));

      const stack = d3
        .stack<ChartDataPoint>()
        .keys(enabledKeys)
        .value((d, key) => d[key] as number);

      const stackedData = stack(data);
      const maxStackedValue = d3.max(stackedData, layer => d3.max(layer, d => d[1])) || 0;

      yScale = d3.scaleLinear().domain([0, maxStackedValue]).nice().range([innerHeight, 0]);

      // Create stacked areas
      stackedData.forEach((layer, index) => {
        const key = layer.key;

        // Area generator for stacked data
        const area = d3
          .area<d3.SeriesPoint<ChartDataPoint>>()
          .x((_d, i) => xScale(xAreNumbers ? Number(data[i][xAxisKey]) : String(data[i][xAxisKey])))
          .y0(d => yScale(d[0]))
          .y1(d => yScale(d[1]))
          .curve(curve);

        // Create area path
        const areaPath = g
          .append('path')
          .datum(layer)
          .attr('fill', currentColors[key])
          .attr('stroke', 'none')
          .attr('fill-opacity', 0)
          .attr('d', area)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))');

        // Add stroke if enabled
        if (showStroke) {
          const line = d3
            .line<d3.SeriesPoint<ChartDataPoint>>()
            .x((_d, i) =>
              xScale(xAreNumbers ? Number(data[i][xAxisKey]) : String(data[i][xAxisKey]))
            )
            .y(d => yScale(d[1]))
            .curve(curve);

          g.append('path')
            .datum(layer)
            .attr('fill', 'none')
            .attr('stroke', currentColors[key])
            .attr('stroke-width', 2)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('opacity', 0)
            .attr('d', line)
            .transition()
            .delay(animationDuration + index * 200)
            .duration(500)
            .attr('opacity', 1);
        }

        // Animate area
        areaPath
          .transition()
          .delay(index * 200)
          .duration(animationDuration)
          .ease(d3.easeQuadInOut)
          .attr('fill-opacity', opacity);
      });
    } else {
      // For overlapping areas
      const enabledAreas = yAxisKeys.filter(key => !disabledLines.includes(key));

      // Filter and validate Y values - exclude null, undefined, NaN
      const allYValues = data.flatMap(d =>
        enabledAreas.map(key => d[key] as number).filter(val => val != null && !isNaN(val))
      );

      // Ensure domain includes 0 for proper baseline
      const maxValue = d3.max(allYValues) || 0;
      const minValue = d3.min(allYValues) || 0;

      // Always include 0 in domain for area charts to have proper baseline
      const domainMin = Math.min(0, minValue);
      const domainMax = Math.max(0, maxValue);

      yScale = d3.scaleLinear().domain([domainMin, domainMax]).nice().range([innerHeight, 0]);

      // Get the actual baseline Y position (might not be exactly yScale(0) after .nice())
      const baselineY = yScale(Math.max(domainMin, Math.min(0, domainMax)));

      // Create overlapping areas for enabled areas only
      enabledAreas.forEach((key, index) => {
        // Filter out data points with invalid values for this series
        const validData = data.filter(d => {
          const val = d[key];
          return val != null && !isNaN(Number(val));
        });

        // Skip if no valid data points
        if (validData.length === 0) return;

        // Area generator with proper baseline
        const area = d3
          .area<ChartDataPoint>()
          .x(d => xScale(xAreNumbers ? Number(d[xAxisKey]) : String(d[xAxisKey])))
          .y0(baselineY) // Use calculated baseline instead of yScale(0)
          .y1(d => yScale(d[key] as number))
          .curve(curve)
          .defined(d => {
            const val = d[key];
            return val != null && !isNaN(Number(val));
          });

        // Create area path using all data (defined() will handle gaps)
        const areaPath = g
          .append('path')
          .datum(data)
          .attr('fill', currentColors[key])
          .attr('stroke', 'none')
          .attr('fill-opacity', 0)
          .attr('d', area)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))');

        // Add stroke line if enabled
        if (showStroke) {
          const line = d3
            .line<ChartDataPoint>()
            .x(d => xScale(xAreNumbers ? Number(d[xAxisKey]) : String(d[xAxisKey])))
            .y(d => yScale(d[key] as number))
            .curve(curve)
            .defined(d => {
              const val = d[key];
              return val != null && !isNaN(Number(val));
            });

          const strokePath = g
            .append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', currentColors[key])
            .attr('stroke-width', currentWidth < 768 ? 2 : 3)
            .attr('stroke-linecap', 'round')
            .attr('stroke-linejoin', 'round')
            .attr('d', line)
            .style('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))')
            .style('opacity', 0);

          // Animate stroke
          const totalLength = strokePath.node()?.getTotalLength() || 0;

          strokePath
            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .style('opacity', 1)
            .transition()
            .delay(animationDuration + index * 200)
            .duration(animationDuration)
            .ease(d3.easeQuadInOut)
            .attr('stroke-dashoffset', 0)
            .on('end', () => {
              strokePath.attr('stroke-dasharray', 'none');
            });
        }

        // Animate area
        areaPath
          .transition()
          .delay(index * 200)
          .duration(animationDuration)
          .ease(d3.easeQuadInOut)
          .attr('fill-opacity', opacity);

        // Add data points if enabled
        if (showPoints) {
          g.selectAll(`.point-${index}`)
            .data(validData) // Use validData instead of data
            .enter()
            .append('circle')
            .attr('class', `point-${index}`)
            .attr('cx', d => xScale(xAreNumbers ? Number(d[xAxisKey]) : String(d[xAxisKey])))
            .attr('cy', d => yScale(d[key] as number))
            .attr('r', 0)
            .attr('fill', currentColors[key])
            .attr('stroke', chartBackgroundColor)
            .attr('stroke-width', 2)
            .style('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))')
            .on('mouseover', function (event, d) {
              if (!showTooltip) return;

              d3.select(this)
                .transition()
                .duration(200)
                .attr('r', currentWidth < MOBILE_BREAKPOINT ? 5 : 6)
                .attr('stroke-width', 3);

              // Calculate statistics for detailed tooltip (filter null values)
              const value = d[key] as number;
              const allValues = data
                .map(item => item[key] as number)
                .filter(val => val != null && !isNaN(val));
              const total = d3.sum(allValues);
              const average = d3.mean(allValues) || 0;
              const percentage = total > 0 ? (value / total) * 100 : 0;

              // Calculate ranking
              const sortedValues = [...allValues].sort((a, b) => b - a);
              const rank = sortedValues.indexOf(value) + 1;

              // Determine comparison text
              const diffFromAvg = value - average;
              const diffPercentage = average > 0 ? (diffFromAvg / average) * 100 : 0;
              const comparisonText =
                diffFromAvg > 0
                  ? `+${diffPercentage.toFixed(1)}% above average`
                  : `${diffPercentage.toFixed(1)}% below average`;

              // Build tooltip content lines
              const tooltipLines = [
                createHeader(key, { color: currentColors[key] }),
                createSeparator(),
                createStatLine('Value', yAxisFormatter ? yAxisFormatter(value) : String(value), {
                  prefix: '📊 ',
                }),
                createPercentLine('Percentage', percentage),
                createStatLine(
                  'Average',
                  yAxisFormatter ? yAxisFormatter(average) : String(average),
                  { prefix: '〰️ ' }
                ),
                createStatLine('Comparison', comparisonText, {
                  prefix: diffFromAvg >= 0 ? '📈 ' : '📉 ',
                }),
                createRankLine(rank, data.length),
              ];

              // Get mouse position relative to the chart
              const [mouseX, mouseY] = d3.pointer(event, g.node());

              // Reuse existing tooltip group or create if doesn't exist
              let tooltipGroup = g.select('.tooltip') as d3.Selection<
                SVGGElement,
                unknown,
                null,
                undefined
              >;
              if (tooltipGroup.empty()) {
                tooltipGroup = g.append('g').attr('class', 'tooltip').style('opacity', 0);
              }

              // Store tooltip config for mousemove updates
              const tooltipConfig = {
                lines: tooltipLines,
                isDarkMode,
                textColor,
                strokeColor: currentColors[key],
                position: { x: mouseX, y: mouseY },
                containerWidth: innerWidth,
                containerHeight: innerHeight,
                preferPosition: 'auto' as const,
              };

              // Store config on the element for mousemove
              (tooltipGroup.node() as any).__tooltipConfig = tooltipConfig;

              // Render enhanced tooltip (this updates content)
              renderD3Tooltip(tooltipGroup, tooltipConfig);

              // Only fade in if tooltip was just created (opacity is 0)
              // Don't fade in on every mouseover to avoid flickering
              const currentOpacity = parseFloat(tooltipGroup.style('opacity') || '0');
              if (currentOpacity === 0) {
                tooltipGroup.transition().duration(200).style('opacity', 1);
              }
            })
            .on('mousemove', function (event) {
              if (!showTooltip) return;

              // Update tooltip position on mouse move
              const [mouseX, mouseY] = d3.pointer(event, g.node());

              const tooltipGroup = g.select('.tooltip') as d3.Selection<
                SVGGElement,
                unknown,
                null,
                undefined
              >;

              if (!tooltipGroup.empty()) {
                // Get stored config and update position
                const tooltipConfig = (tooltipGroup.node() as any).__tooltipConfig;
                if (tooltipConfig) {
                  tooltipConfig.position = { x: mouseX, y: mouseY };
                  renderD3Tooltip(tooltipGroup, tooltipConfig);
                }
              }
            })
            .on('mouseout', function () {
              d3.select(this).transition().duration(200).attr('r', 4).attr('stroke-width', 2);

              // Smooth fade out instead of immediate remove
              g.select('.tooltip').transition().duration(150).style('opacity', 0);
            })
            .transition()
            .delay(animationDuration * 2 + index * 100)
            .duration(300)
            .ease(d3.easeBackOut)
            .attr('r', 4);
        }
      });
    }

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
        .attr('opacity', gridOpacity);

      // Vertical grid lines
      g.selectAll('.grid-line-vertical')
        .data(xAreNumbers ? xScale.ticks() : (xScale.domain() as any[]))
        .enter()
        .append('line')
        .attr('class', 'grid-line-vertical')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', gridOpacity * 0.7);
    }

    // Add interactive overlay for hover tooltips (even without points)
    if (showTooltip && !showPoints) {
      const enabledAreas = yAxisKeys.filter(key => !disabledLines.includes(key));

      // Create invisible overlay rectangles for each data point area
      enabledAreas.forEach(key => {
        const pointWidth = innerWidth / data.length;

        g.selectAll(`.hover-area-${key}`)
          .data(data)
          .enter()
          .append('rect')
          .attr('class', `hover-area-${key}`)
          .attr('x', d => {
            const xPos = xScale(xAreNumbers ? Number(d[xAxisKey]) : String(d[xAxisKey]));
            return xPos - pointWidth / 2;
          })
          .attr('y', 0)
          .attr('width', pointWidth)
          .attr('height', innerHeight)
          .attr('fill', 'transparent')
          .attr('pointer-events', 'all')
          .style('cursor', 'crosshair')
          .on('mouseover', function (event, d) {
            // Check if this data point has valid value
            const value = d[key] as number;
            if (value == null || isNaN(value)) return; // Skip invalid data points

            // Removed opacity change on hover to respect user's transparency setting
            // Area maintains the configured opacity value

            // Calculate statistics for detailed tooltip (filter null values)
            const allValues = data
              .map(item => item[key] as number)
              .filter(val => val != null && !isNaN(val));
            const total = d3.sum(allValues);
            const average = d3.mean(allValues) || 0;
            const percentage = total > 0 ? (value / total) * 100 : 0;

            // Calculate ranking
            const sortedValues = [...allValues].sort((a, b) => b - a);
            const rank = sortedValues.indexOf(value) + 1;

            // Determine comparison text
            const diffFromAvg = value - average;
            const diffPercentage = average > 0 ? (diffFromAvg / average) * 100 : 0;
            const comparisonText =
              diffFromAvg > 0
                ? `+${diffPercentage.toFixed(1)}% above average`
                : `${diffPercentage.toFixed(1)}% below average`;

            // Build tooltip content lines
            const tooltipLines = [
              createHeader(key, { color: currentColors[key] }),
              createSeparator(),
              createStatLine('Value', yAxisFormatter ? yAxisFormatter(value) : String(value), {
                prefix: '📊 ',
              }),
              createPercentLine('Percentage', percentage),
              createStatLine(
                'Average',
                yAxisFormatter ? yAxisFormatter(average) : String(average),
                { prefix: '〰️ ' }
              ),
              createStatLine('Comparison', comparisonText, {
                prefix: diffFromAvg >= 0 ? '📈 ' : '📉 ',
              }),
              createRankLine(rank, data.length),
            ];

            // Get mouse position relative to the chart
            const [mouseX, mouseY] = d3.pointer(event, g.node());

            // Reuse existing tooltip group or create if doesn't exist
            let tooltipGroup = g.select('.tooltip') as d3.Selection<
              SVGGElement,
              unknown,
              null,
              undefined
            >;
            if (tooltipGroup.empty()) {
              tooltipGroup = g.append('g').attr('class', 'tooltip').style('opacity', 0);
            }

            // Store tooltip config for mousemove updates
            const tooltipConfig = {
              lines: tooltipLines,
              isDarkMode,
              textColor,
              strokeColor: currentColors[key],
              position: { x: mouseX, y: mouseY },
              containerWidth: innerWidth,
              containerHeight: innerHeight,
              preferPosition: 'auto' as const,
            };

            // Store config on the element for mousemove
            (tooltipGroup.node() as any).__tooltipConfig = tooltipConfig;

            // Render enhanced tooltip (this updates content)
            renderD3Tooltip(tooltipGroup, tooltipConfig);

            // Only fade in if tooltip was just created (opacity is 0)
            // Don't fade in on every mouseover to avoid flickering
            const currentOpacity = parseFloat(tooltipGroup.style('opacity') || '0');
            if (currentOpacity === 0) {
              tooltipGroup.transition().duration(200).style('opacity', 1);
            }
          })
          .on('mousemove', function (event) {
            // Update tooltip position on mouse move
            const [mouseX, mouseY] = d3.pointer(event, g.node());

            const tooltipGroup = g.select('.tooltip') as d3.Selection<
              SVGGElement,
              unknown,
              null,
              undefined
            >;

            if (!tooltipGroup.empty()) {
              // Get stored config and update position
              const tooltipConfig = (tooltipGroup.node() as any).__tooltipConfig;
              if (tooltipConfig) {
                tooltipConfig.position = { x: mouseX, y: mouseY };
                renderD3Tooltip(tooltipGroup, tooltipConfig);
              }
            }
          })
          .on('mouseout', function () {
            // No need to reset opacity since we don't change it on hover anymore

            // Smooth fade out tooltip
            g.select('.tooltip').transition().duration(150).style('opacity', 0);
          });
      });
    }

    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d: any) => {
        // Apply formatter if provided
        if (xAxisFormatter) {
          return xAxisFormatter(d); // Apply formatter to all types (number, string, date)
        }
        // Fallback formatting when no formatter is set
        if (xAreNumbers) return d3.format('d')(Number(d));
        return String(d);
      })
      .tickSizeInner(showAxisTicks ? 6 : 0)
      .tickSizeOuter(showAxisTicks ? 6 : 0);

    const xAxisGroup = g
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${fontSize.axis}px`)
      .style('font-weight', '500')
      .attr('transform', `rotate(${xAxisRotation})`)
      .style('text-anchor', xAxisRotation === 0 ? 'middle' : xAxisRotation > 0 ? 'start' : 'end');

    xAxisGroup.select('.domain').attr('stroke', axisColor).attr('stroke-width', 2);

    if (showAxisTicks) {
      xAxisGroup.selectAll('.tick line').attr('stroke', axisColor);
    }

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat(d => {
        const value = d.valueOf();
        if (yAxisFormatter) {
          return yAxisFormatter(value);
        }
        return String(value);
      })
      .tickSizeInner(showAxisTicks ? -5 : 0)
      .tickSizeOuter(showAxisTicks ? 6 : 0)
      .tickPadding(8);

    const yAxisGroup = g.append('g').attr('class', 'y-axis').call(yAxis);

    yAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${fontSize.axis}px`)
      .style('font-weight', '600')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .attr('text-anchor', 'end')
      .attr('x', -10)
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
    }

    // Auto-detect tick label overflow (post-axis render) and nudge the main group
    // so tick labels aren't clipped. Measure axis text bboxes and apply a one-time
    // transform adjustment to the main group `g` if needed.
    try {
      let extraShiftX = 0;
      let extraShiftY = 0;
      let extraShiftRight = 0;

      const xAxisNode = g.select('.x-axis').node() as SVGGElement | null;
      const yAxisNode = g.select('.y-axis').node() as SVGGElement | null;

      if (xAxisNode) {
        const texts = Array.from(xAxisNode.querySelectorAll('text')) as SVGGraphicsElement[];
        let maxBottom = -Infinity;
        texts.forEach(t => {
          try {
            const bb = t.getBBox();
            const textBottom = bb.y + bb.height;
            if (textBottom > maxBottom) maxBottom = textBottom;
            if (bb.x < 0) {
              extraShiftX = Math.max(extraShiftX, Math.ceil(Math.abs(bb.x)) + 6);
            }
            // detect right overflow
            if (bb.x + bb.width > innerWidth) {
              extraShiftRight = Math.max(
                extraShiftRight,
                Math.ceil(bb.x + bb.width - innerWidth) + 6
              );
            }
          } catch (e) {
            /* ignore individual text bbox errors */
          }
        });
        if (maxBottom > innerHeight) {
          extraShiftY = Math.max(extraShiftY, Math.ceil(maxBottom - innerHeight) + 6);
        }
      }

      if (yAxisNode) {
        const ytexts = Array.from(yAxisNode.querySelectorAll('text')) as SVGGraphicsElement[];
        ytexts.forEach(t => {
          try {
            const bb = t.getBBox();
            if (bb.x < 0) {
              extraShiftX = Math.max(extraShiftX, Math.ceil(Math.abs(bb.x)) + 6);
            }
            if (bb.x + bb.width > innerWidth) {
              extraShiftRight = Math.max(
                extraShiftRight,
                Math.ceil(bb.x + bb.width - innerWidth) + 6
              );
            }
          } catch (e) {
            /* ignore */
          }
        });
      }

      if (extraShiftX !== 0 || extraShiftY !== 0 || extraShiftRight !== 0) {
        // Combine left/right overflow and distribute evenly so the plotting
        // area remains centered. Cap the total extra padding to a reasonable
        // value relative to width to avoid huge shifts.
        const totalRequested = extraShiftX + extraShiftRight;
        const totalCap = Math.max(40, Math.floor(currentWidth * 0.12));
        const totalExtra = Math.min(totalRequested, totalCap);

        // Split evenly (left/right). If odd, right gets the remainder.
        const leftShare = Math.floor(totalExtra / 2);
        const rightShare = totalExtra - leftShare;

        const cappedBottom = Math.min(extraShiftY, Math.max(20, Math.floor(currentHeight * 0.08)));

        if (!adjustmentAppliedRef.current) {
          // Apply symmetric extra margins and re-run the effect so axes/layout
          // are re-calculated with the new margins.
          extraMarginsRef.current.left = leftShare;
          extraMarginsRef.current.right = rightShare;
          extraMarginsRef.current.bottom = cappedBottom;
          adjustmentAppliedRef.current = true;
          setPaddingVersion(v => v + 1);
          return; // abort this render — next run will include new margins
        }

        // Fallback: we've already tried applying symmetric margins but still
        // have a remaining overflow — nudge the main group while preserving
        // exact centering as much as possible.
        const finalTranslateX = Math.max(8, Math.floor((currentWidth - innerWidth) / 2));
        g.attr('transform', `translate(${finalTranslateX},${responsiveMargin.top})`);
      }
    } catch (e) {
      // measurement failed (e.g., SSR) — ignore gracefully
    }

    // Add axis labels
    if (xAxisLabel && showAxisLabels) {
      // Position X-axis label considering legend position
      const xLabelYPosition =
        legendPosition === 'bottom'
          ? innerHeight + (currentWidth < 768 ? 30 : 35) // Closer to axis when legend below
          : innerHeight + (currentWidth < 768 ? 40 : 50); // Normal position otherwise

      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', xLabelYPosition)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${fontSize.label}px`)
        .style('font-weight', '600')
        .text(xAxisLabel);
    }

    if (yAxisLabel && showAxisLabels) {
      g.append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -innerHeight / 2)
        .attr('y', currentWidth < 768 ? -55 : -65)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${fontSize.label}px`)
        .style('font-weight', '600')
        .text(yAxisLabel);
    }

    // Add responsive legend directly in SVG (match D3LineChart)
    if (showLegend) {
      const enabledAreas = yAxisKeys.filter(key => !disabledLines.includes(key));
      const isMobile = currentWidth < 640;
      const isTablet = currentWidth < 1024;
      const legendItemHeight = isMobile ? 20 : isTablet ? 22 : 25;
      const legendItems = enabledAreas;

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

        // Build items inside legendContents and support up to 2 rows if needed
        const localIconSize = isMobile ? 12 : isTablet ? 13 : 14;
        const padX = isMobile ? 12 : 16;
        const padY = isMobile ? 8 : 10;
        const availableContentWidth = legendWidth - padX * 2;

        // Precompute display labels with increased character limits to show more text
        const itemsMeta = legendItems.map(key => {
          const label = key;
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
            const colorKey = colors[key] ? key : `area${idx + 1}`;
            const color =
              colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] ||
              Object.values(colors)[idx % Object.keys(colors).length]?.[
                isDarkMode ? 'dark' : 'light'
              ] ||
              '#3b82f6';
            const { displayLabel } = itemsMeta[idx];
            const legendItem = legendContents
              .append('g')
              .attr('class', `legend-item-${idx}`)
              .style('cursor', 'pointer')
              .attr('transform', `translate(${currentX}, 0)`);

            // Color indicator
            legendItem
              .append('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', localIconSize)
              .attr('height', localIconSize)
              .attr('rx', 3)
              .attr('fill', color)
              .style('filter', `drop-shadow(0 2px 4px ${color}40)`);

            // Label
            legendItem
              .append('text')
              .attr('x', localIconSize + (isMobile ? 6 : 8))
              .attr('y', localIconSize / 2)
              .attr('dy', '0.35em')
              .attr('fill', textColor)
              .style('font-size', `${legendFontSize}px`)
              .style('font-weight', '600')
              .text(displayLabel);

            currentX += itemContainerW;
          });
        } else {
          // Two-row layout using uniform item container width for consistent columns
          const firstRowCount = Math.ceil(legendItems.length / 2);
          const rowY = localIconSize + padY;

          // First row
          let x0 = 0;
          for (let i = 0; i < firstRowCount; i++) {
            const key = legendItems[i];
            const colorKey = colors[key] ? key : `area${i + 1}`;
            const color =
              colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] ||
              Object.values(colors)[i % Object.keys(colors).length]?.[
                isDarkMode ? 'dark' : 'light'
              ] ||
              '#3b82f6';
            const { displayLabel } = itemsMeta[i];
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
              .attr('fill', color)
              .style('filter', `drop-shadow(0 2px 4px ${color}40)`);
            legendItem
              .append('text')
              .attr('x', localIconSize + (isMobile ? 6 : 8))
              .attr('y', localIconSize / 2)
              .attr('dy', '0.35em')
              .attr('fill', textColor)
              .style('font-size', `${legendFontSize}px`)
              .style('font-weight', '600')
              .text(displayLabel);
            x0 += itemContainerW;
          }
          // Second row
          let x1 = 0;
          for (let j = firstRowCount; j < legendItems.length; j++) {
            const key = legendItems[j];
            const colorKey = colors[key] ? key : `area${j + 1}`;
            const color =
              colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] ||
              Object.values(colors)[j % Object.keys(colors).length]?.[
                isDarkMode ? 'dark' : 'light'
              ] ||
              '#3b82f6';
            const { displayLabel } = itemsMeta[j];
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
              .attr('fill', color)
              .style('filter', `drop-shadow(0 2px 4px ${color}40)`);
            legendItem
              .append('text')
              .attr('x', localIconSize + (isMobile ? 6 : 8))
              .attr('y', localIconSize / 2)
              .attr('dy', '0.35em')
              .attr('fill', textColor)
              .style('font-size', `${legendFontSize}px`)
              .style('font-weight', '600')
              .text(displayLabel);
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
          const colorKey = colors[key] ? key : `area${i + 1}`;
          const color =
            colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] ||
            Object.values(colors)[i % Object.keys(colors).length]?.[
              isDarkMode ? 'dark' : 'light'
            ] ||
            '#3b82f6';
          const displayLabel =
            key.length > (isMobile ? 10 : isTablet ? 12 : 15)
              ? key.substring(0, isMobile ? 10 : isTablet ? 12 : 15) + '...'
              : key;

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
            .attr('fill', color)
            .style('filter', `drop-shadow(0 2px 4px ${color}40)`);

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

    // Enhanced zoom and pan with mouse interactions (similar to BarChart)
    // Use shouldEnablePan to auto-enable when chart is expanded
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

        // Handle mouse leave to stop dragging
        svg.on('mouseleave', function () {
          if (isDragging) {
            isDragging = false;
            svg.style('cursor', 'default');
          }
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
  }, [
    data,
    margin,
    xAxisKey,
    yAxisKeys,
    disabledLines,
    colors,
    showLegend,
    showGrid,
    showPoints,
    showStroke,
    animationDuration,
    curve,
    title,
    xAxisLabel,
    yAxisLabel,
    isDarkMode,
    dimensions,
    yAxisFormatter,
    xAxisFormatter,
    fontSize,
    opacity,
    stackedMode,
    lineWidth,
    pointRadius,
    gridOpacity,
    legendPosition,
    xAxisRotation,
    yAxisRotation,
    showAxisLabels,
    showAxisTicks,
    enableZoom,
    enablePan,
    zoomExtent,
    showTooltip,
    theme,
    backgroundColor,
    titleFontSize,
    labelFontSize,
    legendFontSize,
    showPointValues,
    paddingVersion,
    variant,
  ]);

  return (
    <div ref={containerRef} className="w-full">
      {title && (
        <h3
          className="font-bold text-gray-900 dark:text-white text-center mb-4"
          style={{ fontSize: `${fontSize.title}px` }}
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
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
};

export default D3AreaChart;
