import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export interface PieChartDataPoint {
  [key: string]: string | number;
}

export interface PieChartProps {
  data: PieChartDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  valueKey: string;
  labelKey: string;
  colors?: Record<string, { light: string; dark: string }>;
  title?: string;
  showLegend?: boolean;
  animationDuration?: number;
  innerRadius?: number;
}

const D3PieChart: React.FC<PieChartProps> = ({
  data,
  width = 600,
  height = 600,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  valueKey,
  labelKey,
  colors = {},
  title,
  showLegend = true,
  animationDuration = 1000,
  innerRadius = 0,
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
    '#84cc16',
    '#f97316',
    '#6366f1',
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
    const radius = Math.min(innerWidth, innerHeight) / 2;

    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create pie layout
    const pie = d3
      .pie<PieChartDataPoint>()
      .value(d => Number(d[valueKey]))
      .sort(null);

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<PieChartDataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(radius - 10);

    const labelArc = d3
      .arc<d3.PieArcDatum<PieChartDataPoint>>()
      .innerRadius(radius - 40)
      .outerRadius(radius - 40);

    // Color scale
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(data.map(d => String(d[labelKey])))
      .range(defaultColors);

    // Create arcs
    const arcs = g.selectAll('.arc').data(pie(data)).enter().append('g').attr('class', 'arc');

    // Add paths
    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', d => {
        const label = String(d.data[labelKey]);
        return colors[label]?.light || colorScale(label);
      })
      .attr('stroke', isDarkMode ? '#374151' : '#ffffff')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .transition()
      .duration(animationDuration)
      .style('opacity', 1)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || '';
        };
      });

    // Add labels
    if (showLegend) {
      arcs
        .append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .style('fill', isDarkMode ? '#f3f4f6' : '#1f2937')
        .style('opacity', 0)
        .text(d => {
          const percentage = (
            (Number(d.data[valueKey]) / d3.sum(data, d => Number(d[valueKey]))) *
            100
          ).toFixed(1);
          return `${percentage}%`;
        })
        .transition()
        .delay(animationDuration / 2)
        .duration(animationDuration / 2)
        .style('opacity', 1);
    }

    // Add hover effects
    arcs
      .selectAll('path')
      .on('mouseenter', function (event, d) {
        d3.select(this).transition().duration(200).attr('transform', 'scale(1.05)');

        // Tooltip
        const tooltip = d3
          .select('body')
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', isDarkMode ? '#1f2937' : 'white')
          .style('border', `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`)
          .style('border-radius', '6px')
          .style('padding', '8px 12px')
          .style('font-size', '12px')
          .style('color', isDarkMode ? '#f3f4f6' : '#1f2937')
          // .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
          .style('pointer-events', 'none')
          .style('z-index', '1000')
          .style('opacity', 0);

        const arcData = d as d3.PieArcDatum<PieChartDataPoint>;
        tooltip.html(`
          <div style="font-weight: 600; margin-bottom: 4px;">${arcData.data[labelKey]}</div>
          <div>${valueKey}: ${Number(arcData.data[valueKey]).toLocaleString()}</div>
        `);

        tooltip.transition().duration(200).style('opacity', 1);

        tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 10 + 'px');
      })
      .on('mouseleave', function () {
        d3.select(this).transition().duration(200).attr('transform', 'scale(1)');

        d3.selectAll('.tooltip').remove();
      });
  }, [
    data,
    width,
    height,
    margin,
    valueKey,
    labelKey,
    colors,
    showLegend,
    animationDuration,
    innerRadius,
    isDarkMode,
  ]);

  return (
    <div
      className={`w-full ${isDarkMode ? 'bg-[#18181b] border-[#23232a]' : 'bg-white border-[#e5e7eb]'} h-full flex flex-col items-center justify-center`}
    >
      {title && (
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground text-center mb-2">
          {title}
        </h3>
      )}
      <div
        className={`relative w-full h-full flex items-center justify-center rounded-xl border-2 overflow-hidden p-0 ${isDarkMode ? 'bg-[#18181b] border-[#23232a]' : 'bg-white border-[#e5e7eb]'}`}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="w-full h-full block"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        />
      </div>
      {/* Legend */}
      {showLegend && (
        <div className="mt-4 w-full">
          <div
            className={`rounded-xl p-4 flex flex-wrap justify-center gap-4 ${isDarkMode ? 'bg-[#18181b] border-2 border-[#23232a]' : 'bg-white border-2 border-[#e5e7eb]'}`}
          >
            {data.map((item, index) => {
              const label = String(item[labelKey]);
              const color = colors[label]?.light || defaultColors[index % defaultColors.length];
              return (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${isDarkMode ? 'bg-[#23232a] border-[#23232a]' : 'bg-[#f3f4f6] border-[#e5e7eb]'}`}
                >
                  <div
                    className="w-4 h-4 rounded border-2 border-border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-foreground capitalize">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default D3PieChart;
