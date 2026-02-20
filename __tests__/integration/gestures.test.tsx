/**
 * Integration tests for gesture interactions
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Gesture } from 'react-native-gesture-handler';
import App from '../../App';

describe('Gesture Interactions', () => {
  describe('Gesture Setup', () => {
    it('should render without crashing when gestures are available', () => {
      const { UNSAFE_root } = render(<App />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should have gesture handlers available', () => {
      expect(Gesture.Pinch).toBeDefined();
      expect(Gesture.Pan).toBeDefined();
      expect(Gesture.Tap).toBeDefined();
    });
  });

  describe('Combined Gestures', () => {
    it('should support simultaneous gestures', () => {
      expect(Gesture.Simultaneous).toBeDefined();
      expect(Gesture.Race).toBeDefined();
    });
  });
});

// Note: Full gesture testing requires E2E framework (see e2e/app.e2e.ts)
