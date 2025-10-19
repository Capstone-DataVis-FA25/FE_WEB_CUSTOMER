import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export interface D3ScatterChartProps {
  arrayData?: (string | number)[][];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKey: string;
  colorKey?: string;
  pointRadius?: number;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  colors?: Record<string, string>;
  backgroundColor?: string;
}

export interface ScatterDataPoint {
  [key: string]: number | string;
}

function convertArrayToScatterData(arrayData: (string | number)[][]): ScatterDataPoint[] {
  if (!arrayData || arrayData.length < 2) return [];
  const headers = arrayData[0] as string[];
  return arrayData.slice(1).map(row => {
    const point: ScatterDataPoint = {};
    headers.forEach((header, i) => {
      point[header] = row[i];
    });
    return point;
  });
}

const D3ScatterChart: React.FC<D3ScatterChartProps> = ({
  arrayData,
  width = 800,
  height = 500,
  margin = { top: 40, right: 40, bottom: 60, left: 60 },
  xAxisKey,
  yAxisKey,
  colorKey,
  pointRadius = 5,
  title,
  xAxisLabel,
  yAxisLabel,
  showGrid = true,
  showLegend = false,
  colors = {},
  backgroundColor = 'transparent',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = React.useMemo(() => convertArrayToScatterData(arrayData || []), [arrayData]);

  useEffect(() => {
    if (!svgRef.current || !data.length) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Background
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', backgroundColor)
      .attr('rx', 8);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // X scale
    const xValues = data.map(d => +d[xAxisKey]);
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(xValues) as [number, number])
      .nice()
      .range([0, innerWidth]);

    // Y scale
    const yValues = data.map(d => +d[yAxisKey]);
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(yValues) as [number, number])
      .nice()
      .range([innerHeight, 0]);

    // Color scale
    let colorScale: d3.ScaleOrdinal<string, string> | undefined;
    if (colorKey) {
      const unique = Array.from(new Set(data.map(d => d[colorKey] as string)));
      colorScale = d3
        .scaleOrdinal<string>()
        .domain(unique)
        .range(unique.map((k, i) => colors[k] || d3.schemeCategory10[i % 10]));
    }

    // Grid lines
    if (showGrid) {
      g.selectAll('.grid-line-x')
        .data(xScale.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-line-x')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
      g.selectAll('.grid-line-y')
        .data(yScale.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-line-y')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
    }

    // X Axis
    const xAxis = d3.axisBottom(xScale).ticks(8);
    const xAxisGroup = g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);
    xAxisGroup.selectAll('text').attr('font-size', 12);

    // Y Axis
    const yAxis = d3.axisLeft(yScale).ticks(8);
    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.selectAll('text').attr('font-size', 12);

    // Axis labels
    if (xAxisLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 40)
        .attr('text-anchor', 'middle')
        .attr('fill', '#374151')
        .style('font-size', '14px')
        .text(xAxisLabel);
    }
    if (yAxisLabel) {
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('fill', '#374151')
        .style('font-size', '14px')
        .text(yAxisLabel);
    }

    // Title
    if (title) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#111827')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text(title);
    }

    // Draw points
    g.selectAll('.scatter-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'scatter-point')
      .attr('cx', d => xScale(+d[xAxisKey]))
      .attr('cy', d => yScale(+d[yAxisKey]))
      .attr('r', pointRadius)
      .attr('fill', d => (colorKey && colorScale ? colorScale(d[colorKey] as string) : '#3b82f6'))
      .attr('opacity', 0.8);

    // Legend
    if (showLegend && colorKey && colorScale) {
      const legend = svg.append('g').attr('class', 'legend');
      const unique = colorScale.domain();
      unique.forEach((val, i) => {
        legend
          .append('circle')
          .attr('cx', width - margin.right - 20)
          .attr('cy', margin.top + i * 24)
          .attr('r', 7)
          .attr('fill', colorScale(val));
        legend
          .append('text')
          .attr('x', width - margin.right)
          .attr('y', margin.top + i * 24 + 5)
          .attr('font-size', 13)
          .attr('fill', '#374151')
          .text(val);
      });
    }
  }, [
    arrayData,
    width,
    height,
    margin,
    xAxisKey,
    yAxisKey,
    colorKey,
    pointRadius,
    title,
    xAxisLabel,
    yAxisLabel,
    showGrid,
    showLegend,
    colors,
    backgroundColor,
  ]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

export default D3ScatterChart;
