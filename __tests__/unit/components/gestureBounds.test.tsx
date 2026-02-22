/**
 * Unit tests for gesture bounds checking
 * Issue #3: Add bounds checking for pinch gestures
 */

import { clampScale, isScaleWithinBounds } from '../../../src/utils/gestureHelpers';

describe('Gesture Bounds Checking', () => {
  describe('clampScale', () => {
    it('should limit scale to minimum 0.1x', () => {
      expect(clampScale(0.05)).toBe(0.1);
      expect(clampScale(0.01)).toBe(0.1);
      expect(clampScale(-1)).toBe(0.1);
    });

    it('should limit scale to maximum 5x', () => {
      expect(clampScale(10)).toBe(5);
      expect(clampScale(6)).toBe(5);
      expect(clampScale(100)).toBe(5);
    });

    it('should allow values within range', () => {
      expect(clampScale(0.1)).toBe(0.1);
      expect(clampScale(1)).toBe(1);
      expect(clampScale(2.5)).toBe(2.5);
      expect(clampScale(5)).toBe(5);
    });

    it('should handle exact boundary values', () => {
      expect(clampScale(0.1)).toBe(0.1);
      expect(clampScale(5)).toBe(5);
    });

    it('should handle negative scale values', () => {
      expect(clampScale(-0.5)).toBe(0.1);
      expect(clampScale(-10)).toBe(0.1);
    });

    it('should handle NaN and undefined', () => {
      expect(clampScale(NaN)).toBe(1); // Default to 1 on invalid input
      expect(clampScale(undefined as any)).toBe(1);
    });
  });

  describe('isScaleWithinBounds', () => {
    it('should return true for values within bounds', () => {
      expect(isScaleWithinBounds(0.1)).toBe(true);
      expect(isScaleWithinBounds(1)).toBe(true);
      expect(isScaleWithinBounds(5)).toBe(true);
    });

    it('should return false for values outside bounds', () => {
      expect(isScaleWithinBounds(0.05)).toBe(false);
      expect(isScaleWithinBounds(6)).toBe(false);
      expect(isScaleWithinBounds(-1)).toBe(false);
    });
  });
});
