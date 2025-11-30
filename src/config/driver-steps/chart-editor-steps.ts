import type { DriveStep } from 'driver.js';

export const chartEditorSteps: DriveStep[] = [
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.5rem;'>Welcome to Chart Editor! 🎨</span>",
      description:
        "<p style='font-size: 1.1rem; line-height: 1.6; color: #64748b;'>Create stunning visualizations with our powerful chart editor. Let me guide you through all the features!</p>",
      side: 'over',
    },
  },
  {
    element: '#chart-type-selector',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📊 Chart Type Selector</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Choose from various chart types: Line, Bar, Area, Scatter, Pie, Donut, and Cycle Plot. Each type is optimized for different data visualization needs.</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#basic-settings-section',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>⚙️ Basic Settings</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Configure fundamental chart properties like size presets (Desktop, Mobile, HD, 4K), custom dimensions, padding/margins, and chart title. Click to expand and explore!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#size-presets',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📐 Size Presets</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Quick size templates for common use cases: Desktop (800×600), Mobile (375×667), Tablet (768×1024), HD (1920×1080), and 4K (3840×2160). One click to apply!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#custom-size-inputs',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📏 Custom Size</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Fine-tune your chart dimensions with custom width and height values. Perfect for specific layout requirements!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#padding-configuration',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📦 Padding Configuration</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Visual padding editor lets you adjust top, right, bottom, and left margins. Control the spacing around your chart area for perfect alignment!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#chart-title-input',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>✏️ Chart Title</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Give your chart a descriptive title. This helps viewers understand what data they're looking at!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#chart-settings-section',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🎯 Chart Settings</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Chart-specific settings that change based on your selected chart type. Includes animation duration, curve types, bar styles, and display options.</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#animation-duration',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>⏱️ Animation Duration</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Control how fast your chart animates when it loads. Adjust from instant (0ms) to slow (3000ms) for the perfect visual effect!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#curve-type-setting',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>〰️ Curve Type (Line/Area)</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Choose how your lines curve: Linear (straight), Monotone (smooth), Basis (rounded), Cardinal, Catmull-Rom, or Step variations. Each creates a unique visual style!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#bar-type-settings',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📊 Bar Type Settings</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>For bar charts: Choose between grouped (side-by-side) or stacked bars. Adjust bar width and spacing for optimal presentation!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#area-type-settings',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🏔️ Area Type Settings</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>For area charts: Select standard or stacked area display. Control fill opacity to create beautiful layered visualizations!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#display-options',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>👁️ Display Options</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Toggle visibility of chart elements: legend, grid lines, data points, point values, tooltips, and axis labels. Customize what viewers see!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#axis-configuration-section',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📐 Axis Configuration</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Configure X and Y axes: select data columns, set labels, define axis ranges, adjust rotation, and control tick marks. Full control over your axes!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#x-axis-selector',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>➡️ X-Axis Column</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Choose which data column to use for the X-axis (horizontal). Typically used for categories, dates, or independent variables.</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#x-axis-label',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🏷️ X-Axis Label</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Add a descriptive label for your X-axis to help viewers understand what the horizontal dimension represents.</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#x-axis-range',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🎚️ X-Axis Range</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Set custom start and end values for the X-axis, or use 'auto' to let the chart determine the optimal range automatically.</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#y-axis-label',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🏷️ Y-Axis Label</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Add a descriptive label for your Y-axis to explain what the vertical dimension measures (e.g., 'Sales ($)', 'Temperature (°C)').</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#y-axis-range',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🎚️ Y-Axis Range</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Define the Y-axis scale by setting minimum and maximum values, or use 'auto' for automatic scaling based on your data.</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#axis-rotation',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🔄 Axis Label Rotation</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Rotate axis labels to prevent overlapping text. Especially useful for long category names or when space is limited!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#series-management-section',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📈 Series Management</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Manage multiple data series (Y-axis columns). Add, remove, rename, change colors, and toggle visibility for each series. Perfect for comparing multiple metrics!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#add-series-button',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>➕ Add Series</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Add additional data series to your chart. Each series can represent a different metric or category from your dataset.</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#series-item-0',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🎨 Series Item</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Each series has its own name, color, data column, and visibility toggle. Customize each one individually for clear, beautiful visualizations!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#series-color-picker-0',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🎨 Series Color</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Pick a color for this series. Choose colors that contrast well for easy differentiation between multiple series!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#series-visibility-toggle-0',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>👁️ Series Visibility</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Toggle series visibility on/off. Temporarily hide series without deleting them to focus on specific data!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#chart-display-section',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🖼️ Chart Display</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Live preview of your chart! All changes are reflected here in real-time. This is where your visualization comes to life!</p>",
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '#chart-formatter-section',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🔢 Number Formatters</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Format how numbers appear on axes and tooltips. Choose from currency, percentage, decimal, scientific notation, bytes, duration, or custom formats!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#y-axis-formatter',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📊 Y-Axis Formatter</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Format Y-axis values: Currency ($1.5M), Percentage (45.2%), Number (1.5K), Decimal (1.50), Scientific (1.5e+6), Bytes (1.5MB), Duration (1h 30m), or Custom!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#x-axis-formatter',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📊 X-Axis Formatter</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Format X-axis values with the same powerful formatting options. Perfect for dates, numbers, or custom formats!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#pie-chart-settings-section',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🥧 Pie Chart Settings</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Special settings for Pie and Donut charts: select label and value columns, configure inner radius for donut effect, and customize slice appearance!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#pie-display-options',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🎨 Pie Display Options</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Control pie chart visuals: show/hide labels, values, percentages, legend. Adjust label positioning and formatting for perfect presentation!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#cycle-plot-settings',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>🔄 Cycle Plot Settings</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Specialized settings for Cycle Plots: configure time periods, cycles, and seasonal patterns. Perfect for visualizing recurring trends!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#import-export-section',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>💾 Import/Export</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Save your chart configuration as JSON to reuse later, or import existing configurations. Share your chart designs with others!</p>",
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#export-config-button',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📤 Export Configuration</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Download your complete chart configuration as a JSON file. Use it as a template or backup of your perfect chart setup!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#import-config-button',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📥 Import Configuration</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Load a previously saved chart configuration. Instantly apply all settings from a JSON file!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#chart-history-panel',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📜 Chart History</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>View and restore previous versions of your chart. Track changes over time and revert to earlier configurations if needed!</p>",
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '#chart-notes-sidebar',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📝 Chart Notes</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Add notes and annotations to your chart. Document insights, methodology, or important observations for future reference!</p>",
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '#save-chart-button',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>💾 Save Chart</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Save your chart to your workspace. All settings, data, and configurations are preserved for future editing!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '#download-chart-button',
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 600;'>📥 Download Chart</span>",
      description:
        "<p style='color: #475569; line-height: 1.6;'>Export your chart as an image (PNG, SVG) or data file. Perfect for presentations, reports, or sharing with others!</p>",
      side: 'bottom',
      align: 'start',
    },
  },
  {
    popover: {
      title:
        "<span style='background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 700; font-size: 1.5rem;'>You're a Chart Master! 🎉</span>",
      description:
        "<p style='font-size: 1.1rem; line-height: 1.6; color: #64748b;'>You now know how to use all the powerful features of the chart editor. Create amazing visualizations and tell compelling data stories!</p>",
      side: 'over',
    },
  },
];
