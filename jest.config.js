module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-reanimated|react-native-gesture-handler|@react-native-async-storage|react-native-safe-area-context|react-native-worklets|reanimated-color-picker)/)',
  ],
  collectCoverage: false, // Set to true to collect coverage by default
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'App.tsx',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  // Coverage thresholds
  // Goals: 90%+ for utils, 60%+ for components, 80%+ for hooks
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60,
    },
    './src/utils/**/*.{ts,tsx}': {
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90,
    },
    './src/hooks/**/*.{ts,tsx}': {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
    './src/components/**/*.{ts,tsx}': {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
  ],
};
