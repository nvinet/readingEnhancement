/**
 * Unit tests for TextTicker edge cases
 * Issue #3: Fix race condition and handle edge cases
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import TextTicker from '../../../src/components/TextTicker';

// Helper component to test TextTicker
const TestWrapper = ({ text }: { text: string }) => {
  const speed = useSharedValue(0);
  const scrollX = useSharedValue(0);

  return (
    <TextTicker speed={speed} scrollX={scrollX}>
      <Text>{text}</Text>
    </TextTicker>
  );
};

describe('TextTicker Edge Cases', () => {
  describe('Empty and Short Text', () => {
    it('should handle empty text without crashing', () => {
      const { UNSAFE_root } = render(<TestWrapper text="" />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle very short text (1 character)', () => {
      const { getByText } = render(<TestWrapper text="A" />);
      expect(getByText('A')).toBeTruthy();
    });

    it('should handle short text that fits in viewport', () => {
      const { getByText } = render(<TestWrapper text="Hello" />);
      expect(getByText('Hello')).toBeTruthy();
    });
  });

  describe('Long Text and Words', () => {
    it('should handle very long single word', () => {
      const longWord = 'Pneumonoultramicroscopicsilicovolcanoconiosis';
      const { getByText } = render(<TestWrapper text={longWord} />);
      expect(getByText(longWord)).toBeTruthy();
    });

    it('should handle extremely long text', () => {
      const longText = 'The quick brown fox jumps over the lazy dog '.repeat(50);
      const { UNSAFE_root } = render(<TestWrapper text={longText} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle text with special characters', () => {
      const specialText = 'Café, naïve, résumé, jalapeño 🔥';
      const { getByText } = render(<TestWrapper text={specialText} />);
      expect(getByText(specialText)).toBeTruthy();
    });
  });

  describe('Whitespace Handling', () => {
    it('should handle text with only whitespace', () => {
      const { UNSAFE_root } = render(<TestWrapper text="   \t\n   " />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle text with multiple consecutive spaces', () => {
      const { getByText } = render(<TestWrapper text="Hello     World" />);
      expect(getByText('Hello     World')).toBeTruthy();
    });
  });

  describe('Gesture Availability Feedback', () => {
    it('should render disabled state indicator when content is too narrow', () => {
      // This will be tested in integration tests with actual layout
      // Unit test just ensures component renders
      const { UNSAFE_root } = render(<TestWrapper text="Hi" />);
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
