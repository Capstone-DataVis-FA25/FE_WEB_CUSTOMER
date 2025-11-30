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
  margin = { top: 80, right: 150, bottom: 100, left: 100 },
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
  xAxisRotation = -45,
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
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !arrayData || arrayData.length === 0) return;

    const heatmapData = convertArrayToHeatmapData(arrayData);

    if (heatmapData.length === 0) {
      console.warn('No valid heatmap data to render');
      return;
    }

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Detect theme
    const isDark =
      theme === 'dark' ||
      (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const textColor = isDark ? '#e5e7eb' : '#1f2937';
    const gridColor = isDark ? '#374151' : '#e5e7eb';

    // Get unique X and Y axis values
    const xValues = Array.from(new Set(heatmapData.map(d => String(d[xAxisKey]))));
    const yValues = Array.from(new Set(heatmapData.map(d => String(d[yAxisKey]))));

    // Calculate value domain
    const values = heatmapData.map(d => Number(d[valueKey])).filter(v => !isNaN(v));
    const minVal = minValue === 'auto' ? d3.min(values) || 0 : minValue;
    const maxVal = maxValue === 'auto' ? d3.max(values) || 100 : maxValue;

    // Create color scale
    const colorInterpolator = COLOR_SCHEMES[colorScheme];
    const colorScale = d3.scaleSequential(colorInterpolator).domain([minVal, maxVal]);

    // Setup SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('font-family', 'system-ui, -apple-system, sans-serif');

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create scales
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
          // Use contrast color based on brightness
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
        .style('text-anchor', xAxisRotation !== 0 ? 'end' : 'middle')
        .attr('transform', `rotate(${xAxisRotation})`)
        .attr('fill', textColor)
        .style('font-size', `${labelFontSize}px`);

      g.selectAll('.x-axis path, .x-axis line').attr('stroke', gridColor);

      // X-axis label
      if (xAxisLabel) {
        g.append('text')
          .attr('class', 'x-axis-label')
          .attr('x', chartWidth / 2)
          .attr('y', chartHeight + margin.bottom - 10)
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

      // Y-axis label
      if (yAxisLabel) {
        g.append('text')
          .attr('class', 'y-axis-label')
          .attr('transform', 'rotate(-90)')
          .attr('x', -chartHeight / 2)
          .attr('y', -margin.left + 20)
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .style('font-size', `${labelFontSize + 2}px`)
          .style('font-weight', '600')
          .text(yAxisLabel);
      }
    }

    // Title
    if (title) {
      svg
        .append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${titleFontSize}px`)
        .style('font-weight', '700')
        .text(title);
    }

    // Legend
    if (showLegend) {
      const legendWidth = 20;
      const legendHeight = chartHeight;
      const legendX = chartWidth + 30;

      const legendScale = d3.scaleLinear().domain([minVal, maxVal]).range([legendHeight, 0]);

      const legendAxis = d3.axisRight(legendScale).ticks(legendSteps);

      const defs = svg.append('defs');
      const linearGradient = defs
        .append('linearGradient')
        .attr('id', 'heatmap-gradient')
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
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

      const legendGroup = g.append('g').attr('transform', `translate(${legendX}, 0)`);

      legendGroup
        .append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#heatmap-gradient)')
        .attr('stroke', gridColor)
        .attr('stroke-width', 1);

      legendGroup
        .append('g')
        .attr('transform', `translate(${legendWidth}, 0)`)
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
        .on('mouseover', function (event, d: any) {
          d3.select(this)
            .style('opacity', 0.8)
            .attr('stroke-width', cellBorderWidth + 2);

          const value = Number(d[valueKey]);
          const displayValue = isNaN(value) ? 'N/A' : valueFormatter(value);

          tooltip.style('opacity', 1).html(`
              <div style="background: ${isDark ? '#1f2937' : '#ffffff'}; border: 1px solid ${gridColor}; padding: 8px 12px; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                <div style="color: ${textColor}; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                  ${xAxisLabel || xAxisKey}: <span style="font-weight: 700;">${d[xAxisKey]}</span>
                </div>
                <div style="color: ${textColor}; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                  ${yAxisLabel || yAxisKey}: <span style="font-weight: 700;">${d[yAxisKey]}</span>
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

            // Get SVG bounding rect to calculate relative position
            const svgRect = svgElement.getBoundingClientRect();
            const tooltipWidth = tooltipNode.offsetWidth;
            const tooltipHeight = tooltipNode.offsetHeight;
            const padding = 10;

            // Calculate position relative to SVG container
            let left = e.clientX - svgRect.left + padding;
            let top = e.clientY - svgRect.top + padding;

            // Check if tooltip goes beyond right edge of SVG
            if (left + tooltipWidth > svgRect.width) {
              left = e.clientX - svgRect.left - tooltipWidth - padding;
            }

            // Check if tooltip goes beyond bottom edge of SVG
            if (top + tooltipHeight > svgRect.height) {
              top = e.clientY - svgRect.top - tooltipHeight - padding;
            }

            // Ensure tooltip doesn't go negative
            left = Math.max(0, left);
            top = Math.max(0, top);

            tooltip.style('left', `${left}px`).style('top', `${top}px`);
          };

          updateTooltipPosition(event);
        })
        .on('mousemove', function (event) {
          const tooltipNode = tooltipRef.current;
          if (!tooltipNode || !svgElement) return;

          // Get SVG bounding rect to calculate relative position
          const svgRect = svgElement.getBoundingClientRect();
          const tooltipWidth = tooltipNode.offsetWidth;
          const tooltipHeight = tooltipNode.offsetHeight;
          const padding = 10;

          // Calculate position relative to SVG container
          let left = event.clientX - svgRect.left + padding;
          let top = event.clientY - svgRect.top + padding;

          // Check if tooltip goes beyond right edge of SVG
          if (left + tooltipWidth > svgRect.width) {
            left = event.clientX - svgRect.left - tooltipWidth - padding;
          }

          // Check if tooltip goes beyond bottom edge of SVG
          if (top + tooltipHeight > svgRect.height) {
            top = event.clientY - svgRect.top - tooltipHeight - padding;
          }

          // Ensure tooltip doesn't go negative
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
    width,
    height,
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
  ]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
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
  );
};

export default D3HeatmapChart;
