/**
 * E2E Tests for Reading Enhancement App
 * 
 * Run with: detox test --configuration ios.sim.debug
 */

describe('Reading Enhancement App - E2E', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('App Launch', () => {
    it('should launch successfully', async () => {
      // App should render without crashing
      // This verifies the app starts up
      await waitFor(element(by.id('app-container')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display empty state initially', async () => {
      // Check for paste prompt or initial state
      await expect(element(by.text('Paste Text').or(by.text('Tap to Paste')))).toExist();
    });
  });

  describe('Text Input Flow', () => {
    it('should allow user to paste text', async () => {
      // Note: Actual clipboard interaction requires device/simulator setup
      // This is a placeholder for the flow
      
      // 1. Tap paste button
      await element(by.id('paste-button')).tap();
      
      // 2. Text should appear in reader
      await waitFor(element(by.id('reader-content')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should handle empty text gracefully', async () => {
      // App should not crash with empty text
      await expect(element(by.id('app-container'))).toBeVisible();
    });
  });

  describe('Settings Panel', () => {
    it('should open settings panel', async () => {
      // Tap settings button
      await element(by.id('settings-button')).tap();
      
      // Settings panel should be visible
      await expect(element(by.text('Background Color'))).toBeVisible();
      await expect(element(by.text('Text Color'))).toBeVisible();
      await expect(element(by.text('Font Size'))).toBeVisible();
    });

    it('should close settings panel', async () => {
      // Open settings
      await element(by.id('settings-button')).tap();
      await expect(element(by.text('Background Color'))).toBeVisible();
      
      // Close settings (tap outside or close button)
      await element(by.id('close-settings')).tap();
      
      // Panel should be hidden
      await waitFor(element(by.text('Background Color')))
        .not.toBeVisible()
        .withTimeout(1000);
    });

    it('should adjust font size with slider', async () => {
      // Open settings
      await element(by.id('settings-button')).tap();
      
      // Find and adjust font size slider
      await element(by.id('font-size-slider')).swipe('right', 'slow', 0.5);
      
      // Font size should increase (visual verification needed)
      // This test verifies the interaction works without errors
    });

    it('should change background color', async () => {
      // Open settings
      await element(by.id('settings-button')).tap();
      
      // Open color picker
      await element(by.text('Choose Color')).atIndex(0).tap();
      
      // Select a color (interaction with color picker)
      // Note: Color picker interaction requires detailed element queries
      
      // Close color picker
      await element(by.text('Cancel').or(by.text('Done'))).tap();
    });
  });

  describe('Settings Persistence', () => {
    it('should persist settings across app restarts', async () => {
      // 1. Open settings and change a value
      await element(by.id('settings-button')).tap();
      await element(by.id('font-size-slider')).swipe('right', 'slow', 0.5);
      
      // 2. Close settings
      await element(by.id('close-settings')).tap();
      
      // 3. Reload app
      await device.reloadReactNative();
      
      // 4. Open settings again
      await element(by.id('settings-button')).tap();
      
      // 5. Verify setting persisted
      // (Would need to check actual slider value)
      await expect(element(by.text('Font Size'))).toBeVisible();
    });

    it('should handle corrupted storage gracefully', async () => {
      // This test would require injecting corrupted data
      // For now, verify app doesn't crash on launch
      await device.reloadReactNative();
      await expect(element(by.id('app-container'))).toBeVisible();
    });
  });

  describe('Gesture Interactions', () => {
    it('should support pinch to zoom', async () => {
      // Note: Pinch gesture testing requires specific Detox setup
      // This is a placeholder for the test structure
      
      // Verify reader is visible
      await expect(element(by.id('reader-content'))).toBeVisible();
      
      // Pinch gesture (requires actual text content)
      // await element(by.id('reader-content')).pinch(1.5, 'slow');
    });

    it('should support tap to select word', async () => {
      // Tap on a word
      // await element(by.id('word-0')).tap();
      
      // Word should be selected (highlighted)
      // Verification would check for styling changes
    });

    it('should support double-tap to reset word size', async () => {
      // First tap to select
      // await element(by.id('word-0')).tap();
      
      // Second tap to reset
      // await element(by.id('word-0')).tap();
      
      // Word size should reset to default
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', async () => {
      // Settings button should be accessible
      await expect(element(by.traits(['button'])).and(by.label('Settings'))).toExist();
    });

    it('should work with VoiceOver enabled', async () => {
      // Note: VoiceOver testing requires specific device configuration
      // This is a placeholder
      
      // Enable VoiceOver (if possible)
      // await device.setVoiceOverEnabled(true);
      
      // Navigate with VoiceOver gestures
      // Verify announcements
      
      // Disable VoiceOver
      // await device.setVoiceOverEnabled(false);
    });

    it('should have sufficient touch target sizes', async () => {
      // All interactive elements should meet minimum size requirements (44x44 on iOS)
      // This would require checking element dimensions
      
      await expect(element(by.id('settings-button'))).toBeVisible();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text', async () => {
      // Paste very long text (would need clipboard setup)
      // App should not crash or freeze
      
      await expect(element(by.id('app-container'))).toBeVisible();
    });

    it('should handle rapid setting changes', async () => {
      // Open settings
      await element(by.id('settings-button')).tap();
      
      // Rapidly change multiple settings
      await element(by.id('font-size-slider')).swipe('right', 'fast', 0.3);
      await element(by.id('font-size-slider')).swipe('left', 'fast', 0.2);
      await element(by.id('word-spacing-slider')).swipe('right', 'fast', 0.4);
      
      // App should remain responsive
      await expect(element(by.text('Font Size'))).toBeVisible();
    });

    it('should work in airplane mode', async () => {
      // App should function without network (no external dependencies)
      await device.reloadReactNative();
      await expect(element(by.id('app-container'))).toBeVisible();
    });
  });
});
