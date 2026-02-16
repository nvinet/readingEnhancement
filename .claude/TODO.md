# Reading Enhancement App - Improvement TODO List

> **Generated:** 2026-02-06
> **Status:** Not Started

---

## 🔴 HIGH PRIORITY - Quick Wins (Implement First)

### 1. TypeScript & Type Safety
- [x] Remove `@ts-ignore` comment at [App.tsx:8](../App.tsx#L8) for React import
- [x] Fix `@ts-ignore` for debounceTimers at [App.tsx:69](../App.tsx#L69)
  - Replace with: `const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});`
- [x] Add proper return type annotations for callback functions
- [x] Ensure all exported types are properly defined

**Estimated Time:** 30 minutes
**Impact:** Improved type safety, better IDE support, catches bugs at compile time

---

### 2. Error Handling & User Feedback
- [x] Replace empty catch blocks with proper error handling:
  - [x] [App.tsx:186](../App.tsx#L186) - Brightness setting error
  - [x] [App.tsx:192](../App.tsx#L192) - Config loading error
  - [x] [App.tsx:205](../App.tsx#L205) - Config saving error
  - [x] [App.tsx:236](../App.tsx#L236) - Brightness update error
- [x] Add user-facing error messages (Alert/Toast) for AsyncStorage failures
- [x] Add success feedback when saving configuration
- [x] Consider logging errors to error tracking service (Sentry, etc.)

**Estimated Time:** 1 hour
**Impact:** Better user experience, easier debugging, prevents silent failures

**Completed:** Added comprehensive error handling with user-facing alerts, success feedback, and error logging utilities ready for Sentry integration.

---

### 3. Extract Magic Numbers to Constants
- [x] Create `src/constants/app.ts` file
- [x] Extract constants:
  - [x] `300` - Double-tap threshold → `DOUBLE_TAP_THRESHOLD_MS`
  - [x] `100` - Debounce delay → `DEBOUNCE_DELAY_MS`
  - [x] `20`, `10` - Pinch sensitivity multipliers → `PINCH_SENSITIVITY_WORD_SPACING`, `PINCH_SENSITIVITY_FONT_SIZE`
  - [x] `100` - Ticker band height → `TICKER_BAND_HEIGHT`
  - [x] `5`, `10`, `20` - Font size constraints → `MIN_FONT_SIZE`, `MIN_BASE_FONT_SIZE`, `DEFAULT_BASE_FONT_SIZE`
  - [x] Color values → `DEFAULT_BACKGROUND_COLOR`, `DEFAULT_TEXT_COLOR`, `DEFAULT_DOUBLE_LETTER_COLOR`, etc.
- [x] Create `src/constants/storage.ts` for AsyncStorage keys
  - [x] `'reader_config_v1'` → `STORAGE_KEY_READER_CONFIG`

**Estimated Time:** 45 minutes
**Impact:** Better maintainability, easier to adjust values, clearer intent

**Completed:** Extracted 25+ magic numbers to well-documented constants in `src/constants/app.ts` and `src/constants/storage.ts`. All values now have descriptive names and documentation.

---

### 4. Add Unit Tests (Foundation)
- [x] Set up test infrastructure (verify Jest configuration)
- [x] Create tests for pure functions:
  - [x] `splitIntoWords()` - [Reader.tsx:32](../src/components/Reader.tsx#L32) - 8 tests
  - [x] `findDoubleLetterIndices()` - [Reader.tsx:39](../src/components/Reader.tsx#L39) - 8 tests
  - [x] `handleChangeHardLetters()` normalization logic - 16 tests
- [ ] Create basic component smoke tests:
  - [ ] `Word` component renders correctly *(deferred - requires native module mocks)*
  - [ ] `Reader` component renders without crashing *(deferred - requires native module mocks)*
  - [ ] `TextTicker` component basic functionality *(deferred - requires native module mocks)*
- [x] Add test coverage reporting

**Estimated Time:** 2-3 hours
**Impact:** Confidence in refactoring, catch regressions, document expected behavior

**Completed:** 32 passing pure function tests covering critical business logic. Component tests deferred until e2e testing infrastructure is in place.

---

## 🟡 MEDIUM PRIORITY - Next Sprint

### 5. Performance Optimization
- [ ] Extract inline styles to StyleSheet:
  - [ ] [Reader.tsx:81-89](../src/components/Reader.tsx#L81-L89) - Word container styles
  - [ ] [Reader.tsx:99-104](../src/components/Reader.tsx#L99-L104) - Character styles
  - [ ] [App.tsx:247-259](../App.tsx#L247-L259) - Input container styles
- [ ] Review `renderedWords` memoization dependencies ([Reader.tsx:169-189](../src/components/Reader.tsx#L169-L189))
- [ ] Optimize `useWindowDimensions()` usage in TextTicker ([TextTicker.tsx:21](../src/components/TextTicker.tsx#L21))
- [ ] Profile app performance with React DevTools Profiler
- [ ] Consider React.memo with custom comparison functions for frequently re-rendered components

**Estimated Time:** 2-3 hours
**Impact:** Smoother animations, better battery life, improved UX on older devices

---

### 6. State Management Refactoring
- [ ] Evaluate current `config` + `liveValues` dual-state pattern
- [ ] Consider replacing with `useReducer` for complex config state
- [ ] Centralize debouncing logic (currently scattered across handlers)
- [ ] Create state management plan document
- [ ] If needed, evaluate lightweight state libraries (Zustand, Jotai)
- [ ] Implement chosen solution
- [ ] Test thoroughly on both iOS and Android

**Estimated Time:** 4-6 hours
**Impact:** Easier to maintain, fewer bugs, clearer state transitions

---

### 7. Gesture Handling Edge Cases
- [ ] Add bounds checking for pinch gestures ([Reader.tsx:153-166](../src/components/Reader.tsx#L153-L166))
  - [ ] Limit scale to reasonable range (e.g., 0.1x to 5x)
  - [ ] Prevent negative or extreme values
- [ ] Fix potential race condition in TextTicker:
  - [ ] Consistent use of shared values vs local state ([TextTicker.tsx:56-63](../src/components/TextTicker.tsx#L56-L63))
  - [ ] Use `contentWidthSV` instead of local `contentWidth` in pan gesture
- [ ] Add user feedback when gestures are disabled (content too narrow to scroll)
- [ ] Test edge cases: very long words, very short text, empty text

**Estimated Time:** 2 hours
**Impact:** More robust gesture handling, better edge case handling

---

### 8. Code Organization & Structure
- [ ] Create folder structure:
  - [ ] `src/constants/colors.ts` - Extract Colors object from [App.tsx:27-30](../App.tsx#L27-L30)
  - [ ] `src/constants/app.ts` - App-level constants
  - [ ] `src/constants/messages.ts` - User-facing text/help messages
  - [ ] `src/types/index.ts` - Shared TypeScript types
- [ ] Extract help text from [Reader.tsx:212-215](../src/components/Reader.tsx#L212-L215) to constants
- [ ] Move all inline styles to StyleSheet.create()
- [ ] Create TypeScript enums for string literal unions (FontFamily, etc.)
- [ ] Organize imports consistently (external, internal, types)

**Estimated Time:** 2 hours
**Impact:** Better code organization, easier to find things, clearer separation of concerns

---

### 9. React 19 Compatibility Testing
- [ ] Verify all dependencies are React 19 compatible
- [ ] Test `react-native-reanimated` 4.2.1 thoroughly with React 19.2.3
- [ ] Test `react-native-gesture-handler` compatibility
- [ ] Run full test suite on iOS simulator
- [ ] Run full test suite on Android emulator
- [ ] Test on physical devices (iOS and Android)
- [ ] Document any compatibility issues found
- [ ] Create upgrade plan if issues discovered

**Estimated Time:** 3-4 hours
**Impact:** Prevent production issues, ensure stability

---

## 🟢 LOW PRIORITY - Long Term Improvements

### 10. Accessibility Enhancements
- [ ] Add `accessibilityLabel` to all interactive elements
- [ ] Add `accessibilityHint` where helpful
- [ ] Add `accessibilityRole` attributes (button, slider, etc.)
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)
- [ ] Add accessibility state announcements for important changes
- [ ] Support dynamic type scaling (system font size settings)
- [ ] Test color contrast ratios meet WCAG guidelines
- [ ] Add keyboard navigation support where applicable

**Estimated Time:** 4-5 hours
**Impact:** Better accessibility for visually impaired users, wider user base

---

### 11. Comprehensive Test Coverage
- [ ] Add integration tests for key user flows:
  - [ ] Load app → paste text → customize → save
  - [ ] Gesture interactions (pinch, tap, pan)
  - [ ] Auto-scroll functionality
- [ ] Add component tests with React Testing Library:
  - [ ] SidePanel interactions
  - [ ] ColorPickerField behavior
  - [ ] FontPicker dropdown
  - [ ] MemoizedSliderField
- [ ] Add snapshot tests for UI components
- [ ] Set coverage targets (e.g., 80% for utilities, 60% for components)
- [ ] Add E2E tests with Detox or similar
- [ ] Add visual regression tests

**Estimated Time:** 8-12 hours
**Impact:** Confidence in releases, catch regressions early, living documentation

---

### 12. Documentation & Comments
- [ ] Remove outdated comments:
  - [ ] [App.tsx:24-26](../App.tsx#L24-L26) - Removed Colors import comment
  - [ ] [App.tsx:1-6](../App.tsx#L1-L6) - Update boilerplate header
- [ ] Add JSDoc comments for complex functions:
  - [ ] `handleChangeHardLetters()` - Unicode normalization logic
  - [ ] `debouncedUpdateConfig()` - Debouncing pattern
  - [ ] Gesture handling callbacks
- [ ] Create README.md sections:
  - [ ] Features overview
  - [ ] Setup instructions
  - [ ] Architecture documentation
  - [ ] Contributing guidelines
- [ ] Add inline comments for non-obvious logic
- [ ] Document gesture patterns and interactions

**Estimated Time:** 3-4 hours
**Impact:** Easier onboarding, better collaboration, self-documenting code

---

### 13. Error Boundaries
- [ ] Create `ErrorBoundary` component
- [ ] Wrap main app sections with error boundaries
- [ ] Add fallback UI for crashed components
- [ ] Log errors to error tracking service
- [ ] Test error boundary behavior
- [ ] Add recovery mechanisms where possible

**Estimated Time:** 2 hours
**Impact:** Graceful degradation, better user experience during errors

---

### 14. Configuration & Hardcoded Values
- [ ] Create enums for font families
- [ ] Create color palette constants/theme system
- [ ] Centralize default configuration values
- [ ] Consider JSON config file for easy tweaking
- [ ] Add configuration validation
- [ ] Support multiple themes (light/dark)

**Estimated Time:** 3-4 hours
**Impact:** Easier customization, theme support, cleaner code

---

## 📊 Progress Tracking

| Priority | Tasks Complete | Total Tasks | Percentage |
|----------|----------------|-------------|------------|
| 🔴 High   | 4              | 4           | 100%       |
| 🟡 Medium | 0              | 5           | 0%         |
| 🟢 Low    | 0              | 5           | 0%         |
| **Total** | **4**          | **14**      | **29%**    |

---

## 📝 Notes & Decisions

### Decision Log
- [ ] Date: _____ - Decided on state management approach: _____
- [ ] Date: _____ - Chose testing strategy: _____
- [ ] Date: _____ - Selected error tracking service: _____

### Blocked Items
- None currently

### Deferred Items
- None currently

---

## 🎯 Recommended Implementation Order

1. **Week 1:** High Priority #1-2 (TypeScript + Error Handling)
2. **Week 1:** High Priority #3 (Constants extraction)
3. **Week 2:** High Priority #4 (Basic tests) + Medium Priority #7 (Gesture fixes)
4. **Week 3:** Medium Priority #5-6 (Performance + State management)
5. **Week 4:** Medium Priority #8-9 (Organization + React 19 testing)
6. **Ongoing:** Low priority items as time permits

---

## 📚 Resources

- [React Native Performance](https://reactnative.dev/docs/performance)
- [React Native Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [React Testing Library](https://callstack.github.io/react-native-testing-library/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

*This TODO list is a living document. Update it as you complete tasks and discover new improvements.*
