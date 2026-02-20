/**
 * Main application state reducer
 * 
 * Centralized state management for the Reading Enhancement app.
 * All state mutations go through this reducer for predictability and type safety.
 */

import { AppState, AppAction } from '../types/state';
import { MIN_BASE_FONT_SIZE } from '../constants/app';

/**
 * Main application reducer
 * 
 * Handles all state mutations in a predictable, type-safe way.
 * Pure function - no side effects, always returns new state.
 * 
 * @param state - Current application state
 * @param action - Action to perform (with type and payload)
 * @returns New state after applying the action
 * 
 * @example
 * ```tsx
 * const [state, dispatch] = useReducer(appReducer, initialState);
 * 
 * // Update font size
 * dispatch({ type: 'SET_BASE_FONT_SIZE', payload: 24 });
 * 
 * // Select a word
 * dispatch({ type: 'SELECT_WORD', payload: 5 });
 * ```
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
        config: {
          ...state.config,
          maxScrollSpeed: Math.max(1, Math.min(15, action.payload)),
        },
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
      // Remove the override for the specified index
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
      // This would reset to initial state - implementation depends on defaults
      // For now, just return current state (can be implemented later if needed)
      return state;
      
    default:
      // TypeScript exhaustiveness check - ensures all actions are handled
      return state;
  }
}
