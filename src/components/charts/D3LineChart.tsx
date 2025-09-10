  import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTranslation } from 'react-i18next';
import { convertArrayToChartData } from '@/utils/dataConverter';

export interface ChartDataPoint {
  [key: string]: number | string;
}

export interface D3LineChartProps {
  arrayData?: (string | number)[][]; // Array data input
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  xAxisKey: string;
  yAxisKeys: string[];
  disabledLines?: string[]; // New prop for disabled lines
  colors?: Record<string, { light: string; dark: string }>;
  seriesNames?: Record<string, string>; // Add series names mapping
  // Individual series configurations
  seriesConfigs?: Record<string, {
    lineWidth?: number;
    pointRadius?: number;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    pointStyle?: 'circle' | 'square' | 'triangle' | 'diamond';
    opacity?: number;
    formatter?: string;
  }>;
  title?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showPoints?: boolean;
  xAxisStart?: "auto" | "zero" | number; // Add custom X-axis start option
  yAxisStart?: "auto" | "zero" | number; // Add custom Y-axis start option
  animationDuration?: number;
  curve?: d3.CurveFactory;
  yAxisFormatter?: (value: number) => string; // Add custom Y-axis formatter
  xAxisFormatter?: (value: number) => string; // Add custom X-axis formatter
  fontSize?: { axis: number; label: number; title: number }; // Add fontSize prop
  
  // New styling props
  lineWidth?: number;
  pointRadius?: number;
  gridOpacity?: number;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  // New axis props
  xAxisRotation?: number;
  yAxisRotation?: number;
  showAxisLabels?: boolean;
  showAxisTicks?: boolean;
  
  // New interaction props
  enableZoom?: boolean;
  showTooltip?: boolean;
  
  // New visual props
  theme?: 'light' | 'dark' | 'auto';
  backgroundColor?: string;
  titleFontSize?: number;
  labelFontSize?: number;
  legendFontSize?: number;
}

export const defaultColors: Record<string, { light: string; dark: string }> = {
  line1: { light: '#3b82f6', dark: '#60a5fa' },
  line2: { light: '#f97316', dark: '#fb923c' },
  line3: { light: '#6b7280', dark: '#9ca3af' },
  line4: { light: '#eab308', dark: '#facc15' },
  line5: { light: '#ef4444', dark: '#f87171' },
  line6: { light: '#10b981', dark: '#34d399' },
  line7: { light: '#8b5cf6', dark: '#a78bfa' },
  line8: { light: '#f59e0b', dark: '#fbbf24' },
};

const D3LineChart: React.FC<D3LineChartProps> = ({
  arrayData,
  width = 800,
  height = 600, // Reduced from 500 to 400 for better proportions
  margin = { top: 20, right: 40, bottom: 60, left: 80 }, // Increased left margin for better Y-axis spacing
  xAxisKey,
  yAxisKeys,
  disabledLines = [], // Default to no disabled lines
  colors = defaultColors,
  seriesNames = {}, // Default to empty object
  seriesConfigs = {}, // Individual series configurations
  title,
  yAxisLabel,
  xAxisLabel,
  showLegend = true,
  showGrid = true,
  showPoints = true,
  xAxisStart = "auto", // Default to auto
  yAxisStart = "auto", // Default to auto
  animationDuration = 1000,
  curve = d3.curveMonotoneX,
  yAxisFormatter, // Optional custom Y-axis formatter
  xAxisFormatter, // Optional custom X-axis formatter
  fontSize = { axis: 12, label: 14, title: 16 }, // Default fontSize
  
  // New styling props with defaults
  lineWidth = 2,
  pointRadius = 4,
  gridOpacity = 0.3,
  legendPosition = 'bottom',
  
  // New axis props with defaults
  xAxisRotation = 0,
  yAxisRotation = 0,
  showAxisLabels = true,
  showAxisTicks = true,
  
  // New interaction props with defaults
  enableZoom = false,
  showTooltip = true,
  
  // New visual props with defaults
  theme = 'auto',
  backgroundColor = 'transparent',
  titleFontSize = 16,
  labelFontSize = 12,
  legendFontSize = 11,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width, height });
  const { t } = useTranslation();



  // Helper function for different point shapes
  const getPointPath = (style: string, radius: number): string => {
    const r = radius;
    switch (style) {
      case 'square':
        return `M${-r},${-r}L${r},${-r}L${r},${r}L${-r},${r}Z`;
      case 'triangle':
        return `M0,${-r}L${r * 0.866},${r * 0.5}L${-r * 0.866},${r * 0.5}Z`;
      case 'diamond':
        return `M0,${-r}L${r},0L0,${r}L${-r},0Z`;
      default: // circle
        return `M0,${-r}A${r},${r} 0 1,1 0,${r}A${r},${r} 0 1,1 0,${-r}`;
    }
  };

  // Update fontSize object with new props
  const responsiveFontSize = {
    axis: fontSize.axis,
    label: labelFontSize,
    title: titleFontSize,
  };

  // Convert arrayData to ChartDataPoint[] if provided
  const processedData = React.useMemo((): ChartDataPoint[] => {
    if (arrayData && arrayData.length > 0) {
      return convertArrayToChartData(arrayData);
    }
    
    return [];
  }, [arrayData]);

  // Monitor container size for responsiveness
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Better aspect ratio calculation for different screen sizes
        let aspectRatio = height / width;

        // Adjust aspect ratio based on screen size for better proportions
        if (containerWidth < 640) {
          aspectRatio = Math.min(aspectRatio * 1.2, 0.75); // Slightly taller on mobile but not too much
        } else if (containerWidth < 1024) {
          aspectRatio = Math.min(aspectRatio, 0.6); // Medium screens
        } else {
          aspectRatio = Math.min(aspectRatio, 0.5); // Desktop - wider ratio
        }

        const newWidth = Math.min(containerWidth - 16, width); // 16px for minimal padding
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
      if (theme === 'auto') {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
      } else {
        setIsDarkMode(theme === 'dark');
      }
    };

    // Initial theme detection
    updateTheme();

    // Listen for theme changes only if theme is auto
    if (theme === 'auto') {
      const observer = new MutationObserver(updateTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
      return () => observer.disconnect();
    }
  }, [theme]);

  useEffect(() => {
    if (!svgRef.current || !processedData.length) return;

    // Use responsive dimensions
    const currentWidth = dimensions.width;
    const currentHeight = dimensions.height;

    // Get current theme colors for enabled lines only
    const getCurrentColors = () => {
      const theme = isDarkMode ? 'dark' : 'light';
      const result: Record<string, string> = {};
      const enabledLines = yAxisKeys.filter(key => !disabledLines.includes(key));
      enabledLines.forEach((key, index) => {
        const colorKey = colors[key] ? key : `line${index + 1}`;
        result[key] = colors[colorKey]?.[theme] || defaultColors[`line${index + 1}`][theme];
      });
      return result;
    };

    const currentColors = getCurrentColors();

    // Theme-aware colors
    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const gridColor = isDarkMode ? '#4b5563' : '#9ca3af';
    const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';
    
    // Use backgroundColor prop or fallback to theme default
    const chartBackgroundColor = backgroundColor !== 'transparent' 
      ? backgroundColor 
      : (isDarkMode ? '#111827' : '#ffffff');

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
      .attr('fill', chartBackgroundColor)
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
    const xExtent = d3.extent(processedData, d => d[xAxisKey] as number) as [number, number];
    
    // Dynamic X scale domain based on xAxisStart prop
    let xDomain: [number, number];
    if (xAxisStart === "auto") {
      xDomain = xExtent;
    } else if (xAxisStart === "zero") {
      xDomain = [0, xExtent[1]];
    } else if (typeof xAxisStart === "number") {
      xDomain = [xAxisStart, xExtent[1]];
    } else {
      // Fallback to old logic for backward compatibility
      xDomain = xExtent[0] > 0 && xExtent[0] <= 1 ? [0, xExtent[1]] : xExtent;
    }
    
    const xScale = d3
      .scaleLinear()
      .domain(xDomain)
      .range([0, innerWidth]);

    const allYValues = processedData.flatMap(d => yAxisKeys.map(key => d[key] as number));
    const yExtent = d3.extent(allYValues) as [number, number];
    
    // Dynamic Y scale domain based on yAxisStart prop
    let yDomain: [number, number];
    if (yAxisStart === "auto") {
      yDomain = yExtent;
    } else if (yAxisStart === "zero") {
      yDomain = [0, yExtent[1]];
    } else if (typeof yAxisStart === "number") {
      yDomain = [yAxisStart, yExtent[1]];
    } else {
      // Fallback to old logic for backward compatibility
      yDomain = yExtent[0] > 0 ? [0, yExtent[1]] : yExtent;
    }

    const yScale = d3
      .scaleLinear()
      .domain(yDomain)
      .nice()
      .range([innerHeight, 0]);

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
        .attr('opacity', gridOpacity); // Use gridOpacity prop

      // Vertical grid lines
      g.selectAll('.grid-line-vertical')
        .data(xScale.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-line-vertical')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', gridColor)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', gridOpacity * 0.7); // Use gridOpacity prop (slightly less for vertical)
    }

    // X Axis with flexible formatting
    // Get unique X values from actual data to avoid duplicate ticks
    const uniqueXValues = [...new Set(processedData.map(d => d[xAxisKey] as number))].sort((a, b) => a - b);
    
    const xAxis = d3.axisBottom(xScale)
      .tickValues(uniqueXValues) // Use actual data values as ticks
      .tickSizeInner(showAxisTicks ? 6 : 0) // Control inner tick size
      .tickSizeOuter(showAxisTicks ? 6 : 0) // Control outer tick size
      .tickFormat(d => {
        const value = d.valueOf();
        // Use custom formatter if provided, otherwise use integer formatting
        if (xAxisFormatter) {
          return xAxisFormatter(value);
        }
        return d3.format('d')(value);
      });

    const xAxisGroup = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${responsiveFontSize.axis}px`)
      .style('font-weight', '500')
      .attr('transform', `rotate(${xAxisRotation})`)
      .style('text-anchor', xAxisRotation === 0 ? 'middle' : xAxisRotation > 0 ? 'start' : 'end');

    xAxisGroup.select('.domain').attr('stroke', axisColor).attr('stroke-width', 2);

    if (showAxisTicks) {
      xAxisGroup.selectAll('.tick line').attr('stroke', axisColor);
    }

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
      .tickSizeInner(showAxisTicks ? -5 : 0) // Control inner tick size
      .tickSizeOuter(showAxisTicks ? 6 : 0) // Control outer tick size
      .tickPadding(8); // More space between ticks and labels

    const yAxisGroup = g.append('g').call(yAxis);

    // Style Y-axis labels beautifully
    yAxisGroup
      .selectAll('text')
      .attr('fill', textColor)
      .style('font-size', `${responsiveFontSize.axis}px`)
      .style('font-weight', '600')
      .style('font-family', 'system-ui, -apple-system, sans-serif')
      .attr('text-anchor', 'end')
      .attr('x', -10) // Push labels further left for better spacing
      .attr('transform', `rotate(${yAxisRotation})`);

    // Style Y-axis domain line
    yAxisGroup
      .select('.domain')
      .attr('stroke', axisColor)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Style Y-axis tick lines
    if (showAxisTicks) {
      yAxisGroup
        .selectAll('.tick line')
        .attr('stroke', axisColor)
        .attr('stroke-width', 1)
        .attr('opacity', 0.6);
    }

    // Create lines for each enabled yAxisKey with individual configurations
    const enabledLines = yAxisKeys.filter(key => !disabledLines.includes(key));
    
    enabledLines.forEach((key, index) => {
      const seriesConfig = seriesConfigs[key] || {};
      
      // Get individual series configurations or fallback to global
      const seriesLineWidth = seriesConfig.lineWidth ?? lineWidth;
      const seriesPointRadius = seriesConfig.pointRadius ?? pointRadius;
      const seriesOpacity = seriesConfig.opacity ?? 1;
      const seriesLineStyle = seriesConfig.lineStyle ?? 'solid';
      const seriesPointStyle = seriesConfig.pointStyle ?? 'circle';
      
      // Custom line generator for this specific key
      const keyLine = d3
        .line<ChartDataPoint>()
        .x(d => xScale(d[xAxisKey] as number))
        .y(d => yScale(d[key] as number))
        .curve(curve);

      // Add the line path with individual styling
      const path = g
        .append('path')
        .datum(processedData)
        .attr('fill', 'none')
        .attr('stroke', currentColors[key])
        .attr('stroke-width', seriesLineWidth)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-opacity', seriesOpacity)
        .attr('d', keyLine)
        .style('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))')
        .style('opacity', 0);

      // Apply line style (dashed, dotted, etc.)
      if (seriesLineStyle === 'dashed') {
        path.attr('stroke-dasharray', `${seriesLineWidth * 3} ${seriesLineWidth * 2}`);
      } else if (seriesLineStyle === 'dotted') {
        path.attr('stroke-dasharray', `${seriesLineWidth} ${seriesLineWidth}`);
      }

      // Animate the line
      const totalLength = path.node()?.getTotalLength() || 0;

      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .style('opacity', 1)
        .transition()
        .duration(animationDuration)
        .ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0)
        .on('end', () => {
          // Restore original dash array for line styles
          if (seriesLineStyle === 'dashed') {
            path.attr('stroke-dasharray', `${seriesLineWidth * 3} ${seriesLineWidth * 2}`);
          } else if (seriesLineStyle === 'dotted') {
            path.attr('stroke-dasharray', `${seriesLineWidth} ${seriesLineWidth}`);
          } else {
            path.attr('stroke-dasharray', 'none');
          }
        });

      // Add data points with individual styling
      if (showPoints) {
        g.selectAll(`.point-${index}`)
          .data(processedData)
          .enter()
          .append('path')
          .attr('class', `point-${index}`)
          .attr('transform', d => `translate(${xScale(d[xAxisKey] as number)}, ${yScale(d[key] as number)})`)
          .attr('d', getPointPath(seriesPointStyle, 0))
          .attr('fill', currentColors[key])
          .attr('stroke', chartBackgroundColor)
          .attr('stroke-width', 2)
          .attr('opacity', seriesOpacity)
          .style('filter', 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))')
          .on('mouseover', function (_event, d) {
            if (!showTooltip) return;
            
            // Enhanced tooltip on hover
            d3.select(this)
              .transition()
              .duration(200)
              .attr('d', getPointPath(seriesPointStyle, seriesPointRadius * 1.5))
              .attr('stroke-width', 3);

            // Create enhanced tooltip
            const xValue = typeof d[xAxisKey] === 'number' ? d[xAxisKey].toLocaleString() : d[xAxisKey];
            const yValue = typeof d[key] === 'number' ? d[key].toLocaleString() : d[key];
            const seriesName = seriesNames[key] || key;
            
            const tooltip = g
              .append('g')
              .attr('class', 'tooltip')
              .attr(
                'transform',
                `translate(${xScale(d[xAxisKey] as number)}, ${yScale(d[key] as number) - 25})`
              );

            // Tooltip background with shadow - make it larger for more content
            tooltip
              .append('rect')
              .attr('x', -50)
              .attr('y', -35)
              .attr('width', 100)
              .attr('height', 45)
              .attr('fill', isDarkMode ? '#1f2937' : '#ffffff')
              .attr('stroke', currentColors[key])
              .attr('stroke-width', 2)
              .attr('rx', 6)
              .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))')
              .style('opacity', 0)
              .transition()
              .duration(200)
              .style('opacity', 0.95);

            // Series name
            tooltip
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('y', -25)
              .attr('fill', textColor)
              .style('font-size', `${Math.max(responsiveFontSize.axis - 1, 10)}px`)
              .style('font-weight', '600')
              .style('opacity', 0)
              .text(seriesName)
              .transition()
              .duration(200)
              .style('opacity', 1);

            // X value
            tooltip
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('y', -12)
              .attr('fill', textColor)
              .style('font-size', `${Math.max(responsiveFontSize.axis - 1, 10)}px`)
              .style('font-weight', '500')
              .style('opacity', 0)
              .text(`${xAxisLabel || 'X'}: ${xValue}`)
              .transition()
              .duration(200)
              .style('opacity', 0.8);

            // Y value
            tooltip
              .append('text')
              .attr('text-anchor', 'middle')
              .attr('y', 2)
              .attr('fill', textColor)
              .style('font-size', `${responsiveFontSize.axis}px`)
              .style('font-weight', '600')
              .style('opacity', 0)
              .text(`${yValue}`)
              .transition()
              .duration(200)
              .style('opacity', 1);
          })
          .on('mouseout', function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('d', getPointPath(seriesPointStyle, seriesPointRadius))
              .attr('stroke-width', 2);

            g.select('.tooltip').transition().duration(150).style('opacity', 0).remove();
          })
          .transition()
          .delay(animationDuration + index * 100)
          .duration(300)
          .ease(d3.easeBackOut)
          .attr('d', getPointPath(seriesPointStyle, seriesPointRadius));
      }
    });

    // Enhanced zoom and pan with mouse interactions
    if (enableZoom) {
      let zoomLevel = 1;
      let translateX = 0;
      let translateY = 0;
      let isDragging = false;
      let dragStartX = 0;
      let dragStartY = 0;
      let dragStartTranslateX = 0;
      let dragStartTranslateY = 0;
      
      // Mouse wheel zoom
      svg.on('wheel', function(event) {
        event.preventDefault();
        
        // Get mouse position relative to the chart
        const rect = svg.node()?.getBoundingClientRect();
        if (!rect) return;
        
        const mouseX = event.clientX - rect.left - responsiveMargin.left;
        const mouseY = event.clientY - rect.top - responsiveMargin.top;
        
        const delta = event.deltaY;
        const scaleFactor = delta > 0 ? 0.9 : 1.1;
        const newZoomLevel = zoomLevel * scaleFactor;
        
        // Limit zoom
        const clampedZoomLevel = Math.max(0.5, Math.min(3, newZoomLevel));
        const actualScaleFactor = clampedZoomLevel / zoomLevel;
        
        // Calculate new translation to zoom at mouse position
        const newTranslateX = translateX + (mouseX - translateX) * (1 - actualScaleFactor);
        const newTranslateY = translateY + (mouseY - translateY) * (1 - actualScaleFactor);
        
        // Update zoom state
        zoomLevel = clampedZoomLevel;
        translateX = newTranslateX;
        translateY = newTranslateY;
        
        // Apply zoom and pan transform
        const transform = `translate(${responsiveMargin.left + translateX},${responsiveMargin.top + translateY}) scale(${zoomLevel})`;
        g.attr('transform', transform);
      });
      
      // Mouse drag to pan
      svg.on('mousedown', function(event) {
        if (event.button !== 0) return; // Only left mouse button
        
        isDragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        dragStartTranslateX = translateX;
        dragStartTranslateY = translateY;
        
        // Change cursor to grabbing
        svg.style('cursor', 'grabbing');
        
        // Prevent text selection during drag
        event.preventDefault();
      });
      
      svg.on('mousemove', function(event) {
        if (!isDragging) {
          // Show grab cursor when zoomed in
          if (zoomLevel > 1) {
            svg.style('cursor', 'grab');
          } else {
            svg.style('cursor', 'default');
          }
          return;
        }
        
        const deltaX = event.clientX - dragStartX;
        const deltaY = event.clientY - dragStartY;
        
        // Update translation based on drag distance
        translateX = dragStartTranslateX + deltaX;
        translateY = dragStartTranslateY + deltaY;
        
        // Apply pan transform
        const transform = `translate(${responsiveMargin.left + translateX},${responsiveMargin.top + translateY}) scale(${zoomLevel})`;
        g.attr('transform', transform);
      });
      
      svg.on('mouseup', function() {
        if (isDragging) {
          isDragging = false;
          
          // Reset cursor
          if (zoomLevel > 1) {
            svg.style('cursor', 'grab');
          } else {
            svg.style('cursor', 'default');
          }
        }
      });
      
      // Handle mouse leave to stop dragging
      svg.on('mouseleave', function() {
        if (isDragging) {
          isDragging = false;
          svg.style('cursor', 'default');
        }
      });
      
      // Double-click to reset zoom
      svg.on('dblclick', function() {
        zoomLevel = 1;
        translateX = 0;
        translateY = 0;
        
        svg.style('cursor', 'default');
        
        g.transition()
          .duration(300)
          .ease(d3.easeQuadOut)
          .attr('transform', `translate(${responsiveMargin.left},${responsiveMargin.top}) scale(1)`);
      });
    }

    // Add axis labels with responsive font sizes
    if (xAxisLabel && showAxisLabels) {
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + (currentWidth < 768 ? 40 : 50))
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${responsiveFontSize.label}px`)
        .style('font-weight', '600')
        .text(xAxisLabel);
    }

    if (yAxisLabel && showAxisLabels) {
      g.append('text')
        .attr('transform', `rotate(-90)`)
        .attr('x', -innerHeight / 2)
        .attr('y', currentWidth < 768 ? -55 : -65) // Increased distance from Y-axis
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .style('font-size', `${responsiveFontSize.label}px`)
        .style('font-weight', '600')
        .text(yAxisLabel);
    }
  }, [
    processedData,
    margin,
    xAxisKey,
    yAxisKeys,
    disabledLines,
    colors,
    seriesConfigs,
    showLegend,
    showGrid,
    showPoints,
    animationDuration,
    curve,
    title,
    xAxisLabel,
    yAxisLabel,
    isDarkMode,
    dimensions,
    yAxisFormatter,
    xAxisFormatter,
    responsiveFontSize,
    xAxisStart,
    yAxisStart,
    lineWidth,
    pointRadius,
    gridOpacity,
    showTooltip,
    legendPosition,
    xAxisRotation,
    yAxisRotation,
    showAxisLabels,
    showAxisTicks,
    theme,
    legendFontSize,
  ]);

  return (
    <div ref={containerRef} className={`w-full ${legendPosition === 'top' || legendPosition === 'bottom' ? 'space-y-4' : 'flex gap-4'}`}>
      {title && title.trim() !== '' && (
        <h3
          className="font-bold text-gray-900 dark:text-white text-center"
          style={{ fontSize: `${responsiveFontSize.title}px` }}
        >
          {title}
        </h3>
      )}

      {/* Legend Top */}
      {showLegend && legendPosition === 'top' && (
        <div className="w-full">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 
              className="font-semibold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 text-center"
              style={{ fontSize: `${legendFontSize}px` }}
            >
              {t('legend')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {renderLegendItems()}
            </div>
          </div>
        </div>
      )}

      <div className={`${legendPosition === 'left' || legendPosition === 'right' ? 'flex gap-4' : ''}`}>
        {/* Legend Left */}
        {showLegend && legendPosition === 'left' && (
          <div className="w-64 flex-shrink-0">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h4 
                className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center"
                style={{ fontSize: `${legendFontSize}px` }}
              >
                {t('legend')}
              </h4>
              <div className="flex flex-col gap-3">
                {renderLegendItems()}
              </div>
            </div>
          </div>
        )}

        {/* Chart Container */}
        <div className={`relative bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden pl-3 ${legendPosition === 'left' || legendPosition === 'right' ? 'flex-1' : 'w-full'}`}>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-auto"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
          />
        </div>

        {/* Legend Right */}
        {showLegend && legendPosition === 'right' && (
          <div className="w-64 flex-shrink-0">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h4 
                className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center"
                style={{ fontSize: `${legendFontSize}px` }}
              >
                {t('legend')}
              </h4>
              <div className="flex flex-col gap-3">
                {renderLegendItems()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend Bottom */}
      {showLegend && legendPosition === 'bottom' && (
        <div className="w-full">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 
              className="font-semibold text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 text-center"
              style={{ fontSize: `${legendFontSize}px` }}
            >
              {t('legend')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {renderLegendItems()}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderLegendItems() {
    return yAxisKeys
      .filter(key => !disabledLines.includes(key))
      .map((key, index) => {
        const colorKey = colors[key] ? key : `line${index + 1}`;
        const color =
          colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] ||
          defaultColors[`line${index + 1}`][isDarkMode ? 'dark' : 'light'];
        
        // Use series name if provided, otherwise fallback to key
        const displayName = seriesNames[key] || key;

        return (
          <div
            key={key}
            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer group"
          >
            {/* Color Indicator */}
            <div className="flex-shrink-0">
              <div
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors duration-200"
                style={{ backgroundColor: color }}
              />
            </div>

            {/* Label */}
            <span 
              className="font-medium text-gray-700 dark:text-gray-300 capitalize group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200"
              style={{ fontSize: `${legendFontSize}px` }}
            >
              {displayName}
            </span>

            {/* Line Preview */}
            <div className="flex-1 flex justify-end">
              <div
                className="w-8 sm:w-8 h-2 sm:h-3 rounded opacity-60 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        );
      });
  }
};

export default D3LineChart;
