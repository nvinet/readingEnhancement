import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, LayoutChangeEvent, useWindowDimensions } from 'react-native';
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
}

const TextTicker = forwardRef<TextTickerHandle, TextTickerProps>(({ children, style, onPinchStart, onPinchUpdate, onPinchEnd, speed }, ref) => {
  const [contentWidth, setContentWidth] = useState(0);
  const { width: containerWidth } = useWindowDimensions();

  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const contentWidthSV = useSharedValue(0);
  const containerWidthSV = useSharedValue(0);

  React.useEffect(() => {
    containerWidthSV.value = containerWidth;
  }, [containerWidth]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      translateX.value = 0;
      savedTranslateX.value = 0;
    }
  }));

  useFrameCallback(() => {
    if (!speed || speed.value === 0) return;

    const minTranslate = containerWidthSV.value - contentWidthSV.value;
    const maxTranslate = 0;

    // Only scroll if content is wider than container
    if (minTranslate < 0) {
      translateX.value = clamp(translateX.value - speed.value, minTranslate, maxTranslate);
    }
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
    })
    .onUpdate((event) => {
      // Only allow panning if the content is wider than the container
      if (contentWidth <= containerWidth) {
        return;
      }
      const minTranslate = containerWidth - contentWidth;
      const maxTranslate = 0;
      translateX.value = clamp(savedTranslateX.value + event.translationX, minTranslate, maxTranslate);
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
      transform: [{ translateX: translateX.value }],
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
          }}
        >
          {children}
        </Animated.View>
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
});

export default TextTicker;