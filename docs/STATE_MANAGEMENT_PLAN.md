# State Management Refactoring Plan

**Issue:** #2  
**Date:** 2026-02-20  
**Author:** Full Stack Developer Agent

## Executive Summary

This document analyzes the current state management pattern in the Reading Enhancement app and proposes a refactoring to improve maintainability, reduce complexity, and eliminate potential bugs.

**Decision:** Use `useReducer` with a custom `useDebounce` hook to centralize state logic and eliminate the dual-state pattern.

---

## Current State Analysis

### Current Pattern

The app currently uses a **dual-state pattern**:

```typescript
// Persisted configuration (saved to AsyncStorage)
const [config, setConfig] = useState<ReaderConfig>({ ... });

// Real-time values (used during slider dragging)
const [liveValues, setLiveValues] = useState({
  hardLetterExtraSpacing: config.hardLetterExtraSpacing,
  wordSpacing: config.wordSpacing,
  baseFontSize: config.baseFontSize,
  maxScrollSpeed: config.maxScrollSpeed,
  brightness: brightness,
});

// Manual debounce timers
const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
```

### Update Flow

1. User drags slider
2. `liveValues` updates immediately (for responsive UI)
3. Debounced timer started
4. After delay, `config` is updated
5. Manual cleanup of timer refs

### Pain Points

#### 1. **Dual State Synchronization**
- Two sources of truth: `config` and `liveValues`
- Easy to forget to update both
- Initialization requires duplicating values
- Mental overhead: "Which value do I use here?"

#### 2. **Scattered Debouncing Logic**
- Each handler manually manages its own debounce timer
- Repetitive code across 5+ handlers
- Easy to introduce bugs (forget to clear timer, wrong key, etc.)
- Hard to change debounce behavior globally

#### 3. **No State Transition Tracking**
- Can't easily tell what's "dirty" (changed but not saved)
- No way to know if debounce is pending
- Difficult to show "unsaved changes" indicator

#### 4. **Testing Complexity**
- Must test synchronization between states
- Debounce logic intertwined with component logic
- Hard to mock timer behavior

#### 5. **Repetitive Update Handlers**
```typescript
// This pattern is repeated 5+ times with slight variations
const handleChangeWordSpacing = useCallback((v: number): void => {
  const clampedValue = Math.max(0, v);
  setLiveValues(prev => ({...prev, wordSpacing: clampedValue}));
  debouncedUpdateConfig('wordSpacing', clampedValue, () => {
    setConfig(prev => ({...prev, wordSpacing: clampedValue}));
  });
}, [debouncedUpdateConfig]);
```

---

## Proposed Solution

### Architecture

Use **`useReducer`** with a **custom `useDebounce` hook** to:

1. Centralize all state updates in a single reducer
2. Eliminate dual state pattern
3. Extract debouncing into a reusable hook
4. Track state transitions (pending, saved, dirty)

### Key Benefits

✅ **Single Source of Truth** - One state object, no synchronization  
✅ **Centralized Logic** - All updates go through reducer  
✅ **Reusable Debouncing** - Extract into custom hook  
✅ **Better Type Safety** - Actions are typed and exhaustive  
✅ **Easier Testing** - Pure reducer functions  
✅ **State Tracking** - Know what's pending/dirty  
✅ **Less Boilerplate** - No repetitive handlers  

---

## Implementation Plan

### Phase 1: Create Supporting Infrastructure

#### 1.1 Create `src/hooks/` directory
```bash
mkdir -p src/hooks
```

#### 1.2 Create `src/hooks/useDebounce.ts`

A reusable hook that debounces any value:

```typescript
import { useEffect, useState } from 'react';

/**
 * Debounces a value, updating only after the specified delay.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

#### 1.3 Create `src/types/state.ts`

Define state shape and actions:

```typescript
import { ReaderConfig } from './config';

/**
 * Application state (managed by reducer)
 */
export interface AppState {
  /** Persisted reader configuration (saved to AsyncStorage) */
  config: ReaderConfig;
  
  /** Screen brightness overlay (0-1, 0=bright, 1=dark) */
  brightness: number;
  
  /** Per-word font size overrides (wordIndex -> delta in px) */
  perWordFontSizeOverrides: Record<number, number>;
  
  /** Currently selected word index */
  selectedWordIndex: number | null;
}

/**
 * State actions (all possible state mutations)
 */
export type AppAction =
  // Configuration updates
  | { type: 'SET_FONT_FAMILY'; payload: string | undefined }
  | { type: 'SET_BACKGROUND_COLOR'; payload: string }
  | { type: 'SET_TEXT_COLOR'; payload: string }
  | { type: 'SET_DOUBLE_LETTER_COLOR'; payload: string }
  | { type: 'SET_UNDERLINE_COLOR'; payload: string }
  | { type: 'SET_HARD_LETTERS'; payload: string }
  | { type: 'SET_HARD_LETTER_SPACING'; payload: number }
  | { type: 'SET_WORD_SPACING'; payload: number }
  | { type: 'SET_BASE_FONT_SIZE'; payload: number }
  | { type: 'SET_MAX_SCROLL_SPEED'; payload: number }
  | { type: 'SET_BRIGHTNESS'; payload: number }
  
  // Word selection
  | { type: 'SELECT_WORD'; payload: number | null }
  
  // Word font size overrides
  | { type: 'ADJUST_WORD_FONT_SIZE'; payload: { index: number; delta: number } }
  | { type: 'RESET_WORD_FONT_SIZE'; payload: number }
  | { type: 'RESET_ALL_WORD_FONT_SIZES' }
  
  // Bulk operations
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<AppState> }
  | { type: 'RESET_TO_DEFAULTS' };
```

#### 1.4 Create `src/reducers/appReducer.ts`

Pure reducer function:

```typescript
import { AppState, AppAction } from '../types/state';
import { MIN_BASE_FONT_SIZE } from '../constants/app';

/**
 * Main application reducer
 * Handles all state mutations in a predictable way
 */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Configuration updates
    case 'SET_FONT_FAMILY':
      return {
        ...state,
        config: { ...state.config, fontFamily: action.payload },
      };
      
    case 'SET_BACKGROUND_COLOR':
      return {
        ...state,
        config: { ...state.config, backgroundColor: action.payload },
      };
      
    case 'SET_TEXT_COLOR':
      return {
        ...state,
        config: { ...state.config, textColor: action.payload },
      };
      
    case 'SET_DOUBLE_LETTER_COLOR':
      return {
        ...state,
        config: { ...state.config, doubleLetterColor: action.payload },
      };
      
    case 'SET_UNDERLINE_COLOR':
      return {
        ...state,
        config: { ...state.config, underlineColor: action.payload },
      };
      
    case 'SET_HARD_LETTERS':
      return {
        ...state,
        config: { ...state.config, hardLetters: action.payload },
      };
      
    case 'SET_HARD_LETTER_SPACING':
      return {
        ...state,
        config: {
          ...state.config,
          hardLetterExtraSpacing: Math.max(0, action.payload),
        },
      };
      
    case 'SET_WORD_SPACING':
      return {
        ...state,
        config: {
          ...state.config,
          wordSpacing: Math.max(0, action.payload),
        },
      };
      
    case 'SET_BASE_FONT_SIZE':
      return {
        ...state,
        config: {
          ...state.config,
          baseFontSize: Math.max(MIN_BASE_FONT_SIZE, action.payload),
        },
      };
      
    case 'SET_MAX_SCROLL_SPEED':
      return {
        ...state,
        config: { ...state.config, maxScrollSpeed: action.payload },
      };
      
    case 'SET_BRIGHTNESS':
      return {
        ...state,
        brightness: Math.max(0, Math.min(1, action.payload)),
      };
      
    // Word selection
    case 'SELECT_WORD':
      return {
        ...state,
        selectedWordIndex: action.payload,
      };
      
    // Word font size overrides
    case 'ADJUST_WORD_FONT_SIZE': {
      const { index, delta } = action.payload;
      const current = state.perWordFontSizeOverrides[index] || 0;
      const next = Math.max(0, current + delta);
      
      return {
        ...state,
        perWordFontSizeOverrides: {
          ...state.perWordFontSizeOverrides,
          [index]: next,
        },
      };
    }
    
    case 'RESET_WORD_FONT_SIZE': {
      const { [action.payload]: removed, ...rest } = state.perWordFontSizeOverrides;
      return {
        ...state,
        perWordFontSizeOverrides: rest,
      };
    }
    
    case 'RESET_ALL_WORD_FONT_SIZES':
      return {
        ...state,
        perWordFontSizeOverrides: {},
      };
      
    // Bulk operations
    case 'LOAD_SAVED_STATE':
      return {
        ...state,
        ...action.payload,
        config: {
          ...state.config,
          ...action.payload.config,
        },
      };
      
    case 'RESET_TO_DEFAULTS':
      // Will use initial state from App.tsx
      return state;
      
    default:
      return state;
  }
}
```

---

### Phase 2: Refactor App.tsx

#### 2.1 Replace useState with useReducer

**Before:**
```typescript
const [config, setConfig] = useState<ReaderConfig>({ ... });
const [brightness, setBrightness] = useState<number>(0);
const [liveValues, setLiveValues] = useState({ ... });
const [perWordFontSizeOverrides, setPerWordFontSizeOverrides] = useState({ ... });
const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
```

**After:**
```typescript
const [state, dispatch] = useReducer(appReducer, initialState);
```

#### 2.2 Implement Debounced Values

For values that need debouncing (sliders):

```typescript
// Immediate state (for responsive UI)
const [liveWordSpacing, setLiveWordSpacing] = useState(state.config.wordSpacing);
const [liveHardLetterSpacing, setLiveHardLetterSpacing] = useState(state.config.hardLetterExtraSpacing);
const [liveBaseFontSize, setLiveBaseFontSize] = useState(state.config.baseFontSize);
const [liveMaxScrollSpeed, setLiveMaxScrollSpeed] = useState(state.config.maxScrollSpeed);
const [liveBrightness, setLiveBrightness] = useState(state.brightness);

// Debounced values (update reducer after delay)
const debouncedWordSpacing = useDebounce(liveWordSpacing, DEBOUNCE_DELAY_MS);
const debouncedHardLetterSpacing = useDebounce(liveHardLetterSpacing, DEBOUNCE_DELAY_MS);
const debouncedBaseFontSize = useDebounce(liveBaseFontSize, DEBOUNCE_DELAY_MS);
const debouncedMaxScrollSpeed = useDebounce(liveMaxScrollSpeed, DEBOUNCE_DELAY_MS);
const debouncedBrightness = useDebounce(liveBrightness, DEBOUNCE_DELAY_MS);

// Sync debounced values to reducer
useEffect(() => {
  dispatch({ type: 'SET_WORD_SPACING', payload: debouncedWordSpacing });
}, [debouncedWordSpacing]);

useEffect(() => {
  dispatch({ type: 'SET_HARD_LETTER_SPACING', payload: debouncedHardLetterSpacing });
}, [debouncedHardLetterSpacing]);

useEffect(() => {
  dispatch({ type: 'SET_BASE_FONT_SIZE', payload: debouncedBaseFontSize });
}, [debouncedBaseFontSize]);

useEffect(() => {
  dispatch({ type: 'SET_MAX_SCROLL_SPEED', payload: debouncedMaxScrollSpeed });
}, [debouncedMaxScrollSpeed]);

useEffect(() => {
  dispatch({ type: 'SET_BRIGHTNESS', payload: debouncedBrightness });
  try {
    setNativeBrightness(debouncedBrightness);
  } catch (e) {
    logError('UpdateBrightness', e);
  }
}, [debouncedBrightness]);
```

#### 2.3 Simplify Event Handlers

**Before:**
```typescript
const handleChangeWordSpacing = useCallback((v: number): void => {
  const clampedValue = Math.max(0, v);
  setLiveValues(prev => ({...prev, wordSpacing: clampedValue}));
  debouncedUpdateConfig('wordSpacing', clampedValue, () => {
    setConfig(prev => ({...prev, wordSpacing: clampedValue}));
  });
}, [debouncedUpdateConfig]);
```

**After:**
```typescript
const handleChangeWordSpacing = useCallback((v: number): void => {
  setLiveWordSpacing(v); // Debounce hook handles the rest
}, []);
```

---

### Phase 3: Update SidePanel Integration

Pass `live*` values to SidePanel for responsive UI, but read from `state.config` for actual saved values:

```typescript
<SidePanel
  visible={isPanelVisible}
  onClose={() => setIsPanelVisible(false)}
  
  fontFamily={state.config.fontFamily}
  onChangeFontFamily={(f) => dispatch({ type: 'SET_FONT_FAMILY', payload: f })}
  
  backgroundColor={state.config.backgroundColor}
  onChangeBackgroundColor={(c) => dispatch({ type: 'SET_BACKGROUND_COLOR', payload: c })}
  
  textColor={state.config.textColor}
  onChangeTextColor={(c) => dispatch({ type: 'SET_TEXT_COLOR', payload: c })}
  
  // Slider values (use live state for responsive UI)
  wordSpacing={liveWordSpacing}
  onChangeWordSpacing={setLiveWordSpacing}
  
  hardLetterExtraSpacing={liveHardLetterSpacing}
  onChangeHardLetterExtraSpacing={setLiveHardLetterSpacing}
  
  baseFontSize={liveBaseFontSize}
  onChangeBaseFontSize={setLiveBaseFontSize}
  
  maxScrollSpeed={liveMaxScrollSpeed}
  onChangeMaxScrollSpeed={setLiveMaxScrollSpeed}
  
  brightness={liveBrightness}
  onChangeBrightness={setLiveBrightness}
  
  onSave={handleSaveConfiguration}
  onResetAllWordScales={() => dispatch({ type: 'RESET_ALL_WORD_FONT_SIZES' })}
/>
```

---

### Phase 4: Update Reader Integration

```typescript
<Reader
  text={inputText}
  config={state.config}
  perWordFontSizeOverrides={state.perWordFontSizeOverrides}
  onSelectWordIndex={(idx) => {
    if (idx === null) Keyboard.dismiss();
    dispatch({ type: 'SELECT_WORD', payload: idx });
  }}
  onAdjustSelectedWordScale={(delta) => {
    if (state.selectedWordIndex != null) {
      dispatch({
        type: 'ADJUST_WORD_FONT_SIZE',
        payload: { index: state.selectedWordIndex, delta },
      });
    }
  }}
  onAdjustFontSize={(delta) => {
    const newSize = state.config.baseFontSize + delta;
    setLiveBaseFontSize(newSize);
  }}
  onResetSelectedWordScale={() => {
    if (state.selectedWordIndex != null) {
      dispatch({ type: 'RESET_WORD_FONT_SIZE', payload: state.selectedWordIndex });
    }
  }}
  onResetWordScaleByIndex={(index) => {
    dispatch({ type: 'RESET_WORD_FONT_SIZE', payload: index });
  }}
/>
```

---

### Phase 5: Update AsyncStorage Save/Load

**Save:**
```typescript
const handleSaveConfiguration = useCallback(async (): Promise<void> => {
  try {
    const payload = JSON.stringify({
      config: state.config,
      brightness: state.brightness,
    });
    await AsyncStorage.setItem(STORAGE_KEY_READER_CONFIG, payload);
    showSuccessAlert(ALERTS.SUCCESS.CONFIGURATION_SAVED);
  } catch (e) {
    logError('SaveConfiguration', e);
    showErrorAlert(
      ALERTS.ERROR.SAVE_FAILED.title,
      ALERTS.ERROR.SAVE_FAILED.message
    );
  }
}, [state.config, state.brightness]);
```

**Load:**
```typescript
useEffect(() => {
  (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_READER_CONFIG);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          dispatch({ type: 'LOAD_SAVED_STATE', payload: parsed });
          
          // Sync live values to loaded state
          if (parsed.config) {
            setLiveWordSpacing(parsed.config.wordSpacing ?? liveWordSpacing);
            setLiveHardLetterSpacing(parsed.config.hardLetterExtraSpacing ?? liveHardLetterSpacing);
            setLiveBaseFontSize(parsed.config.baseFontSize ?? liveBaseFontSize);
            setLiveMaxScrollSpeed(parsed.config.maxScrollSpeed ?? liveMaxScrollSpeed);
          }
          
          if (typeof parsed.brightness === 'number') {
            setLiveBrightness(parsed.brightness);
            try {
              setNativeBrightness(parsed.brightness);
            } catch (e) {
              logError('SetBrightness', e);
            }
          }
        }
      }
    } catch (e) {
      logError('LoadConfiguration', e);
      showErrorAlert(
        ALERTS.ERROR.LOAD_FAILED.title,
        ALERTS.ERROR.LOAD_FAILED.message
      );
    }
  })();
}, []);
```

---

## Migration Strategy

### Step 1: Create New Files (Non-Breaking)
- ✅ Create `src/hooks/useDebounce.ts`
- ✅ Create `src/types/state.ts`
- ✅ Create `src/reducers/appReducer.ts`

### Step 2: Add Tests (Optional but Recommended)
- ✅ Test reducer functions
- ✅ Test useDebounce hook

### Step 3: Refactor App.tsx
- ✅ Import new modules
- ✅ Replace useState with useReducer
- ✅ Replace manual debounce with useDebounce hook
- ✅ Update all handlers to use dispatch
- ✅ Update SidePanel and Reader integration

### Step 4: Test Thoroughly
- ✅ iOS simulator - verify all features work
- ✅ Android emulator - verify all features work
- ✅ Verify config persistence (save/load)
- ✅ Verify slider responsiveness (no lag)
- ✅ Verify brightness overlay works
- ✅ Verify word selection and font size overrides work

### Step 5: Cleanup
- ✅ Remove old debounceTimers ref
- ✅ Remove liveValues state
- ✅ Update documentation

---

## Alternatives Considered

### Option 1: Keep Current Pattern (❌ Rejected)

**Pros:**
- No refactoring needed
- Works currently

**Cons:**
- Dual state complexity
- Scattered debouncing logic
- Hard to maintain
- Prone to bugs

**Decision:** Rejected. The pain points outweigh the effort to refactor.

---

### Option 2: Use Zustand/Jotai (❌ Rejected for Now)

**Pros:**
- Global state accessible anywhere
- Simple API
- Good TypeScript support
- Persistence middleware available

**Cons:**
- Additional dependency (~3-5kb)
- Overkill for single-component state
- Learning curve for team
- Not needed unless we have multiple components sharing state

**Decision:** Rejected for now. The app is simple enough that `useReducer` is sufficient. We can revisit if we add more screens/components that need shared state.

---

### Option 3: Context + useReducer (❌ Rejected for Now)

**Pros:**
- Share state across components
- Still React-native

**Cons:**
- Unnecessary complexity for current app structure
- All state is in App.tsx currently
- No need for global context yet

**Decision:** Rejected for now. Keep it simple. Add Context only when we have multiple components that need the state.

---

### Option 4: useReducer + useDebounce (✅ Selected)

**Pros:**
- Centralized state logic
- Type-safe actions
- Reusable debounce hook
- No external dependencies
- Easier to test
- Clear state transitions
- Can add middleware later if needed

**Cons:**
- Some boilerplate (reducer, action types)
- Slightly more files to maintain

**Decision:** ✅ **SELECTED**. Best balance of simplicity, maintainability, and no external dependencies.

---

## Performance Considerations

### Before Refactoring

- Manual debounce timers: ~DEBOUNCE_DELAY_MS (300ms) per slider
- Multiple setState calls per update
- Risk of unnecessary re-renders due to liveValues

### After Refactoring

- `useDebounce` hook: Same ~300ms delay
- Single dispatch per update
- Reducer returns new state only if changed (reference equality)
- **Expected:** Same or slightly better performance
- **Risk:** Negligible (reducer overhead is minimal)

### Memory Impact

- **Before:** 5 separate useState hooks + 1 ref object
- **After:** 1 useReducer + 5 useState (for live values) + 5 useDebounce
- **Net:** Approximately the same memory footprint
- **Tradeoff:** More clarity and maintainability for similar memory usage

---

## Testing Plan

### Unit Tests

#### Test `useDebounce` hook
```typescript
// __tests__/hooks/useDebounce.test.ts
describe('useDebounce', () => {
  it('should debounce value updates', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );
    
    expect(result.current).toBe('initial');
    
    rerender({ value: 'updated', delay: 300 });
    expect(result.current).toBe('initial'); // Still old value
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 350));
    });
    
    expect(result.current).toBe('updated'); // Updated after delay
  });
});
```

#### Test `appReducer`
```typescript
// __tests__/reducers/appReducer.test.ts
describe('appReducer', () => {
  it('should update font size', () => {
    const state = { ...initialState };
    const action = { type: 'SET_BASE_FONT_SIZE', payload: 24 };
    const newState = appReducer(state, action);
    
    expect(newState.config.baseFontSize).toBe(24);
  });
  
  it('should clamp font size to minimum', () => {
    const state = { ...initialState };
    const action = { type: 'SET_BASE_FONT_SIZE', payload: 5 };
    const newState = appReducer(state, action);
    
    expect(newState.config.baseFontSize).toBe(MIN_BASE_FONT_SIZE);
  });
  
  // More tests...
});
```

### Integration Tests

#### Manual Testing Checklist

- [ ] **Config Persistence**
  - [ ] Change multiple settings
  - [ ] Save configuration
  - [ ] Force-quit app
  - [ ] Relaunch app
  - [ ] Verify all settings persisted

- [ ] **Slider Responsiveness**
  - [ ] Drag word spacing slider - should update in real-time
  - [ ] Drag font size slider - should update in real-time
  - [ ] Drag brightness slider - should update overlay immediately
  - [ ] Verify no lag or stuttering

- [ ] **Word Selection**
  - [ ] Tap a word - should highlight
  - [ ] Double-tap word - should reset font size
  - [ ] Tap background - should deselect

- [ ] **Gesture Controls**
  - [ ] Pinch to zoom text
  - [ ] Pinch to adjust word spacing
  - [ ] Verify gestures work smoothly

- [ ] **Color Pickers**
  - [ ] Change background color
  - [ ] Change text color
  - [ ] Change double-letter highlight color
  - [ ] Change underline color
  - [ ] Verify colors apply immediately

- [ ] **Edge Cases**
  - [ ] Empty text input
  - [ ] Very long text (1000+ words)
  - [ ] Special characters (é, ñ, €, 中文)
  - [ ] Rapid slider changes
  - [ ] Multiple rapid taps

---

## Success Metrics

### Code Quality

- ✅ Reduced lines of code in App.tsx (remove ~50-100 lines of boilerplate)
- ✅ All state updates go through typed actions
- ✅ No manual timer management
- ✅ Easier to add new config fields (just add action type + reducer case)

### Maintainability

- ✅ New developer can understand state flow by reading reducer
- ✅ Adding a new setting takes ~5 lines of code (action type + reducer case)
- ✅ Debouncing is centralized and reusable

### Performance

- ✅ No performance regressions
- ✅ Same or better slider responsiveness
- ✅ Same or better memory usage

### Bugs

- ✅ No synchronization bugs between config and liveValues
- ✅ No forgotten timer cleanups
- ✅ Type-safe state updates (TypeScript catches invalid actions)

---

## Rollback Plan

If issues arise:

1. **Branch Protection:** Work on feature branch, keep main stable
2. **Commit Strategy:** Small, atomic commits for easy revert
3. **Testing:** Thorough testing before merge
4. **Revert:** If bugs found post-merge, git revert the refactor commit

---

## Timeline

| Phase | Time Estimate | Status |
|-------|---------------|--------|
| Create hooks/reducers/types | 1 hour | ⏳ Pending |
| Refactor App.tsx | 2 hours | ⏳ Pending |
| Manual testing (iOS) | 45 min | ⏳ Pending |
| Manual testing (Android) | 45 min | ⏳ Pending |
| Bug fixes (buffer) | 30 min | ⏳ Pending |
| **Total** | **~5 hours** | ⏳ Pending |

---

## Conclusion

The proposed `useReducer` + `useDebounce` approach:

✅ Eliminates dual-state complexity  
✅ Centralizes state logic  
✅ Improves type safety  
✅ Makes code more maintainable  
✅ Easier to test  
✅ No external dependencies  
✅ Minimal performance impact  

This refactoring is **recommended** and should be implemented on a feature branch for safety, then merged to main after thorough testing.

---

**Next Steps:**

1. Review and approve this plan
2. Create feature branch `refactor/state-management`
3. Implement Phase 1-5
4. Test thoroughly
5. Merge to main
6. Close issue #2

**Questions? Concerns?** Comment on issue #2.
