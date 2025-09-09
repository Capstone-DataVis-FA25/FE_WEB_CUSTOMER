import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export interface TrendChartDataPoint {
  [key: string]: string | number;
}

export interface TrendChartProps {
  data: TrendChartDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKey: string;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  animationDuration?: number;
  showTrendLine?: boolean;
  showDataPoints?: boolean;
  lineColor?: string;
  trendLineColor?: string;
  pointColor?: string;
  strokeWidth?: number;
}

const D3TrendChart: React.FC<TrendChartProps> = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 50 },
  xAxisKey,
  yAxisKey,
  title,
  xAxisLabel,
  yAxisLabel,
  showGrid = true,
  animationDuration = 1000,
  showTrendLine = true,
  showDataPoints = true,
  lineColor = '#3b82f6',
  trendLineColor = '#ef4444',
  pointColor = '#3b82f6',
  strokeWidth = 2,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Sort data by x value
    const sortedData = [...data].sort((a, b) => {
      const aVal = a[xAxisKey];
      const bVal = b[xAxisKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return aVal - bVal;
      }
      return String(aVal).localeCompare(String(bVal));
    });

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(sortedData, d => Number(d[xAxisKey])) as [number, number])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(sortedData, d => Number(d[yAxisKey])) as [number, number])
      .range([innerHeight, 0])
      .nice();

    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const gridColor = isDarkMode ? '#4b5563' : '#e5e7eb';
    const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';

    // Grid lines
    if (showGrid) {
      // Vertical grid lines
      g.selectAll('.grid-line-x')
        .data(xScale.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-line-x')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', gridColor)
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.7);

      // Horizontal grid lines
      g.selectAll('.grid-line-y')
        .data(yScale.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-line-y')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .attr('stroke', gridColor)
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.7);
    }

    // Line generator
    const line = d3.line<TrendChartDataPoint>()
      .x(d => xScale(Number(d[xAxisKey])))
      .y(d => yScale(Number(d[yAxisKey])))
      .curve(d3.curveMonotoneX);

    // Main line
    const path = g.append('path')
      .datum(sortedData)
      .attr('class', 'main-line')
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', strokeWidth)
      .attr('opacity', 0.8);

    // Calculate path length for animation
    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;

    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .attr('d', line)
      .transition()
      .duration(animationDuration)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Calculate trend line using linear regression
    if (showTrendLine) {
      const n = sortedData.length;
      const sumX = d3.sum(sortedData, d => Number(d[xAxisKey]));
      const sumY = d3.sum(sortedData, d => Number(d[yAxisKey]));
      const sumXY = d3.sum(sortedData, d => Number(d[xAxisKey]) * Number(d[yAxisKey]));
      const sumXX = d3.sum(sortedData, d => Number(d[xAxisKey]) * Number(d[xAxisKey]));

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      const xDomain = xScale.domain();
      const trendData = [
        { x: xDomain[0], y: slope * xDomain[0] + intercept },
        { x: xDomain[1], y: slope * xDomain[1] + intercept }
      ];

      const trendLine = d3.line<any>()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));

      g.append('path')
        .datum(trendData)
        .attr('class', 'trend-line')
        .attr('fill', 'none')
        .attr('stroke', trendLineColor)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0)
        .attr('d', trendLine)
        .transition()
        .delay(animationDuration / 2)
        .duration(animationDuration / 2)
        .attr('opacity', 0.7);

      // Add trend line equation
      const equation = `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`;
      g.append('text')
        .attr('x', innerWidth - 10)
        .attr('y', 15)
        .attr('text-anchor', 'end')
        .attr('fill', trendLineColor)
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('opacity', 0)
        .text(equation)
        .transition()
        .delay(animationDuration)
        .duration(500)
        .style('opacity', 1);
    }

    // Data points
    if (showDataPoints) {
      const dots = g.selectAll('.dot')
        .data(sortedData)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(Number(d[xAxisKey])))
        .attr('cy', d => yScale(Number(d[yAxisKey])))
        .attr('r', 0)
        .attr('fill', pointColor)
        .attr('stroke', isDarkMode ? '#374151' : '#ffffff')
        .attr('stroke-width', 2);

      dots.transition()
        .duration(200)
        .delay((_, i) => animationDuration + i * 50)
        .attr('r', 4);

      // Hover effects
      dots
        .on('mouseenter', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6);

          // Tooltip
          const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background', isDarkMode ? '#1f2937' : 'white')
            .style('border', `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`)
            .style('border-radius', '6px')
            .style('padding', '8px 12px')
            .style('font-size', '12px')
            .style('color', isDarkMode ? '#f3f4f6' : '#1f2937')
            .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .style('opacity', 0);

          const tooltipContent = `
            <div style="font-weight: 600; margin-bottom: 4px;">${xAxisKey}: ${Number(d[xAxisKey]).toLocaleString()}</div>
            <div>${yAxisKey}: ${Number(d[yAxisKey]).toLocaleString()}</div>
          `;

          tooltip.html(tooltipContent);

          tooltip.transition()
            .duration(200)
            .style('opacity', 1);

          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 4);
          
          d3.selectAll('.tooltip').remove();
        });
    }

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', textColor)
      .style('font-size', '12px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', textColor)
      .style('font-size', '12px');

    g.selectAll('.domain, .tick line')
      .attr('stroke', axisColor);

    // Add axis labels
    if (xAxisLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 35)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', '14px')
        .style('font-weight', '600')
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -35)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', '14px')
        .style('font-weight', '600')
        .text(yAxisLabel);
    }

  }, [data, width, height, margin, xAxisKey, yAxisKey, showGrid, animationDuration, showTrendLine, showDataPoints, lineColor, trendLineColor, pointColor, strokeWidth, isDarkMode]);

  return (
    <div className="w-full space-y-4">
      {title && (
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground text-center">
          {title}
        </h3>
      )}

      <div className="relative w-full bg-background rounded-xl border-2 border-border shadow-lg overflow-hidden">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-auto"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
          <div
            className="w-4 h-1 rounded"
            style={{ backgroundColor: lineColor }}
          />
          <span className="text-sm font-medium text-foreground">Data Line</span>
        </div>
        
        {showTrendLine && (
          <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border">
            <div
              className="w-4 h-1 rounded border-dashed border-2"
              style={{ borderColor: trendLineColor }}
            />
            <span className="text-sm font-medium text-foreground">Trend Line</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default D3TrendChart;
