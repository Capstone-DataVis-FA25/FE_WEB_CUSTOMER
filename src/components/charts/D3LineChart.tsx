import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface ChartDataPoint {
  [key: string]: number | string;
}

export interface D3LineChartProps {
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
  showPoints?: boolean;
  animationDuration?: number;
  curve?: d3.CurveFactory;
}

const defaultColors: Record<string, { light: string; dark: string }> = {
  line1: { light: "#3b82f6", dark: "#60a5fa" },
  line2: { light: "#f97316", dark: "#fb923c" },
  line3: { light: "#6b7280", dark: "#9ca3af" },
  line4: { light: "#eab308", dark: "#facc15" },
  line5: { light: "#ef4444", dark: "#f87171" },
  line6: { light: "#10b981", dark: "#34d399" },
  line7: { light: "#8b5cf6", dark: "#a78bfa" },
  line8: { light: "#f59e0b", dark: "#fbbf24" },
};

const D3LineChart: React.FC<D3LineChartProps> = ({
  data,
  width = 800,
  height = 500,
  margin = { top: 20, right: 150, bottom: 60, left: 60 },
  xAxisKey,
  yAxisKeys,
  colors = defaultColors,
  title,
  yAxisLabel,
  xAxisLabel,
  showLegend = true,
  showGrid = true,
  showPoints = true,
  animationDuration = 1000,
  curve = d3.curveMonotoneX,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [dimensions, setDimensions] = React.useState({ width, height });

  // Monitor container size for responsiveness
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const aspectRatio = height / width;
        const newWidth = Math.min(containerWidth - 32, width); // 32px for padding
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

    // Initial theme detection
    updateTheme();

    // Listen for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Use responsive dimensions
    const currentWidth = dimensions.width;
    const currentHeight = dimensions.height;

    // Get current theme colors
    const getCurrentColors = () => {
      const theme = isDarkMode ? 'dark' : 'light';
      const result: Record<string, string> = {};
      yAxisKeys.forEach((key, index) => {
        const colorKey = colors[key] ? key : `line${index + 1}`;
        result[key] = colors[colorKey]?.[theme] || defaultColors[`line${index + 1}`][theme];
      });
      return result;
    };

    const currentColors = getCurrentColors();

    // Theme-aware colors
    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
    const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';
    const backgroundColor = isDarkMode ? '#111827' : '#ffffff';

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    
    // Responsive margin adjustments
    const responsiveMargin = {
      top: margin.top,
      right: currentWidth < 768 ? margin.right * 0.6 : margin.right, // Smaller right margin on mobile
      bottom: currentWidth < 768 ? margin.bottom * 0.8 : margin.bottom,
      left: currentWidth < 768 ? margin.left * 0.8 : margin.left
    };

    // Set dimensions
    const innerWidth = currentWidth - responsiveMargin.left - responsiveMargin.right;
    const innerHeight = currentHeight - responsiveMargin.top - responsiveMargin.bottom;

    // Add background
    svg.append("rect")
      .attr("width", currentWidth)
      .attr("height", currentHeight)
      .attr("fill", backgroundColor)
      .attr("rx", 8);

    // Create main group
    const g = svg.append("g")
      .attr("transform", `translate(${responsiveMargin.left},${responsiveMargin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[xAxisKey] as number) as [number, number])
      .range([0, innerWidth]);

    const allYValues = data.flatMap(d => 
      yAxisKeys.map(key => d[key] as number)
    );
    
    const yScale = d3.scaleLinear()
      .domain(d3.extent(allYValues) as [number, number])
      .nice()
      .range([innerHeight, 0]);

    // Grid lines
    if (showGrid) {
      // Horizontal grid lines
      g.selectAll(".grid-line-horizontal")
        .data(yScale.ticks())
        .enter()
        .append("line")
        .attr("class", "grid-line-horizontal")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("stroke", gridColor)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.5);

      // Vertical grid lines
      g.selectAll(".grid-line-vertical")
        .data(xScale.ticks())
        .enter()
        .append("line")
        .attr("class", "grid-line-vertical")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", gridColor)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.3);
    }

    // X Axis with responsive font size
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format("d"));
    
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", textColor)
      .style("font-size", currentWidth < 768 ? "10px" : "12px")
      .style("font-weight", "500");

    g.select(".domain")
      .attr("stroke", axisColor)
      .attr("stroke-width", 2);

    g.selectAll(".tick line")
      .attr("stroke", axisColor);

    // Y Axis with responsive font size
    const yAxis = d3.axisLeft(yScale);
    
    g.append("g")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", textColor)
      .style("font-size", currentWidth < 768 ? "10px" : "12px")
      .style("font-weight", "500");

    g.selectAll(".domain")
      .attr("stroke", axisColor)
      .attr("stroke-width", 2);

    g.selectAll(".tick line")
      .attr("stroke", axisColor);



    // Create lines for each yAxisKey
    yAxisKeys.forEach((key, index) => {
      // Custom line generator for this specific key
      const keyLine = d3.line<ChartDataPoint>()
        .x(d => xScale(d[xAxisKey] as number))
        .y(d => yScale(d[key] as number))
        .curve(curve);

      // Add the line path
      const path = g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", currentColors[key])
        .attr("stroke-width", currentWidth < 768 ? 2 : 3)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("d", keyLine)
        .style("filter", "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))")
        .style("opacity", 0);

      // Animate the line
      const totalLength = path.node()?.getTotalLength() || 0;
      
      path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .style("opacity", 1)
        .transition()
        .duration(animationDuration)
        .ease(d3.easeQuadInOut)
        .attr("stroke-dashoffset", 0)
        .on("end", () => {
          path.attr("stroke-dasharray", "none");
        });

      // Add data points
      if (showPoints) {
        g.selectAll(`.point-${index}`)
          .data(data)
          .enter()
          .append("circle")
          .attr("class", `point-${index}`)
          .attr("cx", d => xScale(d[xAxisKey] as number))
          .attr("cy", d => yScale(d[key] as number))
          .attr("r", 0)
          .attr("fill", currentColors[key])
          .attr("stroke", backgroundColor)
          .attr("stroke-width", 2)
          .style("filter", "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))")
          .on("mouseover", function(_event, d) {
            // Tooltip on hover
            d3.select(this)
              .transition()
              .duration(150)
              .attr("r", 6);

            // Create tooltip
            const tooltip = g.append("g")
              .attr("class", "tooltip")
              .attr("transform", `translate(${xScale(d[xAxisKey] as number)}, ${yScale(d[key] as number) - 10})`);

            tooltip.append("rect")
              .attr("x", -25)
              .attr("y", -25)
              .attr("width", 50)
              .attr("height", 20)
              .attr("fill", isDarkMode ? '#1f2937' : '#f9fafb')
              .attr("stroke", currentColors[key])
              .attr("stroke-width", 1)
              .attr("rx", 4);

            tooltip.append("text")
              .attr("text-anchor", "middle")
              .attr("y", -10)
              .attr("fill", textColor)
              .style("font-size", currentWidth < 768 ? "10px" : "12px")
              .style("font-weight", "500")
              .text(d[key] as string);
          })
          .on("mouseout", function() {
            d3.select(this)
              .transition()
              .duration(150)
              .attr("r", 4);

            g.select(".tooltip").remove();
          })
          .transition()
          .delay(animationDuration + index * 100)
          .duration(300)
          .ease(d3.easeBackOut)
          .attr("r", 4);
      }
    });

    // Add legend
    if (showLegend && currentWidth >= 640) { // Only show legend on larger screens
      const legend = g.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${innerWidth + 20}, 20)`);

      // Legend background
      const legendHeight = yAxisKeys.length * 25 + 20;
      const legendWidth = currentWidth < 768 ? 100 : 120; // Smaller legend on mobile
      
      legend.append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", isDarkMode ? '#1f2937' : '#f9fafb')
        .attr("stroke", isDarkMode ? '#4b5563' : '#d1d5db')
        .attr("stroke-width", 1)
        .attr("rx", 6)
        .style("filter", "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1))");

      // Legend title
      legend.append("text")
        .attr("x", legendWidth / 2 - 10)
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .attr("fill", textColor)
        .style("font-size", currentWidth < 768 ? "12px" : "14px")
        .style("font-weight", "600")
        .text("Legend");

      // Legend items
      yAxisKeys.forEach((key, i) => {
        const legendItem = legend.append("g")
          .attr("class", "legend-item")
          .attr("transform", `translate(0, ${20 + i * 25})`)
          .style("cursor", "pointer")
          .style("opacity", 0);

        legendItem.append("rect")
          .attr("x", 5)
          .attr("y", -7)
          .attr("width", 14)
          .attr("height", 14)
          .attr("fill", currentColors[key])
          .attr("rx", 2);

        legendItem.append("text")
          .attr("x", 25)
          .attr("y", 5)
          .attr("fill", textColor)
          .style("font-size", currentWidth < 768 ? "10px" : "12px")
          .style("font-weight", "500")
          .text(key);

        // Animate legend items
        legendItem
          .transition()
          .delay(animationDuration + i * 100)
          .duration(300)
          .style("opacity", 1);

        // Legend item interactions
        legendItem.on("mouseover", function() {
          d3.select(this).select("rect")
            .transition()
            .duration(150)
            .attr("width", 16)
            .attr("height", 16)
            .attr("x", 4)
            .attr("y", -8);
        })
        .on("mouseout", function() {
          d3.select(this).select("rect")
            .transition()
            .duration(150)
            .attr("width", 14)
            .attr("height", 14)
            .attr("x", 5)
            .attr("y", -7);
        });
      });
    }

    // Add axis labels with responsive font sizes
    if (xAxisLabel) {
      g.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + (currentWidth < 768 ? 40 : 50))
        .attr("text-anchor", "middle")
        .attr("fill", textColor)
        .style("font-size", currentWidth < 768 ? "12px" : "14px")
        .style("font-weight", "600")
        .text(xAxisLabel);
    }

    if (yAxisLabel) {
      g.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("x", -innerHeight / 2)
        .attr("y", currentWidth < 768 ? -30 : -40)
        .attr("text-anchor", "middle")
        .attr("fill", textColor)
        .style("font-size", currentWidth < 768 ? "12px" : "14px")
        .style("font-weight", "600")
        .text(yAxisLabel);
    }

  }, [data, margin, xAxisKey, yAxisKeys, colors, showLegend, showGrid, showPoints, animationDuration, curve, title, xAxisLabel, yAxisLabel, isDarkMode, dimensions]);

  return (
    <div ref={containerRef} className="w-full">
      {title && (
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          {title}
        </h3>
      )}
      
      <div className="flex justify-center w-full overflow-x-auto">
        <div className="min-w-full">
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 w-full max-w-full h-auto"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
          />
        </div>
      </div>

      {/* Mobile Legend - Show below chart on smaller screens */}
      {showLegend && dimensions.width < 640 && (
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {yAxisKeys.map((key, index) => {
            const colorKey = colors[key] ? key : `line${index + 1}`;
            const color = colors[colorKey]?.[isDarkMode ? 'dark' : 'light'] || defaultColors[`line${index + 1}`][isDarkMode ? 'dark' : 'light'];
            
            return (
              <div key={key} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default D3LineChart;
