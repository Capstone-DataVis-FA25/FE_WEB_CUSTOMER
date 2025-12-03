import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface HeatmapDataPoint {
  [key: string]: number | string;
}

export interface D3HeatmapChartProps {
  arrayData?: (string | number)[][]; // Array data input
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string; // Column for X-axis categories
  yAxisKey: string; // Column for Y-axis categories
  valueKey: string; // Column for heatmap values
  colorScheme?:
    | 'blues'
    | 'reds'
    | 'greens'
    | 'purples'
    | 'oranges'
    | 'greys'
    | 'viridis'
    | 'plasma'
    | 'inferno'
    | 'magma'
    | 'turbo'
    | 'cividis';
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showValues?: boolean; // Show values inside cells
  cellBorderWidth?: number;
  cellBorderColor?: string;
  valuePosition?: 'center' | 'top' | 'bottom';
  minValue?: number | 'auto';
  maxValue?: number | 'auto';
  nullColor?: string;
  legendSteps?: number;
  xAxisRotation?: number;
  yAxisRotation?: number;
  showAxisLabels?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  titleFontSize?: number;
  labelFontSize?: number;
  legendFontSize?: number;
  animationDuration?: number;
  showTooltip?: boolean;
  valueFormatter?: (value: number) => string;
}

// Color scheme mapping
const COLOR_SCHEMES = {
  blues: d3.interpolateBlues,
  reds: d3.interpolateReds,
  greens: d3.interpolateGreens,
  purples: d3.interpolatePurples,
  oranges: d3.interpolateOranges,
  greys: d3.interpolateGreys,
  viridis: d3.interpolateViridis,
  plasma: d3.interpolatePlasma,
  inferno: d3.interpolateInferno,
  magma: d3.interpolateMagma,
  turbo: d3.interpolateTurbo,
  cividis: d3.interpolateCividis,
};

function convertArrayToHeatmapData(arrayData: (string | number)[][]): HeatmapDataPoint[] {
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

  const heatmapData: HeatmapDataPoint[] = dataRows.map((row, rowIndex) => {
    const dataPoint: HeatmapDataPoint = {};
    headers.forEach((header, headerIndex) => {
      const value = row[headerIndex];

      if (value === undefined || value === null || value === 'N/A' || value === '') {
        dataPoint[header] = headerIndex === 0 ? `Unknown_${rowIndex + 1}` : 0;
        return;
      }

      if (typeof value === 'string') {
        const cleanedValue = value.replace(/[,\s]/g, '');
        const numericPattern = /^[+-]?\d+(?:\.\d+)?$/;
        if (numericPattern.test(cleanedValue)) {
          dataPoint[header] = parseFloat(cleanedValue);
        } else {
          dataPoint[header] = value;
        }
      } else {
        dataPoint[header] = value;
      }
    });

    return dataPoint;
  });

  return heatmapData;
}

const D3HeatmapChart: React.FC<D3HeatmapChartProps> = ({
  arrayData = [],
  width = 800,
  height = 600,
  margin = { top: 80, right: 50, bottom: 150, left: 100 },
  xAxisKey,
  yAxisKey,
  valueKey,
  colorScheme = 'viridis',
  title = 'Heatmap Chart',
  xAxisLabel = '',
  yAxisLabel = '',
  showLegend = true,
  showValues = false,
  cellBorderWidth = 1,
  cellBorderColor = '#ffffff',
  valuePosition = 'center',
  minValue = 'auto',
  maxValue = 'auto',
  nullColor = '#cccccc',
  legendSteps = 5,
  xAxisRotation = 0,
  yAxisRotation = 0,
  showAxisLabels = true,
  theme = 'auto',
  titleFontSize = 20,
  labelFontSize = 12,
  legendFontSize = 11,
  animationDuration = 750,
  showTooltip = true,
  valueFormatter = (value: number) => value.toFixed(2),
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width, height });
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Responsive container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let aspectRatio = height / width;
        if (containerWidth < 640) aspectRatio = Math.min(aspectRatio * 1.2, 0.75);
        else if (containerWidth < 1024) aspectRatio = Math.min(aspectRatio, 0.6);
        else aspectRatio = Math.min(aspectRatio, 0.5);
        const newWidth = Math.min(containerWidth - 16, width);
        let newHeight = newWidth * aspectRatio;
        setDimensions({ width: newWidth, height: newHeight });
      }
    };
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [width, height]);

  // Theme detection
  useEffect(() => {
    const updateTheme = () => {
      if (theme === 'auto') {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      } else {
        setIsDarkMode(theme === 'dark');
      }
    };
    updateTheme();
    if (theme === 'auto') {
      const observer = new MutationObserver(updateTheme);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, [theme]);

  useEffect(() => {
    if (!svgRef.current || !arrayData || arrayData.length === 0) return;
    const heatmapData = convertArrayToHeatmapData(arrayData);
    if (heatmapData.length === 0) {
      console.warn('No valid heatmap data to render');
      return;
    }
    d3.select(svgRef.current).selectAll('*').remove();
    const isDark = isDarkMode;
    const textColor = isDark ? '#e5e7eb' : '#1f2937';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const chartBackgroundColor = isDark ? '#111827' : '#ffffff';
    const borderColor = isDark ? '#374151' : '#e5e7eb';
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;
    const svg = d3
      .select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .style('font-family', 'system-ui, -apple-system, sans-serif');
    // Card background
    svg
      .append('rect')
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .attr('fill', chartBackgroundColor)
      .attr('rx', 12)
      .attr('stroke', borderColor)
      .attr('stroke-width', 2);
    // Title in SVG
    if (title) {
      svg
        .append('text')
        .attr('class', 'chart-title')
        .attr('x', dimensions.width / 2)
        .attr('y', Math.max(28, (titleFontSize || 18) * 1.2))
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${titleFontSize}px`)
        .style('font-weight', '700')
        .text(title);
    }
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
    // Scales
    const xValues = Array.from(new Set(heatmapData.map(d => String(d[xAxisKey]))));
    const yValues = Array.from(new Set(heatmapData.map(d => String(d[yAxisKey]))));
    const values = heatmapData.map(d => Number(d[valueKey])).filter(v => !isNaN(v));
    const minVal = minValue === 'auto' ? d3.min(values) || 0 : minValue;
    const maxVal = maxValue === 'auto' ? d3.max(values) || 100 : maxValue;
    const colorInterpolator = COLOR_SCHEMES[colorScheme];
    const colorScale = d3.scaleSequential(colorInterpolator).domain([minVal, maxVal]);
    const xScale = d3.scaleBand().domain(xValues).range([0, chartWidth]).padding(0.05);
    const yScale = d3.scaleBand().domain(yValues).range([0, chartHeight]).padding(0.05);
    // Draw cells
    g.selectAll('rect.cell')
      .data(heatmapData)
      .join('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(String(d[xAxisKey])) || 0)
      .attr('y', d => yScale(String(d[yAxisKey])) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => {
        const value = Number(d[valueKey]);
        return isNaN(value) ? nullColor : colorScale(value);
      })
      .attr('stroke', cellBorderColor)
      .attr('stroke-width', cellBorderWidth)
      .style('opacity', 0)
      .transition()
      .duration(animationDuration)
      .style('opacity', 1);
    // Show values in cells
    if (showValues) {
      g.selectAll('text.cell-value')
        .data(heatmapData)
        .join('text')
        .attr('class', 'cell-value')
        .attr('x', d => (xScale(String(d[xAxisKey])) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => {
          const yPos = (yScale(String(d[yAxisKey])) || 0) + yScale.bandwidth() / 2;
          if (valuePosition === 'top') return yPos - yScale.bandwidth() / 4;
          if (valuePosition === 'bottom') return yPos + yScale.bandwidth() / 4;
          return yPos;
        })
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', d => {
          const value = Number(d[valueKey]);
          if (isNaN(value)) return textColor;
          const color = d3.color(colorScale(value));
          if (!color) return textColor;
          const rgb = d3.rgb(color);
          const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
          return brightness > 128 ? '#000000' : '#ffffff';
        })
        .style('font-size', `${labelFontSize}px`)
        .style('pointer-events', 'none')
        .text(d => {
          const value = Number(d[valueKey]);
          return isNaN(value) ? 'N/A' : valueFormatter(value);
        })
        .style('opacity', 0)
        .transition()
        .duration(animationDuration)
        .style('opacity', 1);
    }
    // X-axis
    if (showAxisLabels) {
      const xAxis = d3.axisBottom(xScale);
      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'middle')
        .attr('transform', 'rotate(0)')
        .attr('fill', textColor)
        .style('font-size', `${labelFontSize}px`);
      g.selectAll('.x-axis path, .x-axis line').attr('stroke', gridColor);
      if (xAxisLabel) {
        g.append('text')
          .attr('class', 'x-axis-label')
          .attr('x', chartWidth / 2)
          .attr('y', chartHeight + 50)
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .style('font-size', `${labelFontSize + 2}px`)
          .style('font-weight', '600')
          .text(xAxisLabel);
      }
    }
    // Y-axis
    if (showAxisLabels) {
      const yAxis = d3.axisLeft(yScale);
      g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text')
        .attr('transform', `rotate(${yAxisRotation})`)
        .attr('fill', textColor)
        .style('font-size', `${labelFontSize}px`);
      g.selectAll('.y-axis path, .y-axis line').attr('stroke', gridColor);
      if (yAxisLabel) {
        g.append('text')
          .attr('class', 'y-axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -chartHeight / 2)
          .attr('y', -margin.left + 30)
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .style('font-size', `${labelFontSize + 2}px`)
          .style('font-weight', '600')
          .text(yAxisLabel);
      }
    }
    // Legend (horizontal card style below chart)
    if (showLegend) {
      const legendWidth = Math.min(chartWidth * 0.6, 400);
      const legendHeight = 20;
      const legendY = chartHeight + 65;
      const legendX = (chartWidth - legendWidth) / 2;
      const legendScale = d3.scaleLinear().domain([minVal, maxVal]).range([0, legendWidth]);
      const legendAxis = d3.axisBottom(legendScale).ticks(legendSteps);
      const defs = svg.append('defs');
      const linearGradient = defs
        .append('linearGradient')
        .attr('id', 'heatmap-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const offset = (i / steps) * 100;
        const value = minVal + (maxVal - minVal) * (i / steps);
        linearGradient
          .append('stop')
          .attr('offset', `${offset}%`)
          .attr('stop-color', colorScale(value));
      }
      const legendGroup = g.append('g').attr('transform', `translate(${legendX}, ${legendY})`);
      // Card background for legend
      legendGroup
        .append('rect')
        .attr('width', legendWidth + 24)
        .attr('height', legendHeight + 48)
        .attr('x', -12)
        .attr('y', -12)
        .attr('fill', isDark ? 'rgba(55,65,81,0.85)' : 'rgba(248,250,252,0.95)')
        .attr('stroke', borderColor)
        .attr('stroke-width', 1)
        .attr('rx', 10)
        .style('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))');
      legendGroup
        .append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', 'url(#heatmap-gradient)')
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('rx', 3);
      legendGroup
        .append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(legendAxis)
        .selectAll('text')
        .attr('fill', textColor)
        .style('font-size', `${legendFontSize}px`);
      legendGroup.selectAll('path, line').attr('stroke', gridColor);
    }
    // Tooltip
    if (showTooltip && tooltipRef.current) {
      const tooltip = d3.select(tooltipRef.current);
      const svgElement = svgRef.current;
      g.selectAll('rect.cell')
        .on('mouseover', function (event, d) {
          d3.select(this)
            .style('opacity', 0.8)
            .attr('stroke-width', cellBorderWidth + 2);
          const dataPoint = d as HeatmapDataPoint;
          const value = Number(dataPoint[valueKey]);
          const displayValue = isNaN(value) ? 'N/A' : valueFormatter(value);
          tooltip.style('opacity', 1).html(`
              <div style="background: ${isDark ? '#1f2937' : '#ffffff'}; border: 1px solid ${gridColor}; padding: 8px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                <div style="color: ${textColor}; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                  ${xAxisLabel || xAxisKey}: <span style="font-weight: 700;">${dataPoint[xAxisKey]}</span>
                </div>
                <div style="color: ${textColor}; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                  ${yAxisLabel || yAxisKey}: <span style="font-weight: 700;">${dataPoint[yAxisKey]}</span>
                </div>
                <div style="color: ${textColor}; font-size: 14px; font-weight: 700; border-top: 1px solid ${gridColor}; padding-top: 4px; margin-top: 4px;">
                  ${valueKey}: <span style="color: ${isDark ? '#60a5fa' : '#2563eb'};">${displayValue}</span>
                </div>
              </div>
            `);
          // Position tooltip relative to SVG container
          const updateTooltipPosition = (e: MouseEvent) => {
            const tooltipNode = tooltipRef.current;
            if (!tooltipNode || !svgElement) return;
            const svgRect = svgElement.getBoundingClientRect();
            const tooltipWidth = tooltipNode.offsetWidth;
            const tooltipHeight = tooltipNode.offsetHeight;
            const padding = 10;
            let left = e.clientX - svgRect.left + padding;
            let top = e.clientY - svgRect.top + padding;
            if (left + tooltipWidth > svgRect.width) {
              left = e.clientX - svgRect.left - tooltipWidth - padding;
            }
            if (top + tooltipHeight > svgRect.height) {
              top = e.clientY - svgRect.top - tooltipHeight - padding;
            }
            left = Math.max(0, left);
            top = Math.max(0, top);
            tooltip.style('left', `${left}px`).style('top', `${top}px`);
          };
          updateTooltipPosition(event);
        })
        .on('mousemove', function (event) {
          const tooltipNode = tooltipRef.current;
          if (!tooltipNode || !svgElement) return;
          const svgRect = svgElement.getBoundingClientRect();
          const tooltipWidth = tooltipNode.offsetWidth;
          const tooltipHeight = tooltipNode.offsetHeight;
          const padding = 10;
          let left = event.clientX - svgRect.left + padding;
          let top = event.clientY - svgRect.top + padding;
          if (left + tooltipWidth > svgRect.width) {
            left = event.clientX - svgRect.left - tooltipWidth - padding;
          }
          if (top + tooltipHeight > svgRect.height) {
            top = event.clientY - svgRect.top - tooltipHeight - padding;
          }
          left = Math.max(0, left);
          top = Math.max(0, top);
          tooltip.style('left', `${left}px`).style('top', `${top}px`);
        })
        .on('mouseout', function () {
          d3.select(this).style('opacity', 1).attr('stroke-width', cellBorderWidth);
          tooltip.style('opacity', 0);
        });
    }
  }, [
    arrayData,
    dimensions,
    margin,
    xAxisKey,
    yAxisKey,
    valueKey,
    colorScheme,
    title,
    xAxisLabel,
    yAxisLabel,
    showLegend,
    showValues,
    cellBorderWidth,
    cellBorderColor,
    valuePosition,
    minValue,
    maxValue,
    nullColor,
    legendSteps,
    xAxisRotation,
    yAxisRotation,
    showAxisLabels,
    theme,
    titleFontSize,
    labelFontSize,
    legendFontSize,
    animationDuration,
    showTooltip,
    valueFormatter,
    isDarkMode,
  ]);

  return (
    <div ref={containerRef} className="w-full">
      <div className="chart-container relative bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto chart-svg"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          style={{ display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Heatmap chart${title ? `: ${title}` : ''}`}
        />
        {showTooltip && (
          <div
            ref={tooltipRef}
            style={{
              position: 'absolute',
              opacity: 0,
              pointerEvents: 'none',
              transition: 'opacity 0.2s',
              zIndex: 1000,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default D3HeatmapChart;
