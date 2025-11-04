import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { defaultColorsChart } from '@/utils/Utils';
import {
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  MOBILE_MARGIN_TOP_FACTOR,
  MOBILE_MARGIN_RIGHT_FACTOR,
  MOBILE_MARGIN_BOTTOM_FACTOR,
  MOBILE_MARGIN_LEFT_FACTOR,
} from '@/constants/response-breakpoint';

export interface ChartDataPoint {
  [key: string]: number | string;
}

export interface D3CyclePlotProps {
  arrayData?: (string | number)[][]; // Array data input (headers + rows)
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };

  // Cycle configuration
  cycleKey: string; // Key for cycle grouping (e.g., "Year")
  periodKey: string; // Key for period within cycle (e.g., "Month", "Quarter")
  valueKey: string; // Key for the value to plot

  // Styling
  colors?: Record<string, { light: string; dark: string }>;
  lineWidth?: number;
  pointRadius?: number;
  opacity?: number;

  // Display options
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showPoints?: boolean;
  showTooltip?: boolean;
  showTooltipDelta?: boolean;

  // Grid styling
  gridOpacity?: number;

  // Legend
  legendFontSize?: number;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';

  // Axis configuration
  yAxisStart?: 'auto' | 'zero';
  xAxisRotation?: number;
  showAxisLabels?: boolean;
  showAxisTicks?: boolean;
  // Period ordering
  periodOrdering?: 'auto' | 'custom';

  // Formatters
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string | number) => string;

  // Font sizes
  fontSize?: { axis: number; label: number; title: number };
  titleFontSize?: number;
  labelFontSize?: number;

  // Theme
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;

  // Animation
  animationDuration?: number;

  // Curve type
  curveType?: 'linear' | 'monotone' | 'natural' | 'step' | 'basis';

  // Extras
  showAverageLine?: boolean;
  emphasizeLatestCycle?: boolean;
  showRangeBand?: boolean;

  // Zoom and Pan
  enableZoom?: boolean;
  enablePan?: boolean;
  zoomExtent?: number;
}

// Convert array data to chart data format
function convertArrayToCyclePlotData(arrayData: (string | number)[][]): ChartDataPoint[] {
  if (!arrayData || arrayData.length === 0) return [];
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

  const chartData: ChartDataPoint[] = dataRows.map((row, rowIndex) => {
    const dataPoint: ChartDataPoint = {};
    headers.forEach((header, headerIndex) => {
      const value = row[headerIndex];

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

  return chartData;
}

const D3CyclePlot: React.FC<D3CyclePlotProps> = ({
  arrayData,
  width = 800,
  height = 600,
  margin = { top: 60, right: 40, bottom: 80, left: 80 },
  cycleKey,
  periodKey,
  valueKey,
  colors = defaultColorsChart,
  lineWidth = 2,
  pointRadius = 4,
  opacity = 0.8,
  title,
  xAxisLabel,
  yAxisLabel,
  showLegend = true,
  showGrid = true,
  showPoints = true,
  showTooltip = true,
  showTooltipDelta = false,
  gridOpacity = 0.3,
  legendFontSize = 12,
  legendPosition = 'top',
  yAxisStart = 'auto',
  xAxisRotation = 0,
  showAxisLabels = true,
  showAxisTicks = true,
  periodOrdering = 'auto',
  yAxisFormatter,
  xAxisFormatter,
  fontSize = { axis: 12, label: 14, title: 16 },
  titleFontSize = 18,
  labelFontSize = 14,
  theme = 'auto',
  backgroundColor = 'transparent',
  animationDuration = 1000,
  curveType = 'monotone',
  showAverageLine = false,
  emphasizeLatestCycle = false,
  showRangeBand = false,
  enableZoom = false,
  enablePan = false,
  zoomExtent = 10,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dimensions, setDimensions] = useState({ width, height });

  // Process data
  const processedData = React.useMemo(
    () => convertArrayToCyclePlotData(arrayData || []),
    [arrayData]
  );

  // Helpers: ordering for periods and cycles
  const monthOrder = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];
  const fullMonthOrder = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  const detectAndSortPeriods = (periodsRaw: Array<string | number>): string[] => {
    const vals = periodsRaw.map(v => String(v));
    const lower = vals.map(v => v.toLowerCase());

    const isQuarter = lower.every(v => /^q[1-4]$/.test(v));
    if (isQuarter) {
      return ['Q1', 'Q2', 'Q3', 'Q4'].filter(q => vals.some(v => v.toUpperCase() === q));
    }

    const numeric = vals.map(v => Number(v));
    const allNumeric = numeric.every(v => !isNaN(v));
    if (allNumeric) {
      return vals
        .map((v, i) => ({ v, n: Number(v), i }))
        .sort((a, b) => a.n - b.n || a.i - b.i)
        .map(o => o.v);
    }

    const isShortMonths = lower.every(v => monthOrder.includes(v));
    if (isShortMonths) {
      return monthOrder
        .map((m, idx) => ({ m, idx }))
        .filter(o => lower.includes(o.m))
        .map(o => vals[lower.indexOf(o.m)]);
    }

    const isFullMonths = lower.every(v => fullMonthOrder.includes(v));
    if (isFullMonths) {
      return fullMonthOrder
        .map((m, idx) => ({ m, idx }))
        .filter(o => lower.includes(o.m))
        .map(o => vals[lower.indexOf(o.m)]);
    }

    // fallback alphabetical
    return [...vals].sort((a, b) => a.localeCompare(b));
  };

  const sortCyclesSmart = (cyclesRaw: Array<string | number>): Array<string | number> => {
    const vals = cyclesRaw;
    const nums = vals.map(v => (typeof v === 'number' ? v : Number(v)));
    const allNum = nums.every(v => !isNaN(v));
    if (allNum) return [...vals].sort((a: any, b: any) => Number(a) - Number(b));

    const dates = vals.map(v => Date.parse(String(v)));
    const allDate = dates.every(ts => !isNaN(ts));
    if (allDate) return [...vals].sort((a, b) => Date.parse(String(a)) - Date.parse(String(b)));

    return [...vals].sort((a, b) => String(a).localeCompare(String(b)));
  };

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

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let aspectRatio = height / width;

        if (containerWidth < MOBILE_BREAKPOINT) {
          aspectRatio = Math.min(aspectRatio * 1.2, 0.75);
        } else if (containerWidth < TABLET_BREAKPOINT) {
          aspectRatio = Math.min(aspectRatio, 0.6);
        } else {
          aspectRatio = Math.min(aspectRatio, 0.5);
        }

        const newWidth = Math.min(containerWidth - 16, width);
        let newHeight = newWidth * aspectRatio;

        const hasXAxisLabel = xAxisLabel && showAxisLabels;
        if (hasXAxisLabel) {
          newHeight += containerWidth < MOBILE_BREAKPOINT ? 35 : 40;
        }

        if (showLegend && legendPosition === 'bottom') {
          newHeight = newHeight * 0.85;
          newHeight += 80;
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
  }, [width, height, showLegend, showAxisLabels, xAxisLabel, legendPosition]);

  // Get curve factory based on curveType
  const getCurve = (type: string): d3.CurveFactory => {
    switch (type) {
      case 'linear':
        return d3.curveLinear;
      case 'monotone':
        return d3.curveMonotoneX;
      case 'natural':
        return d3.curveNatural;
      case 'step':
        return d3.curveStep;
      case 'basis':
        return d3.curveBasis;
      default:
        return d3.curveMonotoneX;
    }
  };

  // Main rendering effect
  useEffect(() => {
    if (!processedData || processedData.length === 0 || !svgRef.current) {
      return;
    }

    if (!cycleKey || !periodKey || !valueKey) {
      console.warn('CyclePlot requires cycleKey, periodKey, and valueKey');
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const chartWidth = dimensions.width;
    const chartHeight = dimensions.height;

    // Responsive margins
    const responsiveMargin = {
      top:
        chartWidth < MOBILE_BREAKPOINT
          ? Math.max(margin.top * MOBILE_MARGIN_TOP_FACTOR, 40)
          : margin.top,
      right:
        chartWidth < MOBILE_BREAKPOINT
          ? Math.max(margin.right * MOBILE_MARGIN_RIGHT_FACTOR, 30)
          : margin.right,
      bottom:
        legendPosition === 'bottom'
          ? chartWidth < MOBILE_BREAKPOINT
            ? Math.max(margin.bottom * 2.5, 120)
            : Math.max(margin.bottom * 2.0, 100)
          : xAxisLabel && showAxisLabels
            ? chartWidth < MOBILE_BREAKPOINT
              ? Math.max(margin.bottom + 30, 60)
              : Math.max(margin.bottom + 35, 70)
            : chartWidth < MOBILE_BREAKPOINT
              ? Math.max(margin.bottom * MOBILE_MARGIN_BOTTOM_FACTOR, 40)
              : margin.bottom,
      left:
        yAxisLabel && showAxisLabels
          ? chartWidth < MOBILE_BREAKPOINT
            ? Math.max(margin.left * MOBILE_MARGIN_LEFT_FACTOR + 20, 65)
            : Math.max(margin.left + 25, 80)
          : chartWidth < MOBILE_BREAKPOINT
            ? Math.max(margin.left * MOBILE_MARGIN_LEFT_FACTOR, 50)
            : margin.left,
    };

    const innerWidth = Math.max(chartWidth - responsiveMargin.left - responsiveMargin.right, 100);
    const innerHeight = Math.max(chartHeight - responsiveMargin.top - responsiveMargin.bottom, 100);

    if (innerWidth <= 0 || innerHeight <= 0) return;

    // Group data by cycle (e.g., by year)
    const cycleGroups = d3.group(processedData, d => d[cycleKey]);
    const cycles = sortCyclesSmart(Array.from(cycleGroups.keys()));

    // Get all unique periods (e.g., months, quarters)
    const allPeriodsRaw = Array.from(new Set(processedData.map(d => d[periodKey])));
    const allPeriods =
      periodOrdering === 'custom'
        ? allPeriodsRaw.map(v => String(v)).sort((a, b) => a.localeCompare(b))
        : detectAndSortPeriods(allPeriodsRaw as any);

    // Validate data
    if (cycles.length === 0 || allPeriods.length === 0) {
      const textColor = isDarkMode ? '#e5e7eb' : '#374151';
      svg
        .append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', '14px')
        .text('No valid data for cycle plot');
      return;
    }

    // Set background
    svg
      .append('rect')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('fill', backgroundColor)
      .attr('rx', 8);

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${responsiveMargin.left},${responsiveMargin.top})`);

    // Create scales
    // X scale: period (e.g., Month 1-12, Quarter 1-4)
    const xScale = d3
      .scalePoint()
      .domain(allPeriods.map(String))
      .range([0, innerWidth])
      .padding(0.1);

    // Y scale: value
    const allValues = processedData.map(d => +d[valueKey]).filter(v => !isNaN(v));
    const yExtent = d3.extent(allValues) as [number, number];

    const yDomain: [number, number] =
      yAxisStart === 'zero' ? [0, yExtent[1]] : [yExtent[0], yExtent[1]];

    const yScale = d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);

    // Colors
    const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
    const textColor = isDarkMode ? '#e5e7eb' : '#374151';

    // Grid lines
    if (showGrid) {
      // Horizontal grid lines
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

      // Vertical grid lines
      chartGroup
        .selectAll('.grid-line-x')
        .data(allPeriods)
        .enter()
        .append('line')
        .attr('class', 'grid-line-x')
        .attr('x1', d => xScale(String(d)) || 0)
        .attr('x2', d => xScale(String(d)) || 0)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('opacity', gridOpacity);
    }

    // Draw axes
    if (showAxisTicks) {
      // X axis
      const xAxis = d3.axisBottom(xScale);
      if (xAxisFormatter) {
        xAxis.tickFormat(d => xAxisFormatter(d as string));
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

      // Y axis
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

    // Axis labels
    if (showAxisLabels) {
      if (xAxisLabel) {
        chartGroup
          .append('text')
          .attr('x', innerWidth / 2)
          .attr('y', innerHeight + (dimensions.width < 768 ? 50 : 60))
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .style('font-size', `${labelFontSize}px`)
          .style('font-weight', '600')
          .text(xAxisLabel);
      }

      if (yAxisLabel) {
        chartGroup
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('x', -innerHeight / 2)
          .attr('y', dimensions.width < 768 ? -50 : -60)
          .attr('text-anchor', 'middle')
          .attr('fill', textColor)
          .style('font-size', `${labelFontSize}px`)
          .style('font-weight', '600')
          .text(yAxisLabel);
      }
    }

    // Line generator
    const lineGenerator = d3
      .line<ChartDataPoint>()
      .defined(d => !isNaN(+d[valueKey]))
      .x(d => xScale(String(d[periodKey])) || 0)
      .y(d => yScale(+d[valueKey]))
      .curve(getCurve(curveType));

    // Build color mapping: prefer explicit mapping by cycle key if provided
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(cycles.map(String))
      .range(Object.values(themeColors));

    const colorForCycle = (cycleVal: any) => {
      const key = String(cycleVal);
      if (colors && (colors as any)[key]) {
        const v = (colors as any)[key];
        if (typeof v === 'object' && 'light' in v) {
          return isDarkMode ? v.dark : v.light;
        }
        return v as string;
      }
      return colorScale(key) as string;
    };

    // Precompute per-period stats
    const dataByCycle = new Map<string, Map<string, number>>();
    cycles.forEach(c => {
      const map = new Map<string, number>();
      (cycleGroups.get(c) || []).forEach((row: any) => {
        const val = +row[valueKey];
        if (!isNaN(val)) map.set(String(row[periodKey]), val);
      });
      dataByCycle.set(String(c), map);
    });

    const statsByPeriod = allPeriods.map(p => {
      const values = cycles
        .map(c => dataByCycle.get(String(c))?.get(String(p)))
        .filter((v): v is number => typeof v === 'number' && !isNaN(v));
      const avg = values.length ? (d3.mean(values as number[]) ?? NaN) : NaN;
      const min = values.length ? (d3.min(values as number[]) ?? NaN) : NaN;
      const max = values.length ? (d3.max(values as number[]) ?? NaN) : NaN;
      return { period: String(p), avg, min, max };
    });

    // Tooltip
    const tooltip = chartGroup.append('g').attr('class', 'cycle-tooltip').style('display', 'none');

    tooltip
      .append('rect')
      .attr('fill', isDarkMode ? '#1f2937' : 'white')
      .attr('stroke', isDarkMode ? '#4b5563' : '#d1d5db')
      .attr('stroke-width', 1)
      .attr('rx', 4);

    const tooltipText = tooltip
      .append('text')
      .attr('fill', textColor)
      .style('font-size', '12px')
      .style('font-weight', '500');

    // Draw lines for each cycle
    const latestCycle = cycles.length ? cycles[cycles.length - 1] : undefined;
    cycles.forEach((cycle, cycleIndex) => {
      const cycleData = Array.from(cycleGroups.get(cycle) || []);
      const color = colorForCycle(cycle);
      const isLatest = emphasizeLatestCycle && String(cycle) === String(latestCycle);

      // Draw line
      const path = chartGroup
        .append('path')
        .datum(cycleData)
        .attr('class', `cycle-line cycle-${cycleIndex}`)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', isLatest ? (lineWidth || 2) + 1.5 : lineWidth)
        .attr('opacity', isLatest ? Math.min((opacity || 0.8) + 0.2, 1) : opacity)
        .attr('d', lineGenerator);

      // Animate line
      const totalLength = (path.node() as SVGPathElement).getTotalLength();
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(animationDuration)
        .attr('stroke-dashoffset', 0);

      // Draw points
      if (showPoints) {
        chartGroup
          .selectAll(`.cycle-point-${cycleIndex}`)
          .data(cycleData)
          .enter()
          .append('circle')
          .attr('class', `cycle-point cycle-point-${cycleIndex}`)
          .attr('cx', d => xScale(String(d[periodKey])) || 0)
          .attr('cy', d => yScale(+d[valueKey]))
          .attr('r', 0)
          .attr('fill', color)
          .attr('stroke', 'white')
          .attr('stroke-width', 1.5)
          .style('cursor', showTooltip ? 'pointer' : 'default')
          .on('mouseover', function (event, d) {
            if (!showTooltip) return;

            d3.select(this)
              .transition()
              .duration(150)
              .attr('r', pointRadius * 1.5);

            const baseVal = +d[valueKey];
            const avgEntry = statsByPeriod.find(s => s.period === String(d[periodKey]));
            const avgVal = avgEntry && !isNaN(avgEntry.avg) ? avgEntry.avg : undefined;
            let yoyDelta: number | undefined = undefined;
            let yoyPct: number | undefined = undefined;
            if (showTooltipDelta) {
              // YoY: only when cycles numeric
              const numCycle = Number(d[cycleKey]);
              if (!isNaN(numCycle)) {
                const prev = dataByCycle.get(String(numCycle - 1))?.get(String(d[periodKey]));
                if (typeof prev === 'number') {
                  yoyDelta = baseVal - prev;
                  yoyPct = prev !== 0 ? (yoyDelta / prev) * 100 : undefined;
                }
              }
            }

            const tooltipContent: string[] = [
              `${cycleKey}: ${d[cycleKey]}`,
              `${periodKey}: ${d[periodKey]}`,
              `${valueKey}: ${yAxisFormatter ? yAxisFormatter(baseVal) : String(baseVal)}`,
            ];
            if (showTooltipDelta && typeof avgVal === 'number') {
              const delta = baseVal - avgVal;
              const pct = avgVal !== 0 ? (delta / avgVal) * 100 : undefined;
              tooltipContent.push(
                `vs avg: ${yAxisFormatter ? yAxisFormatter(delta) : delta.toFixed(2)}${
                  typeof pct === 'number' ? ` (${pct.toFixed(1)}%)` : ''
                }`
              );
            }
            if (showTooltipDelta && typeof yoyDelta === 'number') {
              tooltipContent.push(
                `vs last year: ${yAxisFormatter ? yAxisFormatter(yoyDelta) : yoyDelta.toFixed(2)}${
                  typeof yoyPct === 'number' ? ` (${yoyPct.toFixed(1)}%)` : ''
                }`
              );
            }

            tooltip.style('display', null);

            tooltipText.selectAll('tspan').remove();
            tooltipContent.forEach((line, i) => {
              tooltipText
                .append('tspan')
                .attr('x', 10)
                .attr('y', 15 + i * 16)
                .text(line);
            });

            const bbox = (tooltipText.node() as SVGTextElement).getBBox();
            tooltip
              .select('rect')
              .attr('width', bbox.width + 20)
              .attr('height', bbox.height + 10);

            const mouse = d3.pointer(event, chartGroup.node());
            let tooltipX = mouse[0] + 10;
            let tooltipY = mouse[1] - 10;

            // Keep tooltip within bounds
            if (tooltipX + bbox.width + 20 > innerWidth) {
              tooltipX = mouse[0] - bbox.width - 30;
            }
            if (tooltipY < 0) {
              tooltipY = mouse[1] + 20;
            }

            tooltip.attr('transform', `translate(${tooltipX},${tooltipY})`);
          })
          .on('mouseout', function () {
            d3.select(this).transition().duration(150).attr('r', pointRadius);
            tooltip.style('display', 'none');
          })
          .transition()
          .duration(animationDuration)
          .delay((_, i) => i * 50)
          .attr('r', pointRadius);
      }
    });

    // Range band (min-max)
    if (showRangeBand) {
      const area = d3
        .area<{ period: string; min: number; max: number }>()
        .defined(d => !isNaN(d.min) && !isNaN(d.max))
        .x(d => xScale(String(d.period)) || 0)
        .y0(d => yScale(d.max))
        .y1(d => yScale(d.min))
        .curve(getCurve(curveType));

      chartGroup
        .append('path')
        .datum(statsByPeriod)
        .attr('fill', isDarkMode ? '#60a5fa22' : '#3b82f622')
        .attr('stroke', 'none')
        .attr('d', area as any);
    }

    // Average line
    if (showAverageLine) {
      const avgLine = d3
        .line<{ period: string; avg: number }>()
        .defined(d => !isNaN(d.avg))
        .x(d => xScale(String(d.period)) || 0)
        .y(d => yScale(d.avg))
        .curve(getCurve(curveType));

      chartGroup
        .append('path')
        .datum(statsByPeriod)
        .attr('fill', 'none')
        .attr('stroke', isDarkMode ? '#60a5fa' : '#3b82f6')
        .attr('stroke-dasharray', '4 4')
        .attr('stroke-width', 2)
        .attr('opacity', 0.9)
        .attr('d', avgLine as any);
    }

    // Zoom and Pan
    if (enableZoom || enablePan) {
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, zoomExtent])
        .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
          const transform = event.transform;
          chartGroup.attr(
            'transform',
            `translate(${responsiveMargin.left},${responsiveMargin.top}) scale(${transform.k}) translate(${transform.x},${transform.y})`
          );
        });

      if (!enableZoom) {
        zoom.scaleExtent([1, 1]); // Disable zoom
      }
      if (!enablePan) {
        zoom.translateExtent([
          [0, 0],
          [0, 0],
        ]); // Disable pan
      }

      svg.call(zoom as any);
    }

    // Legend
    if (showLegend) {
      const legendItemHeight = 20;
      const legendItemWidth = 120;

      if (legendPosition === 'top' || legendPosition === 'bottom') {
        // Horizontal, centered, wrapping legend
        const itemsPerRow = Math.max(1, Math.floor(innerWidth / legendItemWidth));

        const legendY =
          legendPosition === 'top'
            ? -responsiveMargin.top + 10
            : innerHeight + (xAxisLabel && showAxisLabels ? 70 : 50);

        const legendGroup = chartGroup
          .append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(0, ${legendY})`);

        const totalRows = Math.ceil(cycles.length / itemsPerRow);
        const itemsInRow = (row: number) =>
          row < totalRows - 1
            ? itemsPerRow
            : Math.max(1, cycles.length - (totalRows - 1) * itemsPerRow);

        cycles.forEach((cycle, index) => {
          const row = Math.floor(index / itemsPerRow);
          const col = index % itemsPerRow;

          const thisRowCount = itemsInRow(row);
          const rowWidth = thisRowCount * legendItemWidth;
          const rowOffsetX = Math.max(0, (innerWidth - rowWidth) / 2);

          const x = rowOffsetX + col * legendItemWidth;
          const y = row * legendItemHeight;

          const item = legendGroup.append('g').attr('transform', `translate(${x}, ${y})`);

          // Color line
          item
            .append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', legendItemHeight / 2)
            .attr('y2', legendItemHeight / 2)
            .attr('stroke', colorScale(String(cycle)))
            .attr('stroke-width', lineWidth);

          // Label
          item
            .append('text')
            .attr('x', 25)
            .attr('y', legendItemHeight / 2)
            .attr('dy', '0.35em')
            .attr('fill', textColor)
            .style('font-size', `${legendFontSize}px`)
            .style('font-weight', '500')
            .text(String(cycle));
        });
      } else {
        // Vertical legend (right/left)
        const legendX = legendPosition === 'right' ? innerWidth + 20 : -responsiveMargin.left + 10;

        const legendGroup = chartGroup
          .append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${legendX}, 0)`);

        cycles.forEach((cycle, index) => {
          const y = index * legendItemHeight;

          const item = legendGroup.append('g').attr('transform', `translate(0, ${y})`);

          item
            .append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', legendItemHeight / 2)
            .attr('y2', legendItemHeight / 2)
            .attr('stroke', colorScale(String(cycle)))
            .attr('stroke-width', lineWidth);

          item
            .append('text')
            .attr('x', 25)
            .attr('y', legendItemHeight / 2)
            .attr('dy', '0.35em')
            .attr('fill', textColor)
            .style('font-size', `${legendFontSize}px`)
            .style('font-weight', '500')
            .text(String(cycle));
        });
      }
    }
  }, [
    processedData,
    dimensions,
    cycleKey,
    periodKey,
    valueKey,
    themeColors,
    lineWidth,
    pointRadius,
    opacity,
    showGrid,
    showPoints,
    showLegend,
    showTooltip,
    gridOpacity,
    yAxisStart,
    xAxisRotation,
    showAxisLabels,
    showAxisTicks,
    yAxisFormatter,
    xAxisFormatter,
    fontSize,
    titleFontSize,
    labelFontSize,
    legendFontSize,
    legendPosition,
    backgroundColor,
    animationDuration,
    curveType,
    isDarkMode,
    title,
    xAxisLabel,
    yAxisLabel,
    showAverageLine,
    emphasizeLatestCycle,
    showRangeBand,
    showTooltipDelta,
    periodOrdering,
    enableZoom,
    enablePan,
    zoomExtent,
  ]);

  return (
    <div ref={containerRef} className="w-full">
      {title && title.trim() !== '' && (
        <h3
          className="font-bold text-gray-900 dark:text-white text-center mb-4"
          style={{ fontSize: `${titleFontSize}px` }}
        >
          {title}
        </h3>
      )}

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

export default D3CyclePlot;
