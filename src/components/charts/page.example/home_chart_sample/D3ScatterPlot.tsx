import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export interface ScatterPlotDataPoint {
  [key: string]: string | number;
}

export interface ScatterPlotProps {
  data: ScatterPlotDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKey: string;
  sizeKey?: string;
  colorKey?: string;
  colors?: Record<string, { light: string; dark: string }>;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  animationDuration?: number;
}

const D3ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 50 },
  xAxisKey,
  yAxisKey,
  sizeKey,
  colorKey,
  colors = {},
  title,
  xAxisLabel,
  yAxisLabel,
  showGrid = true,
  animationDuration = 1000,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Default colors
  const defaultColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

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

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => Number(d[xAxisKey])) as [number, number])
      .range([0, innerWidth])
      .nice();

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => Number(d[yAxisKey])) as [number, number])
      .range([innerHeight, 0])
      .nice();

    // Size scale if sizeKey is provided
    const sizeScale = sizeKey ? d3.scaleSqrt()
      .domain(d3.extent(data, d => Number(d[sizeKey])) as [number, number])
      .range([3, 20]) : null;

    // Color scale if colorKey is provided
    const colorScale = colorKey ? d3.scaleOrdinal<string>()
      .domain([...new Set(data.map(d => String(d[colorKey])))])
      .range(defaultColors) : null;

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

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', textColor)
      .style('font-size', '12px');

    g.selectAll('.domain, .tick line')
      .attr('stroke', axisColor);

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', textColor)
      .style('font-size', '12px');

    g.selectAll('.domain, .tick line')
      .attr('stroke', axisColor);

    // Dots
    const dots = g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(Number(d[xAxisKey])))
      .attr('cy', d => yScale(Number(d[yAxisKey])))
      .attr('r', 0)
      .attr('fill', d => {
        if (colorKey && colorScale) {
          const colorValue = String(d[colorKey]);
          return colors[colorValue]?.light || colorScale(colorValue);
        }
        return '#3b82f6';
      })
      .attr('stroke', isDarkMode ? '#374151' : '#ffffff')
      .attr('stroke-width', 1.5)
      .style('opacity', 0.8);

    // Animation
    dots.transition()
      .duration(animationDuration)
      .delay((_, i) => i * 50)
      .attr('r', d => sizeScale && sizeKey ? sizeScale(Number(d[sizeKey])) : 5);

    // Hover effects
    dots
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', sizeScale && sizeKey ? sizeScale(Number(d[sizeKey])) * 1.5 : 7.5)
          .style('opacity', 1);
        
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

        let tooltipContent = `
          <div style="font-weight: 600; margin-bottom: 4px;">${xAxisKey}: ${Number(d[xAxisKey]).toLocaleString()}</div>
          <div style="margin-bottom: 4px;">${yAxisKey}: ${Number(d[yAxisKey]).toLocaleString()}</div>
        `;

        if (sizeKey) {
          tooltipContent += `<div style="margin-bottom: 4px;">${sizeKey}: ${Number(d[sizeKey]).toLocaleString()}</div>`;
        }

        if (colorKey) {
          tooltipContent += `<div>${colorKey}: ${d[colorKey]}</div>`;
        }

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
          .attr('r', (d: any) => sizeScale && sizeKey ? sizeScale(Number(d[sizeKey])) : 5)
          .style('opacity', 0.8);
        
        d3.selectAll('.tooltip').remove();
      });

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

  }, [data, width, height, margin, xAxisKey, yAxisKey, sizeKey, colorKey, colors, showGrid, animationDuration, isDarkMode]);

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

      {/* Legend for color key */}
      {colorKey && (
        <div className="mt-4">
          <div className="flex flex-wrap justify-center gap-3">
            {[...new Set(data.map(d => String(d[colorKey])))].map((value, index) => {
              const color = colors[value]?.light || defaultColors[index % defaultColors.length];
              return (
                <div
                  key={value}
                  className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border"
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default D3ScatterPlot;
