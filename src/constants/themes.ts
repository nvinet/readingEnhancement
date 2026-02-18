/**
 * Theme definitions
 * 
 * Provides light and dark theme color palettes for the application.
 * Themes can be switched at runtime via ThemeContext.
 */

import { Theme, ThemeColors } from '../types/config';
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_DOUBLE_LETTER_COLOR,
  DEFAULT_UNDERLINE_COLOR,
} from './app';

/**
 * Light theme color palette
 * Uses high contrast for readability
 */
export const LIGHT_THEME_COLORS: ThemeColors = {
  background: DEFAULT_BACKGROUND_COLOR, // '#FFFFFF'
  text: DEFAULT_TEXT_COLOR, // '#111111'
  doubleLetter: DEFAULT_DOUBLE_LETTER_COLOR, // '#D32F2F' (red)
  underline: DEFAULT_UNDERLINE_COLOR, // '#1976D2' (blue)
};

/**
 * Dark theme color palette
 * Reduces eye strain in low-light conditions
 */
export const DARK_THEME_COLORS: ThemeColors = {
  background: '#1E1E1E', // Dark gray, softer than pure black
  text: '#E0E0E0', // Light gray, easier on eyes than pure white
  doubleLetter: '#EF5350', // Lighter red for dark background
  underline: '#42A5F5', // Lighter blue for dark background
};

/**
 * Light theme definition
 */
export const LIGHT_THEME: Theme = {
  mode: 'light',
  colors: LIGHT_THEME_COLORS,
};

/**
 * Dark theme definition
 */
export const DARK_THEME: Theme = {
  mode: 'dark',
  colors: DARK_THEME_COLORS,
};

/**
 * All available themes indexed by mode
 */
export const THEMES: Record<'light' | 'dark', Theme> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

/**
 * Default theme mode
 */
export const DEFAULT_THEME_MODE: 'light' | 'dark' = 'light';
