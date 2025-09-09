import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTranslation } from 'react-i18next';
import { convertArrayToChartData } from '@/utils/dataConverter';

export interface ChartDataPoint {
  [key: string]: number | string;
}

export interface D3BarChartProps {
  data?: ChartDataPoint[];
  arrayData?: (string | number)[][]; // New prop for array data
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
  fontSize?: { axis: number; label: number; title: number }; // Add fontSize prop
  barType?: 'grouped' | 'stacked';
}

const defaultColors: Record<string, { light: string; dark: string }> = {
  bar1: { light: '#3b82f6', dark: '#60a5fa' },
  bar2: { light: '#f97316', dark: '#fb923c' },
  bar3: { light: '#6b7280', dark: '#9ca3af' },
  bar4: { light: '#eab308', dark: '#facc15' },
  bar5: { light: '#ef4444', dark: '#f87171' },
  bar6: { light: '#10b981', dark: '#34d399' },
  bar7: { light: '#8b5cf6', dark: '#a78bfa' },
  bar8: { light: '#f59e0b', dark: '#fbbf24' },
};

const D3BarChart: React.FC<D3BarChartProps> = ({
  data,
  arrayData,
  width = 800,
  height = 600, // Reduced from 500 to 400 for better proportions
  margin = { top: 20, right: 40, bottom: 60, left: 80 }, // Increased left margin for better Y-axis spacing
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
  fontSize = { axis: 12, label: 14, title: 16 }, // Default fontSize
  barType = 'grouped',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width, height });
  const { t } = useTranslation();

  // Convert arrayData to ChartDataPoint[] if provided
  const processedData = React.useMemo((): ChartDataPoint[] => {
    if (arrayData && arrayData.length > 0) {
      return convertArrayToChartData(arrayData);
    }

    return data || [];
  }, [data, arrayData]);

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
    if (!svgRef.current || !processedData.length) return;

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
    const backgroundColor = isDarkMode ? '#111827' : '#ffffff';

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);

    // Responsive margin adjustments - better spacing for Y-axis
    const responsiveMargin = {
      top: currentWidth < 640 ? margin.top * 0.8 : margin.top,
      right: currentWidth < 640 ? margin.right * 0.7 : margin.right,
      bottom: currentWidth < 640 ? margin.bottom * 0.8 : margin.bottom,
      left: currentWidth < 640 ? margin.left * 0.8 : margin.left, // Better left spacing on mobile
    };

    // Set dimensions
    const innerWidth = currentWidth - responsiveMargin.left - responsiveMargin.right;
    const innerHeight = currentHeight - responsiveMargin.top - responsiveMargin.bottom;

    // Add background
    svg
      .append('rect')
      .attr('width', currentWidth)
      .attr('height', currentHeight)
      .attr('fill', backgroundColor)
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
      .scaleBand()
      .domain(processedData.map(d => String(d[xAxisKey])))
      .range([0, innerWidth])
      .padding(0.2);

    // Get max value for y scale
    let maxValue: number;
    if (barType === 'stacked') {
      maxValue =
        d3.max(processedData, d => yAxisKeys.reduce((sum, key) => sum + (d[key] as number), 0)) ||
        0;
    } else {
      maxValue = d3.max(processedData, d => d3.max(yAxisKeys, key => d[key] as number) || 0) || 0;
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
        .attr('opacity', isDarkMode ? 0.5 : 0.7); // Better opacity for light mode

      // Vertical grid lines
      g.selectAll('.grid-line-vertical')
        .data(xScale.domain())
        .enter()
        .append('line')
        .attr('class', 'grid-line-vertical')
        .attr('x1', d => (xScale(d) || 0) + xScale.bandwidth() / 2)
        .attr('x2', d => (xScale(d) || 0) + xScale.bandwidth() / 2)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', isDarkMode ? 0.3 : 0.5); // Better opacity for light mode
    }

    // X Axis with flexible formatting
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
      .style('font-size', `${fontSize.axis}px`)
      .style('font-weight', '500');

    g.select('.domain').attr('stroke', axisColor).attr('stroke-width', 2);

    g.selectAll('.tick line').attr('stroke', axisColor);

    // Y Axis with flexible formatting
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat(d => {
        const value = d.valueOf();
        // Use custom formatter if provided, otherwise use simple number formatting
        if (yAxisFormatter) {
          return yAxisFormatter(value);
        }
        return value.toLocaleString();
      })
      .tickSize(-5) // Shorter tick lines for cleaner look
      .tickPadding(8); // More space between ticks and labels

    const yAxisGroup = g.append('g').call(yAxis);

    // Style Y-axis labels beautifully
    yAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${fontSize.axis}px`)
      .style('font-weight', '600')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .attr('text-anchor', 'end')
      .attr('x', -10); // Push labels further left for better spacing

    // Style Y-axis domain line
    yAxisGroup
      .select('.domain')
      .attr('stroke', axisColor)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Style Y-axis tick lines
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
          .data(processedData)
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

            // Create enhanced tooltip
            const tooltip = g
              .append('g')
              .attr('class', 'tooltip')
              .attr(
                'transform',
                `translate(${(xScale(String(d[xAxisKey])) || 0) + (xSubScale(key) || 0) + xSubScale.bandwidth() / 2}, ${yScale(d[key] as number) - 15})`
              );

            // Tooltip background with shadow
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

            // Tooltip text with better formatting
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
        .value((d, key) => d[key] as number)(processedData);

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

    // Add axis labels with responsive font sizes
    if (xAxisLabel) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + (currentWidth < 768 ? 40 : 50))
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${fontSize.label}px`)
        .style('font-weight', '600')
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      g.append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -innerHeight / 2)
        .attr('y', currentWidth < 768 ? -55 : -65) // Increased distance from Y-axis
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${fontSize.label}px`)
        .style('font-weight', '600')
        .text(yAxisLabel);
    }
  }, [
    processedData,
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
    fontSize,
    barType,
  ]);

  return (
    <div ref={containerRef} className="w-full space-y-4">
      {title && (
        <h3
          className="font-bold text-gray-900 dark:text-white text-center"
          style={{ fontSize: `${fontSize.title}px` }}
        >
          {title}
        </h3>
      )}

      {/* Chart Container */}
      <div className="relative w-full bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden pl-3">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      {/* Beautiful Legend Below Chart */}
      {showLegend && (
        <div className="inline-flex">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 text-center">
              {t('legend')}
            </h4>

            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 justify-items-center">
              {yAxisKeys.map((key, index) => {
                const colorKey = colors[key] ? key : `bar${index + 1}`;
                const color =
                  colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] ||
                  defaultColors[`bar${index + 1}`][isDarkMode ? 'dark' : 'light'];

                return (
                  <div
                    key={key}
                    className="flex items-center min-w-[140px] max-w-[180px] gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
                  >
                    {/* Color Indicator */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-2 h-2 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors duration-200"
                        style={{ backgroundColor: color }}
                      />
                    </div>
                    {/* Label */}
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                      {key}
                    </span>
                    {/* Bar Preview */}
                    <div className="flex-1 flex justify-end">
                      <div
                        className="w-8 sm:w-12 h-2 sm:h-3 rounded opacity-60 group-hover:opacity-100 transition-opacity duration-200"
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
