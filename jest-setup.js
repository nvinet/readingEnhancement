/**
 * Jest setup file for mocking native modules
 */

// Mock react-native-worklets
jest.mock('react-native-worklets', () => ({
  scheduleOnRN: jest.fn((fn) => fn()),
  useWorkletCallback: jest.fn((fn) => fn),
  useSharedValue: jest.fn((value) => ({ value })),
}));

// Mock react-native-reanimated with a custom simplified mock
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;

  const reanimatedMock = {
    __esModule: true,
    default: {
      Value: jest.fn(),
      event: jest.fn(),
      add: jest.fn(),
      eq: jest.fn(),
      set: jest.fn(),
      cond: jest.fn(),
      interpolate: jest.fn(),
      View: View,
      Extrapolate: { CLAMP: jest.fn() },
      Transition: {
        Together: 'Together',
        Out: 'Out',
        In: 'In',
      },
      Easing: {
        in: jest.fn(),
        out: jest.fn(),
        inOut: jest.fn(),
      },
    },
    useSharedValue: jest.fn((initial) => ({ value: initial })),
    useAnimatedStyle: jest.fn((cb) => {
      try {
        return cb();
      } catch {
        return {};
      }
    }),
    useAnimatedReaction: jest.fn(),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    withDecay: jest.fn((value) => value),
    withSequence: jest.fn((...values) => values[0]),
    withRepeat: jest.fn((value) => value),
    runOnJS: jest.fn((fn) => fn),
    useFrameCallback: jest.fn(),
    cancelAnimation: jest.fn(),
    clamp: jest.fn((value, min, max) => Math.min(Math.max(value, min), max)),
  };

  return reanimatedMock;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  
  const mockGesture = () => ({
    onStart: jest.fn().mockReturnThis(),
    onUpdate: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    onFinalize: jest.fn().mockReturnThis(),
    onChange: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
    numberOfTaps: jest.fn().mockReturnThis(),
  });
  
  return {
    Gesture: {
      Pan: jest.fn(mockGesture),
      Pinch: jest.fn(mockGesture),
      Tap: jest.fn(mockGesture),
      Simultaneous: jest.fn((...gestures) => ({
        ...mockGesture(),
        gestures,
      })),
      Race: jest.fn((...gestures) => ({
        ...mockGesture(),
        gestures,
      })),
    },
    GestureDetector: View,
    GestureHandlerRootView: View,
    State: {},
  };
});

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock reanimated-color-picker
jest.mock('reanimated-color-picker', () => ({
  __esModule: true,
  default: ({ children, value, onCompleteJS }) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'color-picker' }, children);
  },
  Preview: () => null,
  Panel1: () => null,
  HueSlider: () => null,
  OpacitySlider: () => null,
}));
