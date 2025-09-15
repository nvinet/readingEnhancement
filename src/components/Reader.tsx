import React, {useMemo, useRef, useState} from 'react';
import {GestureResponderEvent, PanResponder, ScrollView, Text, View} from 'react-native';

export type ReaderConfig = {
  fontFamily: string | undefined;
  backgroundColor: string;
  textColor: string;
  doubleLetterColor: string;
  hardLetters: string; // custom hard letters that get extra spacing
  hardLetterExtraSpacing: number; // px after specific letters
  wordSpacing: number; // px between words
  baseFontSize: number;
};

type Props = {
  text: string;
  config: ReaderConfig;
  perWordSpacingOverrides: Record<number, number>; // wordIndex -> extra px per character
  onSelectWordIndex?: (index: number | null) => void;
  onAdjustSelectedWordSpacing?: (delta: number) => void;
  onAdjustFontSize?: (delta: number) => void;
  onResetSelectedWordSpacing?: () => void;
};

// Default hard letters (will be overridden by config)
const DEFAULT_HARD_LETTERS = 'ghkqwxyzGHKQWXYZ';

function splitIntoWords(text: string): string[] {
  // Split on any whitespace, collapse multiples; keep only words
  return text
    .split(/\s+/)
    .filter(w => w.length > 0);
}

function findDoubleLetterIndices(word: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < word.length - 1; i++) {
    if (word[i] === word[i + 1]) {
      indices.push(i); // color the first of each pair
    }
  }
  return indices;
}

export const Reader: React.FC<Props> = ({
  text,
  config,
  perWordSpacingOverrides,
  onSelectWordIndex,
  onAdjustSelectedWordSpacing,
  onAdjustFontSize,
  onResetSelectedWordSpacing,
}) => {
  const words = useMemo(() => splitIntoWords(text), [text]);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  
  // Create a Set of hard letters from the config
  const hardLettersSet = useMemo(() => {
    const hardLetters = (config.hardLetters || DEFAULT_HARD_LETTERS).normalize('NFC');
    return new Set(Array.from(hardLetters));
  }, [config.hardLetters]);
  const gestureStateRef = useRef<{ lastPinchDistance: number | null; lastTapTs: number | null } | null>({ lastPinchDistance: null, lastTapTs: null });
  const containerRef = useRef<View | null>(null);
  const containerPageOffsetRef = useRef<{pageX: number; pageY: number}>({pageX: 0, pageY: 0});
  const wordLayoutsRef = useRef<Record<number, {x: number; y: number; width: number; height: number}>>({});

  function handleWordPress(index: number) {
    // Toggle selection: if the same word is tapped, deselect it
    if (selectedWordIndex === index) {
      setSelectedWordIndex(null);
      onSelectWordIndex && onSelectWordIndex(null);
    } else {
      setSelectedWordIndex(index);
      onSelectWordIndex && onSelectWordIndex(index);
    }
  }

  function distance(p1: {x: number; y: number}, p2: {x: number; y: number}): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function midpoint(p1: {x: number; y: number}, p2: {x: number; y: number}) {
    return {x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2};
  }

  function selectWordAtLocalPoint(localX: number, localY: number): number | null {
    const layouts = wordLayoutsRef.current;
    let found: number | null = null;
    let minDy = Number.MAX_VALUE;
    Object.keys(layouts).forEach(k => {
      const idx = Number(k);
      const r = layouts[idx];
      const withinX = localX >= r.x && localX <= r.x + r.width;
      const withinY = localY >= r.y && localY <= r.y + r.height;
      if (withinX && withinY) {
        found = idx;
        minDy = 0;
      } else {
        const dy = Math.min(Math.abs(localY - r.y), Math.abs(localY - (r.y + r.height)));
        if (withinX && dy < minDy && dy < 40) {
          found = idx;
          minDy = dy;
        }
      }
    });
    return found;
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // Only capture gestures for multi-touch (pinch) - let ScrollView handle single touch
        onStartShouldSetPanResponder: (evt) => {
          const touches = evt.nativeEvent.touches;
          return touches && touches.length >= 2;
        },
        onMoveShouldSetPanResponder: (evt) => {
          const touches = evt.nativeEvent.touches;
          return touches && touches.length >= 2;
        },
        onPanResponderMove: (_evt: GestureResponderEvent) => {
          const evt: any = _evt.nativeEvent as any;
          const touches = evt.touches as Array<{pageX: number; pageY: number}> | undefined;
          if (touches && touches.length >= 2) {
            const p1 = {x: touches[0].pageX, y: touches[0].pageY};
            const p2 = {x: touches[1].pageX, y: touches[1].pageY};
            const d = distance(p1, p2);
            const last = gestureStateRef.current?.lastPinchDistance;
            if (last != null) {
              const delta = d - last;
              // Gesture configuration: override character spacing dynamically
              // Pinch in = decrease spacing, Pinch out = increase spacing
              const mid = midpoint(p1, p2);
              const localX = mid.x - containerPageOffsetRef.current.pageX;
              const localY = mid.y - containerPageOffsetRef.current.pageY;
              const hovered = selectWordAtLocalPoint(localX, localY);
              
              // If a word is already selected, always adjust that word regardless of pinch location
              if (selectedWordIndex != null) {
                // Adjust character spacing for the currently selected word
                if (onAdjustSelectedWordSpacing) {
                  // Pinch OUT = increase spacing, Pinch IN = decrease spacing
                  onAdjustSelectedWordSpacing(delta * 0.1);
                }
              } else if (hovered != null) {
                // If no word is selected, select the word under the gesture
                setSelectedWordIndex(hovered);
                onSelectWordIndex && onSelectWordIndex(hovered);
                // Start adjusting the newly selected word
                if (onAdjustSelectedWordSpacing) {
                  onAdjustSelectedWordSpacing(delta * 0.1);
                }
              } else {
                // Only adjust global font size when no word is selected and not hovering over any word
                if (onAdjustFontSize) {
                  onAdjustFontSize(delta * 0.03);
                }
              }
            }
            if (gestureStateRef.current) gestureStateRef.current.lastPinchDistance = d;
          }
        },
        onPanResponderRelease: (evt) => {
          if (gestureStateRef.current) {
            gestureStateRef.current.lastPinchDistance = null;
            const now = Date.now();
            const lastTapTs = gestureStateRef.current.lastTapTs;
            // Treat quick two taps as double tap reset
            if (lastTapTs && now - lastTapTs < 250) {
              if (selectedWordIndex != null && onResetSelectedWordSpacing) {
                onResetSelectedWordSpacing();
              }
              gestureStateRef.current.lastTapTs = null;
            } else {
              gestureStateRef.current.lastTapTs = now;
            }
          }
        },
        onPanResponderTerminationRequest: () => false, // Don't terminate easily, but allow scroll
      }),
    [onAdjustFontSize, onAdjustSelectedWordSpacing, onResetSelectedWordSpacing, selectedWordIndex],
  );

  const renderedWords = useMemo(() => {
    return words.map((word, index) => {
      const doubleIndices = findDoubleLetterIndices(word);
      const perCharExtra = perWordSpacingOverrides[index] || 0;
      const chars = word.split('');
      return (
        <View
          key={index}
          onLayout={(e) => {
            wordLayoutsRef.current[index] = e.nativeEvent.layout;
          }}
          onTouchEnd={() => handleWordPress(index)}
          style={{
            flexDirection: 'row',
            marginRight: config.wordSpacing,
            backgroundColor: selectedWordIndex === index ? 'rgba(0, 123, 255, 0.2)' : 'transparent',
            borderRadius: selectedWordIndex === index ? 8 : 0,
            paddingHorizontal: selectedWordIndex === index ? 6 : 0,
            paddingVertical: selectedWordIndex === index ? 3 : 0,
            borderWidth: selectedWordIndex === index ? 2 : 0,
            borderColor: selectedWordIndex === index ? 'rgba(0, 123, 255, 0.5)' : 'transparent',
          }}
        >
          {chars.map((ch, i) => {
            const isDoubleColored = doubleIndices.includes(i);
            const isHard = hardLettersSet.has(ch);
            const hardLetterSpacing = isHard ? config.hardLetterExtraSpacing : 0;
            const gestureSpacing = perCharExtra;
            
            return (
              <Text
                key={i}
                style={{
                  color: isDoubleColored ? config.doubleLetterColor : config.textColor,
                  fontFamily: config.fontFamily,
                  fontSize: config.baseFontSize,
                  marginHorizontal: hardLetterSpacing,
                  // Gesture-based spacing
                  letterSpacing: gestureSpacing,
                }}
              >
                {ch}
              </Text>
            );
          })}
        </View>
      );
    });
  }, [words, config, perWordSpacingOverrides, selectedWordIndex]);

  return (
    <View
      ref={(r) => { containerRef.current = r; }}
      onLayout={() => {
        const node: any = containerRef.current as any;
        if (node && typeof node.measure === 'function') {
          node.measure((x: number, y: number, w: number, h: number, pageX: number, pageY: number) => {
            containerPageOffsetRef.current = {pageX, pageY};
          });
        }
      }}
      style={{flex: 1, backgroundColor: config.backgroundColor}}
      {...panResponder.panHandlers}
    >
      <ScrollView 
        contentContainerStyle={{padding: 16, flexGrow: 1}}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={{flexDirection: 'row', flexWrap: 'wrap', minHeight: '100%'}}>
          {renderedWords}
        </View>
        <Text 
          style={{height: 100, justifyContent: 'center', opacity: 0.6, color: config.textColor, textAlign: 'center', paddingTop: 20}}
          onPress={() => {
            setSelectedWordIndex(null);
            onSelectWordIndex && onSelectWordIndex(null);
          }}
        >
          {selectedWordIndex != null
            ? 'Selected word is highlighted in BLUE. Pinch OUT to zoom letters, Pinch IN to shrink. Tap here to deselect.'
            : 'TAP any word to select it (blue highlight), then PINCH to adjust its letter spacing. Pinch in empty space for global font size.'}
        </Text>
      </ScrollView>
    </View>
  );
};

export default Reader;



