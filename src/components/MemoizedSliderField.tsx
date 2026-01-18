import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, clamp } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {scheduleOnRN} from 'react-native-worklets';

type MemoizedSliderFieldProps = {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  displayMultiplier?: number;
};

const SLIDER_WIDTH = 180;

const MemoizedSliderField = React.memo(({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  displayMultiplier = 1
}: MemoizedSliderFieldProps) => {
  const sliderProgress = useSharedValue(((value - min) / (max - min)) * SLIDER_WIDTH);
  const startValue = useSharedValue(0);

  const updateValue = (progress: number) => {
    const normalizedProgress = progress / SLIDER_WIDTH;
    const newValue = min + normalizedProgress * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    onChange(clampedValue);
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      startValue.value = sliderProgress.value;
    })
    .onUpdate((event) => {
      const newProgress = clamp(startValue.value + event.translationX, 0, SLIDER_WIDTH);
      sliderProgress.value = newProgress;
      scheduleOnRN(updateValue, newProgress);
    });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sliderProgress.value }],
    };
  });

  // Update slider position when value changes externally
  React.useEffect(() => {
    sliderProgress.value = ((value - min) / (max - min)) * SLIDER_WIDTH;
  }, [value, min, max, sliderProgress]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}: {Math.round(value * displayMultiplier)}
      </Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - step))}
          style={[styles.button, styles.buttonLeft]}
        >
          <Text style={styles.buttonText}>-</Text>
        </Pressable>

        <View style={styles.sliderContainer}>
          <View style={styles.track} />
          <GestureDetector gesture={gesture}>
            <Animated.View
              style={[
                styles.thumb,
                thumbStyle
              ]}
            />
          </GestureDetector>
        </View>

        <Pressable
          onPress={() => onChange(Math.min(max, value + step))}
          style={[styles.button, styles.buttonRight]}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLeft: {
    marginRight: 12,
  },
  buttonRight: {
    marginLeft: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    width: SLIDER_WIDTH,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#1976D2',
    borderRadius: 10,
    top: 10,
    marginLeft: -10,
  },
});

export default MemoizedSliderField;
