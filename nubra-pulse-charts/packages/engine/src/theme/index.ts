/**
 * Theme system for chart components
 * Provides light and dark theme configurations using Nubra color palette
 */

import { themeColors, type ThemeColorKey, updateThemeColors, getThemeColor } from './colors';

export type ThemeMode = "light" | "dark";

export interface ChartTheme {
  // Line chart colors
  lineColor: string;
  strokeWidth: number;
  
  // Tooltip colors
  tooltipBackgroundColor: string;
  tooltipBorderColor: string;
  tooltipTextColor: string;
  tooltipSecondaryTextColor: string;
  
  // Axis colors
  axisColor: string;
  axisLabelColor: string;
  
  // Grid colors (if needed in future)
  gridColor: string;
  
  // Background colors (if needed in future)
  backgroundColor: string;
  
  // Label colors
  labelTextColor: string;
  labelTextSelectedColor: string;
}

/**
 * Creates light theme using Nubra color palette
 */
function createLightTheme(): ChartTheme {
  return {
    lineColor: themeColors['primary-blue'],
    strokeWidth: 3,
    tooltipBackgroundColor: 'rgba(245, 245, 255, 0.95)', // titan-white with opacity
    tooltipBorderColor: themeColors['silver-mist'],
    tooltipTextColor: themeColors['black'],
    tooltipSecondaryTextColor: themeColors['dim-gray'],
    axisColor: themeColors['silver-mist'],
    axisLabelColor: themeColors['black'],
    gridColor: themeColors['grid-gray'],
    backgroundColor: themeColors['white'],
    labelTextColor: themeColors['black'],
    labelTextSelectedColor: themeColors['black'],
  };
}

/**
 * Creates dark theme using Nubra color palette
 */
function createDarkTheme(): ChartTheme {
  return {
    lineColor: themeColors['cornflower-blue'],
    strokeWidth: 3,
    tooltipBackgroundColor: 'rgba(8, 8, 8, 0.95)', // cod-gray with opacity
    tooltipBorderColor: themeColors['french-gray'],
    tooltipTextColor: themeColors['white'],
    tooltipSecondaryTextColor: themeColors['white-light-70%'],
    axisColor: themeColors['french-gray'],
    axisLabelColor: themeColors['white-light-70%'],
    gridColor: themeColors['french-gray'],
    backgroundColor: themeColors['cod-gray'],
    labelTextColor: themeColors['white-light-70%'],
    labelTextSelectedColor: themeColors['white'],
  };
}

// Create theme instances
let lightTheme: ChartTheme = createLightTheme();
let darkTheme: ChartTheme = createDarkTheme();

export { lightTheme, darkTheme };

export const themes: Record<ThemeMode, ChartTheme> = {
  light: lightTheme,
  dark: darkTheme,
};

/**
 * Get theme by mode
 */
export function getTheme(mode: ThemeMode): ChartTheme {
  return themes[mode];
}

/**
 * Update theme colors and regenerate themes
 * This method allows you to update the base color palette and automatically
 * regenerate the light and dark themes
 * 
 * @param colorUpdates - Partial object of color key-value pairs to update
 * @param themeOverrides - Optional overrides for specific theme properties
 */
export function updateTheme(
  colorUpdates?: Partial<Record<ThemeColorKey, string>>,
  themeOverrides?: {
    light?: Partial<ChartTheme>;
    dark?: Partial<ChartTheme>;
  }
): void {
  // Update base colors if provided
  if (colorUpdates) {
    updateThemeColors(colorUpdates);
    // Regenerate themes with new colors
    lightTheme = createLightTheme();
    darkTheme = createDarkTheme();
  }

  // Apply theme-specific overrides if provided
  if (themeOverrides?.light) {
    lightTheme = { ...lightTheme, ...themeOverrides.light };
    themes.light = lightTheme;
  }

  if (themeOverrides?.dark) {
    darkTheme = { ...darkTheme, ...themeOverrides.dark };
    themes.dark = darkTheme;
  }
}

/**
 * Get a specific color from the theme color palette
 */
export { getThemeColor };

/**
 * Re-export color utilities
 */
export { themeColors, updateThemeColors, type ThemeColorKey };
