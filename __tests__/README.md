# Test Suite Documentation

## Overview

This test suite provides comprehensive unit tests for the Reading Enhancement App's core business logic.

## Test Coverage

### ✅ Completed Tests (34 passing)

#### 1. Pure Function Tests

**`splitIntoWords()` - 8 tests**
- Splits text on whitespace
- Handles multiple spaces, tabs, and newlines
- Filters out empty strings
- Edge cases: empty strings, single words, very long text

**`findDoubleLetterIndices()` - 8 tests**
- Finds double letters correctly
- Handles multiple double letters
- Handles triple letters
- Case-sensitive matching
- Edge cases: empty strings, single characters, numbers/special chars

**`handleChangeHardLetters()` normalization logic - 16 tests**
- Unicode letter acceptance (accented chars, Greek, Cyrillic, ligatures)
- NFC normalization
- Duplicate removal
- Non-letter filtering (numbers, whitespace, special chars)
- Edge cases: empty input, very long input, combining marks

#### 2. Placeholder Tests (2 tests)

Component smoke tests exist as placeholders pending e2e infrastructure.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Infrastructure

- **Framework:** Jest 29.6.3
- **React Testing:** react-test-renderer 19.2.0
- **Mocks:** Native modules (Reanimated, Gesture Handler, AsyncStorage)

### Jest Configuration

- Setup file: `jest-setup.js` (native module mocks)
- Transform patterns include React Native modules
- Coverage reporters: text, lcov, html

## Deferred Tests

### Component Render Tests

The following tests require complex native module dependencies and are deferred until e2e testing infrastructure (Detox or similar) is in place:

- **Word component** - Depends on react-native-reanimated
- **Reader component** - Depends on reanimated + gesture-handler
- **TextTicker component** - Depends on reanimated + gesture-handler
- **App component** - Depends on all above + reanimated-color-picker

**Rationale:** Mocking these dependencies correctly is time-prohibitive. E2E tests will provide better coverage for component integration.

## Future Improvements

1. **E2E Tests (Detox):** Add full integration tests for component rendering and user interactions
2. **Integration Tests:** Test component interactions without full e2e overhead
3. **Snapshot Tests:** Add visual regression tests for UI components
4. **Coverage Targets:** 
   - Utilities: 80%+
   - Components: 60%+
5. **CI/CD Integration:** Automate test runs on PR and deployment

## Notes

- Pure function tests are stable and catch regressions in core logic
- All 34 tests pass consistently
- Test suite runs in <1 second
- No flaky tests or external dependencies

## Contributing

When adding new utility functions, please include comprehensive unit tests following the existing patterns:

1. **Happy path** - Normal expected usage
2. **Edge cases** - Empty inputs, boundaries, extremes
3. **Error cases** - Invalid inputs, unexpected types
4. **Unicode support** - International characters if applicable
