import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, LayoutChangeEvent, useWindowDimensions, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, clamp, runOnJS, useFrameCallback, SharedValue } from 'react-native-reanimated';

export interface TextTickerHandle {
  reset: () => void;
}

interface TextTickerProps {
  style?: any;
  children: React.ReactNode;
  onPinchStart?: () => void;
  onPinchUpdate?: (scale: number) => void;
  onPinchEnd?: () => void;
  speed?: SharedValue<number>;
  scrollX: SharedValue<number>;
}

const TextTicker = forwardRef<TextTickerHandle, TextTickerProps>(({ children, style, onPinchStart, onPinchUpdate, onPinchEnd, speed, scrollX }, ref) => {
  const [contentWidth, setContentWidth] = useState(0);
  const { width: containerWidth } = useWindowDimensions();
  const [isPanDisabled, setIsPanDisabled] = useState(false);

  const savedTranslateX = useSharedValue(0);
  const contentWidthSV = useSharedValue(0);
  const containerWidthSV = useSharedValue(0);

  React.useEffect(() => {
    const prevCenter = containerWidthSV.value / 2;
    containerWidthSV.value = containerWidth;
    const newCenter = containerWidth / 2;
    // Set initial position to center, or update if it was at the previous center
    if (scrollX.value === 0 || Math.abs(scrollX.value - prevCenter) < 1) {
      scrollX.value = newCenter;
      savedTranslateX.value = newCenter;
    }
  }, [containerWidth]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      scrollX.value = containerWidthSV.value / 2;
      savedTranslateX.value = containerWidthSV.value / 2;
    }
  }));

  useFrameCallback(() => {
    if (!speed || speed.value === 0) return;

    const center = containerWidthSV.value / 2;
    const minTranslate = center - contentWidthSV.value;
    const maxTranslate = center;

    if (minTranslate < maxTranslate) {
      scrollX.value = clamp(scrollX.value - speed.value, minTranslate, maxTranslate);
    }
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = scrollX.value;
    })
    .onUpdate((event) => {
      // Fix race condition: use shared values instead of state variables
      // State (contentWidth, containerWidth) may not be in sync on UI thread
      if (contentWidthSV.value <= containerWidthSV.value) {
        return;
      }
      const center = containerWidthSV.value / 2;
      const minTranslate = center - contentWidthSV.value;
      const maxTranslate = center;
      scrollX.value = clamp(savedTranslateX.value + event.translationX, minTranslate, maxTranslate);
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      if (onPinchStart) runOnJS(onPinchStart)();
    })
    .onUpdate((e) => {
      if (onPinchUpdate) runOnJS(onPinchUpdate)(e.scale);
    })
    .onEnd(() => {
      if (onPinchEnd) runOnJS(onPinchEnd)();
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: scrollX.value }],
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={[
        styles.container,
        style
      ]}>
        <Animated.View
          style={[styles.content, animatedStyle]}
          onLayout={(e: LayoutChangeEvent) => {
            const w = e.nativeEvent.layout.width;
            setContentWidth(w);
            contentWidthSV.value = w;
            // Update pan disabled state for user feedback
            setIsPanDisabled(w <= containerWidth);
          }}
        >
          {children}
        </Animated.View>
        {isPanDisabled && (
          <View style={styles.disabledOverlay}>
            <Text style={styles.disabledText}>
              Text too short to scroll
            </Text>
          </View>
        )}
      </View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
  },
  disabledOverlay: {
    position: 'absolute',
    top: 4,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  disabledText: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.8,
  },
});

export default TextTicker;