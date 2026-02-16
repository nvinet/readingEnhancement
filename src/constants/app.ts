/**
 * Application-wide constants
 * 
 * This file contains magic numbers and configuration values used throughout the app.
 * Centralizing these values makes the code more maintainable and easier to adjust.
 */

// ============================================================================
// TIMING & INTERACTION
// ============================================================================

/**
 * Double-tap threshold in milliseconds
 * Used to detect when a user double-taps on a word to reset its font size
 */
export const DOUBLE_TAP_THRESHOLD_MS = 300;

/**
 * Debounce delay in milliseconds
 * Used to delay config updates when user is adjusting sliders to reduce writes
 */
export const DEBOUNCE_DELAY_MS = 100;

/**
 * Input animation duration in milliseconds
 * Duration for the text input expand/collapse animation
 */
export const INPUT_ANIMATION_DURATION_MS = 300;

// ============================================================================
// GESTURE SENSITIVITY
// ============================================================================

/**
 * Pinch sensitivity multiplier for selected word letter spacing
 * Higher values = more sensitive (larger changes per pinch gesture)
 * Used when a word is selected to adjust letter spacing
 */
export const PINCH_SENSITIVITY_WORD_SPACING = 20;

/**
 * Pinch sensitivity multiplier for global font size
 * Higher values = more sensitive (larger changes per pinch gesture)
 * Used when no word is selected to adjust global font size
 */
export const PINCH_SENSITIVITY_FONT_SIZE = 10;

// ============================================================================
// UI DIMENSIONS
// ============================================================================

/**
 * Height of the text ticker band in pixels
 * The scrolling text area where words are displayed
 */
export const TICKER_BAND_HEIGHT = 100;

/**
 * Maximum height for the text input area in pixels
 */
export const INPUT_MAX_HEIGHT = 250;

/**
 * Height of the text input field in pixels
 */
export const INPUT_FIELD_HEIGHT = 200;

// ============================================================================
// FONT SIZE CONSTRAINTS
// ============================================================================

/**
 * Minimum effective font size in pixels
 * Prevents font from becoming too small to read
 */
export const MIN_FONT_SIZE = 5;

/**
 * Minimum base font size in pixels
 * Used when adjusting the base font size setting
 */
export const MIN_BASE_FONT_SIZE = 10;

/**
 * Default base font size in pixels
 */
export const DEFAULT_BASE_FONT_SIZE = 20;

/**
 * Minimum scroll speed multiplier
 */
export const MIN_SCROLL_SPEED = 0.5;

/**
 * Maximum scroll speed multiplier
 */
export const MAX_SCROLL_SPEED = 10;

// ============================================================================
// COLOR DEFAULTS
// ============================================================================

/**
 * Default background color
 */
export const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';

/**
 * Default text color
 */
export const DEFAULT_TEXT_COLOR = '#111111';

/**
 * Default color for highlighting double letters
 */
export const DEFAULT_DOUBLE_LETTER_COLOR = '#D32F2F';

/**
 * Default underline color for centered word
 */
export const DEFAULT_UNDERLINE_COLOR = '#1976D2';

/**
 * Default theme colors (for backwards compatibility with app shell)
 */
export const THEME_COLORS = {
  lighter: '#F3F3F3',
  darker: '#222',
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Default hard letters (characters that get extra spacing for dyslexia support)
 * These are commonly confused letters that benefit from extra spacing
 */
export const DEFAULT_HARD_LETTERS = 'ghkqwxyzGHKQWXYZ';

/**
 * Default extra spacing for hard letters in pixels
 */
export const DEFAULT_HARD_LETTER_SPACING = 2;

/**
 * Default word spacing in pixels
 */
export const DEFAULT_WORD_SPACING = 8;

/**
 * Default maximum scroll speed
 */
export const DEFAULT_MAX_SCROLL_SPEED = 3;
