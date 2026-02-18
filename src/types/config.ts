/**
 * Configuration type definitions
 * 
 * Central location for all configuration-related TypeScript types.
 * Ensures type safety across the application.
 */

import { FontFamily } from '../constants/fonts';

/**
 * Reader configuration options
 * Controls the appearance and behavior of the text reader
 */
export interface ReaderConfig {
  /** Selected font family for text display */
  fontFamily: FontFamily;
  
  /** Background color (hex code) */
  backgroundColor: string;
  
  /** Main text color (hex code) */
  textColor: string;
  
  /** Color for highlighting double letters (hex code) */
  doubleLetterColor: string;
  
  /** Color for underlining the centered word (hex code) */
  underlineColor: string;
  
  /** Custom hard letters that get extra spacing */
  hardLetters: string;
  
  /** Extra spacing after hard letters (in pixels) */
  hardLetterExtraSpacing: number;
  
  /** Spacing between words (in pixels) */
  wordSpacing: number;
  
  /** Base font size (in pixels) */
  baseFontSize: number;
  
  /** Maximum scroll speed (pixels per frame, 1-15) */
  maxScrollSpeed: number;
}

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Theme color palette
 */
export interface ThemeColors {
  /** Background color */
  background: string;
  
  /** Primary text color */
  text: string;
  
  /** Color for double letter highlights */
  doubleLetter: string;
  
  /** Color for underline */
  underline: string;
}

/**
 * Complete theme definition
 */
export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether the value is valid */
  valid: boolean;
  
  /** Error message if invalid */
  error?: string;
}

/**
 * Font size validation constraints
 */
export interface FontSizeConstraints {
  min: number;
  max: number;
}

/**
 * Spacing validation constraints
 */
export interface SpacingConstraints {
  min: number;
  max: number;
}
