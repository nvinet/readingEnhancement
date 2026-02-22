import * as Brightness from 'expo-brightness';
import { Platform } from 'react-native';

export async function getBrightness(): Promise<number> {
  if (Platform.OS === 'ios') {
    try {
      return await Brightness.getBrightnessAsync();
    } catch (error) {
      console.error('Failed to get brightness:', error);
      return 0;
    }
  }
  return Promise.resolve(0);
}

export async function setBrightness(value: number): Promise<void> {
  if (Platform.OS === 'ios') {
    try {
      await Brightness.setBrightnessAsync(Math.max(0, Math.min(1, value)));
    } catch (error) {
      console.error('Failed to set brightness:', error);
    }
  }
}





