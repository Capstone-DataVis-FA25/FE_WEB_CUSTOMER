// Color configuration for the Vegetable Client project

export const colors = {
  // Brand colors
  brand: {
    primary: '#ffffff', // Primary white
    secondary: '#f97d32', // Secondary orange
    tertiary: '#204188', // Tertiary blue
  },

  // Color variations for different use cases
  primary: {
    50: '#ffffff',
    100: '#fefefe',
    200: '#fdfdfd',
    300: '#fcfcfc',
    400: '#fafafa',
    500: '#ffffff', // Main primary color (white)
    600: '#f5f5f5',
    700: '#e5e5e5',
    800: '#d4d4d4',
    900: '#a3a3a3',
    950: '#525252',
  },

  secondary: {
    50: '#fef7f0',
    100: '#fdede0',
    200: '#fad8bf',
    300: '#f6bc94',
    400: '#f19657',
    500: '#f97d32', // Main secondary color (orange)
    600: '#e6622a',
    700: '#c04d1f',
    800: '#9b3e1d',
    900: '#7d351c',
    950: '#43190c',
  },

  tertiary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#204188', // Main tertiary color (blue)
    600: '#1d3a7a',
    700: '#1a336b',
    800: '#172c5c',
    900: '#14254d',
    950: '#0f1d3e',
  },

  randomSeriesColor: [
    '#f97316', // orange
    '#ec4899', // pink
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#3b82f6', // blue
    '#14b8a6', // teal
    '#f43f5e', // rose
    '#a855f7', // violet
    '#84cc16', // lime
    '#6366f1', // indigo
    '#22c55e', // emerald
    '#eab308', // yellow
    '#d946ef', // fuchsia
  ],

  // Extended palette
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // White and black
  white: '#ffffff',
  black: '#000000',
} as const;

// CSS variable names mapping
export const cssVariables = {
  primary: 'var(--primary)',
  primaryForeground: 'var(--primary-foreground)',
  secondary: 'var(--secondary)',
  secondaryForeground: 'var(--secondary-foreground)',
  accent: 'var(--accent)',
  accentForeground: 'var(--accent-foreground)',
  background: 'var(--background)',
  foreground: 'var(--foreground)',
  card: 'var(--card)',
  cardForeground: 'var(--card-foreground)',
  popover: 'var(--popover)',
  popoverForeground: 'var(--popover-foreground)',
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',
  destructive: 'var(--destructive)',
  border: 'var(--border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
} as const;

// Utility functions
export const getColorValue = (colorPath: string): string => {
  const keys = colorPath.split('.');
  let current: any = colors;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return '#000000'; // fallback color
    }
  }

  return typeof current === 'string' ? current : '#000000';
};

// Color utilities for common use cases
export const colorUtils = {
  // Get primary color variants
  getPrimaryColor: (shade?: keyof typeof colors.primary) =>
    shade ? colors.primary[shade] : colors.brand.primary,

  // Get secondary color variants
  getSecondaryColor: (shade?: keyof typeof colors.secondary) =>
    shade ? colors.secondary[shade] : colors.brand.secondary,

  // Get tertiary color variants
  getTertiaryColor: (shade?: keyof typeof colors.tertiary) =>
    shade ? colors.tertiary[shade] : colors.brand.tertiary,

  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  // Add opacity to hex color
  addOpacity: (hex: string, opacity: number): string => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  },
};

// Export default
export default colors;
