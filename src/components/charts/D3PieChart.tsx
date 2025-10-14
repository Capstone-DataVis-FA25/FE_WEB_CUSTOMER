import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { defaultColorsChart } from '@/utils/Utils';

function convertArrayToChartData(arrayData: (string | number)[][]): ChartDataPoint[] {
  if (!arrayData || arrayData.length === 0) return [];

  const headers = arrayData[0];
  const dataRows = arrayData.slice(1);

  return dataRows.map(row => {
    const dataPoint: ChartDataPoint = {};
    headers.forEach((header, index) => {
      const value = row[index];

      if (index === 0) {
        // First column is typically the label
        dataPoint[String(header)] = String(value);
      } else {
        // Other columns are numeric values
        dataPoint[String(header)] =
          typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      }
    });
    return dataPoint;
  });
}

export interface ChartDataPoint {
  [key: string]: number | string;
}

export interface D3PieChartProps {
  arrayData?: (string | number)[][]; // Array data input
  data?: ChartDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  labelKey: string;
  valueKey: string;
  colors?: Record<string, { light: string; dark: string }>;

  // Chart settings
  title?: string;
  showTitle?: boolean;
  showLegend?: boolean;
  showLabels?: boolean;
  showPercentage?: boolean;
  showSliceValues?: boolean;
  animationDuration?: number;

  // Pie-specific settings
  innerRadius?: number; // For donut chart (0-1, percentage of outer radius)
  cornerRadius?: number;
  padAngle?: number; // Angle between slices in radians
  startAngle?: number; // Start angle in degrees
  endAngle?: number; // End angle in degrees
  sortSlices?: 'ascending' | 'descending' | 'none';
  sliceOpacity?: number;

  // Visual settings
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  titleFontSize?: number;
  titleColor?: string;
  labelFontSize?: number;
  labelColor?: string;
  legendFontSize?: number;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  legendMaxItems?: number;
  showTooltip?: boolean;
  strokeWidth?: number;
  strokeColor?: string;
  hoverScale?: number;

  // Formatter
  valueFormatter?: (value: number) => string;
  valueFormatterType?:
    | 'currency'
    | 'percentage'
    | 'number'
    | 'decimal'
    | 'scientific'
    | 'bytes'
    | 'duration'
    | 'date'
    | 'custom';
}

const D3PieChart: React.FC<D3PieChartProps> = ({
  data,
  arrayData,
  width = 600,
  height = 600,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  labelKey,
  valueKey,
  colors = defaultColorsChart,
  title,
  showTitle = true,
  showLegend = true,
  showLabels = true,
  showPercentage = true,
  showSliceValues = false,
  animationDuration = 1000,
  innerRadius = 0,
  cornerRadius = 0,
  padAngle = 0,
  startAngle = 0,
  endAngle = 360,
  sortSlices = 'none',
  sliceOpacity = 1,
  theme = 'auto',
  backgroundColor = 'transparent',
  titleFontSize = 20,
  titleColor = '',
  labelFontSize = 12,
  labelColor = '',
  legendFontSize = 12,
  legendPosition = 'right',
  legendMaxItems = 10,
  showTooltip = true,
  strokeWidth = 2,
  strokeColor = '',
  hoverScale = 1.05,
  valueFormatter,
  valueFormatterType = 'number',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width, height });

  // Tooltip management refs
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTooltipRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(
    null
  );

  // Convert array to data
  const processedData = React.useMemo((): ChartDataPoint[] => {
    if (arrayData && arrayData.length > 0) return convertArrayToChartData(arrayData);
    return data || [];
  }, [arrayData, data]);

  // Helper function to get formatter symbol (currently unused but kept for future use)
  // const getFormatterSymbol = (formatterType?: string): string => {
  //   switch (formatterType) {
  //     case 'currency':
  //       return '$';
  //     case 'percentage':
  //       return '%';
  //     case 'bytes':
  //       return 'MB';
  //     case 'duration':
  //       return 'min';
  //     case 'date':
  //       return 'date';
  //     case 'decimal':
  //       return 'dec';
  //     case 'scientific':
  //       return 'sci';
  //     case 'number':
  //       return '#';
  //     case 'custom':
  //       return 'custom';
  //     default:
  //       return '';
  //   }
  // };

  // Helper functions for tooltip management
  const clearTooltipTimeout = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  };

  const hideCurrentTooltip = () => {
    if (currentTooltipRef.current) {
      currentTooltipRef.current.transition().duration(200).style('opacity', 0).remove();
      currentTooltipRef.current = null;
    }
  };

  // Resize observer
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;

      // For pie chart, maintain aspect ratio
      const aspectRatio = height / width;
      const newWidth = Math.min(containerWidth - 16, width);
      let newHeight = newWidth * aspectRatio;

      // Add extra height for title if shown
      if (showTitle && title) {
        newHeight += containerWidth < 640 ? 30 : 40;
      }

      // Add extra height for legend if at bottom
      if (showLegend && legendPosition === 'bottom') {
        newHeight += containerWidth < 640 ? 100 : 120;
      }

      setDimensions({ width: newWidth, height: newHeight });
    };
    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [width, height, showLegend, legendPosition, showTitle, title]);

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

  // Cleanup tooltip timeout on unmount
  useEffect(() => {
    return () => {
      clearTooltipTimeout();
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || !processedData.length) return;

    const currentWidth = dimensions.width;
    const currentHeight = dimensions.height;

    // Colors
    const getCurrentColors = () => {
      const mode = isDarkMode ? 'dark' : 'light';
      const result: string[] = [];
      processedData.forEach((d, index) => {
        const label = String(d[labelKey]);
        const colorKey = colors[label] ? label : `color${index + 1}`;
        result.push(colors[colorKey]?.[mode] || defaultColorsChart[`color${index + 1}`][mode]);
      });
      return result;
    };
    const currentColors = getCurrentColors();

    const textColor = titleColor || (isDarkMode ? '#f3f4f6' : '#1f2937');
    const defaultLabelColor = labelColor || (isDarkMode ? '#f3f4f6' : '#1f2937');
    const bgColor =
      backgroundColor !== 'transparent' ? backgroundColor : isDarkMode ? '#111827' : '#ffffff';
    const defaultStrokeColor = strokeColor || (isDarkMode ? '#374151' : '#ffffff');

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

    // Background
    svg
      .append('rect')
      .attr('width', currentWidth)
      .attr('height', currentHeight)
      .attr('fill', bgColor)
      .attr('rx', 8);

    // Main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${responsiveMargin.left},${responsiveMargin.top})`);

    // Title
    if (showTitle && title) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${titleFontSize}px`)
        .style('font-weight', '700')
        .text(title);
    }

    // Calculate pie dimensions
    const titleOffset = showTitle && title ? titleFontSize + 20 : 0;
    const radius = Math.min(innerWidth, innerHeight - titleOffset) / 2;
    const centerX = innerWidth / 2;
    const centerY = titleOffset + (innerHeight - titleOffset) / 2;

    // Pie generator
    const pie = d3
      .pie<ChartDataPoint>()
      .value(d => d[valueKey] as number)
      .startAngle((startAngle * Math.PI) / 180)
      .endAngle((endAngle * Math.PI) / 180)
      .padAngle((padAngle * Math.PI) / 180);

    // Sort slices
    if (sortSlices === 'ascending') {
      pie.sort((a, b) => (a[valueKey] as number) - (b[valueKey] as number));
    } else if (sortSlices === 'descending') {
      pie.sort((a, b) => (b[valueKey] as number) - (a[valueKey] as number));
    } else {
      pie.sort(null);
    }

    // Arc generator
    const arc = d3
      .arc<d3.PieArcDatum<ChartDataPoint>>()
      .innerRadius(radius * innerRadius)
      .outerRadius(radius)
      .cornerRadius(cornerRadius);

    // Arc for labels (positioned at centroid)
    const labelArc = d3
      .arc<d3.PieArcDatum<ChartDataPoint>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    // Pie group
    const pieGroup = g.append('g').attr('transform', `translate(${centerX},${centerY})`);

    // Calculate total for percentages
    const total = d3.sum(processedData, d => d[valueKey] as number);

    // Create pie slices
    const slices = pieGroup
      .selectAll('.slice')
      .data(pie(processedData))
      .enter()
      .append('g')
      .attr('class', 'slice');

    // Add paths
    slices
      .append('path')
      .attr('d', arc)
      .attr('fill', (_d, i) => currentColors[i])
      .attr('stroke', defaultStrokeColor)
      .attr('stroke-width', strokeWidth)
      .attr('opacity', sliceOpacity)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))')
      .on('mouseover', function (_event, d) {
        if (!showTooltip) return;

        // Scale up on hover
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', `scale(${hoverScale})`)
          .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))');

        // Show tooltip
        const label = String(d.data[labelKey]);
        const value = d.data[valueKey] as number;
        const percentage = ((value / total) * 100).toFixed(1);
        const formattedValue = valueFormatter ? valueFormatter(value) : value.toLocaleString();

        const tooltip = pieGroup
          .append('g')
          .attr('class', 'tooltip')
          .attr('pointer-events', 'none');

        const tooltipText = `${label}: ${formattedValue} (${percentage}%)`;
        const textWidth = tooltipText.length * 7 + 20;

        tooltip
          .append('rect')
          .attr('x', -textWidth / 2)
          .attr('y', -60)
          .attr('width', textWidth)
          .attr('height', 40)
          .attr('fill', isDarkMode ? '#1f2937' : '#ffffff')
          .attr('stroke', currentColors[d.index])
          .attr('stroke-width', 2)
          .attr('rx', 6)
          .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
          .style('opacity', 0)
          .transition()
          .duration(200)
          .style('opacity', 0.95);

        tooltip
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -35)
          .attr('fill', textColor)
          .style('font-size', `${labelFontSize}px`)
          .style('font-weight', '600')
          .style('opacity', 0)
          .text(tooltipText)
          .transition()
          .duration(200)
          .style('opacity', 1);

        currentTooltipRef.current = tooltip;
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)')
          .style('filter', 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))');

        hideCurrentTooltip();
      })
      .transition()
      .duration(animationDuration)
      .ease(d3.easeBackOut)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arc(interpolate(t)) || '';
        };
      });

    // Add labels
    if (showLabels) {
      slices
        .append('text')
        .attr('transform', d => {
          const [x, y] = labelArc.centroid(d);
          return `translate(${x},${y})`;
        })
        .attr('text-anchor', 'middle')
        .attr('fill', defaultLabelColor)
        .style('font-size', `${labelFontSize}px`)
        .style('font-weight', '600')
        .style('opacity', 0)
        .style(
          'text-shadow',
          isDarkMode ? '1px 1px 2px rgba(0,0,0,0.8)' : '1px 1px 2px rgba(255,255,255,0.8)'
        )
        .text(d => {
          const label = String(d.data[labelKey]);
          const value = d.data[valueKey] as number;
          const percentage = ((value / total) * 100).toFixed(1);

          if (showSliceValues && showPercentage) {
            const formattedValue = valueFormatter ? valueFormatter(value) : value.toLocaleString();
            return `${label}\n${formattedValue}\n${percentage}%`;
          } else if (showSliceValues) {
            const formattedValue = valueFormatter ? valueFormatter(value) : value.toLocaleString();
            return `${label}\n${formattedValue}`;
          } else if (showPercentage) {
            return `${label}\n${percentage}%`;
          } else {
            return label;
          }
        })
        .transition()
        .delay(animationDuration)
        .duration(300)
        .style('opacity', 1);
    }

    // Add legend
    if (showLegend) {
      const legendItemHeight = 25;
      const legendItems = processedData.slice(0, legendMaxItems);

      const legendGroup = g.append('g').attr('class', 'legend-group');

      const legendWidth = 150;
      const legendHeight = legendItems.length * legendItemHeight + 20;

      let legendX = 0;
      let legendY = 0;

      switch (legendPosition) {
        case 'top':
          legendX = innerWidth / 2 - legendWidth / 2;
          legendY = 10;
          break;
        case 'bottom':
          legendX = innerWidth / 2 - legendWidth / 2;
          legendY = innerHeight - legendHeight - 10;
          break;
        case 'left':
          legendX = 10;
          legendY = titleOffset + 20;
          break;
        case 'right':
        default:
          legendX = innerWidth - legendWidth - 10;
          legendY = titleOffset + 20;
          break;
      }

      // Legend background
      legendGroup
        .append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'rgba(248, 250, 252, 0.9)')
        .attr('stroke', isDarkMode ? 'rgba(107, 114, 128, 0.3)' : 'rgba(209, 213, 219, 0.3)')
        .attr('stroke-width', 1)
        .attr('rx', 8)
        .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))');

      // Legend items
      legendItems.forEach((d, i) => {
        const label = String(d[labelKey]);
        const itemY = legendY + 10 + i * legendItemHeight;

        const legendItem = legendGroup
          .append('g')
          .attr('class', `legend-item-${i}`)
          .style('cursor', 'pointer');

        // Color indicator
        legendItem
          .append('rect')
          .attr('x', legendX + 10)
          .attr('y', itemY)
          .attr('width', 16)
          .attr('height', 16)
          .attr('rx', 3)
          .attr('fill', currentColors[i])
          .style('filter', `drop-shadow(0 2px 4px ${currentColors[i]}40)`);

        // Label text
        const maxLabelLength = 15;
        const displayLabel =
          label.length > maxLabelLength ? label.substring(0, maxLabelLength) + '...' : label;

        legendItem
          .append('text')
          .attr('x', legendX + 35)
          .attr('y', itemY + 8)
          .attr('dy', '0.35em')
          .attr('fill', textColor)
          .style('font-size', `${legendFontSize}px`)
          .style('font-weight', '600')
          .text(displayLabel);

        // Hover effects
        legendItem
          .on('mouseenter', function () {
            d3.select(this).style('opacity', '0.8');
          })
          .on('mouseleave', function () {
            d3.select(this).style('opacity', '1');
          });
      });

      // Show "..." if there are more items
      if (processedData.length > legendMaxItems) {
        legendGroup
          .append('text')
          .attr('x', legendX + 10)
          .attr('y', legendY + legendHeight - 10)
          .attr('fill', textColor)
          .style('font-size', `${legendFontSize - 2}px`)
          .style('font-style', 'italic')
          .text(`... and ${processedData.length - legendMaxItems} more`);
      }
    }

    // Global mouseleave handler
    svg.on('mouseleave', function () {
      clearTooltipTimeout();
      hideCurrentTooltip();
    });
  }, [
    processedData,
    margin,
    labelKey,
    valueKey,
    colors,
    showLegend,
    animationDuration,
    title,
    showTitle,
    isDarkMode,
    dimensions,
    valueFormatter,
    valueFormatterType,
    innerRadius,
    cornerRadius,
    padAngle,
    startAngle,
    endAngle,
    sortSlices,
    sliceOpacity,
    backgroundColor,
    showTooltip,
    titleFontSize,
    titleColor,
    labelFontSize,
    labelColor,
    legendFontSize,
    legendPosition,
    legendMaxItems,
    strokeWidth,
    strokeColor,
    hoverScale,
    showLabels,
    showPercentage,
    showSliceValues,
  ]);

  return (
    <div ref={containerRef} className="w-full">
      <div className="chart-container relative bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-auto chart-svg"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          style={{ display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
};

export default D3PieChart;
