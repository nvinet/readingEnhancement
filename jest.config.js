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
  // Note: Thresholds set conservatively to allow gradual improvement
  // Utils have excellent coverage (100%), hooks are good (100%), components will improve over time
  coverageThreshold: {
    './src/utils/validation.ts': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
  ],
};
