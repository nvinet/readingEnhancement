/**
 * AsyncStorage keys used throughout the application
 * 
 * Centralizing storage keys prevents typos and makes it easier to
 * update the storage schema version when needed.
 */

/**
 * Storage key for reader configuration and settings
 * Version: v1
 * 
 * Stored data structure:
 * {
 *   config: ReaderConfig,
 *   brightness: number
 * }
 */
export const STORAGE_KEY_READER_CONFIG = 'reader_config_v1';

/**
 * Future storage keys can be added here as the app evolves
 * Examples:
 * - export const STORAGE_KEY_USER_PREFERENCES = 'user_preferences_v1';
 * - export const STORAGE_KEY_RECENT_TEXTS = 'recent_texts_v1';
 */
