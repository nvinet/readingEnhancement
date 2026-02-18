import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  SharedValue,
  clamp,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

type ControllerProps = {
  speed: SharedValue<number>;
  maxSpeed: number;
  onReset: () => void;
};

export interface ControllerHandle {
  resetSpeed: () => void;
}

// ~5.5cm on iPad/landscape — comfortable thumb target without stretching across the screen
const MAX_SLIDER_WIDTH_WIDE = 280;
const WIDE_BREAKPOINT = 600;

const Controller = forwardRef<ControllerHandle, ControllerProps>(({ speed, maxSpeed, onReset }, ref) => {
  const { width: screenWidth } = useWindowDimensions();
  const isWide = screenWidth > WIDE_BREAKPOINT;

  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderWidthSV = useSharedValue(0);

  const thumbPosition = useSharedValue(0);
  const startX = useSharedValue(0);

  const handleSliderLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (Math.abs(w - sliderWidthSV.value) < 1) return;
    setSliderWidth(w);
    sliderWidthSV.value = w;
    thumbPosition.value = w / 2;
    speed.value = 0;
  };

  useImperativeHandle(ref, () => ({
    resetSpeed: () => {
      speed.value = 0;
      thumbPosition.value = sliderWidthSV.value / 2;
    }
  }));

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = thumbPosition.value;
    })
    .onUpdate((e) => {
      const sw = sliderWidthSV.value;
      if (sw === 0) return;
      const center = sw / 2;
      const newPos = clamp(startX.value + e.translationX, 0, sw);
      thumbPosition.value = newPos;

      const normalized = (newPos - center) / center;
      speed.value = normalized * maxSpeed;
    })
    .onEnd(() => {
      if (Math.abs(speed.value) < 0.5) {
        speed.value = 0;
        thumbPosition.value = sliderWidthSV.value / 2;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      speed.value = 0;
      thumbPosition.value = sliderWidthSV.value / 2;
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value }],
  }));

  const handleReset = () => {
    speed.value = 0;
    thumbPosition.value = sliderWidthSV.value / 2;
    onReset();
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleReset} style={styles.button}>
        <View style={styles.arrow} />
        <View style={styles.bar} />
      </Pressable>

      <View
        style={[styles.sliderContainer, isWide && {maxWidth: MAX_SLIDER_WIDTH_WIDE}]}
        onLayout={handleSliderLayout}>
        <GestureDetector gesture={doubleTapGesture}>
          <Animated.View style={styles.gestureContainer}>
            <View style={styles.track} />
            {sliderWidth > 0 && (
              <View style={[styles.centerMarker, {left: sliderWidth / 2 - 1}]} />
            )}

            <GestureDetector gesture={panGesture}>
              <Animated.View style={[styles.thumb, thumbStyle]} />
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  gestureContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    width: '100%',
  },
  centerMarker: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: '#ccc',
  },
  thumb: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#1976D2',
    borderRadius: 30,
    top: -10,
    marginLeft: -30,
  },
});

export default Controller;
