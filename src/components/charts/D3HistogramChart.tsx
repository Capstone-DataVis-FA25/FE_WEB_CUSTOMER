import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  renderD3Tooltip,
  createHeader,
  createStatLine,
  createPercentLine,
  createSeparator,
  type TooltipLine,
} from './ChartTooltip';

export interface ChartDataPoint {
  [key: string]: number | string;
}

export interface D3HistogramChartProps {
  data?: ChartDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  dataColumn: string; // The numeric column to create histogram from
  binCount?: number;
  binWidth?: number;
  binMethod?: 'count' | 'width' | 'sturges' | 'scott' | 'freedman-diaconis';
  customBinEdges?: number[];
  showDensity?: boolean;
  showCumulativeFrequency?: boolean;
  barColor?: string;
  showMean?: boolean;
  showMedian?: boolean;
  showPointValues?: boolean;
  normalize?: boolean;
  title?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  legendFontSize?: number;
  yAxisStart?: 'auto' | 'zero';
  animationDuration?: number;
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: number) => string;
  gridOpacity?: number;
  xAxisRotation?: number;
  yAxisRotation?: number;
  showAxisLabels?: boolean;
  showAxisTicks?: boolean;
  showTooltip?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  titleFontSize?: number;
  labelFontSize?: number;
}

const D3HistogramChart: React.FC<D3HistogramChartProps> = ({
  data = [],
  width = 800,
  height = 600,
  margin = { top: 20, right: 40, bottom: 60, left: 80 },
  dataColumn,
  binCount = 10,
  binWidth,
  binMethod = 'sturges',
  customBinEdges,
  showDensity = false,
  showCumulativeFrequency = false,
  barColor,
  showMean = false,
  showMedian = false,
  showPointValues = false,
  normalize = false,
  title,
  yAxisLabel,
  xAxisLabel,
  showGrid = true,
  showLegend = false,
  legendPosition = 'bottom',
  legendFontSize = 11,
  yAxisStart = 'zero',
  animationDuration = 1000,
  yAxisFormatter,
  xAxisFormatter,
  gridOpacity = 0.5,
  xAxisRotation = 0,
  yAxisRotation = 0,
  showAxisLabels = true,
  showAxisTicks = true,
  showTooltip = true,
  theme = 'auto',
  backgroundColor = 'transparent',
  titleFontSize = 16,
  labelFontSize = 12,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width, height });
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTooltipRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(
    null
  );

  // Extract numeric values from data column
  const numericValues = React.useMemo(() => {
    if (!data || !dataColumn) return [];
    return data
      .map(d => {
        const val = d[dataColumn];
        return typeof val === 'number' ? val : parseFloat(String(val));
      })
      .filter(v => !isNaN(v) && isFinite(v));
  }, [data, dataColumn]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (numericValues.length === 0) return { mean: 0, median: 0, min: 0, max: 0 };

    const sorted = [...numericValues].sort((a, b) => a - b);
    const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    return {
      mean,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
    };
  }, [numericValues]);

  // Calculate bin thresholds based on method
  const calculateThresholds = React.useCallback(() => {
    if (customBinEdges && customBinEdges.length > 0) {
      return customBinEdges;
    }

    const n = numericValues.length;
    if (n === 0) return [];

    const min = stats.min;
    const max = stats.max;
    const range = max - min;

    let numBins = binCount;

    switch (binMethod) {
      case 'sturges':
        numBins = Math.ceil(Math.log2(n) + 1);
        break;
      case 'scott': {
        const stdDev = Math.sqrt(
          numericValues.reduce((sum, val) => sum + Math.pow(val - stats.mean, 2), 0) / n
        );
        const binW = (3.5 * stdDev) / Math.pow(n, 1 / 3);
        numBins = Math.ceil(range / binW);
        break;
      }
      case 'freedman-diaconis': {
        const sorted = [...numericValues].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(n * 0.25)];
        const q3 = sorted[Math.floor(n * 0.75)];
        const iqr = q3 - q1;
        const binW = (2 * iqr) / Math.pow(n, 1 / 3);
        numBins = Math.ceil(range / binW);
        break;
      }
      case 'width':
        if (binWidth && binWidth > 0) {
          numBins = Math.ceil(range / binWidth);
        }
        break;
      case 'count':
      default:
        numBins = binCount;
        break;
    }

    // Ensure reasonable bin count
    numBins = Math.max(1, Math.min(100, numBins));

    return d3.range(min, max + range / numBins, range / numBins);
  }, [numericValues, binCount, binWidth, binMethod, customBinEdges, stats]);

  const clearTooltipTimeout = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  };

  const hideCurrentTooltip = () => {
    if (currentTooltipRef.current) {
      currentTooltipRef.current.transition().duration(200).style('opacity', 0);
    }
  };

  // Theme detection
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

  // Resize observer
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      // Use full container width instead of limiting it
      const newWidth = containerWidth > 0 ? containerWidth : width;
      const aspectRatio = height / width;
      const newHeight = newWidth * aspectRatio;
      setDimensions({ width: newWidth, height: newHeight });
    };
    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [width, height]);

  // Cleanup
  useEffect(() => {
    return () => clearTooltipTimeout();
  }, []);

  // Main rendering effect
  useEffect(() => {
    if (!svgRef.current || numericValues.length === 0) return;

    const currentWidth = dimensions.width;
    const currentHeight = dimensions.height;

    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const gridColor = isDarkMode ? '#4b5563' : '#9ca3af';
    const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';
    const bgColor =
      backgroundColor !== 'transparent' ? backgroundColor : isDarkMode ? '#111827' : '#ffffff';
    const defaultBarColor = barColor || (isDarkMode ? '#60a5fa' : '#3b82f6');

    // Clear and setup
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current);

    const innerWidth = currentWidth - margin.left - margin.right;
    const innerHeight = currentHeight - margin.top - margin.bottom;

    svg
      .append('rect')
      .attr('width', currentWidth)
      .attr('height', currentHeight)
      .attr('fill', bgColor)
      .attr('rx', 8);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Create histogram bins
    const thresholds = calculateThresholds();
    const histogram = d3.bin().domain([stats.min, stats.max]).thresholds(thresholds);

    const bins = histogram(numericValues);

    // Scales
    const xScale = d3.scaleLinear().domain([stats.min, stats.max]).range([0, innerWidth]);

    const maxFrequency = d3.max(bins, d => d.length) || 0;
    const yMax = normalize ? 1 : maxFrequency;

    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .range([innerHeight, 0]);

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
    }

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(10)
      .tickFormat(d => (xAxisFormatter ? xAxisFormatter(d.valueOf()) : String(d.valueOf())));

    const xAxisGroup = g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);

    xAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${labelFontSize}px`)
      .attr('transform', `rotate(${xAxisRotation})`)
      .style('text-anchor', xAxisRotation === 0 ? 'middle' : xAxisRotation > 0 ? 'start' : 'end');

    xAxisGroup.select('.domain').attr('stroke', axisColor).attr('stroke-width', 2);
    if (showAxisTicks) xAxisGroup.selectAll('.tick line').attr('stroke', axisColor);
    else xAxisGroup.selectAll('.tick line').attr('opacity', 0);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(8)
      .tickFormat(d => (yAxisFormatter ? yAxisFormatter(d.valueOf()) : String(d.valueOf())));

    const yAxisGroup = g.append('g').call(yAxis);

    yAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${labelFontSize}px`)
      .attr('transform', `rotate(${yAxisRotation})`);

    yAxisGroup.select('.domain').attr('stroke', axisColor).attr('stroke-width', 2);
    if (showAxisTicks) yAxisGroup.selectAll('.tick line').attr('stroke', axisColor);
    else yAxisGroup.selectAll('.tick line').attr('opacity', 0);

    // Histogram bars
    g.selectAll('.histogram-bar')
      .data(bins)
      .enter()
      .append('rect')
      .attr('class', 'histogram-bar')
      .attr('x', d => xScale(d.x0 || 0) + 1)
      .attr('width', d => Math.max(0, xScale(d.x1 || 0) - xScale(d.x0 || 0) - 2))
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('fill', defaultBarColor)
      .attr('rx', 2)
      .attr('ry', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
      .on('mouseover', function (_event, d) {
        if (!showTooltip) return;
        clearTooltipTimeout();

        d3.select(this)
          .transition()
          .duration(200)
          .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))')
          .attr('opacity', 0.8);

        const frequency = d.length;
        const percentage = (frequency / numericValues.length) * 100;
        const binStart = d.x0 || 0;
        const binEnd = d.x1 || 0;

        const tooltipLines: TooltipLine[] = [
          createHeader(`Range: ${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`),
          createSeparator(),
          createStatLine('Frequency', frequency.toString()),
          createPercentLine('Percentage', percentage),
        ];

        // Create or get tooltip group
        let tooltipGroup = currentTooltipRef.current;
        if (!tooltipGroup) {
          tooltipGroup = svg.append('g').attr('class', 'histogram-tooltip');
          currentTooltipRef.current = tooltipGroup;
        }

        const [mouseX, mouseY] = d3.pointer(_event, svg.node());

        renderD3Tooltip(tooltipGroup, {
          lines: tooltipLines,
          isDarkMode,
          position: { x: mouseX, y: mouseY },
          containerWidth: currentWidth,
          containerHeight: currentHeight,
        });
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
          .attr('opacity', 1);

        tooltipTimeoutRef.current = setTimeout(() => {
          hideCurrentTooltip();
        }, 100);
      })
      .transition()
      .duration(animationDuration)
      .attr('y', d => {
        const freq = normalize ? d.length / numericValues.length : d.length;
        return yScale(freq);
      })
      .attr('height', d => {
        const freq = normalize ? d.length / numericValues.length : d.length;
        return innerHeight - yScale(freq);
      });

    // Show values on bars
    if (showPointValues) {
      g.selectAll('.bar-value')
        .data(bins)
        .enter()
        .append('text')
        .attr('class', 'bar-value')
        .attr('x', d => xScale((d.x0 || 0) + (d.x1 || 0)) / 2)
        .attr('y', d => {
          const freq = normalize ? d.length / numericValues.length : d.length;
          return yScale(freq) - 5;
        })
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${labelFontSize - 2}px`)
        .style('font-weight', '600')
        .text(d =>
          normalize ? ((d.length / numericValues.length) * 100).toFixed(1) + '%' : d.length
        );
    }

    // Mean line
    if (showMean) {
      g.append('line')
        .attr('x1', xScale(stats.mean))
        .attr('x2', xScale(stats.mean))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', isDarkMode ? '#fbbf24' : '#f59e0b')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      g.append('text')
        .attr('x', xScale(stats.mean))
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('fill', isDarkMode ? '#fbbf24' : '#f59e0b')
        .style('font-size', `${labelFontSize}px`)
        .style('font-weight', '600')
        .text(`Mean: ${stats.mean.toFixed(2)}`);
    }

    // Median line
    if (showMedian) {
      g.append('line')
        .attr('x1', xScale(stats.median))
        .attr('x2', xScale(stats.median))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', isDarkMode ? '#34d399' : '#10b981')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

      g.append('text')
        .attr('x', xScale(stats.median))
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('fill', isDarkMode ? '#34d399' : '#10b981')
        .style('font-size', `${labelFontSize}px`)
        .style('font-weight', '600')
        .text(`Median: ${stats.median.toFixed(2)}`);
    }

    // Axis labels
    if (showAxisLabels && xAxisLabel) {
      svg
        .append('text')
        .attr('x', currentWidth / 2)
        .attr('y', currentHeight - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${labelFontSize}px`)
        .style('font-weight', '600')
        .text(xAxisLabel);
    }

    if (showAxisLabels && yAxisLabel) {
      svg
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -currentHeight / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${labelFontSize}px`)
        .style('font-weight', '600')
        .text(yAxisLabel);
    }

    // Title
    if (title) {
      svg
        .append('text')
        .attr('x', currentWidth / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${titleFontSize}px`)
        .style('font-weight', '700')
        .text(title);
    }

    // Legend
    if (showLegend) {
      const legendItemHeight = 20;
      const legendItemWidth = 150;
      const legendPadding = 10;

      const legendItems = [{ label: dataColumn, color: defaultBarColor }];

      if (showMean) {
        legendItems.push({ label: 'Mean', color: isDarkMode ? '#fbbf24' : '#f59e0b' });
      }
      if (showMedian) {
        legendItems.push({ label: 'Median', color: isDarkMode ? '#34d399' : '#10b981' });
      }

      const legendWidth = legendItems.length * legendItemWidth;
      const legendHeight = legendItemHeight + legendPadding * 2;

      let legendX = 0;
      let legendY = 0;

      switch (legendPosition) {
        case 'top':
          legendX = (currentWidth - legendWidth) / 2;
          legendY = 10;
          break;
        case 'bottom':
          legendX = (currentWidth - legendWidth) / 2;
          legendY = currentHeight - legendHeight;
          break;
        case 'left':
          legendX = 10;
          legendY = (currentHeight - legendHeight) / 2;
          break;
        case 'right':
          legendX = currentWidth - legendWidth - 10;
          legendY = (currentHeight - legendHeight) / 2;
          break;
      }

      const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${legendX}, ${legendY})`);

      legendItems.forEach((item, i) => {
        const legendItem = legend
          .append('g')
          .attr('class', 'legend-item')
          .attr('transform', `translate(${i * legendItemWidth}, 0)`);

        legendItem
          .append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', item.color)
          .attr('rx', 2);

        legendItem
          .append('text')
          .attr('x', 18)
          .attr('y', 10)
          .attr('fill', textColor)
          .style('font-size', `${legendFontSize}px`)
          .text(item.label);
      });
    }
  }, [
    numericValues,
    dimensions,
    isDarkMode,
    dataColumn,
    binCount,
    binWidth,
    binMethod,
    customBinEdges,
    showDensity,
    showCumulativeFrequency,
    barColor,
    showMean,
    showMedian,
    showPointValues,
    normalize,
    title,
    yAxisLabel,
    xAxisLabel,
    showGrid,
    showLegend,
    legendPosition,
    legendFontSize,
    yAxisStart,
    animationDuration,
    yAxisFormatter,
    xAxisFormatter,
    gridOpacity,
    xAxisRotation,
    yAxisRotation,
    showAxisLabels,
    showAxisTicks,
    showTooltip,
    backgroundColor,
    titleFontSize,
    labelFontSize,
    stats,
    calculateThresholds,
    margin,
  ]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} />
    </div>
  );
};

export default D3HistogramChart;
