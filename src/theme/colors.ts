// Color configuration for the Vegetable Client project

export const colors = {
  // Brand colors
  brand: {
    primary: '#3F7D58', // Primary green
    secondary: '#73946B', // Secondary green
    tertiary: '#9EBC8A', // Third green (accent)
  },

  // Color variations for different use cases
  primary: {
    50: '#f0f9f4',
    100: '#dcf2e4',
    200: '#bce4cb',
    300: '#8dd0a7',
    400: '#57b37c',
    500: '#3F7D58', // Main primary color
    600: '#2d5940',
    700: '#254733',
    800: '#1f3a2b',
    900: '#1a3024',
    950: '#0d1a12',
  },

  secondary: {
    50: '#f4f6f3',
    100: '#e6ebe3',
    200: '#ced7c8',
    300: '#adbba4',
    400: '#73946B', // Main secondary color
    500: '#5a7553',
    600: '#475d41',
    700: '#3a4b35',
    800: '#303e2c',
    900: '#283426',
    950: '#141c13',
  },

  tertiary: {
    50: '#f6f8f4',
    100: '#e9f2e4',
    200: '#d4e4cb',
    300: '#b6d0a7',
    400: '#9EBC8A', // Main tertiary color
    500: '#7ca068',
    600: '#5f7e4f',
    700: '#4c6340',
    800: '#3e5035',
    900: '#34432e',
    950: '#1a2416',
  },

  // Extended palette
  success: '#3F7D58',
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
