import {NativeModules, Platform} from 'react-native';

type BrightnessModuleType = {
  setBrightness: (value: number) => void;
  getBrightness: () => Promise<number>;
};

const Native: Partial<BrightnessModuleType> = NativeModules.BrightnessModule || {};

export async function getBrightness(): Promise<number> {
  if (Platform.OS === 'ios' && typeof Native.getBrightness === 'function') {
    return Native.getBrightness();
  }
  return Promise.resolve(0);
}

export function setBrightness(value: number) {
  if (Platform.OS === 'ios' && typeof Native.setBrightness === 'function') {
    Native.setBrightness(Math.max(0, Math.min(1, value)));
  }
}






