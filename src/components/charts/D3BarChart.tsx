import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { defaultColorsChart } from '@/utils/Utils';

function convertArrayToChartData(arrayData: (string | number)[][]): ChartDataPoint[] {
  if (!arrayData || arrayData.length === 0) return [];

  const headers = arrayData[0];
  const dataRows = arrayData.slice(1);

  return dataRows.map(row => {
    const dataPoint: ChartDataPoint = {};
    headers.forEach((header, index) => {
      const value = row[index];

      if (index === 0) {
        // First column is typically the X-axis (categories)
        dataPoint[String(header)] = String(value);
      } else {
        // Other columns are numeric values
        dataPoint[String(header)] =
          typeof value === 'number' ? value : parseFloat(String(value)) || 0;
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
  // Individual series configurations (similar to LineChart axisConfigs)
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
  barType?: 'grouped' | 'stacked';
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
  xAxisStart = 'auto', // X-axis start option (match LineChart)
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
  barSpacing = 4,

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
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width, height });

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
        .style('opacity', 0)
        .remove();
      currentTooltipRef.current = null;
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
  }, [width, height, showLegend, legendPosition, showAxisLabels, xAxisLabel]);

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

  // Note: Suppress unused variable warning for xAxisStart (maintained for LineChart interface consistency)
  void xAxisStart;

  useEffect(() => {
    if (!svgRef.current || !processedData.length) return;

    const currentWidth = dimensions.width;
    const currentHeight = dimensions.height;

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

    const responsiveMargin = {
      top: currentWidth < 640 ? margin.top * 0.8 : margin.top,
      right: currentWidth < 640 ? margin.right * 0.7 : margin.right,
      bottom: currentWidth < 640 ? margin.bottom * 0.8 : margin.bottom,
      left: currentWidth < 640 ? margin.left * 0.8 : margin.left,
    };

    const innerWidth = currentWidth - responsiveMargin.left - responsiveMargin.right;
    const innerHeight = currentHeight - responsiveMargin.top - responsiveMargin.bottom;

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
      .attr('transform', `translate(${responsiveMargin.left},${responsiveMargin.top})`);

    // Scales
    // Note: xAxisStart doesn't apply to categorical X-axis (scaleBand) - it's maintained for interface consistency with LineChart
    const xScale = d3
      .scaleBand()
      .domain(processedData.map(d => String(d[xAxisKey])))
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
      if (typeof barSpacing !== 'number') return 0.05; // Reduce default padding for thicker bars
      if (barSpacing <= 1) return Math.max(0, Math.min(0.3, barSpacing)); // Cap at 30% instead of 50%
      const bw = xScale.bandwidth();
      if (bw <= 0) return 0.05;
      return Math.max(0, Math.min(0.3, barSpacing / bw)); // Cap at 30% instead of 50%
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

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d => {
      if (xAxisFormatter) return xAxisFormatter(Number(d));
      // Use xAxisNames to map ID to display name, fallback to original value
      const displayName = xAxisNames[String(d)] || String(d);
      return displayName;
    });
    const xAxisGroup = g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);
    xAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${responsiveFontSize.axis}px`)
      .style('font-weight', '500')
      .attr('transform', `rotate(${xAxisRotation})`)
      .style('text-anchor', xAxisRotation === 0 ? 'middle' : xAxisRotation > 0 ? 'start' : 'end');
    xAxisGroup.select('.domain').attr('stroke', axisColor).attr('stroke-width', 2);
    if (showAxisTicks) xAxisGroup.selectAll('.tick line').attr('stroke', axisColor);
    else xAxisGroup.selectAll('.tick line').attr('opacity', 0);

    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat(d => {
        const value = d.valueOf();
        if (yAxisFormatter) return yAxisFormatter(value);
        return value.toLocaleString();
      })
      .tickSize(showAxisTicks ? -5 : 0)
      .tickPadding(8);
    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${responsiveFontSize.axis}px`)
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
          .attr('x', d => {
            const base = (xScale(String(d[xAxisKey])) || 0) + (xSubScale(key) || 0);
            const subBW = xSubScale.bandwidth();
            // Use series-specific barWidth if available
            let bw = subBW;
            if (typeof seriesBarWidth === 'number') {
              if (seriesBarWidth <= 0) bw = subBW;
              else if (seriesBarWidth > 0 && seriesBarWidth <= 1) bw = subBW * seriesBarWidth;
              else bw = Math.min(seriesBarWidth, subBW);
            }
            return base + (subBW - bw) / 2;
          })
          .attr('y', innerHeight)
          .attr('width', () => {
            const subBW = xSubScale.bandwidth();
            if (typeof seriesBarWidth !== 'number' || seriesBarWidth <= 0) return subBW;
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
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))')
              .attr('opacity', 0.8);

            const tooltip = g
              .append('g')
              .attr('class', 'tooltip')
              .attr(
                'transform',
                `translate(${(xScale(String(d[xAxisKey])) || 0) + (xSubScale(key) || 0) + xSubScale.bandwidth() / 2}, ${yScale(d[key] as number) - 15})`
              );
            tooltip
              .append('rect')
              .attr('x', -40)
              .attr('y', -35)
              .attr('width', 80)
              .attr('height', 30)
              .attr('fill', isDarkMode ? '#1f2937' : '#ffffff')
              .attr('stroke', currentColors[key])
              .attr('stroke-width', 2)
              .attr('rx', 6)
              .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
              .style('opacity', 0)
              .transition()
              .duration(200)
              .style('opacity', 0.95);
            const value =
              typeof d[key] === 'number' ? (d[key] as number).toLocaleString() : (d[key] as string);
            // Get display name for X-axis value
            const xDisplayName = xAxisNames[String(d[xAxisKey])] || String(d[xAxisKey]);
            const seriesDisplayName = seriesNames[key] || key;

            tooltip
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('y', -20)
              .attr('fill', textColor)
              .style('font-size', `${responsiveFontSize.axis - 1}px`)
              .style('font-weight', '600')
              .style('opacity', 0)
              .text(`${xDisplayName}`)
              .transition()
              .duration(200)
              .style('opacity', 1);

            tooltip
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('y', -8)
              .attr('fill', textColor)
              .style('font-size', `${responsiveFontSize.axis}px`)
              .style('font-weight', '700')
              .style('opacity', 0)
              .text(`${seriesDisplayName}: ${value}`)
              .transition()
              .duration(200)
              .style('opacity', 1);
          })
          .on('mouseout', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
              .attr('opacity', 1);
            g.select('.tooltip').transition().duration(100).style('opacity', 0).remove();
          })
          .transition()
          .delay(keyIndex * 100)
          .duration(animationDuration)
          .ease(d3.easeBackOut)
          .attr('y', d => yScale(d[key] as number))
          .attr('height', d => innerHeight - yScale(d[key] as number));

        // Add bar values if showPointValues is enabled (matching LineChart behavior)
        if (showPointValues) {
          g.selectAll(`.bar-value-${keyIndex}`)
            .data(processedData)
            .enter()
            .append('text')
            .attr('class', `bar-value-${keyIndex}`)
            .attr('x', d => {
              const base = (xScale(String(d[xAxisKey])) || 0) + (xSubScale(key) || 0);
              return base + xSubScale.bandwidth() / 2;
            })
            .attr('y', d => {
              return yScale(d[key] as number) - 8; // Position above the bar
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
              return yValue.toLocaleString();
            })
            .transition()
            .delay(keyIndex * 100 + animationDuration)
            .duration(300)
            .ease(d3.easeBackOut)
            .style('opacity', 1);
        }
      });
    } else {
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
          .attr('x', d => xScale(String(d.data[xAxisKey])) || 0)
          .attr('y', innerHeight)
          .attr('width', xScale.bandwidth())
          .attr('height', 0)
          .attr('fill', currentColors[yAxisKeys[seriesIndex]])
          .attr('rx', seriesIndex === 0 ? 4 : 0)
          .attr('ry', seriesIndex === 0 ? 4 : 0)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
          .on('mouseover', function (_event, d) {
            if (!showTooltip) return;
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))')
              .attr('opacity', 0.8);
            const value = d[1] - d[0];
            const tooltip = g
              .append('g')
              .attr('class', 'tooltip')
              .attr(
                'transform',
                `translate(${(xScale(String(d.data[xAxisKey])) || 0) + xScale.bandwidth() / 2}, ${yScale(d[1]) - 10})`
              );
            const tooltipBg = tooltip
              .append('rect')
              .attr('x', -25)
              .attr('y', -20)
              .attr('width', 50)
              .attr('height', 16)
              .attr('fill', isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)')
              .attr('stroke', currentColors[yAxisKeys[seriesIndex]])
              .attr('stroke-width', 1)
              .attr('rx', 3)
              .style('filter', 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2))')
              .style('opacity', 0);
            tooltip
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('y', -8)
              .attr('fill', textColor)
              .style('font-size', '11px')
              .style('font-weight', '500')
              .style('font-family', 'monospace')
              .style('opacity', 0)
              .text(value.toLocaleString());
            tooltipBg.transition().duration(100).style('opacity', 1);
            tooltip.selectAll('text').transition().duration(100).style('opacity', 1);
          })
          .on('mouseout', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
              .attr('opacity', 1);
            g.select('.tooltip').transition().duration(100).style('opacity', 0).remove();
          })
          .transition()
          .delay(seriesIndex * 100)
          .duration(animationDuration)
          .ease(d3.easeBackOut)
          .attr('y', d => yScale(d[1]))
          .attr('height', d => yScale(d[0]) - yScale(d[1]));
      });
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

    // Add responsive legend directly in SVG (matching LineChart implementation exactly)
    if (showLegend) {
      const enabledBars = yAxisKeys.filter(key => !disabledBars.includes(key));

      // Responsive legend sizing based on screen width and position (matching LineChart exactly)
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
        enabledBars.length * legendSizes.itemHeight +
        (enabledBars.length - 1) * legendSizes.itemSpacing +
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

        // Calculate total text width for all items (matching LineChart exactly)
        const totalTextWidth = enabledBars.reduce((total, key) => {
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
        const totalSpacing = (enabledBars.length - 1) * minSpacingBetweenItems;

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

      // Enhanced legend background with glass morphism effect (matching LineChart exactly)
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

      // Add subtle gradient overlay (matching LineChart exactly)
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

      // Enhanced legend items with modern design (matching LineChart exactly)
      enabledBars.forEach((key, index) => {
        const colorKey = colors[key] ? key : `bar${index + 1}`;
        const color =
          colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] ||
          defaultColorsChart[`color${index + 1}`][isDarkMode ? 'dark' : 'light'];

        // Calculate responsive text truncation (matching LineChart exactly)
        const seriesName = seriesNames[key] || key;
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
          const spaceBetweenItems = totalWidth / enabledBars.length;
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
          .attr('class', `legend-item-${index}`)
          .style('cursor', 'pointer')
          .style('transition', 'all 0.2s ease');

        // Modern color indicator with rounded rectangle and glow effect (matching LineChart exactly)
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

        // Add subtle inner glow (matching LineChart exactly)
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

        // Enhanced legend text with better typography (matching LineChart exactly)
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

        // Add interactive hover and click effects (matching LineChart exactly)
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

            // Add hover tooltip effect (matching LineChart exactly)
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

      // Mouse wheel zoom
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

      // Mouse drag to pan
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
            // Show grab cursor when zoomed in
            if (zoomLevel > 1) {
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
            if (zoomLevel > 1) {
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

        // Double-click to reset zoom
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

export default D3BarChart;
