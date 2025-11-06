import React, { useEffect, useRef, useCallback, useMemo } from 'react';
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
  padAngle?: number; // Spacing between slices in radians (typical: 0 to 0.1)
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
  // Preview variant: render without frame/background card
  variant?: 'default' | 'preview';
}

const D3PieChart: React.FC<D3PieChartProps> = ({
  data,
  arrayData,
  width = 1200,
  height = 400,
  margin = { top: 60, right: 60, bottom: 60, left: 60 },
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
  variant = 'default',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const themeObserverRef = useRef<MutationObserver | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTooltipRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(
    null
  );

  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width, height });
  const [error, setError] = React.useState<string | null>(null);
  const [focusedSlice, setFocusedSlice] = React.useState<number | null>(null);

  // Validate and process data
  const processedData = useMemo((): ChartDataPoint[] => {
    try {
      let dataToProcess: ChartDataPoint[] = [];

      if (arrayData && arrayData.length > 0) {
        dataToProcess = convertArrayToChartData(arrayData);
      } else if (data && data.length > 0) {
        dataToProcess = data;
      }

      // Validate data structure
      if (!dataToProcess.length) {
        setError('No data provided');
        return [];
      }

      // Validate required keys (treat labelKey and valueKey as IDs)
      const hasMissingdLabelKey = dataToProcess.every(d =>
        Object.prototype.hasOwnProperty.call(d, labelKey)
      );

      if (!hasMissingdLabelKey) {
        setError(`Invalid data: missing column id '${labelKey}'`);
        return [];
      }

      const hasMissingdValueKey = dataToProcess.every(d =>
        Object.prototype.hasOwnProperty.call(d, valueKey)
      );

      if (!hasMissingdValueKey) {
        setError(`Invalid data: missing column id '${valueKey}'`);
        return [];
      }

      const hasValidValues = dataToProcess.every(d => {
        const num = Number(d[valueKey]); // hoặc parseInt(d[valueKey], 10)
        return !isNaN(num);
      });

      if (!hasValidValues) {
        setError(`Invalid data: column id '${valueKey}' must contain numeric values`);
        return [];
      }

      setError(null);
      return dataToProcess;
    } catch (err) {
      console.error('Error processing chart data:', err);
      setError('Error processing data');
      return [];
    }
  }, [arrayData, data, labelKey, valueKey]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!processedData.length) return;

      const { key } = event;
      let newIndex = focusedSlice ?? -1;

      switch (key) {
        case 'ArrowRight':
        case 'ArrowDown':
          newIndex = Math.min(newIndex + 1, processedData.length - 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          newIndex = Math.max(newIndex - 1, 0);
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = processedData.length - 1;
          break;
        case 'Enter':
        case ' ':
          // Could trigger tooltip or other action
          event.preventDefault();
          return;
        default:
          return;
      }

      event.preventDefault();
      setFocusedSlice(newIndex);
    },
    [processedData.length, focusedSlice]
  );

  // Helper functions for tooltip management
  const clearTooltipTimeout = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
  }, []);

  const hideCurrentTooltip = useCallback(() => {
    if (currentTooltipRef.current) {
      currentTooltipRef.current.transition().duration(200).style('opacity', 0).remove();
      currentTooltipRef.current = null;
    }
  }, []);

  // Improved theme detection
  const updateTheme = useCallback(() => {
    if (theme === 'auto') {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark || document.documentElement.classList.contains('dark'));
    } else {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);

  // Resize observer with improved logic
  const updateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    if (containerWidth === 0) return;

    // Calculate responsive dimensions
    const aspectRatio = height / width;
    const maxWidth = Math.min(containerWidth - 32, width); // Account for padding
    let newHeight = maxWidth * aspectRatio;

    // Reserve space for title
    if (showTitle && title) {
      newHeight += Math.max(40, titleFontSize + 20);
    }

    // Reserve space for legend
    if (showLegend && processedData.length > 0) {
      const legendItems = Math.min(processedData.length, legendMaxItems);
      if (legendPosition === 'top' || legendPosition === 'bottom') {
        newHeight += Math.max(60, legendItems * 25 + 20);
      } else {
        // For side legends, ensure minimum width
        const minWidthForLegend = 200;
        if (maxWidth < minWidthForLegend + 300) {
          // 300 for chart
          newHeight += 40; // Add height if width is constrained
        }
      }
    }

    setDimensions({ width: maxWidth, height: Math.max(newHeight, 200) });
  }, [
    width,
    height,
    showTitle,
    title,
    showLegend,
    processedData.length,
    legendMaxItems,
    legendPosition,
    titleFontSize,
  ]);

  // Setup theme observer
  useEffect(() => {
    updateTheme();

    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);

      const domObserver = new MutationObserver(updateTheme);
      domObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      themeObserverRef.current = domObserver;

      return () => {
        mediaQuery.removeEventListener('change', updateTheme);
        domObserver.disconnect();
      };
    }
  }, [theme, updateTheme]);

  // Setup resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    updateDimensions();

    const ro = new ResizeObserver(updateDimensions);
    ro.observe(containerRef.current);
    resizeObserverRef.current = ro;

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [updateDimensions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTooltipTimeout();
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      if (themeObserverRef.current) {
        themeObserverRef.current.disconnect();
      }
    };
  }, [clearTooltipTimeout]);

  // Main chart rendering effect
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
        // Nếu có màu tùy chỉnh cho label, dùng nó
        if (colors[label]) {
          result.push(colors[label][mode]);
          return;
        }
        // Nếu không, lấy màu từ defaultColorsChart theo chu kỳ
        const colorIndex = (index % 6) + 1; // Lặp lại từ 1-6 nếu có nhiều hơn 6 phần
        result.push(defaultColorsChart[`color${colorIndex}`][mode]);
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

    // Responsive scaling factor based on chart size
    const scaleFactor = Math.min(currentWidth / 600, 1.2); // Base size is 600px
    const isMobile = currentWidth < 640;
    const isTablet = currentWidth < 1024;

    // Responsive font sizes
    const responsiveTitleFontSize = Math.max(12, titleFontSize * scaleFactor);
    const responsiveLabelFontSize = Math.max(9, labelFontSize * scaleFactor);
    const responsiveLegendFontSize = Math.max(9, legendFontSize * scaleFactor);

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

    // Calculate legend dimensions first to reserve space
    const legendItemHeight = isMobile ? 20 : isTablet ? 22 : 25;
    const legendItems = processedData.slice(0, legendMaxItems);

    // Legend dimensions depend on orientation and chart size
    let legendWidth = isMobile ? 120 : isTablet ? 140 : 150;
    let legendHeight = legendItems.length * legendItemHeight + (isMobile ? 15 : 20);

    // For horizontal legend (top/bottom)
    if (legendPosition === 'top' || legendPosition === 'bottom') {
      // Calculate width based on items laid out horizontally
      const itemWidth = isMobile ? 70 : isTablet ? 85 : 100;
      legendWidth = Math.min(innerWidth - 40, legendItems.length * itemWidth + 40);
      legendHeight = isMobile ? 40 : isTablet ? 45 : 50; // Fixed height for horizontal legend
    }

    // Responsive spacing between legend and chart
    const legendSpacing = isMobile ? 15 : isTablet ? 20 : 25;

    // Calculate title offset first (for top legend positioning)
    const titleOffset = showTitle && title ? responsiveTitleFontSize + (isMobile ? 12 : 20) : 0;

    // Calculate available space for pie chart considering legend position
    let availableWidth = innerWidth;
    let availableHeight = innerHeight;
    let pieOffsetX = 0;
    let pieOffsetY = 0;

    if (showLegend) {
      switch (legendPosition) {
        case 'left':
          availableWidth = innerWidth - legendWidth - legendSpacing;
          pieOffsetX = legendWidth + legendSpacing;
          break;
        case 'right':
          availableWidth = innerWidth - legendWidth - legendSpacing;
          pieOffsetX = 0;
          break;
        case 'top': {
          // When legend is at top, need to account for both title and legend
          const topOccupiedSpace = titleOffset + legendHeight + legendSpacing + (isMobile ? 5 : 10);
          availableHeight = innerHeight - topOccupiedSpace;
          pieOffsetY = topOccupiedSpace;
          break;
        }
        case 'bottom':
          availableHeight = innerHeight - legendHeight - legendSpacing;
          pieOffsetY = 0;
          break;
      }
    }

    // Title (positioned at center top, above everything)
    if (showTitle && title) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', responsiveTitleFontSize * 0.8) // Slight offset for better positioning
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${responsiveTitleFontSize}px`)
        .style('font-weight', '700')
        .text(title);
    }

    // Calculate pie dimensions - subtract title offset from available height
    const effectiveHeight = availableHeight - titleOffset;
    const radius = Math.min(availableWidth, effectiveHeight) / 2;
    const centerX = pieOffsetX + availableWidth / 2;
    const centerY = pieOffsetY + titleOffset + effectiveHeight / 2;

    // Pie generator
    const pie = d3
      .pie<ChartDataPoint>()
      .value(d => d[valueKey] as number)
      .startAngle((startAngle * Math.PI) / 180)
      .endAngle((endAngle * Math.PI) / 180)
      .padAngle(padAngle); // padAngle is already in radians (0-0.1 typical range)

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

        // Responsive tooltip sizing
        const tooltipFontSize = isMobile ? 10 : responsiveLabelFontSize;
        const tooltipPadding = isMobile ? 8 : 12;

        // Calculate tooltip text and dimensions
        const line1 = label;
        const line2 = `${formattedValue} (${percentage}%)`;
        const maxLineLength = Math.max(line1.length, line2.length);
        const tooltipWidth = Math.max(
          maxLineLength * (tooltipFontSize * 0.6) + tooltipPadding * 2,
          isMobile ? 100 : 120
        );
        const tooltipHeight = isMobile ? 45 : 55;
        const tooltipY = isMobile ? -50 : -65;

        // Tooltip background
        tooltip
          .append('rect')
          .attr('x', -tooltipWidth / 2)
          .attr('y', tooltipY)
          .attr('width', tooltipWidth)
          .attr('height', tooltipHeight)
          .attr('fill', isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)')
          .attr('stroke', currentColors[d.index])
          .attr('stroke-width', 2)
          .attr('rx', isMobile ? 6 : 8)
          .style('filter', 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))')
          .style('opacity', 0)
          .transition()
          .duration(200)
          .style('opacity', 1);

        // Tooltip text - Line 1 (Label)
        tooltip
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', tooltipY + (isMobile ? 16 : 20))
          .attr('fill', textColor)
          .style('font-size', `${tooltipFontSize}px`)
          .style('font-weight', '700')
          .style('opacity', 0)
          .text(line1)
          .transition()
          .duration(200)
          .style('opacity', 1);

        // Tooltip text - Line 2 (Value and percentage)
        tooltip
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', tooltipY + (isMobile ? 32 : 38))
          .attr('fill', textColor)
          .style('font-size', `${tooltipFontSize * 0.9}px`)
          .style('font-weight', '600')
          .style('opacity', 0)
          .text(line2)
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

    // Add labels / percentages / values — render if any of the toggles is enabled
    if (showLabels || showPercentage || showSliceValues) {
      slices
        .append('text')
        .attr('transform', d => {
          const [x, y] = labelArc.centroid(d);
          return `translate(${x},${y})`;
        })
        .attr('text-anchor', 'middle')
        .attr('fill', defaultLabelColor)
        .style('font-size', `${responsiveLabelFontSize}px`)
        .style('font-weight', '600')
        .style('opacity', 0)
        .style(
          'text-shadow',
          isDarkMode ? '1px 1px 2px rgba(0,0,0,0.8)' : '1px 1px 2px rgba(255,255,255,0.8)'
        )
        .each(function (d) {
          const label = String(d.data[labelKey]);
          const value = d.data[valueKey] as number;
          const percentage = ((value / total) * 100).toFixed(1);

          const formattedValue = valueFormatter ? valueFormatter(value) : value.toLocaleString();

          // Build ordered lines depending on toggles
          const lines: { text: string; style?: { fontSize?: string; fontWeight?: string } }[] = [];

          if (showLabels) {
            const displayLabel =
              isMobile && label.length > 8 ? label.substring(0, 8) + '...' : label;
            lines.push({ text: displayLabel, style: { fontWeight: '700' } });
          }

          if (showPercentage) {
            lines.push({
              text: `${percentage}%`,
              style: { fontSize: `${responsiveLabelFontSize * 0.9}px` },
            });
          }

          if (showSliceValues) {
            lines.push({
              text: `(${formattedValue})`,
              style: { fontSize: `${responsiveLabelFontSize * 0.85}px` },
            });
          }

          const textEl = d3.select(this);

          // Append tspans for each line. Adjust vertical offsets so multi-line content stays centered.
          lines.forEach((line, idx) => {
            const isFirst = idx === 0;
            const dy = isFirst ? (lines.length > 1 ? '-0.6em' : '0') : '1.2em';

            const t = textEl.append('tspan').attr('x', 0).attr('dy', dy).text(line.text);

            if (line.style) {
              if (line.style.fontSize) t.style('font-size', line.style.fontSize);
              if (line.style.fontWeight) t.style('font-weight', String(line.style.fontWeight));
            }
          });
        })
        .transition()
        .delay(animationDuration)
        .duration(300)
        .style('opacity', 1);
    }

    // Add legend
    if (showLegend) {
      const legendGroup = g.append('g').attr('class', 'legend-group');

      let legendX = 0;
      let legendY = 0;

      // Calculate spacing after title
      const titleBottomSpace = showTitle && title ? titleOffset + (isMobile ? 5 : 10) : 0;

      // Device-aware extra spacing to keep legend away from chart edges
      const extraLegendSpacing = isMobile ? 8 : isTablet ? 12 : 20;
      switch (legendPosition) {
        case 'top':
          legendX = innerWidth / 2 - legendWidth / 2;
          legendY = titleBottomSpace + 10; // Add spacing after title
          break;
        case 'bottom':
          legendX = innerWidth / 2 - legendWidth / 2;
          legendY = innerHeight - legendHeight - 10;
          break;
        case 'left':
          // push legend slightly inward so it's not too close to the chart
          legendX = extraLegendSpacing;
          legendY = innerHeight / 2 - legendHeight / 2;
          break;
        case 'right':
        default:
          legendX = innerWidth - legendWidth - extraLegendSpacing;
          legendY = innerHeight / 2 - legendHeight / 2;
          break;
      }

      // Create legend background and a contents group we'll measure
      const legendBg = legendGroup
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

      const legendContents = legendGroup.append('g').attr('class', 'legend-contents');

      if (legendPosition === 'top' || legendPosition === 'bottom') {
        // Horizontal legend - items laid out horizontally
        const itemPadding = isMobile ? 6 : 8;

        // Build items inside legendContents and support up to 2 rows if needed
        const localIconSize = isMobile ? 12 : isTablet ? 13 : 14;
        const padX = isMobile ? 12 : 16;
        const padY = isMobile ? 8 : 10;
        const availableContentWidth = legendWidth - padX * 2;

        // Precompute display labels with increased character limits to show more text
        const itemsMeta = legendItems.map(item => {
          const label = String(item[labelKey]);
          const maxLabelLength = isMobile ? 12 : isTablet ? 18 : 20; // Increased from 6/8/10 to 8/10/12
          const displayLabel =
            label.length > maxLabelLength ? label.substring(0, maxLabelLength) + '...' : label;
          return { displayLabel };
        });

        // Use fixed per-item container width so all items align on a grid (not centered per-item)
        const itemContainerW = isMobile ? 100 : isTablet ? 120 : 140; // Fixed width per column slot

        const totalSingleWidth = itemContainerW * legendItems.length;
        const useTwoRows = totalSingleWidth > availableContentWidth && legendItems.length > 1;

        if (!useTwoRows) {
          // Single centered row - items aligned on grid
          let currentX = 0;
          legendItems.forEach((_, idx) => {
            const { displayLabel } = itemsMeta[idx];
            const legendItem = legendContents
              .append('g')
              .attr('class', `legend-item-${idx}`)
              .style('cursor', 'pointer')
              .attr('transform', `translate(${currentX}, 0)`);

            legendItem
              .append('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', localIconSize)
              .attr('height', localIconSize)
              .attr('rx', 3)
              .attr('fill', currentColors[idx])
              .style('filter', `drop-shadow(0 2px 4px ${currentColors[idx]}40)`);

            legendItem
              .append('text')
              .attr('x', localIconSize + itemPadding)
              .attr('y', localIconSize / 2)
              .attr('dy', '0.35em')
              .attr('fill', textColor)
              .style('font-size', `${responsiveLegendFontSize}px`)
              .style('font-weight', '600')
              .text(displayLabel);

            legendItem
              .on('mouseenter', function () {
                d3.select(this).style('opacity', '0.8');
              })
              .on('mouseleave', function () {
                d3.select(this).style('opacity', '1');
              });

            currentX += itemContainerW;
          });
        } else {
          // Two-row layout using uniform item container width for consistent columns
          const firstRowCount = Math.ceil(legendItems.length / 2);
          const rowY = localIconSize + padY; // spacing between rows

          // First row
          let x0 = 0;
          for (let i = 0; i < firstRowCount; i++) {
            const { displayLabel } = itemsMeta[i];
            const legendItem = legendContents
              .append('g')
              .attr('class', `legend-item-${i}`)
              .style('cursor', 'pointer')
              .attr('transform', `translate(${x0}, 0)`);

            legendItem
              .append('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', localIconSize)
              .attr('height', localIconSize)
              .attr('rx', 3)
              .attr('fill', currentColors[i])
              .style('filter', `drop-shadow(0 2px 4px ${currentColors[i]}40)`);

            legendItem
              .append('text')
              .attr('x', localIconSize + itemPadding)
              .attr('y', localIconSize / 2)
              .attr('dy', '0.35em')
              .attr('fill', textColor)
              .style('font-size', `${responsiveLegendFontSize}px`)
              .style('font-weight', '600')
              .text(displayLabel);

            legendItem
              .on('mouseenter', function () {
                d3.select(this).style('opacity', '0.8');
              })
              .on('mouseleave', function () {
                d3.select(this).style('opacity', '1');
              });

            x0 += itemContainerW;
          }

          // Second row
          let x1 = 0;
          for (let j = firstRowCount; j < legendItems.length; j++) {
            const { displayLabel } = itemsMeta[j];
            const legendItem = legendContents
              .append('g')
              .attr('class', `legend-item-${j}`)
              .style('cursor', 'pointer')
              .attr('transform', `translate(${x1}, ${rowY})`);

            legendItem
              .append('rect')
              .attr('x', 0)
              .attr('y', 0)
              .attr('width', localIconSize)
              .attr('height', localIconSize)
              .attr('rx', 3)
              .attr('fill', currentColors[j])
              .style('filter', `drop-shadow(0 2px 4px ${currentColors[j]}40)`);

            legendItem
              .append('text')
              .attr('x', localIconSize + itemPadding)
              .attr('y', localIconSize / 2)
              .attr('dy', '0.35em')
              .attr('fill', textColor)
              .style('font-size', `${responsiveLegendFontSize}px`)
              .style('font-weight', '600')
              .text(displayLabel);

            legendItem
              .on('mouseenter', function () {
                d3.select(this).style('opacity', '0.8');
              })
              .on('mouseleave', function () {
                d3.select(this).style('opacity', '1');
              });

            x1 += itemContainerW;
          }
        }

        // Measure and center contents inside background, then resize background
        try {
          const bbox = (legendContents.node() as SVGGElement).getBBox();
          const extraWidth = isMobile ? 8 : isTablet ? 12 : 16;
          const desiredBgWidth = Math.max(
            bbox.width + padX * 2 + extraWidth,
            legendWidth + extraWidth
          );
          const desiredBgHeight = Math.max(bbox.height + padY * 2, legendHeight);

          // For top/bottom: center the background by desired width so it doesn't look left-shifted
          const bgX =
            legendPosition === 'top' || legendPosition === 'bottom'
              ? innerWidth / 2 - desiredBgWidth / 2
              : legendX;

          legendBg
            .attr('x', bgX)
            .attr('y', legendY)
            .attr('width', desiredBgWidth)
            .attr('height', desiredBgHeight);

          // center contents horizontally within the bg and vertically with some padding
          const contentsX = bgX + (desiredBgWidth - bbox.width) / 2;
          const contentsY = legendY + padY + (desiredBgHeight - (bbox.height + padY * 2)) / 2;
          legendContents.attr('transform', `translate(${contentsX}, ${contentsY})`);
        } catch {
          console.warn('legend bbox measurement failed');
        }
      } else {
        // Vertical legend (left/right)
        const iconSize = isMobile ? 14 : 16;

        let currentY = 0;
        legendItems.forEach((d, i) => {
          const label = String(d[labelKey]);
          const displayLabel =
            label.length > (isMobile ? 10 : isTablet ? 12 : 15)
              ? label.substring(0, isMobile ? 10 : isTablet ? 12 : 15) + '...'
              : label;

          const legendItem = legendContents
            .append('g')
            .attr('class', `legend-item-${i}`)
            .style('cursor', 'pointer')
            .attr('transform', `translate(${isMobile ? 8 : 10}, ${currentY})`);

          // Color indicator
          legendItem
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', iconSize)
            .attr('height', iconSize)
            .attr('rx', 3)
            .attr('fill', currentColors[i])
            .style('filter', `drop-shadow(0 2px 4px ${currentColors[i]}40)`);

          // Label
          legendItem
            .append('text')
            .attr('x', iconSize + (isMobile ? 6 : 8))
            .attr('y', iconSize / 2)
            .attr('dy', '0.35em')
            .attr('fill', textColor)
            .style('font-size', `${responsiveLegendFontSize}px`)
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

          currentY += legendItemHeight;
        });

        // Measure and position vertical contents
        try {
          const bbox = (legendContents.node() as SVGGElement).getBBox();
          const padX = isMobile ? 8 : 10;
          const padY = isMobile ? 8 : 10;
          const contentsX = legendX + padX;
          const contentsY = legendY + padY;
          legendContents.attr('transform', `translate(${contentsX}, ${contentsY})`);
          const extraWidthV = isMobile ? 6 : 10;
          legendBg
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('width', Math.max(bbox.width + padX * 2 + extraWidthV, legendWidth + extraWidthV))
            .attr('height', Math.max(bbox.height + padY * 2, legendHeight));
        } catch {
          console.warn('legend bbox measurement failed');
        }
      }

      // Show "..." if there are more items; position relative to bg if possible
      if (processedData.length > legendMaxItems) {
        try {
          const bgBBox = (legendBg.node() as SVGRectElement).getBBox();
          legendGroup
            .append('text')
            .attr('x', bgBBox.x + 10)
            .attr('y', bgBBox.y + bgBBox.height - 10)
            .attr('fill', textColor)
            .style('font-size', `${responsiveLegendFontSize - 2}px`)
            .style('font-style', 'italic')
            .text(`... and ${processedData.length - legendMaxItems} more`);
        } catch {
          legendGroup
            .append('text')
            .attr('x', legendX + 10)
            .attr('y', legendY + legendHeight - 10)
            .attr('fill', textColor)
            .style('font-size', `${responsiveLegendFontSize - 2}px`)
            .style('font-style', 'italic')
            .text(`... and ${processedData.length - legendMaxItems} more`);
        }
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
    clearTooltipTimeout,
    hideCurrentTooltip,
    updateDimensions,
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="img"
      aria-label={`Interactive pie chart${title ? `: ${title}` : ''}`}
    >
      {error ? (
        <div className="flex items-center justify-center h-64 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
          <div className="text-center">
            <div className="text-red-500 dark:text-red-400 text-4xl mb-2">⚠️</div>
            <div className="text-red-700 dark:text-red-300 font-semibold">Chart Error</div>
            <div className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</div>
          </div>
        </div>
      ) : (
        <div
          className={
            variant === 'preview'
              ? 'relative overflow-hidden'
              : 'chart-container relative bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden'
          }
        >
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-auto chart-svg"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            style={{ display: 'block' }}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Pie chart${title ? `: ${title}` : ''}`}
          />
        </div>
      )}
    </div>
  );
};

export default D3PieChart;
