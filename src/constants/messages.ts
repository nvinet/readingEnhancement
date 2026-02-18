/**
 * User-facing text and messages
 * 
 * Centralizes all strings shown to users (instructions, alerts, labels).
 * Makes it easier to update copy and eventually add i18n support.
 */

/**
 * Help and instruction text
 */
export const HELP_TEXT = {
  /** Main reader instructions */
  READER_INSTRUCTIONS: 'TAP any word to select it (blue highlight), then PINCH to adjust its letter spacing. Double-TAP to reset the font-size.',
  
  /** Input placeholder */
  INPUT_PLACEHOLDER: 'Paste text here...',
  
  /** Input label */
  INPUT_LABEL: 'Paste or type text:',
} as const;

/**
 * Alert messages
 */
export const ALERTS = {
  /** Success messages */
  SUCCESS: {
    CONFIGURATION_SAVED: 'Your configuration has been saved successfully.',
  },
  
  /** Error messages */
  ERROR: {
    SAVE_FAILED: {
      title: 'Save Failed',
      message: 'Could not save your configuration. Please try again.',
    },
    LOAD_FAILED: {
      title: 'Configuration Load Failed',
      message: 'Could not load your saved settings. Using default configuration.',
    },
    BRIGHTNESS_UPDATE_FAILED: 'Failed to update device brightness (overlay still works)',
  },
} as const;

/**
 * Accessibility labels
 */
export const A11Y_LABELS = {
  SETTINGS_BUTTON: 'Settings',
  SETTINGS_BUTTON_HINT: 'Opens the settings panel',
  TOGGLE_INPUT_BUTTON: 'Toggle text input',
  TOGGLE_INPUT_BUTTON_HINT: 'Show or hide the text input field',
} as const;
