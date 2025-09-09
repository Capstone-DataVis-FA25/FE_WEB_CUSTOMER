import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

export interface MapDataPoint {
  region: string;
  value: number;
  [key: string]: string | number;
}

export interface MapChartProps {
  data: MapDataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  title?: string;
  colorScheme?: string[];
  animationDuration?: number;
  showLegend?: boolean;
}

// Simple world regions data - in real implementation, you'd use actual GeoJSON
const WORLD_REGIONS = [
  { name: 'North America', x: 150, y: 120, width: 120, height: 80 },
  { name: 'South America', x: 200, y: 250, width: 80, height: 120 },
  { name: 'Europe', x: 350, y: 100, width: 80, height: 70 },
  { name: 'Africa', x: 350, y: 180, width: 90, height: 140 },
  { name: 'Asia', x: 450, y: 80, width: 140, height: 120 },
  { name: 'Oceania', x: 520, y: 250, width: 60, height: 50 },
];

const D3MapChart: React.FC<MapChartProps> = ({
  data,
  width = 700,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 30 },
  title,
  colorScheme = ['#f7fafc', '#3182ce'],
  animationDuration = 1000,
  showLegend = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create data map for quick lookup
    const dataMap = new Map(data.map(d => [d.region, d.value]));

    // Color scale
    const maxValue = d3.max(data, d => d.value) || 0;
    const minValue = d3.min(data, d => d.value) || 0;

    const colorScale = d3.scaleSequential()
      .domain([minValue, maxValue])
      .interpolator(d3.interpolateBlues);

    const textColor = isDarkMode ? '#f3f4f6' : '#1f2937';
    const strokeColor = isDarkMode ? '#374151' : '#e5e7eb';

    // Create regions
    const regions = g.selectAll('.region')
      .data(WORLD_REGIONS)
      .enter()
      .append('g')
      .attr('class', 'region');

    // Add region shapes (simplified rectangles for demo)
    const shapes = regions.append('rect')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('fill', d => {
        const value = dataMap.get(d.name);
        return value !== undefined ? colorScale(value) : '#e5e7eb';
      })
      .attr('stroke', strokeColor)
      .attr('stroke-width', 1)
      .attr('opacity', 0)
      .attr('rx', 4)
      .attr('ry', 4);

    // Animation
    shapes.transition()
      .duration(animationDuration)
      .delay((_, i) => i * 100)
      .attr('opacity', 0.8);

    // Add region labels
    regions.append('text')
      .attr('x', d => d.x + d.width / 2)
      .attr('y', d => d.y + d.height / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', textColor)
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('opacity', 0)
      .text(d => d.name)
      .transition()
      .delay(animationDuration + 200)
      .duration(500)
      .style('opacity', 1);

    // Add value labels
    regions.append('text')
      .attr('x', d => d.x + d.width / 2)
      .attr('y', d => d.y + d.height / 2 + 15)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', textColor)
      .style('font-size', '11px')
      .style('font-weight', '500')
      .style('opacity', 0)
      .text(d => {
        const value = dataMap.get(d.name);
        return value !== undefined ? value.toLocaleString() : 'N/A';
      })
      .transition()
      .delay(animationDuration + 400)
      .duration(500)
      .style('opacity', 0.8);

    // Hover effects
    shapes
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('stroke-width', 2);

        // Tooltip
        const value = dataMap.get(d.name);
        if (value !== undefined) {
          const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .style('background', isDarkMode ? '#1f2937' : 'white')
            .style('border', `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`)
            .style('border-radius', '6px')
            .style('padding', '12px 16px')
            .style('font-size', '14px')
            .style('color', isDarkMode ? '#f3f4f6' : '#1f2937')
            .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .style('opacity', 0);

          const tooltipContent = `
            <div style="font-weight: 600; margin-bottom: 4px;">${d.name}</div>
            <div style="color: ${isDarkMode ? '#9ca3af' : '#6b7280'};">Value: ${value.toLocaleString()}</div>
          `;

          tooltip.html(tooltipContent);

          tooltip.transition()
            .duration(200)
            .style('opacity', 1);

          tooltip
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        }
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('stroke-width', 1);
        
        d3.selectAll('.tooltip').remove();
      });

  }, [data, width, height, margin, colorScheme, animationDuration, isDarkMode]);

  // Prepare legend data
  const maxValue = d3.max(data, d => d.value) || 0;
  const minValue = d3.min(data, d => d.value) || 0;
  const legendSteps = 5;
  const legendData = Array.from({ length: legendSteps }, (_, i) => {
    const value = minValue + (maxValue - minValue) * (i / (legendSteps - 1));
    return { value, color: d3.interpolateBlues(i / (legendSteps - 1)) };
  });

  return (
    <div className="w-full space-y-4">
      {title && (
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground text-center">
          {title}
        </h3>
      )}

      <div className="relative w-full bg-background rounded-xl border-2 border-border shadow-lg overflow-hidden">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-auto"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        />
      </div>

      {/* Legend */}
      {showLegend && data.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="text-sm font-medium text-foreground">Value Range</div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">{minValue.toLocaleString()}</span>
              <div className="flex">
                {legendData.map((item, index) => (
                  <div
                    key={index}
                    className="w-6 h-4 border-r border-border last:border-r-0"
                    style={{ backgroundColor: item.color }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{maxValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Data Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        {data.map((item) => (
          <div
            key={item.region}
            className="p-3 bg-card rounded-lg border border-border text-center"
          >
            <div className="text-xs font-medium text-muted-foreground mb-1">
              {item.region}
            </div>
            <div className="text-lg font-bold text-foreground">
              {item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default D3MapChart;
