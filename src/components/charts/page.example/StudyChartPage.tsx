import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function StudyChartPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 });
  const currentWidth = dimensions.width;
  const currentHeight = dimensions.height;
  const backgroundColor = '#000000';

  useEffect(() => {
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3.select(svgRef.current);
   // Add background
    svg.append("rect")
      .attr("width", currentWidth)
      .attr("height", currentHeight)
      .attr("fill", backgroundColor)
      .attr("rx", 8);

    // Add subtle Y-axis background area
    svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 50)
      .attr("height", currentHeight)
      .attr("fill", '#1f2937' )
      .attr("opacity", 0.3);
    
  }, []);

  return (
    <div className="relative w-full bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-auto"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}
