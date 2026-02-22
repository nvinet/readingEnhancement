/**
 * Gesture helper utilities
 * Provides bounds checking and validation for gesture handling
 */

export const SCALE_MIN = 0.1;
export const SCALE_MAX = 5;

/**
 * Clamps a scale value to safe bounds (0.1x to 5x)
 * Prevents extreme or negative scale values that could break rendering
 * 
 * @param scale - The scale value to clamp
 * @returns Clamped scale value between SCALE_MIN and SCALE_MAX
 */
export function clampScale(scale: number): number {
  // Handle invalid inputs
  if (isNaN(scale) || scale === undefined || scale === null) {
    return 1; // Default to neutral scale
  }

  // Clamp to bounds
  return Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale));
}

/**
 * Checks if a scale value is within acceptable bounds
 * 
 * @param scale - The scale value to check
 * @returns True if scale is within bounds, false otherwise
 */
export function isScaleWithinBounds(scale: number): boolean {
  return scale >= SCALE_MIN && scale <= SCALE_MAX;
}

/**
 * Calculates a safe scale delta for incremental adjustments
 * Ensures the resulting scale stays within bounds
 * 
 * @param currentScale - Current scale value
 * @param delta - Desired change in scale
 * @returns Safe delta that won't exceed bounds
 */
export function getSafeScaleDelta(currentScale: number, delta: number): number {
  const newScale = currentScale + delta;
  const clampedScale = clampScale(newScale);
  return clampedScale - currentScale;
}
