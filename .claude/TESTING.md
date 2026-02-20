# Testing Guide

This document describes the testing infrastructure and conventions for the Reading Enhancement app.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage](#coverage)
- [Continuous Integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The Reading Enhancement app uses **Jest** and **React Native Testing Library** for testing.

### Test Categories

1. **Unit Tests** - Pure functions and utility code
2. **Component Tests** - React component rendering and interactions
3. **Integration Tests** - User flows and feature combinations
4. **E2E Tests** - Full application workflows (not yet implemented)

### Current Coverage

- **Unit Tests**: 100+ tests covering utils, validation, and text processing
- **Component Tests**: Tests for ColorPickerField and other reusable components
- **Integration Tests**: Basic user flow tests
- **Overall Coverage**: ~50% code coverage

## Test Structure

```
__tests__/
├── unit/          # Component tests
│   └── components/          # Component tests
│       └── (future tests here)
│   └── hooks/               # Custom hook tests
│       └── (future tests here)
│   └── utils/               # Utility function tests
│       └── (future tests here)
├── integration/         # Integration tests
│   └── (future tests here)
├── integration/         # end to end tests
│   └── (future tests here)
```

### File Naming Conventions

- **Test files**: `ComponentName.test.tsx` or `functionName.test.ts`
- **Location**: Mirror the source file structure in `__tests__/`

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

This generates:
- Console output with coverage summary
- HTML report in `coverage/` directory
- LCOV report for CI tools

### Run Specific Test File

```bash
npx jest __tests__/components/ColorPickerField.test.tsx
```

### Run Tests Matching Pattern

```bash
npx jest --testNamePattern="should render"
```

## Writing Tests

### Component Test Example

```typescript
import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import ColorPickerField from '../../src/components/ColorPickerField';

describe('ColorPickerField Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with label and initial color', () => {
    const {getByText} = render(
      <ColorPickerField
        label="Background Color"
        value="#FFFFFF"
        onChange={mockOnChange}
      />
    );

    expect(getByText('Background Color')).toBeTruthy();
    expect(getByText('Choose Color')).toBeTruthy();
  });

  it('should call onChange when color is selected', () => {
    const {getByText, getByTestId} = render(
      <ColorPickerField
        label="Test Color"
        value="#FFFFFF"
        onChange={mockOnChange}
      />
    );

    fireEvent.press(getByText('Choose Color'));
    fireEvent.press(getByTestId('color-picker-complete'));

    expect(mockOnChange).toHaveBeenCalled();
  });
});
```

### Unit Test Example

```typescript
import {validateHexColor, sanitizeColor} from '../../src/utils/validation';

describe('validateHexColor', () => {
  it('should accept valid 6-digit hex colors', () => {
    expect(validateHexColor('#FF5500')).toBe(true);
    expect(validateHexColor('#000000')).toBe(true);
    expect(validateHexColor('#FFFFFF')).toBe(true);
  });

  it('should reject invalid hex colors', () => {
    expect(validateHexColor('FF5500')).toBe(false);  // Missing #
    expect(validateHexColor('#GG0000')).toBe(false); // Invalid chars
    expect(validateHexColor('#FF')).toBe(false);     // Too short
  });
});
```

### Integration Test Example

```typescript
import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import App from '../../App';

describe('Text Input Flow', () => {
  it('should allow user to paste text and display it', async () => {
    const {getByPlaceholderText, getByText} = render(<App />);

    const input = getByPlaceholderText(/Paste your text here/);
    fireEvent.changeText(input, 'Hello world');

    await waitFor(() => {
      expect(getByText('Hello')).toBeTruthy();
    }, {timeout: 2000});
  });
});
```

## Testing Best Practices

### 1. AAA Pattern (Arrange-Act-Assert)

```typescript
it('should increment counter', () => {
  // Arrange
  const initialValue = 0;

  // Act
  const result = increment(initialValue);

  // Assert
  expect(result).toBe(1);
});
```

### 2. Use Descriptive Test Names

✅ Good:
```typescript
it('should display error when password is less than 8 characters', () => {
```

❌ Bad:
```typescript
it('validates password', () => {
```

### 3. Test Behavior, Not Implementation

Focus on what users see and do, not internal state.

✅ Good:
```typescript
it('should display success message after save', () => {
  fireEvent.press(saveButton);
  expect(getByText('Settings saved')).toBeTruthy();
});
```

❌ Bad:
```typescript
it('should set state.saved to true', () => {
  // Testing internal implementation
});
```

### 4. Mock External Dependencies

```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
}));
```

### 5. Clean Up After Tests

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
});
```

## Coverage

### Coverage Thresholds

The project enforces minimum coverage thresholds:

- **Global**: 40% statements, 30% branches, 40% functions, 40% lines
- **Utils**: 80% statements, 70% branches, 80% functions, 80% lines
- **Components**: 40% statements, 30% branches, 40% functions, 40% lines

### View Coverage Report

After running `npm run test:coverage`, open:

```bash
open coverage/lcov-report/index.html
```

### Improving Coverage

Focus on:
1. **Critical paths**: User flows that must work
2. **Edge cases**: Empty inputs, max values, error conditions
3. **Business logic**: Validation, calculations, transformations
4. **Not coverage for coverage's sake**: Don't test trivial getters/setters

## Mocking

### Common Mocks (in `jest-setup.js`)

- `react-native-reanimated` - Animation library
- `react-native-gesture-handler` - Gesture handling
- `@react-native-async-storage/async-storage` - Local storage
- `react-native-safe-area-context` - Safe area handling
- `react-native-worklets` - Worklet execution
- `reanimated-color-picker` - Color picker component

### Custom Mocks in Tests

```typescript
// Mock specific module for one test file
jest.mock('../../src/utils/myUtil', () => ({
  myFunction: jest.fn(() => 'mocked value'),
}));

// Mock implementation
const mockFunction = jest.fn();
mockFunction.mockReturnValue(42);
mockFunction.mockResolvedValue(Promise.resolve('data'));
mockFunction.mockRejectedValue(new Error('error'));
```

## Testing Native Modules

Some components require native modules that aren't available in the test environment. For these:

1. Mock the native module in `jest-setup.js`
2. Test the logic separately from the native integration
3. Use E2E tests for full native functionality

Example:
```typescript
// __tests__/App.test.tsx
describe('App component', () => {
  it('placeholder test - component requires native modules', () => {
    expect(true).toBe(true);
  });
});
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Pushes to `main` branch
- Release builds

### CI Configuration

```yaml
# .github/workflows/test.yml (example)
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Troubleshooting

### Issue: Tests timeout

**Solution**: Increase timeout in test file:
```typescript
jest.setTimeout(10000); // 10 seconds
```

Or per test:
```typescript
it('async test', async () => {
  // test code
}, 10000);
```

### Issue: "Cannot find module" errors

**Solution**: Check `jest.config.js` `transformIgnorePatterns` and ensure the module is included.

### Issue: Reanimated/Gesture Handler errors

**Solution**: Ensure mocks are properly set up in `jest-setup.js`. Native animation libraries need mocks to work in tests.

### Issue: Act warnings

**Solution**: Wrap state updates in `act()` or `waitFor()`:
```typescript
await waitFor(() => {
  expect(getByText('Updated')).toBeTruthy();
});
```

### Issue: Snapshot tests failing

**Solution**: Update snapshots if changes are intentional:
```bash
npx jest --updateSnapshot
```

## Future Testing Plans

### E2E Testing (Planned)

**Options considered**:
- **Detox**: Full React Native E2E framework
- **Maestro**: Simpler, faster E2E testing

**Recommended**: Maestro for easier setup and maintenance.

### Example Maestro Test (Future)

```yaml
# e2e/flows/paste-and-read.yaml
appId: com.readingenhancement
---
- launchApp
- tapOn: "Paste your text here"
- inputText: "The quick brown fox"
- assertVisible: "The"
- tapOn:
    text: "Settings"
    index: 0
- assertVisible: "Font"
```

## Resources

- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Maestro E2E Testing](https://maestro.mobile.dev/)

## Contributing

When adding new features:
1. Write tests first (TDD) or alongside implementation
2. Aim for meaningful tests, not just coverage numbers
3. Test user-facing behavior
4. Update this documentation if adding new testing patterns

## Questions?

Contact the team or check the main project README.md for more information.

---

*Last updated: 2026-02-20*
