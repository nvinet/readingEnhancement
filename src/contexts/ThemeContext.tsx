/**
 * Theme Context
 * 
 * Provides theme management with runtime switching and persistence.
 * Allows switching between light and dark themes throughout the app.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode } from '../types/config';
import { THEMES, DEFAULT_THEME_MODE } from '../constants/themes';

/**
 * Storage key for persisted theme preference
 */
const STORAGE_KEY_THEME = 'theme_preference_v1';

/**
 * Theme context value
 */
interface ThemeContextValue {
  /** Current active theme */
  theme: Theme;
  
  /** Current theme mode */
  themeMode: ThemeMode;
  
  /** Switch to a specific theme */
  setTheme: (mode: ThemeMode) => void;
  
  /** Toggle between light and dark themes */
  toggleTheme: () => void;
  
  /** Whether theme is currently loading from storage */
  isLoading: boolean;
}

/**
 * Theme context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: ReactNode;
  /** Initial theme mode (defaults to persisted value or DEFAULT_THEME_MODE) */
  initialMode?: ThemeMode;
}

/**
 * Theme Provider Component
 * 
 * Wraps the app to provide theme context to all components.
 * Handles theme persistence and loading.
 * 
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, initialMode }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode ?? DEFAULT_THEME_MODE);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Persist theme preference when it changes
  useEffect(() => {
    if (!isLoading) {
      saveThemePreference(themeMode);
    }
  }, [themeMode, isLoading]);

  /**
   * Load theme preference from AsyncStorage
   */
  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_THEME);
      if (stored && (stored === 'light' || stored === 'dark')) {
        setThemeMode(stored);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save theme preference to AsyncStorage
   */
  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_THEME, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  /**
   * Switch to a specific theme
   */
  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    setThemeMode(current => current === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextValue = {
    theme: THEMES[themeMode],
    themeMode,
    setTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * 
 * @throws Error if used outside ThemeProvider
 * @returns Theme context value
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, toggleTheme } = useTheme();
 *   
 *   return (
 *     <View style={{ backgroundColor: theme.colors.background }}>
 *       <Text style={{ color: theme.colors.text }}>
 *         Current theme: {theme.mode}
 *       </Text>
 *       <Button onPress={toggleTheme} title="Toggle Theme" />
 *     </View>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Optional: Hook to access just the theme colors
 * Convenience hook for components that only need colors
 */
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}
