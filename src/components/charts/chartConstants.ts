import * as d3 from 'd3';


// Color configuration
export type ColorConfig = Record<string, { light: string; dark: string }>;

// Curve options
export const curveOptions = {
  curveLinear: d3.curveLinear,
  curveMonotoneX: d3.curveMonotoneX,
  curveMonotoneY: d3.curveMonotoneY,
  curveBasis: d3.curveBasis,
  curveCardinal: d3.curveCardinal,
  curveCatmullRom: d3.curveCatmullRom,
  curveStep: d3.curveStep,
  curveStepBefore: d3.curveStepBefore,
  curveStepAfter: d3.curveStepAfter,
};


// Common chart size presets
export const sizePresets = {
  tiny: { width: 300, height: 200, labelKey: 'lineChart_editor_preset_tiny' },
  small: { width: 400, height: 250, labelKey: 'lineChart_editor_preset_small' },
  medium: { width: 600, height: 375, labelKey: 'lineChart_editor_preset_medium' },
  large: { width: 800, height: 500, labelKey: 'lineChart_editor_preset_large' },
  xlarge: { width: 1000, height: 625, labelKey: 'lineChart_editor_preset_xlarge' },
  wide: { width: 1200, height: 400, labelKey: 'lineChart_editor_preset_wide' },
  ultrawide: { width: 1400, height: 350, labelKey: 'lineChart_editor_preset_ultrawide' },
  square: { width: 500, height: 500, labelKey: 'lineChart_editor_preset_square' },
  presentation: { width: 1024, height: 768, labelKey: 'lineChart_editor_preset_presentation' },
  mobile: { width: 350, height: 300, labelKey: 'lineChart_editor_preset_mobile' },
  tablet: { width: 768, height: 480, labelKey: 'lineChart_editor_preset_tablet' },
  responsive: { width: 0, height: 0, labelKey: 'lineChart_editor_preset_responsive' }
};
