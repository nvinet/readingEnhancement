# Configuration & Theming System

This document describes the configuration and theming system implemented in Issue #10.

## Overview

The app now has a centralized configuration and theming system with the following features:

- **Font families** as typed constants (no more hardcoded strings)
- **Light/Dark theme support** with runtime switching
- **Type-safe configuration** with validation
- **Persistent theme preferences** saved to device storage

## Architecture

### Directory Structure

```
src/
├── constants/
│   ├── app.ts           # App-wide constants (timing, dimensions, defaults)
│   ├── fonts.ts         # Font family constants and options
│   ├── themes.ts        # Theme definitions (light/dark)
│   ├── storage.ts       # AsyncStorage keys
│   └── index.ts         # Barrel export
├── types/
│   ├── config.ts        # Configuration type definitions
│   └── index.ts         # Barrel export
├── contexts/
│   └── ThemeContext.tsx # Theme provider and hooks
└── utils/
    ├── validation.ts    # Validation and sanitization functions
    └── index.ts         # Barrel export
```

## Usage

### Using Fonts

**Before (hardcoded):**
```tsx
const fontFamily = 'OpenDyslexic-Bold';
```

**After (typed constant):**
```tsx
import { FONT_FAMILIES } from '@/constants/fonts';

const fontFamily = FONT_FAMILIES.OPEN_DYSLEXIC_BOLD;
```

**Font Picker:**
```tsx
import { FONT_OPTIONS } from '@/constants/fonts';

// FONT_OPTIONS is an array of { label, value } objects
<Picker>
  {FONT_OPTIONS.map(option => (
    <Picker.Item key={option.label} label={option.label} value={option.value} />
  ))}
</Picker>
```

### Using Themes

**1. Wrap your app with ThemeProvider:**

```tsx
// App.tsx
import { ThemeProvider } from './src/contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

**2. Use theme in components:**

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, themeMode, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        Current theme: {themeMode}
      </Text>
      <Button onPress={toggleTheme} title="Toggle Theme" />
    </View>
  );
}
```

**3. Or use just the colors:**

```tsx
import { useThemeColors } from '@/contexts/ThemeContext';

function MyComponent() {
  const colors = useThemeColors();
  
  return (
    <Text style={{ color: colors.text }}>
      Hello World
    </Text>
  );
}
```

### Validation

All configuration values can be validated before use:

```tsx
import {
  validateHexColor,
  validateFontSize,
  validateScrollSpeed,
  sanitizeColor,
  sanitizeFontSize,
} from '@/utils/validation';

// Validate a color
const result = validateHexColor('#FF0000');
if (!result.valid) {
  console.error(result.error);
}

// Sanitize (auto-fix) a value
const safeColor = sanitizeColor(userInput, '#FFFFFF');
const safeFontSize = sanitizeFontSize(userInput);
```

## Theme Customization

### Available Themes

- **Light theme**: High contrast for daylight reading
- **Dark theme**: Reduced eye strain for low-light conditions

### Theme Structure

```typescript
interface Theme {
  mode: 'light' | 'dark';
  colors: {
    background: string;
    text: string;
    doubleLetter: string;
    underline: string;
  };
}
```

### Adding New Themes

To add a new theme:

1. Define colors in `src/constants/themes.ts`
2. Add to `THEMES` object
3. Update `ThemeMode` type in `src/types/config.ts`

## Type Safety

### ReaderConfig

The `ReaderConfig` type is now centralized in `src/types/config.ts`:

```typescript
interface ReaderConfig {
  fontFamily: FontFamily;
  backgroundColor: string;
  textColor: string;
  doubleLetterColor: string;
  underlineColor: string;
  hardLetters: string;
  hardLetterExtraSpacing: number;
  wordSpacing: number;
  baseFontSize: number;
  maxScrollSpeed: number;
}
```

All font families use the `FontFamily` type, which is derived from `FONT_FAMILIES` constants.

## Persistence

### Theme Preference

Theme preference is automatically saved to AsyncStorage:
- Storage key: `theme_preference_v1`
- Persisted on theme change
- Loaded on app startup

### Reader Config

Reader configuration continues to use the existing storage:
- Storage key: `reader_config_v1`
- Contains `ReaderConfig` and brightness

## Validation Functions

### Available Validators

- `validateHexColor(color)` - Validates hex color format (#RGB, #RRGGBB, #RRGGBBAA)
- `validateFontSize(size, constraints?)` - Validates font size within range
- `validateEffectiveFontSize(size)` - Validates minimum readable font size
- `validateSpacing(spacing, constraints?)` - Validates spacing values
- `validateScrollSpeed(speed)` - Validates scroll speed multiplier
- `validateHardLetters(letters)` - Validates hard letters string (a-z, A-Z only)

### Available Sanitizers

Sanitizers clamp values to valid ranges (prefer validation + error handling when possible):

- `sanitizeColor(color, fallback)` - Returns valid color or fallback
- `sanitizeFontSize(size, constraints?)` - Clamps font size to valid range
- `sanitizeSpacing(spacing, constraints?)` - Clamps spacing to valid range
- `sanitizeScrollSpeed(speed)` - Clamps scroll speed to valid range

## Migration Guide

### For Existing Components

**FontOptions.tsx:**
- Now imports from `src/constants/fonts.ts`
- Maintains backwards compatibility via re-export

**Reader.tsx:**
- No changes required
- `ReaderConfig` type can now be imported from `src/types/config.ts` or `src/types`

**App.tsx:**
- Wrap with `<ThemeProvider>` to enable theme support (optional)

### Breaking Changes

None! All changes are backwards compatible. Existing code continues to work.

## Best Practices

1. **Use constants** instead of hardcoding values
2. **Validate user input** before saving to config
3. **Use theme context** for consistent colors across the app
4. **Import from index files** for cleaner imports:
   ```tsx
   import { FONT_FAMILIES, THEMES } from '@/constants';
   import { ReaderConfig, Theme } from '@/types';
   import { validateHexColor } from '@/utils';
   ```

## Future Enhancements

Potential additions:
- Custom user themes
- Theme scheduling (auto-switch based on time of day)
- Additional theme variants (high contrast, sepia, etc.)
- Color blind friendly themes
- Import/export configuration presets
