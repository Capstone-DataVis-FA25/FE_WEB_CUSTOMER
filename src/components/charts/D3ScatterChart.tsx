import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { getAxisRequirementDescription } from '../../utils/chartValidation';

// Default color scheme matching LineChart
const defaultColorsChart: Record<string, { light: string; dark: string }> = {
  color1: { light: '#3b82f6', dark: '#60a5fa' },
  color2: { light: '#ef4444', dark: '#f87171' },
  color3: { light: '#10b981', dark: '#34d399' },
  color4: { light: '#f59e0b', dark: '#fbbf24' },
  color5: { light: '#8b5cf6', dark: '#a78bfa' },
  color6: { light: '#ec4899', dark: '#f472b6' },
  color7: { light: '#06b6d4', dark: '#22d3ee' },
  color8: { light: '#84cc16', dark: '#a3e635' },
};

export interface ScatterDataPoint {
  [key: string]: number | string;
}

export interface D3ScatterChartProps {
  arrayData?: (string | number)[][];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKey: string;
  colorKey?: string; // Key for color grouping
  sizeKey?: string; // Key for bubble size
  colors?: Record<string, { light: string; dark: string }>;

  // Styling props
  pointRadius?: number;
  minPointRadius?: number;
  maxPointRadius?: number;
  pointOpacity?: number;

  // Title and labels
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;

  // Display options
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showAxisLabels?: boolean;
  showAxisTicks?: boolean;

  // Grid styling
  gridOpacity?: number;

  // Legend options
  legendFontSize?: number;

  // Axis configuration
  xAxisStart?: 'auto' | 'zero';
  yAxisStart?: 'auto' | 'zero';
  xAxisRotation?: number;

  // Formatters
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: number) => string;

  // Font sizes
  fontSize?: { axis: number; label: number; title: number };
  titleFontSize?: number;
  labelFontSize?: number;

  // Theme and background
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;

  // Animation
  animationDuration?: number;

  // Regression line
  showRegressionLine?: boolean;
  regressionLineColor?: string;
  regressionLineWidth?: number;
}

// Convert array data to scatter data format
function convertArrayToScatterData(arrayData: (string | number)[][]): ScatterDataPoint[] {
  if (!arrayData || arrayData.length === 0) {
    return [];
  }

  if (arrayData.length < 2) {
    console.warn('Array data must have at least 2 rows (headers + data)');
    return [];
  }

  const headers = arrayData[0] as string[];
  const dataRows = arrayData.slice(1);

  if (headers.length === 0) {
    console.warn('No headers found in first row');
    return [];
  }

  const scatterData: ScatterDataPoint[] = dataRows.map((row, rowIndex) => {
    const dataPoint: ScatterDataPoint = {};
    headers.forEach((header, headerIndex) => {
      const value = row[headerIndex];

      // Handle undefined/null/N/A values
      if (value === undefined || value === null || value === 'N/A' || value === '') {
        console.warn(
          `Missing/invalid value at row ${rowIndex + 1}, column ${headerIndex} (${header}):`,
          value
        );
        if (headerIndex === 0) {
          dataPoint[header] = `Row ${rowIndex + 1}`;
        } else {
          dataPoint[header] = 0;
        }
        return;
      }

      // Try to convert to number if it's a numeric string
      if (typeof value === 'string') {
        const cleanedValue = value.replace(/[,\s]/g, '');
        const numValue = parseFloat(cleanedValue);
        if (!isNaN(numValue)) {
          dataPoint[header] = numValue;
        } else {
          dataPoint[header] = value;
        }
      } else {
        dataPoint[header] = value;
      }
    });

    return dataPoint;
  });

  return scatterData;
}

// Validate processed scatter data (objects) for given x/y keys
function validateScatterDataObjects(
  data: ScatterDataPoint[],
  xKey: string,
  yKey: string
): { validCount: number; total: number; invalidRows: number[] } {
  let validCount = 0;
  const invalidRows: number[] = [];
  data.forEach((d, i) => {
    const x = Number(d[xKey]);
    const y = Number(d[yKey]);
    if (!isNaN(x) && !isNaN(y)) validCount++;
    else invalidRows.push(i + 1); // 1-based for easier messages
  });
  return { validCount, total: data.length, invalidRows };
}

// Suggest pairs of keys that have at least `minValid` numeric rows
function suggestNumericPairsFromObjects(
  data: ScatterDataPoint[],
  minValid = 2
): Array<[string, string]> {
  if (!data || data.length === 0) return [];
  const keys = Object.keys(data[0]);
  // Count numeric occurrences per key
  const counts: Record<string, number> = {};
  keys.forEach(k => {
    counts[k] = data.reduce((acc, d) => (!isNaN(Number(d[k])) ? acc + 1 : acc), 0);
  });

  const numericKeys = keys.filter(k => counts[k] >= minValid);
  const pairs: Array<[string, string]> = [];
  for (let i = 0; i < numericKeys.length; i++) {
    for (let j = i + 1; j < numericKeys.length; j++) {
      pairs.push([numericKeys[i], numericKeys[j]]);
    }
  }
  return pairs;
}

const D3ScatterChart: React.FC<D3ScatterChartProps> = ({
  arrayData,
  width = 800,
  height = 600,
  margin = { top: 20, right: 40, bottom: 60, left: 60 },
  xAxisKey,
  yAxisKey,
  colorKey,
  sizeKey,
  colors = defaultColorsChart,

  // Styling props
  pointRadius = 5,
  minPointRadius = 3,
  maxPointRadius = 15,
  pointOpacity = 0.7,

  // Title and labels
  title,
  xAxisLabel,
  yAxisLabel,

  // Display options
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showAxisLabels = true,
  showAxisTicks = true,

  // Grid styling
  gridOpacity = 0.3,

  // Legend options
  legendFontSize = 11,

  // Axis configuration
  xAxisStart = 'auto',
  yAxisStart = 'auto',
  xAxisRotation = 0,

  // Formatters
  yAxisFormatter,
  xAxisFormatter,

  // Font sizes
  fontSize = { axis: 12, label: 14, title: 16 },
  titleFontSize = 16,
  labelFontSize = 12,

  // Theme and background
  theme = 'auto',
  backgroundColor = 'transparent',

  // Animation
  animationDuration = 1000,

  // Regression line
  showRegressionLine = false,
  regressionLineColor,
  regressionLineWidth = 2,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Chart dimensions follow container size (responsive) but honor default props as maximums
  const [dimensions, setDimensions] = useState({ width, height });

  // Responsive font sizes (match LineChart)
  const responsiveFontSize = React.useMemo(
    () => ({
      axis: fontSize.axis,
      label: labelFontSize,
      title: titleFontSize,
    }),
    [fontSize.axis, labelFontSize, titleFontSize]
  );

  // Process data
  const processedData = React.useMemo(
    () => convertArrayToScatterData(arrayData || []),
    [arrayData]
  );

  // Get theme-specific colors
  const themeColors = React.useMemo(() => {
    const colorEntries = Object.entries(colors);
    return colorEntries.reduce(
      (acc, [key, value]) => {
        if (typeof value === 'object' && 'light' in value) {
          acc[key] = isDarkMode ? value.dark : value.light;
        } else {
          acc[key] = value as string;
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }, [colors, isDarkMode]);

  // Detect theme changes
  useEffect(() => {
    if (theme === 'auto') {
      const checkTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
      };

      checkTheme();
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      return () => observer.disconnect();
    } else {
      setIsDarkMode(theme === 'dark');
    }
  }, [theme]);

  // Remove ResizeObserver: chart size strictly follows props

  // Monitor container size for responsiveness (make scatter fill the inner container similar to LineChart)
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
        let newHeight = newWidth * aspectRatio;

        const hasXAxisLabel = xAxisLabel && showAxisLabels;
        if (hasXAxisLabel) {
          newHeight += containerWidth < 640 ? 35 : 40;
        }

        if (showLegend) {
          // Reserve space for legend at bottom
          newHeight = newHeight * 0.8;
          const legendExtraHeight = 150;
          newHeight += legendExtraHeight;
        }

        setDimensions({
          width: Math.max(Math.floor(newWidth), 100),
          height: Math.max(Math.floor(newHeight), 100),
        });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [width, height, showLegend, showAxisLabels, xAxisLabel]);
  // Helper: Calculate linear regression
  const calculateLinearRegression = (xVals: number[], yVals: number[]) => {
    const n = xVals.length;
    const sumX = d3.sum(xVals);
    const sumY = d3.sum(yVals);
    const sumXY = d3.sum(xVals.map((x, i) => x * yVals[i]));
    const sumXX = d3.sum(xVals.map(x => x * x));

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  // Main chart rendering with tooltip and legend
  useEffect(() => {
    if (!processedData || processedData.length === 0 || !svgRef.current || !xAxisKey || !yAxisKey) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const chartWidth = dimensions.width;
    const chartHeight = dimensions.height;
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // Validate selected X/Y keys on processed data
    const validation = validateScatterDataObjects(processedData, xAxisKey, yAxisKey);
    // Debug logs for validation
    try {
      console.groupCollapsed && console.groupCollapsed('[D3ScatterChart] validation');
      console.debug('[D3ScatterChart] processedData.length=', processedData.length);
      console.debug('[D3ScatterChart] keys=', Object.keys(processedData[0] || {}));
      console.debug('[D3ScatterChart] xAxisKey, yAxisKey=', xAxisKey, yAxisKey);
      console.debug('[D3ScatterChart] validation=', validation);
    } catch (e) {
      /* ignore */
    } finally {
      try {
        console.groupEnd && console.groupEnd();
      } catch (e) {
        /* ignore */
      }
    }
    if (validation.validCount < 2) {
      // Suggest alternative numeric column pairs (up to 3 suggestions)
      const suggestions = suggestNumericPairsFromObjects(processedData, 2).slice(0, 3);
      console.warn(
        '[D3ScatterChart] not enough numeric pairs for',
        xAxisKey,
        '/',
        yAxisKey,
        validation
      );
      if (suggestions.length > 0) console.debug('[D3ScatterChart] suggestions=', suggestions);

      const xReq = getAxisRequirementDescription('scatter', 'x');
      const yReq = getAxisRequirementDescription('scatter', 'y');

      let message = `Scatter chart requires: ${xReq}; ${yReq}.`;
      if (suggestions.length > 0) {
        message += ` Try pairs: ${suggestions.map(p => p.join('/')).join(', ')}`;
      }

      svg
        .append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', isDarkMode ? '#e5e7eb' : '#374151')
        .style('font-size', '14px')
        .style('font-weight', '600')
        .text(message);
      return;
    }

    // Create numeric arrays for scales and regression
    const xValues = processedData.map(d => +d[xAxisKey]).filter(v => !isNaN(v));
    const yValues = processedData.map(d => +d[yAxisKey]).filter(v => !isNaN(v));

    // Debug: show sample converted rows and extents
    try {
      console.groupCollapsed && console.groupCollapsed('[D3ScatterChart] sample conversion');
      const sample = processedData.slice(0, 6).map((d, i) => ({
        row: i + 1,
        rawX: d[xAxisKey],
        rawY: d[yAxisKey],
        numX: Number(d[xAxisKey]),
        numY: Number(d[yAxisKey]),
        valid: !isNaN(Number(d[xAxisKey])) && !isNaN(Number(d[yAxisKey])),
      }));
      console.debug('[D3ScatterChart] sampleRows=', sample);
      console.debug(
        '[D3ScatterChart] xValues.length=',
        xValues.length,
        'yValues.length=',
        yValues.length
      );
      console.debug(
        '[D3ScatterChart] xExtent=',
        d3.extent(xValues),
        'yExtent=',
        d3.extent(yValues)
      );
    } catch (e) {
      /* ignore */
    } finally {
      try {
        console.groupEnd && console.groupEnd();
      } catch (e) {
        /* ignore */
      }
    }

    // Set background
    svg
      .append('rect')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', backgroundColor)
      .attr('rx', 8);

    const chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xExtent = d3.extent(xValues) as [number, number];
    const yExtent = d3.extent(yValues) as [number, number];

    // Apply axis start config
    const xDomain: [number, number] = [
      xAxisStart === 'zero' ? 0 : xAxisStart === 'auto' ? xExtent[0] : xExtent[0],
      xExtent[1],
    ];
    const yDomain: [number, number] = [
      yAxisStart === 'zero' ? 0 : yAxisStart === 'auto' ? yExtent[0] : yExtent[0],
      yExtent[1],
    ];

    const xScale = d3.scaleLinear().domain(xDomain).nice().range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);

    // Color scale
    let colorScale: d3.ScaleOrdinal<string, string> | undefined;
    if (colorKey) {
      const uniqueCategories = Array.from(new Set(processedData.map(d => String(d[colorKey]))));
      const categoryColors = uniqueCategories.map(
        (cat, i) => themeColors[cat] || d3.schemeCategory10[i % 10]
      );
      colorScale = d3.scaleOrdinal<string>().domain(uniqueCategories).range(categoryColors);
    }

    // Size scale
    let sizeScale: d3.ScaleLinear<number, number> | undefined;
    if (sizeKey) {
      const sizeValues = processedData.map(d => +d[sizeKey]).filter(v => !isNaN(v));
      sizeScale = d3
        .scaleLinear()
        .domain(d3.extent(sizeValues) as [number, number])
        .range([minPointRadius, maxPointRadius]);
    }

    // Grid lines
    const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
    const textColor = isDarkMode ? '#e5e7eb' : '#374151';

    if (showGrid) {
      chartGroup
        .selectAll('.grid-line-x')
        .data(xScale.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-line-x')
        .attr('x1', (d: d3.NumberValue) => xScale(+d))
        .attr('x2', (d: d3.NumberValue) => xScale(+d))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('opacity', gridOpacity);

      chartGroup
        .selectAll('.grid-line-y')
        .data(yScale.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-line-y')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', (d: d3.NumberValue) => yScale(+d))
        .attr('y2', (d: d3.NumberValue) => yScale(+d))
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('opacity', gridOpacity);
    }

    // X Axis
    if (showAxisTicks) {
      const xAxis = d3.axisBottom(xScale).ticks(8);
      if (xAxisFormatter) {
        xAxis.tickFormat(d => xAxisFormatter(+d));
      }
      const xAxisGroup = chartGroup
        .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis);
      xAxisGroup
        .selectAll('text')
        .attr('fill', textColor)
        .attr('font-size', fontSize.axis || 12)
        .attr('transform', `rotate(${xAxisRotation})`)
        .style('text-anchor', xAxisRotation !== 0 ? 'end' : 'middle');

      // Y Axis
      const yAxis = d3.axisLeft(yScale).ticks(8);
      if (yAxisFormatter) {
        yAxis.tickFormat(d => yAxisFormatter(+d));
      }
      const yAxisGroup = chartGroup.append('g').call(yAxis);
      yAxisGroup
        .selectAll('text')
        .attr('fill', textColor)
        .attr('font-size', fontSize.axis || 12);
    }

    // Axis labels (match LineChart)
    if (showAxisLabels) {
      if (xAxisLabel) {
        chartGroup
          .append('text')
          .attr('x', innerWidth / 2)
          .attr('y', innerHeight + (dimensions.width < 768 ? 40 : 50))
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .style('font-size', `${responsiveFontSize.label}px`)
          .style('font-weight', '600')
          .text(xAxisLabel);
      }
      if (yAxisLabel) {
        chartGroup
          .append('text')
          .attr('transform', `rotate(-90)`)
          .attr('x', -innerHeight / 2)
          .attr('y', dimensions.width < 768 ? -55 : -65)
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .style('font-size', `${responsiveFontSize.label}px`)
          .style('font-weight', '600')
          .text(yAxisLabel);
      }
    }

    // Title
    if (title) {
      svg
        .append('text')
        .attr('x', chartWidth / 2)
        .attr('y', margin.top / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${titleFontSize || 18}px`)
        .style('font-weight', 'bold')
        .text(title);
    }

    // Tooltip group
    const tooltipGroup = svg.append('g').attr('class', 'scatter-tooltip-group');

    // Draw points with animation and tooltip
    chartGroup
      .selectAll('.scatter-point')
      .data(processedData)
      .enter()
      .append('circle')
      .attr('class', 'scatter-point')
      .attr('cx', (d: ScatterDataPoint) => xScale(+d[xAxisKey]))
      .attr('cy', (d: ScatterDataPoint) => yScale(+d[yAxisKey]))
      .attr('r', 0)
      .attr('fill', (d: ScatterDataPoint) =>
        colorKey && colorScale
          ? colorScale(String(d[colorKey]))
          : themeColors['default'] || '#3b82f6'
      )
      .attr('opacity', pointOpacity)
      .style('cursor', showTooltip ? 'pointer' : 'default')
      .on('mouseover', function (event, d) {
        if (!showTooltip) return;
        // Remove any existing tooltip
        tooltipGroup.selectAll('*').remove();
        // Tooltip content
        const tooltipContent =
          `${xAxisKey}: ${d[xAxisKey]}\n${yAxisKey}: ${d[yAxisKey]}` +
          (colorKey ? `\n${colorKey}: ${d[colorKey]}` : '') +
          (sizeKey ? `\n${sizeKey}: ${d[sizeKey]}` : '');
        // Position
        const mouse = d3.pointer(event, svg.node());
        tooltipGroup
          .append('rect')
          .attr('x', mouse[0] + 10)
          .attr('y', mouse[1] - 10)
          .attr('width', 180)
          .attr('height', 60)
          .attr('fill', isDarkMode ? '#222' : '#fff')
          .attr('stroke', isDarkMode ? '#eee' : '#333')
          .attr('rx', 8)
          .attr('opacity', 0.95);
        tooltipGroup
          .append('text')
          .attr('x', mouse[0] + 20)
          .attr('y', mouse[1] + 10)
          .attr('fill', isDarkMode ? '#fff' : '#222')
          .style('font-size', '14px')
          .style('font-family', 'monospace')
          .text(tooltipContent)
          .call(text => {
            const lines = tooltipContent.split('\n');
            lines.forEach((line, i) => {
              text
                .append('tspan')
                .attr('x', mouse[0] + 20)
                .attr('y', mouse[1] + 10 + i * 18)
                .text(line);
            });
          });
      })
      .on('mouseout', function () {
        tooltipGroup.selectAll('*').remove();
      })
      .transition()
      .duration(animationDuration)
      .attr('r', (d: ScatterDataPoint) =>
        sizeKey && sizeScale ? sizeScale(+d[sizeKey]) : pointRadius
      );

    // Legend (match LineChart glassmorphism, responsive)
    if (showLegend && colorKey && colorScale) {
      const categories = colorScale.domain();
      // Responsive legend sizing
      const legendItemHeight = 28;
      const legendItemSpacing = 6;
      const legendPadding = 12;
      const legendWidth = dimensions.width < 640 ? 100 : 120;
      const legendHeight =
        categories.length * legendItemHeight +
        (categories.length - 1) * legendItemSpacing +
        2 * legendPadding;
      // Position legend bottom right (like LineChart)
      const legendX = dimensions.width - margin.right - legendWidth - 16;
      const legendY = dimensions.height - legendHeight - 16;
      // Glassmorphism background
      const legendGroup = svg.append('g').attr('class', 'legend-group');
      legendGroup
        .append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth + 2 * legendPadding)
        .attr('height', legendHeight)
        .attr('fill', isDarkMode ? 'rgba(55,65,81,0.8)' : 'rgba(248,250,252,0.9)')
        .attr('stroke', isDarkMode ? 'rgba(107,114,128,0.3)' : 'rgba(209,213,219,0.3)')
        .attr('stroke-width', 1)
        .attr('rx', dimensions.width < 640 ? 8 : 12)
        .attr('ry', dimensions.width < 640 ? 8 : 12)
        .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))')
        .style('backdrop-filter', 'blur(10px)');
      // Legend items
      categories.forEach((category, i) => {
        const itemY = legendY + legendPadding + i * (legendItemHeight + legendItemSpacing);
        legendGroup
          .append('circle')
          .attr('cx', legendX + legendPadding + 10)
          .attr('cy', itemY + legendItemHeight / 2)
          .attr('r', 7)
          .attr('fill', colorScale(category));
        legendGroup
          .append('text')
          .attr('x', legendX + legendPadding + 28)
          .attr('y', itemY + legendItemHeight / 2 + 4)
          .attr('font-size', legendFontSize)
          .attr('fill', textColor)
          .style('font-weight', 'bold')
          .text(category);
      });
    }

    // Regression line
    if (showRegressionLine && xValues.length > 1) {
      const regression = calculateLinearRegression(xValues, yValues);
      const regressionColor = regressionLineColor || (isDarkMode ? '#ef4444' : '#dc2626');

      chartGroup
        .append('line')
        .attr('class', 'regression-line')
        .attr('x1', xScale(xDomain[0]))
        .attr('y1', yScale(regression.slope * xDomain[0] + regression.intercept))
        .attr('x2', xScale(xDomain[1]))
        .attr('y2', yScale(regression.slope * xDomain[1] + regression.intercept))
        .attr('stroke', regressionColor)
        .attr('stroke-width', regressionLineWidth)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.7);
    }
  }, [
    processedData,
    dimensions,
    margin,
    xAxisKey,
    yAxisKey,
    colorKey,
    sizeKey,
    pointRadius,
    minPointRadius,
    maxPointRadius,
    pointOpacity,
    title,
    xAxisLabel,
    yAxisLabel,
    showGrid,
    showLegend,
    showTooltip,
    showAxisLabels,
    showAxisTicks,
    gridOpacity,
    legendFontSize,
    xAxisStart,
    yAxisStart,
    xAxisRotation,
    yAxisFormatter,
    xAxisFormatter,
    fontSize,
    titleFontSize,
    labelFontSize,
    backgroundColor,
    animationDuration,
    showRegressionLine,
    regressionLineColor,
    regressionLineWidth,
    themeColors,
    isDarkMode,
  ]);

  // NOTE: To ensure the scatter chart is always as large as LineChart, BarChart, and AreaChart,
  // make sure the parent container does NOT restrict width/height. This div uses 100% width/height.
  // If the chart appears small, check parent CSS/layout.
  return (
    <div ref={containerRef} className="w-full h-full" style={{ width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default D3ScatterChart;
