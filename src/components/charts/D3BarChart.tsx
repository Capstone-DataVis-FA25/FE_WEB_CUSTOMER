import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTranslation } from 'react-i18next';

export interface ChartDataPoint {
  [key: string]: number | string;
}

export interface D3BarChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKeys: string[];
  colors?: Record<string, { light: string; dark: string }>;
  title?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  animationDuration?: number;
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: number) => string;
  barType?: 'grouped' | 'stacked';
}

const defaultColors: Record<string, { light: string; dark: string }> = {
  bar1: { light: '#1f2937', dark: '#374151' },
  bar2: { light: '#4b5563', dark: '#6b7280' },
  bar3: { light: '#6b7280', dark: '#9ca3af' },
  bar4: { light: '#374151', dark: '#4b5563' },
  bar5: { light: '#111827', dark: '#1f2937' },
  bar6: { light: '#0f172a', dark: '#1e293b' },
  bar7: { light: '#27272a', dark: '#3f3f46' },
  bar8: { light: '#18181b', dark: '#27272a' },
};

const D3BarChart: React.FC<D3BarChartProps> = ({
  data,
  width = 800,
  height = 600,
  margin = { top: 20, right: 40, bottom: 60, left: 80 },
  xAxisKey,
  yAxisKeys,
  colors = defaultColors,
  title,
  yAxisLabel,
  xAxisLabel,
  showLegend = true,
  showGrid = true,
  animationDuration = 1000,
  yAxisFormatter,
  xAxisFormatter,
  barType = 'grouped',
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
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const currentWidth = dimensions.width;
    const currentHeight = dimensions.height;

    // Get current theme colors
    const getCurrentColors = () => {
      const theme = isDarkMode ? 'dark' : 'light';
      const result: Record<string, string> = {};
      yAxisKeys.forEach((key, index) => {
        const colorKey = colors[key] ? key : `bar${index + 1}`;
        result[key] = colors[colorKey]?.[theme] || defaultColors[`bar${index + 1}`][theme];
      });
      return result;
    };

    const currentColors = getCurrentColors();

    // Theme-aware colors
    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const gridColor = isDarkMode ? '#4b5563' : '#9ca3af';
    const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);

    // Responsive margin adjustments
    const responsiveMargin = {
      top: currentWidth < 640 ? margin.top * 0.8 : margin.top,
      right: currentWidth < 640 ? margin.right * 0.8 : margin.right,
      bottom: currentWidth < 640 ? margin.bottom * 1.2 : margin.bottom,
      left: currentWidth < 640 ? margin.left * 0.9 : margin.left,
    };

    const innerWidth = currentWidth - responsiveMargin.left - responsiveMargin.right;
    const innerHeight = currentHeight - responsiveMargin.top - responsiveMargin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${responsiveMargin.left},${responsiveMargin.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map(d => String(d[xAxisKey])))
      .range([0, innerWidth])
      .padding(0.2);

    // Get max value for y scale
    let maxValue: number;
    if (barType === 'stacked') {
      maxValue =
        d3.max(data, d => yAxisKeys.reduce((sum, key) => sum + (d[key] as number), 0)) || 0;
    } else {
      maxValue = d3.max(data, d => d3.max(yAxisKeys, key => d[key] as number) || 0) || 0;
    }

    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([innerHeight, 0]);

    // Create scales for grouped bars
    const xSubScale = d3.scaleBand().domain(yAxisKeys).range([0, xScale.bandwidth()]).padding(0.1);

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
        .attr('opacity', isDarkMode ? 0.5 : 0.7);
    }

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d => {
      if (xAxisFormatter) {
        return xAxisFormatter(Number(d));
      }
      return String(d);
    });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', currentWidth < 768 ? '10px' : '12px')
      .style('font-weight', '500');

    g.select('.domain').attr('stroke', axisColor).attr('stroke-width', 2);

    g.selectAll('.tick line').attr('stroke', axisColor);

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
      .tickSize(-5)
      .tickPadding(8);

    const yAxisGroup = g.append('g').call(yAxis);

    yAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', currentWidth < 768 ? '11px' : '13px')
      .style('font-weight', '600')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .attr('text-anchor', 'end')
      .attr('x', -10);

    yAxisGroup
      .select('.domain')
      .attr('stroke', axisColor)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    yAxisGroup
      .selectAll('.tick line')
      .attr('stroke', axisColor)
      .attr('stroke-width', 1)
      .attr('opacity', 0.6);

    // Create bars
    if (barType === 'grouped') {
      // Grouped bars
      yAxisKeys.forEach((key, keyIndex) => {
        g.selectAll(`.bar-${keyIndex}`)
          .data(data)
          .enter()
          .append('rect')
          .attr('class', `bar-${keyIndex}`)
          .attr('x', d => (xScale(String(d[xAxisKey])) || 0) + (xSubScale(key) || 0))
          .attr('y', innerHeight)
          .attr('width', xSubScale.bandwidth())
          .attr('height', 0)
          .attr('fill', currentColors[key])
          .attr('rx', 4)
          .attr('ry', 4)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
          .on('mouseover', function (_event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))')
              .attr('opacity', 0.8);

            // Create minimal tooltip like stock apps
            const tooltip = g
              .append('g')
              .attr('class', 'tooltip')
              .attr(
                'transform',
                `translate(${(xScale(String(d[xAxisKey])) || 0) + (xSubScale(key) || 0) + xSubScale.bandwidth() / 2}, ${yScale(d[key] as number) - 10})`
              );

            // Simple background
            const tooltipBg = tooltip
              .append('rect')
              .attr('x', -25)
              .attr('y', -20)
              .attr('width', 50)
              .attr('height', 16)
              .attr('fill', isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)')
              .attr('stroke', currentColors[key])
              .attr('stroke-width', 1)
              .attr('rx', 3)
              .style('filter', 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.2))')
              .style('opacity', 0);

            // Value only
            const value = typeof d[key] === 'number' ? d[key].toLocaleString() : d[key];
            const tooltipText = tooltip
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('y', -8)
              .attr('fill', textColor)
              .style('font-size', '11px')
              .style('font-weight', '500')
              .style('font-family', 'monospace')
              .style('opacity', 0)
              .text(value);

            // Smooth animation
            tooltipBg.transition().duration(100).style('opacity', 1);
            tooltipText.transition().duration(100).style('opacity', 1);
          })
          .on('mouseout', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
              .attr('opacity', 1);

            // Quick fade out
            g.select('.tooltip').transition().duration(100).style('opacity', 0).remove();
          })
          .transition()
          .delay(keyIndex * 100)
          .duration(animationDuration)
          .ease(d3.easeBackOut)
          .attr('y', d => yScale(d[key] as number))
          .attr('height', d => innerHeight - yScale(d[key] as number));
      });
    } else {
      // Stacked bars
      const stackedData = d3
        .stack<ChartDataPoint>()
        .keys(yAxisKeys)
        .value((d, key) => d[key] as number)(data);

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
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))')
              .attr('opacity', 0.8);

            // Create minimal tooltip for stacked bars
            const value = d[1] - d[0];
            const tooltip = g
              .append('g')
              .attr('class', 'tooltip')
              .attr(
                'transform',
                `translate(${(xScale(String(d.data[xAxisKey])) || 0) + xScale.bandwidth() / 2}, ${yScale(d[1]) - 10})`
              );

            // Simple background
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

            // Value only
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

            // Smooth animation
            tooltipBg.transition().duration(100).style('opacity', 1);
            tooltip.selectAll('text').transition().duration(100).style('opacity', 1);
          })
          .on('mouseout', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
              .attr('opacity', 1);

            // Quick fade out
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

    // Add axis labels
    if (xAxisLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + (currentWidth < 768 ? 40 : 50))
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', currentWidth < 768 ? '12px' : '14px')
        .style('font-weight', '600')
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      g.append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -innerHeight / 2)
        .attr('y', currentWidth < 768 ? -55 : -65)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', currentWidth < 768 ? '12px' : '14px')
        .style('font-weight', '600')
        .text(yAxisLabel);
    }
  }, [
    data,
    margin,
    xAxisKey,
    yAxisKeys,
    colors,
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
    barType,
  ]);

  return (
    <div ref={containerRef} className="w-full space-y-4">
      {title && (
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground text-center">
          {title}
        </h3>
      )}

      {/* Chart Container */}
      <div className="relative w-full bg-background rounded-xl border-2 border-border shadow-lg overflow-hidden">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      {/* Legend - Modern, compact, responsive */}
      {showLegend && (
        <div className="w-full flex flex-col items-center">
          <div className="bg-card rounded-2xl px-4 py-3 border border-border shadow-sm max-w-xl w-full">
            <h4 className="text-base font-bold text-foreground mb-2 text-center tracking-wide">
              {t('legend')}
            </h4>
            <div className="flex flex-wrap justify-center gap-3">
              {yAxisKeys.map((key, index) => {
                const colorKey = colors[key] ? key : `bar${index + 1}`;
                const color =
                  colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] ||
                  defaultColors[`bar${index + 1}`][isDarkMode ? 'dark' : 'light'];
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 px-3 py-2 bg-background rounded-xl border border-border"
                    style={{ minWidth: 110 }}
                  >
                    <div
                      className="w-5 h-5 rounded-full border-2 border-border"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="text-base font-semibold text-foreground capitalize"
                      style={{ letterSpacing: 0.5 }}
                    >
                      {key}
                    </span>
                    <div className="flex-1 flex justify-end">
                      <div
                        className="w-6 h-2 rounded-full opacity-70"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default D3BarChart;
