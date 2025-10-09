import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTranslation } from 'react-i18next';
import type { ColorConfig } from '../../types/chart';
import { defaultColorsChart } from '@/utils/Utils';

export interface ChartDataPoint {
  [key: string]: number | string;
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
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width, height });
  const { t } = useTranslation();

  // Monitor container size for responsiveness
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let aspectRatio = height / width;

        if (containerWidth < 640) {
          aspectRatio = Math.min(aspectRatio * 1.2, 0.75);
        } else if (containerWidth < 1024) {
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
    if (!svgRef.current || !data.length) return;

    const currentWidth = dimensions.width;
    const currentHeight = dimensions.height;

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
      backgroundColor !== 'transparent' ? backgroundColor : isDarkMode ? '#111827' : '#ffffff';

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);

    // Responsive margin adjustments
    const responsiveMargin = {
      top: currentWidth < 640 ? margin.top * 0.8 : margin.top,
      right: currentWidth < 640 ? margin.right * 0.7 : margin.right,
      bottom: currentWidth < 640 ? margin.bottom * 0.8 : margin.bottom,
      left: currentWidth < 640 ? margin.left * 0.8 : margin.left,
    };

    // Reserve space for legend when positioned top/bottom to avoid overlap (match LineChart behavior)
    if (showLegend && (legendPosition === 'top' || legendPosition === 'bottom')) {
      const isMobile = currentWidth < 640;
      const isTablet = currentWidth < 1024;
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

    // Add background
    svg
      .append('rect')
      .attr('width', currentWidth)
      .attr('height', currentHeight)
      .attr('fill', chartBackgroundColor)
      .attr('rx', 8);

    // Add subtle Y-axis background area
    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', responsiveMargin.left)
      .attr('height', currentHeight)
      .attr('fill', isDarkMode ? '#111827' : '#f8fafc')
      .attr('opacity', 0.3);

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${responsiveMargin.left},${responsiveMargin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, d => d[xAxisKey] as number) as [number, number])
      .range([0, innerWidth]);

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
          .x((_d, i) => xScale(data[i][xAxisKey] as number))
          .y0(d => yScale(d[0]))
          .y1(d => yScale(d[1]))
          .curve(curve);

        // Create area path
        const areaPath = g
          .append('path')
          .datum(layer)
          .attr('fill', currentColors[key])
          .attr('opacity', 0)
          .attr('d', area)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))');

        // Add stroke if enabled
        if (showStroke) {
          const line = d3
            .line<d3.SeriesPoint<ChartDataPoint>>()
            .x((_d, i) => xScale(data[i][xAxisKey] as number))
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
          .attr('opacity', opacity);
      });
    } else {
      // For overlapping areas
      const enabledAreas = yAxisKeys.filter(key => !disabledLines.includes(key));
      const allYValues = data.flatMap(d => enabledAreas.map(key => d[key] as number));

      // Ensure domain starts from 0 for consistent positioning
      const maxValue = d3.max(allYValues) || 0;
      const minValue = Math.min(0, d3.min(allYValues) || 0);

      yScale = d3.scaleLinear().domain([minValue, maxValue]).nice().range([innerHeight, 0]);

      // Create overlapping areas for enabled areas only
      enabledAreas.forEach((key, index) => {
        // Area generator
        const area = d3
          .area<ChartDataPoint>()
          .x(d => xScale(d[xAxisKey] as number))
          .y0(yScale(0))
          .y1(d => yScale(d[key] as number))
          .curve(curve);

        // Create area path
        const areaPath = g
          .append('path')
          .datum(data)
          .attr('fill', currentColors[key])
          .attr('opacity', 0)
          .attr('d', area)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))');

        // Add stroke line if enabled
        if (showStroke) {
          const line = d3
            .line<ChartDataPoint>()
            .x(d => xScale(d[xAxisKey] as number))
            .y(d => yScale(d[key] as number))
            .curve(curve);

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
          .attr('opacity', opacity);

        // Add data points if enabled
        if (showPoints) {
          g.selectAll(`.point-${index}`)
            .data(data)
            .enter()
            .append('circle')
            .attr('class', `point-${index}`)
            .attr('cx', d => xScale(d[xAxisKey] as number))
            .attr('cy', d => yScale(d[key] as number))
            .attr('r', 0)
            .attr('fill', currentColors[key])
            .attr('stroke', chartBackgroundColor)
            .attr('stroke-width', 2)
            .style('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))')
            .on('mouseover', function (_event, d) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('r', currentWidth < 640 ? 5 : 6)
                .attr('stroke-width', 3);

              // Create tooltip
              const tooltip = g
                .append('g')
                .attr('class', 'tooltip')
                .attr(
                  'transform',
                  `translate(${xScale(d[xAxisKey] as number)}, ${yScale(d[key] as number) - 15})`
                );

              tooltip
                .append('rect')
                .attr('x', -30)
                .attr('y', -30)
                .attr('width', 60)
                .attr('height', 25)
                .attr('fill', isDarkMode ? '#1f2937' : '#ffffff')
                .attr('stroke', currentColors[key])
                .attr('stroke-width', 2)
                .attr('rx', 6)
                .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
                .style('opacity', 0)
                .transition()
                .duration(200)
                .style('opacity', 0.95);

              const value = typeof d[key] === 'number' ? d[key].toLocaleString() : d[key];
              tooltip
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('y', -12)
                .attr('fill', textColor)
                .style('font-size', `${fontSize.axis}px`)
                .style('font-weight', '600')
                .style('opacity', 0)
                .text(value as string)
                .transition()
                .duration(200)
                .style('opacity', 1);
            })
            .on('mouseout', function () {
              d3.select(this).transition().duration(200).attr('r', 4).attr('stroke-width', 2);

              g.select('.tooltip').transition().duration(150).style('opacity', 0).remove();
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
        .data(xScale.ticks())
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

    // X Axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat(d => {
        const value = d.valueOf();
        if (xAxisFormatter) {
          return xAxisFormatter(value);
        }
        return d3.format('d')(value);
      })
      .tickSizeInner(showAxisTicks ? 6 : 0)
      .tickSizeOuter(showAxisTicks ? 6 : 0);

    const xAxisGroup = g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);

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
        return value.toLocaleString();
      })
      .tickSizeInner(showAxisTicks ? -5 : 0)
      .tickSizeOuter(showAxisTicks ? 6 : 0)
      .tickPadding(8);

    const yAxisGroup = g.append('g').call(yAxis);

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

    // Add axis labels
    if (xAxisLabel && showAxisLabels) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + (currentWidth < 768 ? 40 : 50))
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

    // Add responsive legend directly in SVG (similar to LineChart)
    if (showLegend) {
      const enabledAreas = yAxisKeys.filter(key => !disabledLines.includes(key));

      // Responsive legend sizing based on screen width and position
      const getResponsiveLegendSizes = () => {
        const isMobile = currentWidth < 640;

        return {
          itemHeight: isMobile ? 20 : 22,
          padding: isMobile ? 10 : 12,
          itemSpacing: isMobile ? 6 : 8,
          fontSize: isMobile ? legendFontSize : legendFontSize + 1,
          iconSize: isMobile ? 14 : 16,
          iconSpacing: isMobile ? 8 : 10,
        };
      };

      const legendSizes = getResponsiveLegendSizes();
      const totalLegendHeight =
        enabledAreas.length * legendSizes.itemHeight +
        (enabledAreas.length - 1) * legendSizes.itemSpacing +
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
              y: innerHeight + xLabelSpacing + (isMobile ? 15 : 40),
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
        const totalTextWidth = enabledAreas.reduce((total, key) => {
          const maxTextLength = currentWidth < 640 ? 8 : currentWidth < 1024 ? 10 : 12;
          const displayName =
            key.length > maxTextLength ? key.substring(0, maxTextLength) + '...' : key;
          return (
            total +
            displayName.length * (legendSizes.fontSize * 0.6) +
            legendSizes.iconSize +
            legendSizes.iconSpacing
          );
        }, 0);

        // Add minimum spacing between items
        const minSpacingBetweenItems = currentWidth < 640 ? 20 : 30;
        const totalSpacing = (enabledAreas.length - 1) * minSpacingBetweenItems;

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
      enabledAreas.forEach((key, index) => {
        const colorKey = colors[key] ? key : `area${index + 1}`;
        const color =
          colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] ||
          Object.values(colors)[index % Object.keys(colors).length]?.[
            isDarkMode ? 'dark' : 'light'
          ] ||
          '#3b82f6';

        // Calculate responsive text truncation
        const maxTextLength = currentWidth < 640 ? 8 : currentWidth < 1024 ? 10 : 12;
        const displayName =
          key.length > maxTextLength ? key.substring(0, maxTextLength) + '...' : key;

        let itemX = legendX;
        let itemY = legendY;

        if (isHorizontal) {
          // Horizontal layout for top/bottom - distribute evenly across available width
          const totalWidth = legendBgDimensions.width - 2 * legendSizes.padding;
          const spaceBetweenItems = totalWidth / enabledAreas.length;
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
              .attr('width', Math.max(key.length * 6 + 16, 80))
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
              .text(key);

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

    // Enhanced zoom and pan with mouse interactions (similar to BarChart)
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

        // Handle mouse leave to stop dragging
        svg.on('mouseleave', function () {
          if (isDragging) {
            isDragging = false;
            svg.style('cursor', 'default');
          }
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
      <div className="chart-container relative bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
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
