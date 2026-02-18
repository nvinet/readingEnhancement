/**
 * Color palette and color-related constants
 * 
 * Centralizes all color definitions used throughout the app.
 * Includes default colors, UI colors, and semantic colors.
 */

/**
 * Default reader colors
 */
export const READER_COLORS = {
  /** Default background color */
  BACKGROUND: '#FFFFFF',
  
  /** Default text color */
  TEXT: '#111111',
  
  /** Default color for highlighting double letters */
  DOUBLE_LETTER: '#D32F2F',
  
  /** Default underline color for centered word */
  UNDERLINE: '#1976D2',
} as const;

/**
 * UI element colors
 */
export const UI_COLORS = {
  /** Border color for inputs and dividers */
  BORDER: '#DDDDDD',
  
  /** Light background for inputs */
  INPUT_BACKGROUND: '#FAFAFA',
  
  /** Selection highlight background */
  SELECTION_BACKGROUND: 'rgba(0, 123, 255, 0.2)',
  
  /** Custom scale indicator (blue dot) */
  SCALE_INDICATOR: '#2196F3',
  
  /** Expanded input button */
  BUTTON_EXPANDED: '#757575',
  
  /** Collapsed input button */
  BUTTON_COLLAPSED: '#1976D2',
  
  /** Shadow color for elevation */
  SHADOW: '#000000',
  
  /** Transparent (for overrides) */
  TRANSPARENT: 'transparent',
} as const;

/**
 * Theme colors (legacy support)
 * Used by App.tsx for backwards compatibility
 */
export const THEME_COLORS = {
  lighter: '#F3F3F3',
  darker: '#222222',
} as const;
