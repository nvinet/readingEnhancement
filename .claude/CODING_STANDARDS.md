# Coding Standards & Guidelines

> **Project:** Reading Enhancement App
> **Stack:** React Native 0.83 + TypeScript 5.8 + React 19
> **Last Updated:** 2026-02-06

This document defines the coding standards and best practices for developing and maintaining this React Native application.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [TypeScript Guidelines](#typescript-guidelines)
3. [React & React Native Patterns](#react--react-native-patterns)
4. [Component Architecture](#component-architecture)
5. [Styling Conventions](#styling-conventions)
6. [State Management](#state-management)
7. [Code Reusability](#code-reusability)
8. [Documentation](#documentation)
9. [Testing Standards](#testing-standards)
10. [Performance Guidelines](#performance-guidelines)
11. [Accessibility](#accessibility)
12. [Git & Commit Conventions](#git--commit-conventions)
13. [Code Review Checklist](#code-review-checklist)

---

## 1. Project Structure

### Folder Organization

```
readingEnhancement/
├── .claude/                      # Claude Code instructions & TODO
├── android/                      # Android native code
├── ios/                         # iOS native code
├── src/
│   ├── components/              # React components
│   │   ├── common/             # Shared/reusable components
│   │   ├── features/           # Feature-specific components
│   │   └── layout/             # Layout components
│   ├── constants/              # App constants
│   │   ├── app.ts             # App-level constants
│   │   ├── colors.ts          # Color palette
│   │   ├── fonts.ts           # Font families & sizes
│   │   ├── messages.ts        # User-facing text
│   │   └── storage.ts         # AsyncStorage keys
│   ├── hooks/                  # Custom React hooks
│   ├── native/                 # Native module wrappers
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts           # Shared types
│   │   └── models.ts          # Data models
│   ├── utils/                  # Utility functions
│   │   ├── text.ts            # Text processing utilities
│   │   ├── validation.ts      # Validation helpers
│   │   └── storage.ts         # AsyncStorage helpers
│   └── screens/               # Screen components (if routing added)
├── __tests__/                  # Test files (mirrors src structure)
│   ├── components/
│   ├── utils/
│   └── integration/
├── App.tsx                     # Root component
├── index.js                    # Entry point
└── package.json
```

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `Reader.tsx`, `TextTicker.tsx` |
| **Utilities** | camelCase | `textUtils.ts`, `storage.ts` |
| **Constants** | camelCase | `colors.ts`, `app.ts` |
| **Types** | PascalCase (interfaces/types) | `ReaderConfig`, `WordProps` |
| **Hooks** | camelCase with `use` prefix | `useDebounce.ts`, `useAsyncStorage.ts` |
| **Tests** | Same as source + `.test` | `Reader.test.tsx`, `textUtils.test.ts` |

### When to Create a New File

- **Component:** When it exceeds 300 lines or has distinct responsibility
- **Utility:** When a function is used in 2+ places
- **Hook:** When stateful logic is reused across components
- **Constant:** When a value is referenced in 2+ files

---

## 2. TypeScript Guidelines

### Strict Mode

Always use strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Type vs Interface

**Use `interface` for:**
- Object shapes, especially React component props
- When you need declaration merging
- Public API definitions

```typescript
interface ReaderProps {
  text: string;
  config: ReaderConfig;
  onSelectWordIndex?: (index: number | null) => void;
}
```

**Use `type` for:**
- Unions, intersections, and mapped types
- Function signatures
- Primitives and literals

```typescript
type Theme = 'light' | 'dark';
type Callback = (value: number) => void;
type ReadonlyConfig = Readonly<ReaderConfig>;
```

### Avoid Any and Type Assertions

❌ **Bad:**
```typescript
// @ts-ignore
const data: any = JSON.parse(raw);
```

✅ **Good:**
```typescript
interface StoredConfig {
  config?: ReaderConfig;
  brightness?: number;
}

const data = JSON.parse(raw) as StoredConfig;
// Validate before using
if (data && typeof data === 'object') {
  // Safe to use
}
```

### Type Exports

Always export types alongside components:

```typescript
export interface ReaderConfig {
  fontFamily?: string;
  backgroundColor: string;
  textColor: string;
}

export const Reader: React.FC<ReaderProps> = ({ ... }) => {
  // ...
};

export default Reader;
```

### Generics Over Any

❌ **Bad:**
```typescript
function updateValue(key: string, value: any) { ... }
```

✅ **Good:**
```typescript
function updateValue<T>(key: string, value: T): void { ... }
```

---

## 3. React & React Native Patterns

### Functional Components Only

Use functional components with hooks. No class components.

```typescript
// ✅ Good
const Reader: React.FC<ReaderProps> = ({ text, config }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // ...
};

// ❌ Bad - Don't use class components
class Reader extends React.Component { ... }
```

### Hook Usage Guidelines

**Order of Hooks:**
1. Context hooks (`useContext`)
2. State hooks (`useState`, `useReducer`)
3. Ref hooks (`useRef`)
4. Shared values (`useSharedValue` from Reanimated)
5. Effect hooks (`useEffect`, `useLayoutEffect`)
6. Memoization (`useMemo`, `useCallback`)
7. Custom hooks

**Example:**
```typescript
const MyComponent: React.FC<Props> = ({ onSave }) => {
  // 1. Context
  const theme = useContext(ThemeContext);

  // 2. State
  const [count, setCount] = useState(0);

  // 3. Refs
  const inputRef = useRef<TextInput>(null);

  // 4. Shared values (Reanimated)
  const translateX = useSharedValue(0);

  // 5. Effects
  useEffect(() => {
    // Side effect
  }, []);

  // 6. Memoization
  const memoizedValue = useMemo(() => heavyComputation(), [deps]);
  const handleClick = useCallback(() => { ... }, [deps]);

  // 7. Custom hooks
  const { data, loading } = useAsyncStorage('key');

  return <View>...</View>;
};
```

### Props Destructuring

Always destructure props in function signature:

✅ **Good:**
```typescript
const Word: React.FC<WordProps> = ({ word, index, isSelected, config }) => {
  // ...
};
```

❌ **Bad:**
```typescript
const Word: React.FC<WordProps> = (props) => {
  const { word, index } = props; // Don't do this
  // ...
};
```

### Default Props

Use default parameters instead of `defaultProps`:

✅ **Good:**
```typescript
interface Props {
  title?: string;
  count?: number;
}

const Component: React.FC<Props> = ({
  title = 'Default Title',
  count = 0
}) => {
  // ...
};
```

❌ **Bad:**
```typescript
Component.defaultProps = {
  title: 'Default Title',
  count: 0,
};
```

---

## 4. Component Architecture

### Component Categories

#### 1. **Presentational Components** (Dumb/Stateless)
- Pure UI components
- Receive all data via props
- No business logic
- Highly reusable

```typescript
// src/components/common/Button.tsx
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ label, onPress, variant = 'primary' }) => (
  <Pressable onPress={onPress} style={styles[variant]}>
    <Text>{label}</Text>
  </Pressable>
);
```

#### 2. **Container Components** (Smart/Stateful)
- Manage state and business logic
- Connect to data sources
- Pass data to presentational components

```typescript
// App.tsx (example of container)
export default function App() {
  const [config, setConfig] = useState<ReaderConfig>({ ... });

  // Business logic
  const handleSave = async () => { ... };

  return (
    <Reader
      config={config}
      onSave={handleSave}
    />
  );
}
```

#### 3. **Feature Components**
- Combine multiple components for a feature
- Can have local state
- Example: `Reader`, `SidePanel`

### Component File Structure

Each component file should follow this structure:

```typescript
// 1. Imports (external, then internal)
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SomeComponent } from './SomeComponent';

// 2. Types and Interfaces
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

interface InternalState {
  isActive: boolean;
}

// 3. Constants (component-specific)
const DEFAULT_TIMEOUT = 300;

// 4. Helper Functions (pure, outside component)
function formatText(text: string): string {
  return text.trim();
}

// 5. Sub-components (if tightly coupled)
const SubComponent = React.memo<SubProps>(({ ... }) => {
  return <View>...</View>;
});

// 6. Main Component
export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  // Hook declarations
  const [state, setState] = useState<InternalState>({ isActive: false });

  // Event handlers
  const handlePress = useCallback(() => {
    onAction();
  }, [onAction]);

  // Render
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

// 7. Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

// 8. Default export (if needed)
export default MyComponent;
```

### Component Size Limits

- **Maximum 300 lines** per component file
- **Maximum 10 props** per component
- If exceeded, consider:
  - Extracting sub-components
  - Creating custom hooks
  - Splitting into multiple components

### When to Use React.memo

Use `React.memo` when:
- Component receives complex props that don't change often
- Component is rendered frequently with same props
- Rendering is expensive (heavy calculations, large lists)

```typescript
export const Word = React.memo<WordProps>(({ word, index, config }) => {
  // Expensive rendering logic
  return <Text>{word}</Text>;
});

// Custom comparison for optimization
export const Word = React.memo<WordProps>(
  ({ word, index, config }) => { ... },
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.word === nextProps.word &&
           prevProps.config === nextProps.config;
  }
);
```

---

## 5. Styling Conventions

### StyleSheet Over Inline Styles

❌ **Bad:**
```typescript
<View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
```

✅ **Good:**
```typescript
<View style={styles.container}>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
});
```

### Style Organization

```typescript
const styles = StyleSheet.create({
  // 1. Layout styles
  container: { flex: 1 },
  row: { flexDirection: 'row' },

  // 2. Component-specific styles
  header: { height: 60, backgroundColor: '#fff' },
  content: { padding: 16 },

  // 3. Text styles
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#666' },

  // 4. State variants
  buttonActive: { backgroundColor: '#007AFF' },
  buttonInactive: { backgroundColor: '#CCC' },
});
```

### Dynamic Styles

For styles that change based on props or state:

```typescript
// Option 1: Array syntax
<View style={[styles.base, isActive && styles.active]} />

// Option 2: Dynamic object (use sparingly)
const dynamicStyle = useMemo(() => ({
  backgroundColor: config.backgroundColor,
  color: config.textColor,
}), [config]);

<View style={[styles.base, dynamicStyle]} />
```

### Color System

Use constants for colors:

```typescript
// src/constants/colors.ts
export const Colors = {
  // Brand colors
  primary: '#007AFF',
  secondary: '#5856D6',

  // Semantic colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  // Neutrals
  text: '#000000',
  textSecondary: '#666666',
  background: '#FFFFFF',
  border: '#DDDDDD',

  // Accessibility
  dyslexiaHighlight: '#D32F2F',
} as const;
```

### Spacing System

Use consistent spacing scale:

```typescript
// src/constants/app.ts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Usage
const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
});
```

---

## 6. State Management

### Local State (useState)

Use for component-specific state:

```typescript
const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
const [isVisible, setIsVisible] = useState(false);
```

### Complex State (useReducer)

Use when:
- State has complex update logic
- Multiple sub-values
- Next state depends on previous state

```typescript
interface State {
  config: ReaderConfig;
  liveValues: LiveValues;
  isDirty: boolean;
}

type Action =
  | { type: 'UPDATE_CONFIG'; payload: Partial<ReaderConfig> }
  | { type: 'UPDATE_LIVE'; payload: Partial<LiveValues> }
  | { type: 'RESET' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload }, isDirty: true };
    case 'UPDATE_LIVE':
      return { ...state, liveValues: { ...state.liveValues, ...action.payload } };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, initialState);
```

### Shared State

For state shared across multiple components:

1. **Props drilling** (up to 2-3 levels)
2. **Context** (for global/theme data)
3. **State management library** (Zustand/Jotai for complex apps)

### Refs for Non-Render Values

Use `useRef` for values that don't trigger re-renders:

```typescript
// ✅ Good - Timers, previous values, DOM refs
const timerRef = useRef<NodeJS.Timeout | null>(null);
const lastValueRef = useRef(0);
const inputRef = useRef<TextInput>(null);

// ❌ Bad - Don't use for render-critical data
const countRef = useRef(0); // Use useState instead
```

---

## 7. Code Reusability

### Custom Hooks

Extract reusable stateful logic:

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedSearchTerm = useDebounce(searchTerm, 300);
```

### Utility Functions

Create pure utility functions:

```typescript
// src/utils/text.ts
export function splitIntoWords(text: string): string[] {
  return text.split(/\s+/).filter(w => w.length > 0);
}

export function findDoubleLetterIndices(word: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < word.length - 1; i++) {
    if (word[i] === word[i + 1]) {
      indices.push(i);
    }
  }
  return indices;
}
```

### Higher-Order Components (HOCs)

Use sparingly; prefer hooks and composition:

```typescript
// Only when you need to wrap multiple components with same logic
function withLoading<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { isLoading: boolean }> {
  return ({ isLoading, ...props }) => {
    if (isLoading) return <LoadingSpinner />;
    return <Component {...props as P} />;
  };
}
```

### Composition Over Inheritance

```typescript
// ✅ Good - Composition
<TextTicker speed={speed}>
  <Word word="hello" />
  <Word word="world" />
</TextTicker>

// ❌ Bad - Don't create class hierarchies
class ExtendedTicker extends TextTicker { ... }
```

---

## 8. Documentation

### Component Documentation

Use JSDoc for public components and functions:

```typescript
/**
 * Renders a single word with character-level styling for dyslexia support.
 *
 * Highlights double letters, applies extra spacing around hard letters,
 * and supports per-word font size overrides.
 *
 * @param word - The word text to render
 * @param index - Position in the word array
 * @param isSelected - Whether this word is currently selected
 * @param config - Global reader configuration
 * @param fontSizeDelta - Additional font size adjustment in pixels
 * @param hardLettersSet - Set of characters that require extra spacing
 * @param onSelect - Callback when word is tapped
 * @param onReset - Callback when word is double-tapped to reset
 *
 * @example
 * ```tsx
 * <Word
 *   word="hello"
 *   index={0}
 *   isSelected={false}
 *   config={readerConfig}
 *   fontSizeDelta={0}
 *   hardLettersSet={new Set(['h', 'l'])}
 *   onSelect={(idx) => console.log('Selected:', idx)}
 *   onReset={(idx) => console.log('Reset:', idx)}
 * />
 * ```
 */
export const Word = React.memo<WordProps>(({ ... }) => { ... });
```

### Inline Comments

Use comments for:
- Complex algorithms
- Non-obvious business logic
- Workarounds or hacks (with TODO/FIXME)

```typescript
// Good comments:

// Normalize to NFC to handle accented characters (é, ñ) consistently
const normalized = letters.normalize('NFC');

// FIXME: Race condition between contentWidth state and contentWidthSV shared value
// TODO: Refactor to use only shared values for consistent gesture handling

// Bad comments (don't state the obvious):
// Set the count to 0
setCount(0);

// Loop through words
words.forEach(word => { ... });
```

### README Documentation

Maintain a comprehensive README.md:

```markdown
# Reading Enhancement App

## Features
- [List key features]

## Setup
\`\`\`bash
npm install
npm run ios  # or npm run android
\`\`\`

## Architecture
- [Brief architecture overview]

## Key Files
- `App.tsx` - Main application orchestrator
- `src/components/Reader.tsx` - Core text rendering component
- [etc.]

## Contributing
See [CODING_STANDARDS.md](.claude/CODING_STANDARDS.md)
```

### Type Documentation

Document complex types:

```typescript
/**
 * Configuration for the Reader component's visual appearance.
 * All settings are persisted to AsyncStorage.
 */
export interface ReaderConfig {
  /** Font family name or undefined for system default */
  fontFamily?: string;

  /** Background color in hex format (#RRGGBB) */
  backgroundColor: string;

  /** Text color in hex format (#RRGGBB) */
  textColor: string;

  /** Highlight color for consecutive identical letters */
  doubleLetterColor: string;

  /** Characters that receive extra spacing (e.g., 'bdhkpq') */
  hardLetters: string;

  /** Additional spacing in pixels around hard letters */
  hardLetterExtraSpacing: number;

  /** Space in pixels between words */
  wordSpacing: number;

  /** Base font size in points */
  baseFontSize: number;
}
```

---

## 9. Testing Standards

### Testing Philosophy

- **Unit tests** for pure functions and utilities
- **Component tests** for UI components
- **Integration tests** for user flows
- **Aim for 70%+ code coverage**

### Test File Organization

Mirror source structure:

```
src/
  components/
    Reader.tsx
  utils/
    text.ts
__tests__/
  components/
    Reader.test.tsx
  utils/
    text.test.ts
```

### Test Structure (AAA Pattern)

```typescript
describe('splitIntoWords', () => {
  it('should split text on whitespace', () => {
    // Arrange
    const input = 'hello world';

    // Act
    const result = splitIntoWords(input);

    // Assert
    expect(result).toEqual(['hello', 'world']);
  });

  it('should filter empty strings', () => {
    const input = 'hello  world'; // Double space
    const result = splitIntoWords(input);
    expect(result).toEqual(['hello', 'world']);
  });
});
```

### Component Testing

Use React Testing Library:

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { Word } from '../components/Reader';

describe('Word component', () => {
  const mockConfig: ReaderConfig = {
    fontFamily: undefined,
    backgroundColor: '#FFF',
    textColor: '#000',
    doubleLetterColor: '#F00',
    hardLetters: 'bdpq',
    hardLetterExtraSpacing: 2,
    wordSpacing: 8,
    baseFontSize: 20,
  };

  it('should render word text', () => {
    const { getByText } = render(
      <Word
        word="hello"
        index={0}
        isSelected={false}
        config={mockConfig}
        fontSizeDelta={0}
        hardLettersSet={new Set(['h'])}
      />
    );

    expect(getByText('hello')).toBeTruthy();
  });

  it('should call onSelect when pressed', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <Word
        word="test"
        index={5}
        isSelected={false}
        config={mockConfig}
        fontSizeDelta={0}
        hardLettersSet={new Set()}
        onSelect={onSelect}
      />
    );

    fireEvent.press(getByText('test'));
    expect(onSelect).toHaveBeenCalledWith(5);
  });
});
```

### Test Coverage Requirements

| Type | Coverage Target |
|------|----------------|
| Utilities | 90%+ |
| Components | 70%+ |
| Integration | Key user flows |

### What NOT to Test

- Third-party library internals
- React Native core functionality
- Obvious getters/setters
- Constants

---

## 10. Performance Guidelines

### Memoization

Use `useMemo` for expensive calculations:

```typescript
// ✅ Good
const hardLettersSet = useMemo(() => {
  const letters = config.hardLetters.normalize('NFC');
  return new Set(Array.from(letters));
}, [config.hardLetters]);

// ❌ Bad - Recreated every render
const hardLettersSet = new Set(Array.from(config.hardLetters));
```

Use `useCallback` for function props:

```typescript
// ✅ Good
const handlePress = useCallback(() => {
  onAction(index);
}, [onAction, index]);

// ❌ Bad - New function every render
const handlePress = () => {
  onAction(index);
};
```

### List Rendering

Use `FlatList` for long lists:

```typescript
// ✅ Good - Virtualized
<FlatList
  data={words}
  renderItem={({ item, index }) => <Word word={item} index={index} />}
  keyExtractor={(item, index) => `word-${index}`}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>

// ❌ Bad - Renders all items
{words.map((word, index) => <Word word={word} index={index} />)}
```

### Avoid Anonymous Functions in Renders

❌ **Bad:**
```typescript
<Pressable onPress={() => handleAction(item.id)}>
```

✅ **Good:**
```typescript
const handlePress = useCallback(() => handleAction(item.id), [item.id]);
return <Pressable onPress={handlePress}>
```

### Reanimated Performance

- Use `useSharedValue` for animated values
- Animations run on UI thread (60fps)
- Use `runOnJS` to call JavaScript functions from worklets

```typescript
const offset = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ translateX: offset.value }],
  };
});
```

---

## 11. Accessibility

### Accessibility Labels

Add labels to all interactive elements:

```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Settings"
  accessibilityHint="Opens the settings panel"
  onPress={openSettings}
>
  <Text>⚙️</Text>
</Pressable>
```

### Accessibility Roles

| Element | Role |
|---------|------|
| Buttons | `button` |
| Text inputs | `search`, `none` (default) |
| Links | `link` |
| Headers | `header` |
| Images | `image` |
| Adjustable sliders | `adjustable` |

### Color Contrast

Ensure WCAG AA compliance:
- **Normal text:** 4.5:1 contrast ratio
- **Large text (18pt+):** 3:1 contrast ratio

```typescript
// Use tools like contrast-ratio.com to verify
const textColor = '#111111'; // Good contrast on #FFFFFF
const borderColor = '#DDDDDD'; // May need darker for visibility
```

### Dynamic Type

Support system font scaling:

```typescript
import { PixelRatio } from 'react-native';

const scaledFontSize = PixelRatio.getFontScale() * baseFontSize;
```

---

## 12. Git & Commit Conventions

### Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `chore`: Maintenance tasks (dependencies, build config)

**Examples:**
```
feat(reader): add double-tap to reset word size

Implemented double-tap gesture detection to reset individual word
font size overrides back to default.

Closes #42

---

fix(ticker): prevent race condition in pan gesture

Use shared value for contentWidth instead of mixing state and
shared values to prevent gesture calculation errors.

---

refactor(app): extract constants to separate files

- Moved color definitions to src/constants/colors.ts
- Moved spacing scale to src/constants/app.ts
- Moved storage keys to src/constants/storage.ts

---

test(utils): add tests for text splitting functions

Added unit tests for splitIntoWords and findDoubleLetterIndices
functions with edge cases.
```

### Branch Naming

```
<type>/<short-description>

Examples:
feature/add-brightness-control
fix/gesture-race-condition
refactor/extract-constants
docs/update-readme
```

### Pull Request Template

```markdown
## Description
[Describe the changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation
- [ ] Performance improvement

## Testing
- [ ] Unit tests added/updated
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Tested on physical device

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tests pass locally
```

---

## 13. Code Review Checklist

### For Reviewers

**Functionality:**
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] No obvious bugs

**Code Quality:**
- [ ] Follows project conventions
- [ ] No unnecessary complexity
- [ ] Proper error handling
- [ ] No hardcoded values (uses constants)

**TypeScript:**
- [ ] No `any` types or `@ts-ignore`
- [ ] Proper type definitions
- [ ] Interfaces exported where needed

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Proper memoization
- [ ] Efficient algorithms

**Testing:**
- [ ] Tests added for new functionality
- [ ] Tests cover edge cases
- [ ] Tests are readable

**Documentation:**
- [ ] Complex logic is commented
- [ ] Public APIs have JSDoc
- [ ] README updated if needed

**Accessibility:**
- [ ] Accessibility labels added
- [ ] Color contrast is sufficient
- [ ] Works with screen readers

### For Authors (Self-Review)

Before submitting PR:

1. **Run linter:** `npm run lint`
2. **Run tests:** `npm test`
3. **Build successfully:** `npm run ios` and `npm run android`
4. **Self-review the diff:** Check for console.logs, commented code
5. **Test on device:** Verify on iOS and Android
6. **Update TODO:** Mark completed items in `.claude/TODO.md`

---

## Quick Reference

### Common Patterns

**Debounced Input:**
```typescript
const [value, setValue] = useState('');
const debouncedValue = useDebounce(value, 300);

useEffect(() => {
  // API call with debouncedValue
}, [debouncedValue]);
```

**Async Storage:**
```typescript
const saveConfig = async (config: ReaderConfig) => {
  try {
    await AsyncStorage.setItem('key', JSON.stringify(config));
  } catch (error) {
    console.error('Save failed:', error);
    Alert.alert('Error', 'Failed to save settings');
  }
};
```

**Gesture Handling:**
```typescript
const panGesture = Gesture.Pan()
  .onStart(() => {
    // Initialize
  })
  .onUpdate((event) => {
    // Update shared values
  })
  .onEnd(() => {
    // Cleanup
  });
```

**Conditional Rendering:**
```typescript
// Simple condition
{isVisible && <Component />}

// If-else
{isLoading ? <Spinner /> : <Content />}

// Multiple conditions
{error ? <Error /> : loading ? <Spinner /> : <Content />}
```

---

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Gesture Handler Docs](https://docs.swmansion.com/react-native-gesture-handler/)
- [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react)

---

**Remember:** These are guidelines, not laws. Use judgment and prioritize:
1. **Readability** over cleverness
2. **Simplicity** over complexity
3. **Consistency** over personal preference
4. **Functionality** over perfection

*Last updated: 2026-02-06*
