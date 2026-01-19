/**
 * Nubra color palette for chart themes
 * Base color definitions that can be updated as needed
 */

export const themeColors = {
  // nubra specific colors
  amber: '#FF9800',
  black: '#000000',
  'black-light': 'rgba(0, 0, 0, 0.50)',
  'black-light-70%': 'rgba(0, 0, 0, 0.70)',
  'black-light-20%': 'rgba(0, 0, 0, 0.20)',
  'black-10%': 'rgba(0, 0, 0, 0.20)',
  'black-60%': 'rgba(0, 0, 0, 0.60)',
  'black-extraLight': 'rgba(0, 0, 0, 0.04)',
  border: '#B1B1B166',
  'bright-orange': 'rgba(249, 148, 30, 0.20)',
  'carrot-orange': '#F9941E',
  'carrot-orange-light': 'rgba(249, 148, 30, 0.30)',
  'carrot-orange-extraLight': '#F9941E1A',
  charcoal: 'rgba(8, 8, 8, 0.7)',
  'cod-gray': '#080808',
  'white-light': 'rgba(255, 255, 255, 0.50)',
  'white-light-70%': 'rgba(255, 255, 255, 0.70)',
  'white-light-20%': 'rgba(255, 255, 255, 0.20)',
  'white-10%': 'rgba(255, 255, 255, 0.10)',
  'white-60%': 'rgba(255, 255, 255, 0.60)',
  'white-extraLight': 'rgba(255, 255, 255, 0.04)',

  'gray-400': '#9CA3AF',
  'gray-500': '#6B7280',
  'gray-700': '#374151',
  'meta-9': '#E5E7EB',
  comet: '#5E5E76',
  'cornflower-blue': '#6E83FB',
  'dark-green': '#009900',
  'dark-red': '#DA0B16',
  'dark-tea-green': '#1F951D',
  'dim-gray': '#6B6B6B',
  'grid-gray': 'rgba(107, 107, 107, 0.20)',
  'ebony-clay': '#2D3447',
  'forest-green': '#3A9E21',
  'forest-green-light': 'rgba(177, 255, 158, 0.3)',
  'french-gray': 'rgba(94, 94, 118, 0.40)',
  'ghost-red': 'rgba(246, 60, 60, 0.10)',
  'green-bay-leaf': '#95DCB1',
  lavender: '#EAECFF',
  'glassoverlay-light': 'rgba(234, 236, 255, 0.04)',
  'glassoverlay-dark': 'rgba(35, 35, 43, 0.6)',
  'light-blue': '#0095F6',
  'light-coral': '#EF4040',
  'light-coral-red': '#F26666',
  'light-gray': 'rgba(177, 177, 177, 0.4)',
  'light-green': '#D2F8D2',
  'light-red': '#FFD5D8',
  mercury: '#E9E9E9',
  mirage: '#161A25',
  mischka: '#CECFDD',
  'pale-mint-green': '#EEF8F2',
  'pale-navy': '#DAE0FF',
  'palma-green': '#3A9E20',
  'pastel-green': '#5BDE58',
  'pastel-green-light': 'rgba(91, 222, 88, 0.30)',
  periwinkle: '#C8CDFF',
  'periwinkle-blue': 'rgba(88, 111, 237, 0.20)',
  'periwinkle-blue-light': 'rgba(88, 111, 237, 0.03)',
  'periwinkle-blue-10%': 'rgba(88, 111, 237, 0.10)',
  'primary-blue': '#586FED',
  'primary-blue-extraLight': 'rgba(88, 111, 237, 0.06)',
  'primary-blue-10%': 'rgba(88, 111, 237, 0.10)',
  'primary-blue-5%': 'rgba(88, 111, 237, 0.05)',
  'primary-blue-20%': 'rgba(88, 111, 237, 0.2)',
  'primary-blue-light': 'rgba(88, 111, 237, 0.30)',
  reef: '#B1FF9E',
  'scream-green': '#85FF66',
  shark: '#23232B',
  'shiny-green': '#38CD59',
  'shiny-red': '#F32934',
  'ship-gray': '#43434A',
  silver: '#C7C7C7',
  'silver-chalice': '#B1B1B1',
  'silver-mist': 'rgba(177, 177, 177, 0.40)',
  'spring-green': '#54BA7C',
  'spring-green-light': 'rgba(84, 186, 124, 0.30)',
  'storm-gray': '#686C81',
  'sunset-orange': '#F63C3C',
  'sunset-orange-light': 'rgba(246, 60, 60, 0.20)',
  'sunset-orange-extraLight': '#F63C3C1A',
  'tea-green': '#CDF5CC',
  tequila: '#FFE7C3',
  'titan-white': '#F5F5FF',
  'titan-white-light': 'rgba(245, 245, 250, 0.50)',
  'transparent-leaf': 'rgba(84, 186, 124, 0.10)',
  'tropical-blue': '#C1CAF8',
  tuna: '#323243',
  'vivid-red': 'rgba(239, 64, 64, 0.20)',
  'vivid-tangerine': '#FF8B8B',
  white: '#FFFFFF',
  'yellow-green': '#F9FF54',
  zircon: '#F6F7FF',
  'spring-green-extraLight': 'rgba(84, 186, 124, 0.2)',
} as const;

/**
 * Type for theme color keys
 */
export type ThemeColorKey = keyof typeof themeColors;

/**
 * Method to update theme colors
 * This allows for dynamic color updates when needed
 */
export function updateThemeColors(
  updates: Partial<Record<ThemeColorKey, string>>
): void {
  Object.assign(themeColors, updates);
}

/**
 * Get a theme color by key
 */
export function getThemeColor(key: ThemeColorKey): string {
  return themeColors[key];
}


