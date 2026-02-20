/**
 * State type definitions for application-level state management
 * 
 * Defines the shape of the app state and all possible actions.
 * Used with useReducer for centralized, type-safe state management.
 */

import { ReaderConfig } from './config';

/**
 * Application state (managed by reducer)
 * 
 * Single source of truth for all app-level state.
 * This state is managed by appReducer and can be persisted to AsyncStorage.
 */
export interface AppState {
  /** Persisted reader configuration (saved to AsyncStorage) */
  config: ReaderConfig;
  
  /** Screen brightness overlay (0-1, where 0=bright, 1=fully dark) */
  brightness: number;
  
  /** Per-word font size overrides (wordIndex -> delta in pixels) */
  perWordFontSizeOverrides: Record<number, number>;
  
  /** Currently selected word index (null if no selection) */
  selectedWordIndex: number | null;
}

/**
 * State actions - all possible state mutations
 * 
 * Each action is a discriminated union with a `type` and optional `payload`.
 * Actions are dispatched to the reducer to update state in a predictable way.
 */
export type AppAction =
  // Configuration updates (colors, fonts, spacing)
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
  
  // Word font size overrides (per-word zoom)
  | { type: 'ADJUST_WORD_FONT_SIZE'; payload: { index: number; delta: number } }
  | { type: 'RESET_WORD_FONT_SIZE'; payload: number }
  | { type: 'RESET_ALL_WORD_FONT_SIZES' }
  
  // Bulk operations
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<AppState> }
  | { type: 'RESET_TO_DEFAULTS' };
