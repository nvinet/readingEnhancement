import React, { useState } from 'react';
import { StyleSheet, View, LayoutChangeEvent, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, clamp, runOnJS } from 'react-native-reanimated';

interface TextTickerProps {
  style?: any;
  children: React.ReactNode;
  onPinchStart?: () => void;
  onPinchUpdate?: (scale: number) => void;
  onPinchEnd?: () => void;
}

const TextTicker: React.FC<TextTickerProps> = ({ children, style, onPinchStart, onPinchUpdate, onPinchEnd }) => {
  const [contentWidth, setContentWidth] = useState(0);
  const { width: containerWidth } = useWindowDimensions();

  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);

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
          onLayout={(e: LayoutChangeEvent) => setContentWidth(e.nativeEvent.layout.width)}
        >
          {children}
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

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