export const FONT_OPTIONS: FontOption<string | undefined>[] = [
  { label: 'System', value: undefined },
  { label: 'Serif', value: 'Times New Roman' },
  { label: 'Sans', value: 'Helvetica' },
  { label: 'Monospace', value: 'Courier New' },
  // OpenDyslexic fonts (using the actual PostScript names)
  { label: 'OpenDyslexic Bold', value: 'OpenDyslexic-Bold' },
  { label: 'OpenDyslexic Italic', value: 'OpenDyslexic-Italic' },
  { label: 'OpenDyslexic Bold Italic', value: 'OpenDyslexic-BoldItalic' },
  { label: 'OpenDyslexicAlta Regular', value: 'OpenDyslexicAlta-Regular' },
  { label: 'OpenDyslexicAlta Bold', value: 'OpenDyslexicAlta-Bold' },
  { label: 'OpenDyslexicAlta Italic', value: 'OpenDyslexicAlta-Italic' },
  { label: 'OpenDyslexicAlta Bold Italic', value: 'OpenDyslexicAlta-BoldItalic' },
  { label: 'OpenDyslexicMono', value: 'OpenDyslexicMono-Regular' },
];

export type FontOption<T> = { label: string; value: T };
