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
  // Coverage thresholds - commented out while building test infrastructure
  // coverageThreshold: {
  //   global: {
  //     statements: 60,
  //     branches: 50,
  //     functions: 60,
  //     lines: 60,
  //   },
  // },
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
  ],
};
