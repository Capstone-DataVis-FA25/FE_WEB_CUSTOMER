import React from 'react';

export interface ChartIconProps {
  type: string;
  className?: string;
  size?: number;
}

const ChartIcon: React.FC<ChartIconProps> = ({ type, className = '', size = 120 }) => {
  const renderIcon = () => {
    switch (type) {
      case 'line':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="16" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
            </defs>
            <rect width="120" height="80" fill="url(#grid)" />

            {/* Axes */}
            <line
              x1="15"
              y1="65"
              x2="105"
              y2="65"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="15"
              y1="65"
              x2="15"
              y2="15"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Line chart paths */}
            <path
              d="M 20 50 L 30 45 L 40 40 L 50 35 L 60 30 L 70 25 L 80 30 L 90 20 L 100 15"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 20 55 L 30 52 L 40 48 L 50 45 L 60 42 L 70 38 L 80 35 L 90 32 L 100 25"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {[20, 30, 40, 50, 60, 70, 80, 90, 100].map((x, i) => (
              <g key={i}>
                <circle cx={x} cy={50 - i * 4} r="2.5" fill="#3b82f6" />
                <circle cx={x} cy={55 - i * 3} r="2.5" fill="#10b981" />
              </g>
            ))}
          </svg>
        );

      case 'bar':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Grid lines */}
            <defs>
              <pattern id="barGrid" width="20" height="16" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
            </defs>
            <rect width="120" height="80" fill="url(#barGrid)" />

            {/* Axes */}
            <line
              x1="15"
              y1="65"
              x2="105"
              y2="65"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="15"
              y1="65"
              x2="15"
              y2="15"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Grouped bars */}
            {[
              { x: 25, heights: [35, 25, 30], colors: ['#3b82f6', '#10b981', '#f59e0b'] },
              { x: 40, heights: [40, 35, 28], colors: ['#3b82f6', '#10b981', '#f59e0b'] },
              { x: 55, heights: [28, 42, 35], colors: ['#3b82f6', '#10b981', '#f59e0b'] },
              { x: 70, heights: [45, 30, 40], colors: ['#3b82f6', '#10b981', '#f59e0b'] },
              { x: 85, heights: [38, 48, 32], colors: ['#3b82f6', '#10b981', '#f59e0b'] },
            ].map((group, groupIndex) => (
              <g key={groupIndex}>
                {group.heights.map((height, barIndex) => (
                  <rect
                    key={barIndex}
                    x={group.x + barIndex * 3 - 4}
                    y={65 - height}
                    width="2.5"
                    height={height}
                    fill={group.colors[barIndex]}
                    rx="0.5"
                  />
                ))}
              </g>
            ))}
          </svg>
        );

      case 'area':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Grid lines */}
            <defs>
              <pattern id="areaGrid" width="20" height="16" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
              <linearGradient id="areaGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="areaGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <rect width="120" height="80" fill="url(#areaGrid)" />

            {/* Axes */}
            <line
              x1="15"
              y1="65"
              x2="105"
              y2="65"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="15"
              y1="65"
              x2="15"
              y2="15"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Area charts */}
            <path
              d="M 20 45 L 30 40 L 40 35 L 50 30 L 60 25 L 70 30 L 80 35 L 90 25 L 100 20 L 100 65 L 20 65 Z"
              fill="url(#areaGradient1)"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            <path
              d="M 20 55 L 30 50 L 40 48 L 50 45 L 60 40 L 70 45 L 80 50 L 90 45 L 100 40 L 100 65 L 20 65 Z"
              fill="url(#areaGradient2)"
              stroke="#10b981"
              strokeWidth="2"
            />
          </svg>
        );

      case 'pie':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            <g transform="translate(60, 40)">
              {/* Pie segments */}
              <path d="M 0 -25 A 25 25 0 0 1 17.7 17.7 L 0 0 Z" fill="#3b82f6" />
              <path d="M 17.7 17.7 A 25 25 0 0 1 -17.7 17.7 L 0 0 Z" fill="#10b981" />
              <path d="M -17.7 17.7 A 25 25 0 0 1 -12.5 -21.7 L 0 0 Z" fill="#f59e0b" />
              <path d="M -12.5 -21.7 A 25 25 0 0 1 0 -25 L 0 0 Z" fill="#ef4444" />
            </g>
          </svg>
        );

      case 'donut':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            <g transform="translate(60, 40)">
              {/* Donut segments */}
              <path
                d="M 0 -25 A 25 25 0 0 1 17.7 17.7 L 10.6 10.6 A 15 15 0 0 0 0 -15 Z"
                fill="#3b82f6"
              />
              <path
                d="M 17.7 17.7 A 25 25 0 0 1 -17.7 17.7 L -10.6 10.6 A 15 15 0 0 0 10.6 10.6 Z"
                fill="#10b981"
              />
              <path
                d="M -17.7 17.7 A 25 25 0 0 1 -12.5 -21.7 L -7.5 -13 A 15 15 0 0 0 -10.6 10.6 Z"
                fill="#f59e0b"
              />
              <path
                d="M -12.5 -21.7 A 25 25 0 0 1 0 -25 L 0 -15 A 15 15 0 0 0 -7.5 -13 Z"
                fill="#ef4444"
              />
            </g>
          </svg>
        );

      case 'scatter':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Grid lines */}
            <defs>
              <pattern id="scatterGrid" width="20" height="16" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
            </defs>
            <rect width="120" height="80" fill="url(#scatterGrid)" />

            {/* Axes */}
            <line
              x1="15"
              y1="65"
              x2="105"
              y2="65"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="15"
              y1="65"
              x2="15"
              y2="15"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Scatter points */}
            {[
              { x: 25, y: 45, size: 3, color: '#3b82f6' },
              { x: 35, y: 35, size: 4, color: '#10b981' },
              { x: 45, y: 50, size: 2, color: '#f59e0b' },
              { x: 55, y: 30, size: 5, color: '#ef4444' },
              { x: 65, y: 40, size: 3, color: '#8b5cf6' },
              { x: 75, y: 25, size: 4, color: '#06b6d4' },
              { x: 85, y: 55, size: 3, color: '#f97316' },
              { x: 30, y: 60, size: 2, color: '#84cc16' },
              { x: 50, y: 20, size: 4, color: '#ec4899' },
              { x: 70, y: 45, size: 3, color: '#6366f1' },
              { x: 90, y: 35, size: 5, color: '#14b8a6' },
            ].map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={point.size}
                fill={point.color}
                opacity="0.8"
              />
            ))}
          </svg>
        );

      case 'cycleplot':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Grid lines */}
            <defs>
              <pattern id="cyclePlotGrid" width="20" height="16" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
            </defs>
            <rect width="120" height="80" fill="url(#cyclePlotGrid)" />

            {/* Axes */}
            <line
              x1="15"
              y1="65"
              x2="105"
              y2="65"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="15"
              y1="65"
              x2="15"
              y2="15"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Multiple cycle lines (3 cycles showing pattern comparison) */}
            {/* Cycle 1 - 2021 */}
            <path
              d="M 20 50 L 30 48 L 40 45 L 50 42 L 60 40 L 70 38 L 80 35 L 90 33 L 100 30"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            {[20, 30, 40, 50, 60, 70, 80, 90, 100].map((x, i) => (
              <circle key={`c1-${i}`} cx={x} cy={50 - i * 2.5} r="2" fill="#3b82f6" opacity="0.8" />
            ))}

            {/* Cycle 2 - 2022 */}
            <path
              d="M 20 55 L 30 52 L 40 48 L 50 44 L 60 38 L 70 34 L 80 30 L 90 28 L 100 25"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            {[20, 30, 40, 50, 60, 70, 80, 90, 100].map((x, i) => (
              <circle key={`c2-${i}`} cx={x} cy={55 - i * 3.3} r="2" fill="#10b981" opacity="0.8" />
            ))}

            {/* Cycle 3 - 2023 */}
            <path
              d="M 20 58 L 30 54 L 40 49 L 50 43 L 60 36 L 70 30 L 80 26 L 90 23 L 100 20"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
            {[20, 30, 40, 50, 60, 70, 80, 90, 100].map((x, i) => (
              <circle key={`c3-${i}`} cx={x} cy={58 - i * 4.2} r="2" fill="#f59e0b" opacity="0.8" />
            ))}

            {/* Period markers (representing months/quarters on X-axis) */}
            {[20, 30, 40, 50, 60, 70, 80, 90, 100].map((x, i) => (
              <line
                key={`marker-${i}`}
                x1={x}
                y1="65"
                x2={x}
                y2="67"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.4"
              />
            ))}
          </svg>
        );

      case 'heatmap':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Heatmap grid */}
            {Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 12 }, (_, col) => {
                const intensity = Math.sin((row + col) * 0.5) * 0.5 + 0.5;
                const colors = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'];
                const colorIndex = Math.floor(intensity * (colors.length - 1));
                return (
                  <rect
                    key={`${row}-${col}`}
                    x={15 + col * 7.5}
                    y={15 + row * 7.5}
                    width="6.5"
                    height="6.5"
                    fill={colors[colorIndex]}
                    rx="0.5"
                  />
                );
              })
            )}
          </svg>
        );

      case 'radar':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            <g transform="translate(60, 40)">
              {/* Radar grid */}
              {[0, 1, 2, 3, 4, 5].map(i => (
                <g key={i}>
                  <line
                    x1={25 * Math.cos((i * Math.PI) / 3)}
                    y1={25 * Math.sin((i * Math.PI) / 3)}
                    x2="0"
                    y2="0"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                </g>
              ))}
              {[10, 20].map(radius => (
                <polygon
                  key={radius}
                  points={[0, 1, 2, 3, 4, 5]
                    .map(
                      i =>
                        `${radius * Math.cos((i * Math.PI) / 3 - Math.PI / 2)},${radius * Math.sin((i * Math.PI) / 3 - Math.PI / 2)}`
                    )
                    .join(' ')}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              ))}

              {/* Radar areas */}
              <polygon
                points="0,-20 17,-10 10,16 -10,16 -17,-10"
                fill="#3b82f6"
                opacity="0.3"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <polygon
                points="0,-15 12,-7 7,12 -7,12 -12,-7"
                fill="#10b981"
                opacity="0.3"
                stroke="#10b981"
                strokeWidth="2"
              />
            </g>
          </svg>
        );

      case 'bubble':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Grid lines */}
            <defs>
              <pattern id="bubbleGrid" width="20" height="16" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
            </defs>
            <rect width="120" height="80" fill="url(#bubbleGrid)" />

            {/* Axes */}
            <line
              x1="15"
              y1="65"
              x2="105"
              y2="65"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="15"
              y1="65"
              x2="15"
              y2="15"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Bubbles */}
            {[
              { x: 30, y: 45, r: 8, color: '#3b82f6' },
              { x: 50, y: 35, r: 12, color: '#10b981' },
              { x: 70, y: 50, r: 6, color: '#f59e0b' },
              { x: 40, y: 25, r: 10, color: '#ef4444' },
              { x: 80, y: 40, r: 7, color: '#8b5cf6' },
              { x: 60, y: 55, r: 9, color: '#06b6d4' },
            ].map((bubble, index) => (
              <circle
                key={index}
                cx={bubble.x}
                cy={bubble.y}
                r={bubble.r}
                fill={bubble.color}
                opacity="0.6"
                stroke={bubble.color}
                strokeWidth="1"
              />
            ))}
          </svg>
        );

      case 'treemap':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Treemap rectangles */}
            <rect
              x="15"
              y="15"
              width="40"
              height="25"
              fill="#3b82f6"
              opacity="0.8"
              stroke="#fff"
              strokeWidth="1"
            />
            <rect
              x="57"
              y="15"
              width="25"
              height="25"
              fill="#10b981"
              opacity="0.8"
              stroke="#fff"
              strokeWidth="1"
            />
            <rect
              x="84"
              y="15"
              width="20"
              height="25"
              fill="#f59e0b"
              opacity="0.8"
              stroke="#fff"
              strokeWidth="1"
            />
            <rect
              x="15"
              y="42"
              width="30"
              height="22"
              fill="#ef4444"
              opacity="0.8"
              stroke="#fff"
              strokeWidth="1"
            />
            <rect
              x="47"
              y="42"
              width="22"
              height="22"
              fill="#8b5cf6"
              opacity="0.8"
              stroke="#fff"
              strokeWidth="1"
            />
            <rect
              x="71"
              y="42"
              width="18"
              height="22"
              fill="#06b6d4"
              opacity="0.8"
              stroke="#fff"
              strokeWidth="1"
            />
            <rect
              x="91"
              y="42"
              width="13"
              height="22"
              fill="#f97316"
              opacity="0.8"
              stroke="#fff"
              strokeWidth="1"
            />
          </svg>
        );

      case 'sankey':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Sankey flow paths */}
            <defs>
              <linearGradient id="sankeyGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
              <linearGradient id="sankeyGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Source nodes */}
            <rect x="15" y="20" width="4" height="15" fill="#3b82f6" />
            <rect x="15" y="40" width="4" height="10" fill="#ef4444" />

            {/* Flow paths */}
            <path
              d="M 19 27.5 Q 40 27.5 40 30 L 65 30 Q 85 30 85 32.5"
              fill="none"
              stroke="url(#sankeyGrad1)"
              strokeWidth="8"
              opacity="0.7"
            />
            <path
              d="M 19 32.5 Q 40 32.5 40 35 L 65 35 Q 85 35 85 37.5"
              fill="none"
              stroke="url(#sankeyGrad2)"
              strokeWidth="6"
              opacity="0.7"
            />
            <path
              d="M 19 45 Q 40 45 40 40 L 65 40 Q 85 40 85 42.5"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              opacity="0.7"
            />

            {/* Target nodes */}
            <rect x="85" y="25" width="4" height="12" fill="#10b981" />
            <rect x="85" y="40" width="4" height="8" fill="#f59e0b" />
          </svg>
        );

      case 'gauge':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            <g transform="translate(60, 50)">
              {/* Gauge background */}
              <path
                d="M -35 0 A 35 35 0 0 1 35 0"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Gauge progress */}
              <path
                d="M -35 0 A 35 35 0 0 1 0 -35"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Gauge pointer */}
              <line
                x1="0"
                y1="0"
                x2="-15"
                y2="-25"
                stroke="#374151"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="0" cy="0" r="4" fill="#374151" />

              {/* Value text */}
              <text
                x="0"
                y="15"
                textAnchor="middle"
                className="text-xs font-semibold"
                fill="currentColor"
              >
                75%
              </text>
            </g>
          </svg>
        );

      case 'funnel':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Funnel segments */}
            <polygon points="25,20 95,20 90,30 30,30" fill="#3b82f6" opacity="0.8" />
            <polygon points="30,30 90,30 85,40 35,40" fill="#10b981" opacity="0.8" />
            <polygon points="35,40 85,40 80,50 40,50" fill="#f59e0b" opacity="0.8" />
            <polygon points="40,50 80,50 75,60 45,60" fill="#ef4444" opacity="0.8" />

            {/* Connecting lines */}
            <line x1="95" y1="20" x2="90" y2="30" stroke="#fff" strokeWidth="1" />
            <line x1="90" y1="30" x2="85" y2="40" stroke="#fff" strokeWidth="1" />
            <line x1="85" y1="40" x2="80" y2="50" stroke="#fff" strokeWidth="1" />
            <line x1="80" y1="50" x2="75" y2="60" stroke="#fff" strokeWidth="1" />

            <line x1="25" y1="20" x2="30" y2="30" stroke="#fff" strokeWidth="1" />
            <line x1="30" y1="30" x2="35" y2="40" stroke="#fff" strokeWidth="1" />
            <line x1="35" y1="40" x2="40" y2="50" stroke="#fff" strokeWidth="1" />
            <line x1="40" y1="50" x2="45" y2="60" stroke="#fff" strokeWidth="1" />
          </svg>
        );

      case 'waterfall':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Grid lines */}
            <defs>
              <pattern id="waterfallGrid" width="20" height="16" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
            </defs>
            <rect width="120" height="80" fill="url(#waterfallGrid)" />

            {/* Axes */}
            <line
              x1="15"
              y1="65"
              x2="105"
              y2="65"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="15"
              y1="65"
              x2="15"
              y2="15"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Waterfall bars */}
            <rect x="20" y="35" width="8" height="30" fill="#3b82f6" />
            <rect x="35" y="40" width="8" height="25" fill="#10b981" />
            <rect x="50" y="30" width="8" height="35" fill="#ef4444" />
            <rect x="65" y="38" width="8" height="27" fill="#10b981" />
            <rect x="80" y="25" width="8" height="40" fill="#3b82f6" />

            {/* Connecting lines (dotted) */}
            <line
              x1="28"
              y1="35"
              x2="35"
              y2="35"
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <line
              x1="43"
              y1="40"
              x2="50"
              y2="40"
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <line
              x1="58"
              y1="30"
              x2="65"
              y2="30"
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <line
              x1="73"
              y1="38"
              x2="80"
              y2="38"
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          </svg>
        );

      case 'histogram':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Grid lines */}
            <defs>
              <pattern id="histogramGrid" width="20" height="16" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </pattern>
            </defs>
            <rect width="120" height="80" fill="url(#histogramGrid)" />

            {/* Axes */}
            <line
              x1="15"
              y1="65"
              x2="105"
              y2="65"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <line
              x1="15"
              y1="65"
              x2="15"
              y2="15"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Histogram bars - bell curve distribution */}
            {[
              { x: 20, height: 15, color: '#60a5fa' },
              { x: 28, height: 25, color: '#60a5fa' },
              { x: 36, height: 35, color: '#3b82f6' },
              { x: 44, height: 45, color: '#3b82f6' },
              { x: 52, height: 50, color: '#2563eb' },
              { x: 60, height: 45, color: '#3b82f6' },
              { x: 68, height: 35, color: '#3b82f6' },
              { x: 76, height: 25, color: '#60a5fa' },
              { x: 84, height: 15, color: '#60a5fa' },
            ].map((bar, index) => (
              <rect
                key={index}
                x={bar.x}
                y={65 - bar.height}
                width="6"
                height={bar.height}
                fill={bar.color}
                rx="0.5"
              />
            ))}

            {/* Mean line */}
            <line
              x1="56"
              y1="15"
              x2="56"
              y2="65"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.8"
            />
          </svg>
        );

      case 'map':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Simple world map outline */}
            <g fill="none" stroke="#3b82f6" strokeWidth="1.5">
              {/* Continents represented as simple shapes */}
              <path
                d="M 20 25 Q 30 20 40 25 L 45 35 Q 35 40 25 35 Z"
                fill="#3b82f6"
                opacity="0.6"
              />
              <path
                d="M 50 30 Q 65 25 75 30 L 80 45 Q 70 50 55 45 Z"
                fill="#10b981"
                opacity="0.6"
              />
              <path
                d="M 25 45 Q 35 40 45 45 L 50 60 Q 40 65 30 60 Z"
                fill="#f59e0b"
                opacity="0.6"
              />
              <path
                d="M 70 35 Q 80 30 90 35 L 95 50 Q 85 55 75 50 Z"
                fill="#ef4444"
                opacity="0.6"
              />
            </g>

            {/* Location markers */}
            <circle cx="30" cy="30" r="2" fill="#dc2626" />
            <circle cx="60" cy="37" r="2" fill="#dc2626" />
            <circle cx="40" cy="52" r="2" fill="#dc2626" />
            <circle cx="82" cy="42" r="2" fill="#dc2626" />
          </svg>
        );

      case 'table':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Table Header */}
            <rect x="10" y="10" width="100" height="15" fill="#3b82f6" rx="2" opacity="0.9" />

            {/* Table Rows */}
            <rect x="10" y="28" width="100" height="10" fill="#f3f4f6" rx="1" opacity="0.8" />
            <rect x="10" y="41" width="100" height="10" fill="#e5e7eb" rx="1" opacity="0.8" />
            <rect x="10" y="54" width="100" height="10" fill="#f3f4f6" rx="1" opacity="0.8" />

            {/* Columns lines */}
            <line x1="40" y1="10" x2="40" y2="64" stroke="#fff" strokeWidth="1" opacity="0.5" />
            <line x1="70" y1="10" x2="70" y2="64" stroke="#fff" strokeWidth="1" opacity="0.5" />

            {/* Header Text Lines */}
            <line x1="15" y1="17.5" x2="35" y2="17.5" stroke="#fff" strokeWidth="2" opacity="0.8" />
            <line x1="45" y1="17.5" x2="65" y2="17.5" stroke="#fff" strokeWidth="2" opacity="0.8" />
            <line x1="75" y1="17.5" x2="95" y2="17.5" stroke="#fff" strokeWidth="2" opacity="0.8" />
          </svg>
        );

      case 'trend':
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            {/* Grid */}
            <defs>
              <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Trend Area */}
            <path
              d="M 10 60 L 30 50 L 50 55 L 70 35 L 90 40 L 110 15 L 110 70 L 10 70 Z"
              fill="url(#trendGradient)"
            />

            {/* Trend Line */}
            <path
              d="M 10 60 L 30 50 L 50 55 L 70 35 L 90 40 L 110 15"
              fill="none"
              stroke="#ec4899"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            <circle cx="10" cy="60" r="3" fill="#ec4899" />
            <circle cx="30" cy="50" r="3" fill="#ec4899" />
            <circle cx="50" cy="55" r="3" fill="#ec4899" />
            <circle cx="70" cy="35" r="3" fill="#ec4899" />
            <circle cx="90" cy="40" r="3" fill="#ec4899" />
            <circle cx="110" cy="15" r="3" fill="#ec4899" />

            {/* Trend Arrow */}
            <path
              d="M 95 15 L 110 15 L 110 30"
              fill="none"
              stroke="#ec4899"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 120 80" className={`w-full h-full ${className}`}>
            <rect width="120" height="80" fill="currentColor" opacity="0.1" rx="4" />
            <text
              x="60"
              y="35"
              textAnchor="middle"
              className="text-sm font-medium"
              fill="currentColor"
            >
              📊
            </text>
            <text
              x="60"
              y="50"
              textAnchor="middle"
              className="text-xs capitalize"
              fill="currentColor"
            >
              {type}
            </text>
          </svg>
        );
    }
  };

  return (
    <div
      className={`inline-block ${className}`}
      style={{ width: size, height: size * 0.67 }} // Maintain aspect ratio
    >
      {renderIcon()}
    </div>
  );
};

export default ChartIcon;
