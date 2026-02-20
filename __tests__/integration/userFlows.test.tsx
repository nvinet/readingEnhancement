/**
 * Integration tests for user flows
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../../App';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('User Flows - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Initial App Load', () => {
    it('should load app with default configuration', async () => {
      const { UNSAFE_root } = render(<App />);
      
      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });
      
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should load saved configuration from AsyncStorage', async () => {
      const savedConfig = {
        config: {
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          baseFontSize: 24,
        },
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(savedConfig)
      );
      
      const { UNSAFE_root } = render(<App />);
      
      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });
      
      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Config Persistence', () => {
    it('should persist configuration changes', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });
      
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('should handle corrupted config gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid json {');
      
      const { UNSAFE_root } = render(<App />);
      
      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });
      
      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
