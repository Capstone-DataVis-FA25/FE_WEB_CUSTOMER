import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTranslation } from 'react-i18next';
import { convertArrayToChartData } from '@/utils/dataConverter';

export interface ChartDataPoint {
  [key: string]: number | string;
}

export interface D3BarChartProps {
  data?: ChartDataPoint[];
  arrayData?: (string | number)[][];
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
  fontSize?: { axis: number; label: number; title: number };
  barType?: 'grouped' | 'stacked';
  // Advanced
  gridOpacity?: number;
  legendPosition?: 'top' | 'bottom';
  xAxisRotation?: number;
  yAxisRotation?: number;
  showAxisLabels?: boolean;
  showAxisTicks?: boolean;
  yAxisStart?: 'auto' | 'zero' | number;
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  showTooltip?: boolean;
  barWidth?: number;
  barSpacing?: number;
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
  fontSize = { axis: 12, label: 14, title: 16 },
  barType = 'grouped',
  gridOpacity = 0.5,
  legendPosition = 'bottom',
  xAxisRotation = 0,
  yAxisRotation = 0,
  showAxisLabels = true,
  showAxisTicks = true,
  yAxisStart = 'zero',
  theme = 'auto',
  backgroundColor = 'transparent',
  showTooltip = true,
  barWidth,
  barSpacing = 4,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width, height });
  const { t } = useTranslation();

  // Convert array to data
  const processedData = React.useMemo((): ChartDataPoint[] => {
    if (arrayData && arrayData.length > 0) return convertArrayToChartData(arrayData);
    return data || [];
  }, [arrayData, data]);

  // Resize observer
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      let aspectRatio = height / width;
      if (containerWidth < 640) aspectRatio = Math.min(aspectRatio * 1.2, 0.75);
      else if (containerWidth < 1024) aspectRatio = Math.min(aspectRatio, 0.6);
      else aspectRatio = Math.min(aspectRatio, 0.5);
      const newWidth = Math.min(containerWidth - 16, width);
      const newHeight = newWidth * aspectRatio;
      setDimensions({ width: newWidth, height: newHeight });
    };
    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [width, height]);

  // Theme
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

  useEffect(() => {
    if (!svgRef.current || !processedData.length) return;

    const currentWidth = dimensions.width;
    const currentHeight = dimensions.height;

    // Colors
    const getCurrentColors = () => {
      const mode = isDarkMode ? 'dark' : 'light';
      const result: Record<string, string> = {};
      yAxisKeys.forEach((key, index) => {
        const colorKey = colors[key] ? key : `bar${index + 1}`;
        result[key] = colors[colorKey]?.[mode] || defaultColors[`bar${index + 1}`][mode];
      });
      return result;
    };
    const currentColors = getCurrentColors();

    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const gridColor = isDarkMode ? '#4b5563' : '#9ca3af';
    const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';
    const bgColor =
      backgroundColor !== 'transparent' ? backgroundColor : isDarkMode ? '#111827' : '#ffffff';

    // Clear and setup
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current);

    const responsiveMargin = {
      top: currentWidth < 640 ? margin.top * 0.8 : margin.top,
      right: currentWidth < 640 ? margin.right * 0.7 : margin.right,
      bottom: currentWidth < 640 ? margin.bottom * 0.8 : margin.bottom,
      left: currentWidth < 640 ? margin.left * 0.8 : margin.left,
    };

    const innerWidth = currentWidth - responsiveMargin.left - responsiveMargin.right;
    const innerHeight = currentHeight - responsiveMargin.top - responsiveMargin.bottom;

    svg
      .append('rect')
      .attr('width', currentWidth)
      .attr('height', currentHeight)
      .attr('fill', bgColor)
      .attr('rx', 8);

    svg
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', responsiveMargin.left)
      .attr('height', currentHeight)
      .attr('fill', isDarkMode ? '#111827' : '#f8fafc')
      .attr('opacity', 0.3);

    const g = svg
      .append('g')
      .attr('transform', `translate(${responsiveMargin.left},${responsiveMargin.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(processedData.map(d => String(d[xAxisKey])))
      .range([0, innerWidth])
      .padding(0.2);

    let maxValue: number;
    if (barType === 'stacked') {
      maxValue =
        d3.max(processedData, d => yAxisKeys.reduce((sum, key) => sum + (d[key] as number), 0)) ||
        0;
    } else {
      maxValue = d3.max(processedData, d => d3.max(yAxisKeys, key => d[key] as number) || 0) || 0;
    }

    let yMin = 0;
    if (yAxisStart === 'auto') yMin = 0;
    else if (yAxisStart === 'zero') yMin = 0;
    else if (typeof yAxisStart === 'number') yMin = yAxisStart;

    const yScale = d3
      .scaleLinear()
      .domain([yMin, maxValue * 1.1])
      .range([innerHeight, 0]);

    // Compute inner padding from barSpacing:
    // - If <= 1: treat as fraction (0..0.5)
    // - If > 1: treat as pixels and normalize by parent band width
    const normalizedPadding = (() => {
      if (typeof barSpacing !== 'number') return 0.1;
      if (barSpacing <= 1) return Math.max(0, Math.min(0.5, barSpacing));
      const bw = xScale.bandwidth();
      if (bw <= 0) return 0.1;
      return Math.max(0, Math.min(0.5, barSpacing / bw));
    })();

    const xSubScale = d3
      .scaleBand()
      .domain(yAxisKeys)
      .range([0, xScale.bandwidth()])
      .padding(normalizedPadding);

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
        .attr('opacity', Math.max(0, Math.min(1, gridOpacity * 0.7)));
    }

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d => {
      if (xAxisFormatter) return xAxisFormatter(Number(d));
      return String(d);
    });
    const xAxisGroup = g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis);
    xAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${fontSize.axis}px`)
      .style('font-weight', '500')
      .attr('transform', `rotate(${xAxisRotation})`)
      .style('text-anchor', xAxisRotation === 0 ? 'middle' : xAxisRotation > 0 ? 'start' : 'end');
    xAxisGroup.select('.domain').attr('stroke', axisColor).attr('stroke-width', 2);
    if (showAxisTicks) xAxisGroup.selectAll('.tick line').attr('stroke', axisColor);
    else xAxisGroup.selectAll('.tick line').attr('opacity', 0);

    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat(d => {
        const value = d.valueOf();
        if (yAxisFormatter) return yAxisFormatter(value);
        return value.toLocaleString();
      })
      .tickSize(showAxisTicks ? -5 : 0)
      .tickPadding(8);
    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${fontSize.axis}px`)
      .style('font-weight', '600')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .attr('text-anchor', 'end')
      .attr('x', -10)
      .attr('transform', `rotate(${yAxisRotation})`);
    yAxisGroup
      .select('.domain')
      .attr('stroke', axisColor)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);
    if (showAxisTicks) {
      yAxisGroup
        .selectAll('.tick line')
        .attr('stroke', axisColor)
        .attr('stroke-width', 1)
        .attr('opacity', 0.6);
    } else {
      yAxisGroup.selectAll('.tick line').attr('opacity', 0);
    }

    // Bars
    if (barType === 'grouped') {
      yAxisKeys.forEach((key, keyIndex) => {
        g.selectAll(`.bar-${keyIndex}`)
          .data(processedData)
          .enter()
          .append('rect')
          .attr('class', `bar-${keyIndex}`)
          .attr('x', d => {
            const base = (xScale(String(d[xAxisKey])) || 0) + (xSubScale(key) || 0);
            const subBW = xSubScale.bandwidth();
            // barWidth semantics: <=1 = fraction, >1 = pixels, 0/undefined = auto (full)
            let bw = subBW;
            if (typeof barWidth === 'number') {
              if (barWidth <= 0) bw = subBW;
              else if (barWidth > 0 && barWidth <= 1) bw = subBW * barWidth;
              else bw = Math.min(barWidth, subBW);
            }
            return base + (subBW - bw) / 2;
          })
          .attr('y', innerHeight)
          .attr('width', () => {
            const subBW = xSubScale.bandwidth();
            if (typeof barWidth !== 'number' || barWidth <= 0) return subBW;
            if (barWidth <= 1) return subBW * barWidth; // fraction
            return Math.min(barWidth, subBW); // pixels
          })
          .attr('height', 0)
          .attr('fill', currentColors[key])
          .attr('rx', 4)
          .attr('ry', 4)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
          .on('mouseover', function (_event, d) {
            if (!showTooltip) return;
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))')
              .attr('opacity', 0.8);

            const tooltip = g
              .append('g')
              .attr('class', 'tooltip')
              .attr(
                'transform',
                `translate(${(xScale(String(d[xAxisKey])) || 0) + (xSubScale(key) || 0) + xSubScale.bandwidth() / 2}, ${yScale(d[key] as number) - 15})`
              );
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
            const value =
              typeof d[key] === 'number' ? (d[key] as number).toLocaleString() : (d[key] as string);
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
            if (!showTooltip) return;
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))')
              .attr('opacity', 0.8);
            const value = d[1] - d[0];
            const tooltip = g
              .append('g')
              .attr('class', 'tooltip')
              .attr(
                'transform',
                `translate(${(xScale(String(d.data[xAxisKey])) || 0) + xScale.bandwidth() / 2}, ${yScale(d[1]) - 10})`
              );
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
            tooltipBg.transition().duration(100).style('opacity', 1);
            tooltip.selectAll('text').transition().duration(100).style('opacity', 1);
          })
          .on('mouseout', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
              .attr('opacity', 1);
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

    // Axis labels
    if (xAxisLabel && showAxisLabels) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + (currentWidth < 768 ? 40 : 50))
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${fontSize.label}px`)
        .style('font-weight', '600')
        .text(xAxisLabel);
    }
    if (yAxisLabel && showAxisLabels) {
      g.append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -innerHeight / 2)
        .attr('y', currentWidth < 768 ? -55 : -65)
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
    gridOpacity,
    xAxisRotation,
    yAxisRotation,
    showAxisLabels,
    showAxisTicks,
    yAxisStart,
    backgroundColor,
    showTooltip,
    barWidth,
    barSpacing,
  ]);

  const renderLegend = () => (
    <div className="w-full">
      <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h4 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 text-center">
          {t('legend')}
        </h4>
        <div
          className="grid w-full gap-3 sm:gap-4 justify-items-stretch"
          style={{ gridTemplateColumns: `repeat(${yAxisKeys.length}, minmax(0, 1fr))` }}
        >
          {yAxisKeys.map((key, index) => {
            const colorKey = colors[key] ? key : `bar${index + 1}`;
            const color =
              colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] ||
              defaultColors[`bar${index + 1}`][isDarkMode ? 'dark' : 'light'];
            return (
              <div
                key={key}
                className="flex items-center justify-between w-full gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
              >
                <div className="flex-shrink-0">
                  <div
                    className="w-2 h-2 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors duration-200"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                  {key}
                </span>
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
  );

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

      {showLegend && legendPosition === 'top' && renderLegend()}

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

      {showLegend && legendPosition === 'bottom' && renderLegend()}
    </div>
  );
};

export default D3BarChart;
