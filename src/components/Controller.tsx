import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, clamp, SharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type ControllerProps = {
  speed: SharedValue<number>;
  onReset: () => void;
};

const SLIDER_WIDTH = 200;
const SLIDER_CENTER = SLIDER_WIDTH / 2;
const MAX_SPEED = 8; // Pixels per frame

const Controller: React.FC<ControllerProps> = ({ speed, onReset }) => {
  // Visual position of the thumb (0 to SLIDER_WIDTH)
  // Center (SLIDER_WIDTH / 2) corresponds to speed 0
  const thumbPosition = useSharedValue(SLIDER_WIDTH / 2);
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = thumbPosition.value;
    })
    .onUpdate((e) => {
      const newPos = clamp(startX.value + e.translationX, 0, SLIDER_WIDTH);
      thumbPosition.value = newPos;
      
      // Calculate speed: Center is 0. Left is negative, Right is positive.
      const normalized = (newPos - SLIDER_CENTER) / (SLIDER_CENTER);
      speed.value = normalized * MAX_SPEED;
    })
    .onEnd(() => {
      // Snap to center if close to 0
      if (Math.abs(speed.value) < 0.5) {
        speed.value = 0;
        thumbPosition.value = SLIDER_CENTER;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      speed.value = 0;
      thumbPosition.value = SLIDER_CENTER;
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value }],
  }));

  const handleReset = () => {
    speed.value = 0;
    thumbPosition.value = SLIDER_CENTER;
    onReset();
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleReset} style={styles.button}>
        <View style={styles.arrow} />
        <View style={styles.bar} />
      </Pressable>
      
      <View style={styles.sliderContainer}>
        <GestureDetector gesture={doubleTapGesture}>
          <Animated.View style={{flex: 1, justifyContent: 'center'}}>
            <View style={styles.track} />
            <View style={styles.centerMarker} />
            
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[styles.thumb, thumbStyle]} />
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    flexDirection: 'row',
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#555',
  },
  bar: {
    width: 3,
    height: 12,
    backgroundColor: '#555',
    marginLeft: 2,
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
  centerMarker: {
    position: 'absolute',
    left: SLIDER_WIDTH / 2 - 1,
    width: 2,
    height: 12,
    backgroundColor: '#ccc',
  },
  thumb: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#1976D2',
    borderRadius: 20,
    top: 0,
    marginLeft: -20,
  },
});

export default Controller;