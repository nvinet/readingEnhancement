/**
 * Tests for validation utilities
 */

import {
  validateHexColor,
  validateFontSize,
  validateEffectiveFontSize,
  validateSpacing,
  validateScrollSpeed,
  validateHardLetters,
  sanitizeColor,
  clamp,
  sanitizeFontSize,
  sanitizeSpacing,
  sanitizeScrollSpeed,
} from '../../../src/utils/validation';

describe('validateHexColor', () => {
  it('should accept valid 6-digit hex colors', () => {
    expect(validateHexColor('#000000')).toEqual({ valid: true });
    expect(validateHexColor('#FFFFFF')).toEqual({ valid: true });
    expect(validateHexColor('#ff00ff')).toEqual({ valid: true });
    expect(validateHexColor('#AbCdEf')).toEqual({ valid: true });
  });

  it('should accept valid 3-digit hex colors', () => {
    expect(validateHexColor('#000')).toEqual({ valid: true });
    expect(validateHexColor('#FFF')).toEqual({ valid: true });
    expect(validateHexColor('#abc')).toEqual({ valid: true });
  });

  it('should accept valid 8-digit hex colors (with alpha)', () => {
    expect(validateHexColor('#00000000')).toEqual({ valid: true });
    expect(validateHexColor('#FFFFFFFF')).toEqual({ valid: true });
    expect(validateHexColor('#ff00ff80')).toEqual({ valid: true });
  });

  it('should reject invalid hex colors', () => {
    const result = validateHexColor('invalid');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid hex color format');
  });

  it('should reject hex colors without #', () => {
    const result = validateHexColor('000000');
    expect(result.valid).toBe(false);
  });

  it('should reject empty strings', () => {
    const result = validateHexColor('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Color cannot be empty');
  });

  it('should reject wrong length hex colors', () => {
    expect(validateHexColor('#00').valid).toBe(false);
    expect(validateHexColor('#0000').valid).toBe(false);
    expect(validateHexColor('#00000').valid).toBe(false);
    expect(validateHexColor('#0000000').valid).toBe(false);
  });

  it('should reject hex colors with invalid characters', () => {
    expect(validateHexColor('#GGGGGG').valid).toBe(false);
    expect(validateHexColor('#123XYZ').valid).toBe(false);
  });
});

describe('validateFontSize', () => {
  it('should accept valid font sizes', () => {
    expect(validateFontSize(16)).toEqual({ valid: true });
    expect(validateFontSize(20)).toEqual({ valid: true });
    expect(validateFontSize(50)).toEqual({ valid: true });
  });

  it('should reject font sizes below minimum', () => {
    const result = validateFontSize(5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least');
  });

  it('should reject font sizes above maximum', () => {
    const result = validateFontSize(200);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot exceed');
  });

  it('should accept custom constraints', () => {
    expect(validateFontSize(10, { min: 8, max: 20 })).toEqual({ valid: true });
    expect(validateFontSize(5, { min: 8, max: 20 }).valid).toBe(false);
    expect(validateFontSize(25, { min: 8, max: 20 }).valid).toBe(false);
  });

  it('should reject non-numeric values', () => {
    const result = validateFontSize(NaN);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be a number');
  });
});

describe('validateEffectiveFontSize', () => {
  it('should accept valid effective font sizes', () => {
    expect(validateEffectiveFontSize(12)).toEqual({ valid: true });
    expect(validateEffectiveFontSize(20)).toEqual({ valid: true });
  });

  it('should reject font sizes below minimum', () => {
    const result = validateEffectiveFontSize(2);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too small');
  });

  it('should reject non-numeric values', () => {
    const result = validateEffectiveFontSize(NaN);
    expect(result.valid).toBe(false);
  });
});

describe('validateSpacing', () => {
  it('should accept valid spacing values', () => {
    expect(validateSpacing(0)).toEqual({ valid: true });
    expect(validateSpacing(10)).toEqual({ valid: true });
    expect(validateSpacing(25)).toEqual({ valid: true });
  });

  it('should reject negative spacing', () => {
    const result = validateSpacing(-5);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least');
  });

  it('should reject spacing above maximum', () => {
    const result = validateSpacing(100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot exceed');
  });

  it('should accept custom constraints', () => {
    expect(validateSpacing(5, { min: 0, max: 10 })).toEqual({ valid: true });
    expect(validateSpacing(15, { min: 0, max: 10 }).valid).toBe(false);
  });

  it('should reject non-numeric values', () => {
    const result = validateSpacing(NaN);
    expect(result.valid).toBe(false);
  });
});

describe('validateScrollSpeed', () => {
  it('should accept valid scroll speeds', () => {
    expect(validateScrollSpeed(0.5)).toEqual({ valid: true });
    expect(validateScrollSpeed(1.0)).toEqual({ valid: true });
    expect(validateScrollSpeed(2.0)).toEqual({ valid: true });
  });

  it('should reject speeds below minimum', () => {
    const result = validateScrollSpeed(0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least');
  });

  it('should reject speeds above maximum', () => {
    const result = validateScrollSpeed(15);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('cannot exceed');
  });

  it('should reject non-numeric values', () => {
    const result = validateScrollSpeed(NaN);
    expect(result.valid).toBe(false);
  });
});

describe('validateHardLetters', () => {
  it('should accept valid letter strings', () => {
    expect(validateHardLetters('abc')).toEqual({ valid: true });
    expect(validateHardLetters('ABC')).toEqual({ valid: true });
    expect(validateHardLetters('AbCdEf')).toEqual({ valid: true });
    expect(validateHardLetters('')).toEqual({ valid: true });
  });

  it('should reject strings with non-letter characters', () => {
    const result = validateHardLetters('abc123');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('alphabetic characters');
  });

  it('should reject strings with special characters', () => {
    expect(validateHardLetters('abc!').valid).toBe(false);
    expect(validateHardLetters('a-b-c').valid).toBe(false);
    expect(validateHardLetters('a b c').valid).toBe(false);
  });

  it('should reject non-string values', () => {
    // @ts-ignore - testing runtime behavior
    const result = validateHardLetters(123);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be a string');
  });
});

describe('sanitizeColor', () => {
  it('should return valid colors unchanged', () => {
    expect(sanitizeColor('#000000', '#FFFFFF')).toBe('#000000');
    expect(sanitizeColor('#abc', '#FFFFFF')).toBe('#abc');
  });

  it('should return fallback for invalid colors', () => {
    expect(sanitizeColor('invalid', '#FFFFFF')).toBe('#FFFFFF');
    expect(sanitizeColor('', '#000000')).toBe('#000000');
    expect(sanitizeColor('#GGG', '#FF0000')).toBe('#FF0000');
  });
});

describe('clamp', () => {
  it('should return value if within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('should clamp to minimum', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(3, 5, 10)).toBe(5);
  });

  it('should clamp to maximum', () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(100, 0, 10)).toBe(10);
  });

  it('should handle negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });

  it('should handle decimal values', () => {
    expect(clamp(5.5, 0, 10)).toBe(5.5);
    expect(clamp(0.1, 1, 10)).toBe(1);
    expect(clamp(10.9, 0, 10)).toBe(10);
  });
});

describe('sanitizeFontSize', () => {
  it('should return valid font sizes unchanged', () => {
    expect(sanitizeFontSize(20)).toBe(20);
    expect(sanitizeFontSize(50)).toBe(50);
  });

  it('should clamp to minimum', () => {
    expect(sanitizeFontSize(5)).toBeGreaterThanOrEqual(10); // MIN_BASE_FONT_SIZE
  });

  it('should clamp to maximum', () => {
    expect(sanitizeFontSize(200)).toBeLessThanOrEqual(100);
  });

  it('should respect custom constraints', () => {
    expect(sanitizeFontSize(5, { min: 10, max: 20 })).toBe(10);
    expect(sanitizeFontSize(25, { min: 10, max: 20 })).toBe(20);
    expect(sanitizeFontSize(15, { min: 10, max: 20 })).toBe(15);
  });
});

describe('sanitizeSpacing', () => {
  it('should return valid spacing unchanged', () => {
    expect(sanitizeSpacing(10)).toBe(10);
    expect(sanitizeSpacing(0)).toBe(0);
  });

  it('should clamp to minimum', () => {
    expect(sanitizeSpacing(-5)).toBe(0);
  });

  it('should clamp to maximum', () => {
    expect(sanitizeSpacing(100)).toBe(50);
  });

  it('should respect custom constraints', () => {
    expect(sanitizeSpacing(-5, { min: 5, max: 15 })).toBe(5);
    expect(sanitizeSpacing(20, { min: 5, max: 15 })).toBe(15);
    expect(sanitizeSpacing(10, { min: 5, max: 15 })).toBe(10);
  });
});

describe('sanitizeScrollSpeed', () => {
  it('should return valid speeds unchanged', () => {
    expect(sanitizeScrollSpeed(1.0)).toBe(1.0);
    expect(sanitizeScrollSpeed(2.0)).toBe(2.0);
  });

  it('should clamp to minimum', () => {
    const result = sanitizeScrollSpeed(0);
    expect(result).toBeGreaterThanOrEqual(0.1); // MIN_SCROLL_SPEED
  });

  it('should clamp to maximum', () => {
    const result = sanitizeScrollSpeed(100);
    expect(result).toBeLessThanOrEqual(10); // MAX_SCROLL_SPEED
  });
});
