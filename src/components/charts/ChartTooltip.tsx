import * as d3 from 'd3';

/**
 * Tooltip line configuration
 */
export interface TooltipLine {
  text: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  isHeader?: boolean;
  isSeparator?: boolean;
}

/**
 * Tooltip configuration
 *
 * @example
 * // Basic usage with auto-positioning to avoid cursor
 * renderD3Tooltip(tooltipGroup, {
 *   lines: [
 *     createHeader('Sales Data'),
 *     createStatLine('Revenue', 1234567),
 *     createPercentLine('Growth', 15.5)
 *   ],
 *   position: { x: mouseX, y: mouseY },
 *   containerWidth: chartWidth,
 *   containerHeight: chartHeight,
 * });
 *
 * @example
 * // Force tooltip to always appear above (legacy behavior)
 * renderD3Tooltip(tooltipGroup, {
 *   lines: tooltipLines,
 *   position: { x: barX, y: barY },
 *   preferPosition: 'above',
 *   avoidPointer: false, // Disable smart positioning
 * });
 */
export interface TooltipConfig {
  lines: TooltipLine[];
  isDarkMode?: boolean;
  backgroundColor?: string;
  textColor?: string;
  strokeColor?: string;
  opacity?: number;
  borderRadius?: number;
  padding?: { x: number; y: number };
  lineHeight?: number;
  /** Position of the data point / cursor to show tooltip near */
  position?: { x: number; y: number };
  containerWidth?: number;
  containerHeight?: number;
  /** Minimum gap between tooltip and pointer position (default: 15px) */
  pointerGap?: number;
  /**
   * Preferred tooltip position. When 'auto', tooltip intelligently chooses best position.
   * Options: 'above' | 'below' | 'left' | 'right' | 'auto'
   * Default: 'auto'
   */
  preferPosition?: 'above' | 'below' | 'left' | 'right' | 'auto';
  /** Duration for smooth position transitions in milliseconds (default: 200ms) */
  animationDuration?: number;
  /**
   * Whether to automatically avoid covering the pointer/cursor position.
   * When true (default), tooltip will intelligently position itself to not obstruct the data point.
   * Set to false for legacy centered behavior.
   * Default: true
   */
  avoidPointer?: boolean;
  /**
   * Additional horizontal offset when avoiding pointer (in pixels).
   * Increases the gap between cursor and tooltip edge.
   * Default: 10px
   */
  horizontalOffset?: number;
}

/**
 * Create or update a D3 tooltip
 * Returns the tooltip group element for further manipulation if needed
 */
export function renderD3Tooltip(
  tooltipGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  config: TooltipConfig
): d3.Selection<SVGGElement, unknown, null, undefined> {
  const {
    lines,
    isDarkMode = false,
    backgroundColor = isDarkMode ? '#222' : '#fff',
    textColor = isDarkMode ? '#fff' : '#222',
    strokeColor = isDarkMode ? '#eee' : '#333',
    opacity = 0.95,
    borderRadius = 8,
    padding = { x: 12, y: 8 }, // Increased from 10,5 to 12,8 for better spacing
    lineHeight = 20, // Increased from 18 to 20 for better readability
    position = { x: 0, y: 0 },
    containerWidth,
    containerHeight,
    pointerGap = 15,
    preferPosition = 'auto',
    animationDuration = 200,
    avoidPointer = true,
    horizontalOffset = 10,
  } = config;

  // Check if this is a content update (tooltip already exists with content)
  const isUpdate = !tooltipGroup.selectAll('*').empty();

  // Clear previous tooltip content
  tooltipGroup.selectAll('*').remove();

  // Create text element with lines
  const textEl = tooltipGroup
    .append('text')
    .attr('fill', textColor)
    .style('font-family', 'system-ui, -apple-system, sans-serif');

  let currentY = padding.y + 12; // Start position with padding

  lines.forEach(line => {
    if (line.isSeparator) {
      // Empty line separator - reduce spacing
      currentY += lineHeight * 0.5;
      return;
    }

    const tspan = textEl.append('tspan').attr('x', padding.x).attr('y', currentY).text(line.text);

    // Apply custom styles
    if (line.fontSize) {
      tspan.style('font-size', `${line.fontSize}px`);
    } else {
      tspan.style('font-size', '12px');
    }

    if (line.fontWeight) {
      tspan.style('font-weight', line.fontWeight);
    }

    if (line.color) {
      tspan.attr('fill', line.color);
    }

    if (line.isHeader) {
      tspan.style('font-weight', '700').style('font-size', '13px');
    }

    currentY += lineHeight;
  });

  // Get bounding box of text for background sizing
  const bbox = (textEl.node() as SVGTextElement).getBBox();
  const tooltipWidth = bbox.width + padding.x * 2;
  const tooltipHeight = bbox.height + padding.y * 2;

  // Insert background rectangle behind text
  tooltipGroup
    .insert('rect', 'text')
    .attr('width', tooltipWidth)
    .attr('height', tooltipHeight)
    .attr('fill', backgroundColor)
    .attr('stroke', strokeColor)
    .attr('stroke-width', 1)
    .attr('rx', borderRadius)
    .attr('ry', borderRadius)
    .attr('opacity', opacity)
    .style('filter', 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))');

  // Calculate final position with smart positioning to avoid covering pointer
  let finalX = position.x;
  let finalY = position.y;

  /**
   * Smart positioning algorithm to keep tooltip visible and away from cursor
   *
   * Algorithm:
   * 1. Generate 6 candidate positions around the pointer (above-right, above-left, etc.)
   * 2. Score each position based on:
   *    - How well it fits within container bounds (penalize overflow)
   *    - User's preferred position (bonus points)
   *    - Natural reading direction (slight bonus for right-side positions)
   * 3. Select position with highest score
   * 4. Apply final boundary adjustments as safety net
   *
   * This ensures tooltip never covers the data point being hovered and
   * automatically adapts to edge cases (near chart borders, corners, etc.)
   */
  if (avoidPointer) {
    // Try different positions and choose the best one based on available space
    const positions = [
      // Above-right (default preference) - Best for most cases
      {
        x: position.x + horizontalOffset,
        y: position.y - tooltipHeight - pointerGap,
        score: 0,
        name: 'above-right',
      },
      // Above-left - Good when right side is constrained
      {
        x: position.x - tooltipWidth - horizontalOffset,
        y: position.y - tooltipHeight - pointerGap,
        score: 0,
        name: 'above-left',
      },
      // Below-right - When top space is limited
      {
        x: position.x + horizontalOffset,
        y: position.y + pointerGap,
        score: 0,
        name: 'below-right',
      },
      // Below-left - Bottom-left corner fallback
      {
        x: position.x - tooltipWidth - horizontalOffset,
        y: position.y + pointerGap,
        score: 0,
        name: 'below-left',
      },
      // Right side
      {
        x: position.x + pointerGap + horizontalOffset,
        y: position.y - tooltipHeight / 2,
        score: 0,
        name: 'right',
      },
      // Left side
      {
        x: position.x - tooltipWidth - pointerGap - horizontalOffset,
        y: position.y - tooltipHeight / 2,
        score: 0,
        name: 'left',
      },
    ];

    // Score each position based on:
    // 1. How much it stays within bounds
    // 2. Preference for above over below
    // 3. Preference for right over left (for LTR languages)
    positions.forEach(pos => {
      let score = 100;

      // Penalize if goes off edges
      if (containerWidth) {
        if (pos.x < 0) {
          score -= Math.abs(pos.x) * 2;
        }
        if (pos.x + tooltipWidth > containerWidth) {
          score -= (pos.x + tooltipWidth - containerWidth) * 2;
        }
      }

      if (containerHeight) {
        if (pos.y < 0) {
          score -= Math.abs(pos.y) * 3; // Penalize top overflow more
        }
        if (pos.y + tooltipHeight > containerHeight) {
          score -= (pos.y + tooltipHeight - containerHeight) * 2;
        }
      }

      // Bonus for preferred positions
      if (preferPosition === 'above' && pos.name.startsWith('above')) {
        score += 20;
      } else if (preferPosition === 'below' && pos.name.startsWith('below')) {
        score += 20;
      } else if (preferPosition === 'left' && pos.name.includes('left')) {
        score += 20;
      } else if (preferPosition === 'right' && pos.name.includes('right')) {
        score += 20;
      } else if (preferPosition === 'auto') {
        // Default preference: above-right > above-left > below-right > below-left
        if (pos.name === 'above-right') score += 15;
        else if (pos.name === 'above-left') score += 10;
        else if (pos.name === 'below-right') score += 5;
      }

      pos.score = score;
    });

    // Choose position with highest score
    const bestPosition = positions.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    finalX = bestPosition.x;
    finalY = bestPosition.y;
  } else {
    // Legacy behavior when avoidPointer is false
    finalX = position.x - tooltipWidth / 2; // Center horizontally

    if (preferPosition === 'above' || preferPosition === 'auto') {
      finalY = position.y - tooltipHeight - pointerGap;
      if (preferPosition === 'auto' && finalY < 0 && containerHeight) {
        finalY = position.y + pointerGap;
      }
    } else if (preferPosition === 'below') {
      finalY = position.y + pointerGap;
    } else if (preferPosition === 'left') {
      finalX = position.x - tooltipWidth - pointerGap;
      finalY = position.y - tooltipHeight / 2;
    } else if (preferPosition === 'right') {
      finalX = position.x + pointerGap;
      finalY = position.y - tooltipHeight / 2;
    }
  }

  // Final boundary adjustments (safety net)
  if (containerWidth) {
    if (finalX < 5) {
      finalX = 5;
    } else if (finalX + tooltipWidth > containerWidth - 5) {
      finalX = containerWidth - tooltipWidth - 5;
    }
  }

  if (finalY < 5) {
    finalY = 5;
  }

  if (containerHeight && finalY + tooltipHeight > containerHeight - 5) {
    finalY = Math.max(5, containerHeight - tooltipHeight - 5);
  }

  // Apply final position with smooth transition
  // Use transition for updates, immediate for first render
  if (isUpdate) {
    tooltipGroup
      .transition()
      .duration(animationDuration)
      .ease(d3.easeCubicOut)
      .attr('transform', `translate(${finalX},${finalY})`);
  } else {
    tooltipGroup.attr('transform', `translate(${finalX},${finalY})`);
  }

  return tooltipGroup;
}

/**
 * Truncate text if it exceeds maxLength
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 1) + '…';
}

/**
 * Create a statistics line for tooltip (common pattern in bar/scatter charts)
 */
export function createStatLine(
  label: string,
  value: number | string,
  options?: {
    prefix?: string;
    suffix?: string;
    color?: string;
    fontWeight?: string;
    fontSize?: number;
    maxLabelLength?: number;
    maxValueLength?: number;
  }
): TooltipLine {
  const maxLabelLen = options?.maxLabelLength || 20;
  const maxValueLen = options?.maxValueLength || 25;

  const truncatedLabel = truncateText(label, maxLabelLen);
  const displayValue = typeof value === 'number' ? value.toLocaleString() : String(value);
  const truncatedValue = truncateText(displayValue, maxValueLen);

  const text = `${options?.prefix || ''}${truncatedLabel}: ${truncatedValue}${options?.suffix || ''}`;

  return {
    text,
    color: options?.color,
    fontWeight: options?.fontWeight || '400',
    fontSize: options?.fontSize || 12,
  };
}

/**
 * Create a percentage line with color coding based on positive/negative
 */
export function createPercentLine(
  label: string,
  percent: number,
  options?: {
    isDarkMode?: boolean;
    showSign?: boolean;
    fontSize?: number;
  }
): TooltipLine {
  const sign = percent >= 0 ? '+' : '';
  const displayPercent =
    options?.showSign !== false ? `${sign}${percent.toFixed(1)}%` : `${percent.toFixed(1)}%`;

  // Color coding: green for positive, red for negative
  const isDarkMode = options?.isDarkMode || false;
  let color: string | undefined;
  if (percent > 0) {
    color = isDarkMode ? '#4ade80' : '#16a34a'; // green
  } else if (percent < 0) {
    color = isDarkMode ? '#f87171' : '#dc2626'; // red
  }

  return {
    text: `${label}: ${displayPercent}`,
    color,
    fontWeight: '600',
    fontSize: options?.fontSize || 12,
  };
}

/**
 * Create a ranking line
 */
export function createRankLine(
  rank: number,
  total: number,
  options?: { fontSize?: number }
): TooltipLine {
  return {
    text: `Rank: #${rank} of ${total}`,
    fontWeight: '600',
    fontSize: options?.fontSize || 12,
  };
}

/**
 * Create a separator line
 */
export function createSeparator(): TooltipLine {
  return {
    text: '',
    isSeparator: true,
  };
}

/**
 * Create a header line
 */
export function createHeader(
  text: string,
  options?: { fontSize?: number; color?: string }
): TooltipLine {
  return {
    text,
    isHeader: true,
    fontSize: options?.fontSize || 13,
    color: options?.color,
  };
}
