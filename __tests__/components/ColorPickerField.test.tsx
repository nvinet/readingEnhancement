/**
 * @format
 * Component tests for ColorPickerField
 */

import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import ColorPickerField from '../../src/components/ColorPickerField';

// Mock the reanimated-color-picker module
jest.mock('reanimated-color-picker', () => ({
  __esModule: true,
  default: ({children, value, onCompleteJS}: any) => {
    const React = require('react');
    const {View, Pressable, Text} = require('react-native');
    
    return (
      <View testID="color-picker">
        <Text>Current Color: {value}</Text>
        <Pressable
          testID="color-picker-complete"
          onPress={() => onCompleteJS({hex: '#FF0000'})}
        >
          <Text>Select Color</Text>
        </Pressable>
        {children}
      </View>
    );
  },
  Preview: () => null,
  Panel1: () => null,
  HueSlider: () => null,
  OpacitySlider: () => null,
}));

describe('ColorPickerField Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with label and initial color', () => {
      const {getByText} = render(
        <ColorPickerField
          label="Background Color"
          value="#FFFFFF"
          onChange={mockOnChange}
        />
      );

      expect(getByText('Background Color')).toBeTruthy();
      expect(getByText('Choose Color')).toBeTruthy();
    });

    it('should display color preview box', () => {
      const {UNSAFE_root} = render(
        <ColorPickerField
          label="Test Color"
          value="#FF5500"
          onChange={mockOnChange}
        />
      );

      // Find the View with backgroundColor style
      const colorPreview = UNSAFE_root.findAllByType('View').find(
        v => v.props.style && 
        Array.isArray(v.props.style) && 
        v.props.style.some((s: any) => s?.backgroundColor === '#FF5500')
      );

      expect(colorPreview).toBeTruthy();
    });

    it('should not show modal initially', () => {
      const {queryByTestId} = render(
        <ColorPickerField
          label="Test Color"
          value="#FFFFFF"
          onChange={mockOnChange}
        />
      );

      expect(queryByTestId('color-picker')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('should open modal when Choose Color button is pressed', () => {
      const {getByText, getByTestId} = render(
        <ColorPickerField
          label="Test Color"
          value="#FFFFFF"
          onChange={mockOnChange}
        />
      );

      const chooseButton = getByText('Choose Color');
      fireEvent.press(chooseButton);

      expect(getByTestId('color-picker')).toBeTruthy();
    });

    it('should close modal when Cancel button is pressed', () => {
      const {getByText, queryByTestId} = render(
        <ColorPickerField
          label="Test Color"
          value="#FFFFFF"
          onChange={mockOnChange}
        />
      );

      // Open modal
      fireEvent.press(getByText('Choose Color'));
      expect(queryByTestId('color-picker')).toBeTruthy();

      // Close modal
      fireEvent.press(getByText('Cancel'));
      expect(queryByTestId('color-picker')).toBeNull();
    });

    it('should call onChange with selected color and close modal', () => {
      const {getByText, getByTestId, queryByTestId} = render(
        <ColorPickerField
          label="Test Color"
          value="#FFFFFF"
          onChange={mockOnChange}
        />
      );

      // Open modal
      fireEvent.press(getByText('Choose Color'));

      // Select color (using our mock)
      const completeButton = getByTestId('color-picker-complete');
      fireEvent.press(completeButton);

      expect(mockOnChange).toHaveBeenCalledWith('#FF0000');
      expect(queryByTestId('color-picker')).toBeNull();
    });
  });

  describe('Memoization', () => {
    it('should be a memoized component', () => {
      expect(ColorPickerField).toHaveProperty('$$typeof');
    });
  });
});
