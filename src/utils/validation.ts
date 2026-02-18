/**
 * Configuration validation utilities
 * 
 * Provides validation functions for user input and configuration values.
 * Ensures data integrity throughout the application.
 */

import { ValidationResult, FontSizeConstraints, SpacingConstraints } from '../types/config';
import {
  MIN_FONT_SIZE,
  MIN_BASE_FONT_SIZE,
  MIN_SCROLL_SPEED,
  MAX_SCROLL_SPEED,
} from '../constants/app';

/**
 * Validates a hex color code
 * Accepts formats: #RGB, #RRGGBB, #RRGGBBAA
 * 
 * @param color - Color string to validate
 * @returns Validation result with error message if invalid
 */
export function validateHexColor(color: string): ValidationResult {
  if (!color) {
    return { valid: false, error: 'Color cannot be empty' };
  }

  // Regex for hex color: #RGB, #RRGGBB, or #RRGGBBAA
  const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  
  if (!hexColorRegex.test(color)) {
    return {
      valid: false,
      error: 'Invalid hex color format. Use #RGB, #RRGGBB, or #RRGGBBAA',
    };
  }

  return { valid: true };
}

/**
 * Validates a font size value
 * 
 * @param fontSize - Font size in pixels
 * @param constraints - Optional custom constraints (defaults to app constants)
 * @returns Validation result with error message if invalid
 */
export function validateFontSize(
  fontSize: number,
  constraints?: FontSizeConstraints
): ValidationResult {
  const min = constraints?.min ?? MIN_BASE_FONT_SIZE;
  const max = constraints?.max ?? 100; // Reasonable maximum

  if (typeof fontSize !== 'number' || isNaN(fontSize)) {
    return { valid: false, error: 'Font size must be a number' };
  }

  if (fontSize < min) {
    return { valid: false, error: `Font size must be at least ${min}px` };
  }

  if (fontSize > max) {
    return { valid: false, error: `Font size cannot exceed ${max}px` };
  }

  return { valid: true };
}

/**
 * Validates effective font size (base + delta)
 * Ensures the final rendered font size is readable
 * 
 * @param fontSize - Effective font size in pixels
 * @returns Validation result with error message if invalid
 */
export function validateEffectiveFontSize(fontSize: number): ValidationResult {
  if (typeof fontSize !== 'number' || isNaN(fontSize)) {
    return { valid: false, error: 'Font size must be a number' };
  }

  if (fontSize < MIN_FONT_SIZE) {
    return { valid: false, error: `Font size too small (minimum ${MIN_FONT_SIZE}px)` };
  }

  return { valid: true };
}

/**
 * Validates spacing value (word spacing, letter spacing, etc.)
 * 
 * @param spacing - Spacing value in pixels
 * @param constraints - Optional custom constraints
 * @returns Validation result with error message if invalid
 */
export function validateSpacing(
  spacing: number,
  constraints?: SpacingConstraints
): ValidationResult {
  const min = constraints?.min ?? 0;
  const max = constraints?.max ?? 50; // Reasonable maximum

  if (typeof spacing !== 'number' || isNaN(spacing)) {
    return { valid: false, error: 'Spacing must be a number' };
  }

  if (spacing < min) {
    return { valid: false, error: `Spacing must be at least ${min}px` };
  }

  if (spacing > max) {
    return { valid: false, error: `Spacing cannot exceed ${max}px` };
  }

  return { valid: true };
}

/**
 * Validates scroll speed value
 * 
 * @param speed - Scroll speed multiplier
 * @returns Validation result with error message if invalid
 */
export function validateScrollSpeed(speed: number): ValidationResult {
  if (typeof speed !== 'number' || isNaN(speed)) {
    return { valid: false, error: 'Scroll speed must be a number' };
  }

  if (speed < MIN_SCROLL_SPEED) {
    return { valid: false, error: `Scroll speed must be at least ${MIN_SCROLL_SPEED}` };
  }

  if (speed > MAX_SCROLL_SPEED) {
    return { valid: false, error: `Scroll speed cannot exceed ${MAX_SCROLL_SPEED}` };
  }

  return { valid: true };
}

/**
 * Validates hard letters string
 * Ensures only valid characters are included
 * 
 * @param letters - String of hard letters
 * @returns Validation result with error message if invalid
 */
export function validateHardLetters(letters: string): ValidationResult {
  if (typeof letters !== 'string') {
    return { valid: false, error: 'Hard letters must be a string' };
  }

  // Allow only letters (a-z, A-Z)
  const validLettersRegex = /^[a-zA-Z]*$/;
  
  if (!validLettersRegex.test(letters)) {
    return {
      valid: false,
      error: 'Hard letters can only contain alphabetic characters (a-z, A-Z)',
    };
  }

  return { valid: true };
}

/**
 * Sanitizes a color value, providing a fallback if invalid
 * 
 * @param color - Color to sanitize
 * @param fallback - Fallback color if invalid
 * @returns Valid hex color
 */
export function sanitizeColor(color: string, fallback: string): string {
  const result = validateHexColor(color);
  return result.valid ? color : fallback;
}

/**
 * Clamps a number between min and max values
 * 
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Sanitizes font size, clamping to valid range
 * 
 * @param fontSize - Font size to sanitize
 * @param constraints - Optional custom constraints
 * @returns Valid font size
 */
export function sanitizeFontSize(
  fontSize: number,
  constraints?: FontSizeConstraints
): number {
  const min = constraints?.min ?? MIN_BASE_FONT_SIZE;
  const max = constraints?.max ?? 100;
  return clamp(fontSize, min, max);
}

/**
 * Sanitizes spacing value, clamping to valid range
 * 
 * @param spacing - Spacing to sanitize
 * @param constraints - Optional custom constraints
 * @returns Valid spacing value
 */
export function sanitizeSpacing(
  spacing: number,
  constraints?: SpacingConstraints
): number {
  const min = constraints?.min ?? 0;
  const max = constraints?.max ?? 50;
  return clamp(spacing, min, max);
}

/**
 * Sanitizes scroll speed, clamping to valid range
 * 
 * @param speed - Scroll speed to sanitize
 * @returns Valid scroll speed
 */
export function sanitizeScrollSpeed(speed: number): number {
  return clamp(speed, MIN_SCROLL_SPEED, MAX_SCROLL_SPEED);
}
