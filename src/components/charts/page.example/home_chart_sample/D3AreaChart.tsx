import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export interface AreaChartDataPoint {
  [key: string]: string | number;
}

export interface AreaChartProps {
  data: AreaChartDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKey: string;
  groupKey?: string;
  colors?: Record<string, { light: string; dark: string }>;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  animationDuration?: number;
  isStacked?: boolean;
  showLegend?: boolean;
}

const D3AreaChart: React.FC<AreaChartProps> = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 50 },
  xAxisKey,
  yAxisKey,
  groupKey,
  colors = {},
  title,
  xAxisLabel,
  yAxisLabel,
  showGrid = true,
  animationDuration = 1000,
  isStacked = false,
  showLegend = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Default colors
  const defaultColors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
  ];

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

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Prepare data
    let chartData: any[] = [];

    if (groupKey) {
      const grouped = d3.group(data, d => d[groupKey]);
      const categories = Array.from(grouped.keys()) as string[];

      if (isStacked) {
        // Stack data for stacked area chart
        const stackData = d3
          .stack<any>()
          .keys(categories)
          .value((d, key) => {
            const found = grouped.get(key)?.find(item => item[xAxisKey] === d[xAxisKey]);
            return found ? Number(found[yAxisKey]) : 0;
          });

        const xValues = [...new Set(data.map(d => d[xAxisKey]))].sort((a, b) =>
          typeof a === 'number' && typeof b === 'number'
            ? a - b
            : String(a).localeCompare(String(b))
        );

        const processedData = xValues.map(x => {
          const dataPoint: any = { [xAxisKey]: x };
          categories.forEach(cat => {
            const found = grouped.get(cat)?.find(item => item[xAxisKey] === x);
            dataPoint[cat] = found ? Number(found[yAxisKey]) : 0;
          });
          return dataPoint;
        });

        chartData = stackData(processedData);
      } else {
        chartData = categories.map(cat => ({
          key: cat,
          values: grouped.get(cat) || [],
        }));
      }
    } else {
      chartData = [
        {
          key: 'default',
          values: [...data].sort((a, b) => {
            const aVal = a[xAxisKey];
            const bVal = b[xAxisKey];
            return typeof aVal === 'number' && typeof bVal === 'number'
              ? aVal - bVal
              : String(aVal).localeCompare(String(bVal));
          }),
        },
      ];
    }

    // Scales
    let xScale: any;
    let yScale: any;

    if (isStacked && groupKey) {
      const xValues = [...new Set(data.map(d => d[xAxisKey]))].sort((a, b) =>
        typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))
      );

      xScale =
        typeof xValues[0] === 'number'
          ? d3
              .scaleLinear()
              .domain(d3.extent(xValues as number[]) as [number, number])
              .range([0, innerWidth])
          : d3
              .scaleBand()
              .domain(xValues as string[])
              .range([0, innerWidth])
              .padding(0.1);

      const maxStackValue = d3.max(chartData as any[][], series => d3.max(series, d => d[1])) || 0;
      yScale = d3.scaleLinear().domain([0, maxStackValue]).range([innerHeight, 0]).nice();
    } else {
      const allValues = data.map(d => d[xAxisKey]);
      xScale =
        typeof allValues[0] === 'number'
          ? d3
              .scaleLinear()
              .domain(d3.extent(allValues as number[]) as [number, number])
              .range([0, innerWidth])
          : d3
              .scaleBand()
              .domain(allValues as string[])
              .range([0, innerWidth])
              .padding(0.1);

      const maxY = d3.max(data, d => Number(d[yAxisKey])) || 0;
      yScale = d3.scaleLinear().domain([0, maxY]).range([innerHeight, 0]).nice();
    }

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(groupKey ? [...new Set(data.map(d => String(d[groupKey])))] : ['default'])
      .range(defaultColors);

    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const gridColor = isDarkMode ? '#4b5563' : '#e5e7eb';
    const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';

    // Grid lines
    if (showGrid) {
      // Vertical grid lines
      const xTicks = typeof xScale.ticks === 'function' ? xScale.ticks() : xScale.domain();
      g.selectAll('.grid-line-x')
        .data(xTicks)
        .enter()
        .append('line')
        .attr('class', 'grid-line-x')
        .attr('x1', d =>
          typeof xScale.bandwidth === 'function' ? xScale(d) + xScale.bandwidth() / 2 : xScale(d)
        )
        .attr('x2', d =>
          typeof xScale.bandwidth === 'function' ? xScale(d) + xScale.bandwidth() / 2 : xScale(d)
        )
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

    // Define area generator
    const area = d3
      .area<any>()
      .x(d =>
        typeof xScale.bandwidth === 'function'
          ? xScale(d.data[xAxisKey]) + xScale.bandwidth() / 2
          : xScale(d.data[xAxisKey])
      )
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    const simpleArea = d3
      .area<any>()
      .x(d =>
        typeof xScale.bandwidth === 'function'
          ? xScale(d[xAxisKey]) + xScale.bandwidth() / 2
          : xScale(d[xAxisKey])
      )
      .y0(innerHeight)
      .y1(d => yScale(Number(d[yAxisKey])))
      .curve(d3.curveMonotoneX);

    // Create areas
    if (isStacked && groupKey) {
      // Stacked areas
      const areas = g
        .selectAll('.area')
        .data(chartData as any[][])
        .enter()
        .append('path')
        .attr('class', 'area')
        .attr('fill', (_, i) => {
          const categories = [...new Set(data.map(d => String(d[groupKey])))];
          const category = categories[i];
          return colors[category]?.light || colorScale(category);
        })
        .attr('stroke', 'none')
        .attr('opacity', 0.7);

      // Animation
      areas
        .attr('d', (d: any) => {
          const zeroData = d.map((point: any) => ({ ...point, [0]: point[0], [1]: point[0] }));
          return area(zeroData);
        })
        .transition()
        .duration(animationDuration)
        .attr('d', area as any);
    } else {
      // Regular areas
      chartData.forEach((group: any, index: number) => {
        const areaPath = g
          .append('path')
          .datum(group.values)
          .attr('class', 'area')
          .attr('fill', colors[group.key]?.light || colorScale(group.key))
          .attr('stroke', 'none')
          .attr('opacity', 0.7);

        // Animation
        const zeroLine = simpleArea.y1(innerHeight);
        areaPath
          .attr('d', zeroLine as any)
          .transition()
          .duration(animationDuration)
          .delay(index * 200)
          .attr('d', simpleArea as any);
      });
    }

    // X Axis
    const xAxis =
      typeof xScale.bandwidth === 'function'
        ? d3.axisBottom(xScale)
        : d3.axisBottom(xScale).ticks(6);

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', textColor)
      .style('font-size', '12px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', textColor)
      .style('font-size', '12px');

    g.selectAll('.domain, .tick line').attr('stroke', axisColor);

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
  }, [
    data,
    width,
    height,
    margin,
    xAxisKey,
    yAxisKey,
    groupKey,
    colors,
    showGrid,
    animationDuration,
    isStacked,
    isDarkMode,
  ]);

  const legendData = groupKey ? [...new Set(data.map(d => String(d[groupKey])))] : [];

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
      {showLegend && groupKey && legendData.length > 1 && (
        <div className="mt-4">
          <div className="flex flex-wrap justify-center gap-3">
            {legendData.map((category, index) => {
              const color = colors[category]?.light || defaultColors[index % defaultColors.length];
              return (
                <div
                  key={category}
                  className="flex items-center gap-2 px-3 py-2 bg-card rounded-lg border border-border"
                >
                  <div
                    className="w-4 h-4 rounded border-2 border-border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-foreground">{category}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default D3AreaChart;
