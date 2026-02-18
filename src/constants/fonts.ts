/**
 * Font families and typography constants
 * 
 * Centralizes all font-related configuration for the app.
 * Extracted from hardcoded values in FontOptions.tsx
 */

/**
 * Available font families in the application
 * Using const object for type safety and easy iteration
 */
export const FONT_FAMILIES = {
  SYSTEM: undefined,
  SERIF: 'Times New Roman',
  SANS: 'Helvetica',
  MONOSPACE: 'Courier New',
  OPEN_DYSLEXIC_BOLD: 'OpenDyslexic-Bold',
  OPEN_DYSLEXIC_ITALIC: 'OpenDyslexic-Italic',
  OPEN_DYSLEXIC_BOLD_ITALIC: 'OpenDyslexic-BoldItalic',
  OPEN_DYSLEXIC_ALTA_REGULAR: 'OpenDyslexicAlta-Regular',
  OPEN_DYSLEXIC_ALTA_BOLD: 'OpenDyslexicAlta-Bold',
  OPEN_DYSLEXIC_ALTA_ITALIC: 'OpenDyslexicAlta-Italic',
  OPEN_DYSLEXIC_ALTA_BOLD_ITALIC: 'OpenDyslexicAlta-BoldItalic',
  OPEN_DYSLEXIC_MONO: 'OpenDyslexicMono-Regular',
} as const;

/**
 * Type for font family values
 */
export type FontFamily = typeof FONT_FAMILIES[keyof typeof FONT_FAMILIES];

/**
 * Font option for UI display
 */
export interface FontOption {
  label: string;
  value: FontFamily;
}

/**
 * Available font options for the font picker
 * Ordered logically: system fonts first, then OpenDyslexic variants
 */
export const FONT_OPTIONS: FontOption[] = [
  { label: 'System', value: FONT_FAMILIES.SYSTEM },
  { label: 'Serif', value: FONT_FAMILIES.SERIF },
  { label: 'Sans', value: FONT_FAMILIES.SANS },
  { label: 'Monospace', value: FONT_FAMILIES.MONOSPACE },
  // OpenDyslexic fonts (using the actual PostScript names)
  { label: 'OpenDyslexic Bold', value: FONT_FAMILIES.OPEN_DYSLEXIC_BOLD },
  { label: 'OpenDyslexic Italic', value: FONT_FAMILIES.OPEN_DYSLEXIC_ITALIC },
  { label: 'OpenDyslexic Bold Italic', value: FONT_FAMILIES.OPEN_DYSLEXIC_BOLD_ITALIC },
  { label: 'OpenDyslexicAlta Regular', value: FONT_FAMILIES.OPEN_DYSLEXIC_ALTA_REGULAR },
  { label: 'OpenDyslexicAlta Bold', value: FONT_FAMILIES.OPEN_DYSLEXIC_ALTA_BOLD },
  { label: 'OpenDyslexicAlta Italic', value: FONT_FAMILIES.OPEN_DYSLEXIC_ALTA_ITALIC },
  { label: 'OpenDyslexicAlta Bold Italic', value: FONT_FAMILIES.OPEN_DYSLEXIC_ALTA_BOLD_ITALIC },
  { label: 'OpenDyslexicMono', value: FONT_FAMILIES.OPEN_DYSLEXIC_MONO },
];
