import React, {useMemo, useState, useRef, useCallback} from 'react';
import {Text, View, StyleSheet, Pressable, useWindowDimensions} from 'react-native';
import { useSharedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import TextTicker, { TextTickerHandle } from './TextTicker';
import Controller, { ControllerHandle } from './Controller';

export type ReaderConfig = {
  fontFamily: string | undefined;
  backgroundColor: string;
  textColor: string;
  doubleLetterColor: string;
  hardLetters: string; // custom hard letters that get extra spacing
  hardLetterExtraSpacing: number; // px after specific letters
  wordSpacing: number; // px between words
  baseFontSize: number;
  maxScrollSpeed: number; // pixels per frame for auto-scroll (1-15)
  underlineColor: string;
};

type Props = {
  text: string;
  config: ReaderConfig;
  perWordFontSizeOverrides: Record<number, number>; // wordIndex -> extra px for font size
  onSelectWordIndex?: (index: number | null) => void;
  onAdjustSelectedWordScale?: (delta: number) => void;
  onAdjustFontSize?: (delta: number) => void;
  onResetSelectedWordScale?: () => void;
  onResetWordScaleByIndex?: (index: number) => void;
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

type WordProps = {
  word: string;
  index: number;
  isSelected: boolean;
  isCentered: boolean;
  config: ReaderConfig;
  fontSizeDelta: number;
  hardLettersSet: Set<string>;
  onSelect?: (index: number) => void;
  onReset?: (index: number) => void;
  onWordLayout?: (x: number, width: number) => void;
};

const Word = React.memo(({ word, index, isSelected, isCentered, config, fontSizeDelta, hardLettersSet, onSelect, onReset, onWordLayout }: WordProps) => {
  const doubleIndices = findDoubleLetterIndices(word);
  const chars = word.split('');
  const hasCustomScale = fontSizeDelta !== 0;
  const effectiveFontSize = Math.max(5, config.baseFontSize + fontSizeDelta);

  const lastTap = useRef<number>(0);
  const handlePress = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onReset?.(index);
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      onSelect?.(index);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLayout={(e) => {
        const { x, width } = e.nativeEvent.layout;
        onWordLayout?.(x, width);
      }}
        style={{
          flexDirection: 'row',
          marginRight: config.wordSpacing,
          alignItems: 'center',
          backgroundColor: isSelected ? 'rgba(0, 123, 255, 0.2)' : 'transparent',
          borderRadius: isSelected ? 100 : 4,
          paddingHorizontal: isSelected ? 20 : 0,
          paddingVertical: isSelected ? 10 : 0,
        }}
      >
        {chars.map((ch, i) => {
          const isDoubleColored = doubleIndices.includes(i);
          const isHard = hardLettersSet.has(ch);
          const hardLetterSpacing = isHard ? config.hardLetterExtraSpacing : 0;

          return (
            <Text
              key={i}
              style={{
                color: isDoubleColored ? config.doubleLetterColor : config.textColor,
                fontFamily: config.fontFamily,
                fontSize: effectiveFontSize,
                marginHorizontal: hardLetterSpacing,
              }}
            >
              {ch}
            </Text>
          );
        })}
        {hasCustomScale && (
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#2196F3',
            }}
          />
        )}
        {isCentered && (
          <View
            style={{
              position: 'absolute',
              bottom: -4,
              left: 0,
              right: 0,
              height: 3,
              backgroundColor: config.underlineColor,
              borderRadius: 1.5,
            }}
          />
        )}
    </Pressable>
  );
});

export const Reader: React.FC<Props> = ({
  text,
  config,
  perWordFontSizeOverrides,
  onSelectWordIndex,
  onAdjustSelectedWordScale,
  onAdjustFontSize,
  onResetWordScaleByIndex
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const words = useMemo(() => splitIntoWords(text), [text]);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [centeredIndex, setCenteredIndex] = useState<number>(-1);
  const centeredIndexRef = useRef(-1);
  const lastScale = useRef(1);
  const speed = useSharedValue(0);
  const scrollX = useSharedValue(0);
  const tickerRef = useRef<TextTickerHandle>(null);
  const controllerRef = useRef<ControllerHandle>(null);
  const wordPositions = useRef<{x: number, width: number}[]>([]);

  const handleWordLayout = useCallback((index: number, x: number, width: number) => {
    wordPositions.current[index] = { x, width };
  }, []);

  const computeCenteredWord = useCallback((currentScrollX: number) => {
    const center = screenWidth / 2;
    let closestIdx = -1;
    let closestDist = Infinity;
    for (let i = 0; i < wordPositions.current.length; i++) {
      const wp = wordPositions.current[i];
      if (!wp) continue;
      const wordCenter = wp.x + wp.width / 2 + currentScrollX;
      const dist = Math.abs(wordCenter - center);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }
    if (closestIdx !== centeredIndexRef.current) {
      centeredIndexRef.current = closestIdx;
      setCenteredIndex(closestIdx);
    }
  }, [screenWidth]);

  useAnimatedReaction(
    () => scrollX.value,
    (val) => { runOnJS(computeCenteredWord)(val); }
  );

  // Create a Set of hard letters from the config
  const hardLettersSet = useMemo(() => {
    const hardLetters = (config.hardLetters || DEFAULT_HARD_LETTERS).normalize('NFC');
    return new Set(Array.from(hardLetters));
  }, [config.hardLetters]);

  const handlePinchStart = () => {
    lastScale.current = 1;
  };

  const handlePinchUpdate = (scale: number) => {
    const delta = scale - lastScale.current;
    lastScale.current = scale;
    
    if (selectedWordIndex !== null) {
      if (onAdjustSelectedWordScale) {
        // Adjust sensitivity: delta is small (e.g. 0.05), spacing is px.
        onAdjustSelectedWordScale(delta * 20); 
      }
    } else {
      if (onAdjustFontSize) {
        onAdjustFontSize(delta * 10);
      }
    }
  };

  const renderedWords = useMemo(() => {
    return words.map((word, index) => {
      return (
        <Word
          key={index}
          word={word}
          index={index}
          isSelected={selectedWordIndex === index}
          isCentered={centeredIndex === index}
          config={config}
          fontSizeDelta={perWordFontSizeOverrides[index] || 0}
          hardLettersSet={hardLettersSet}
          onSelect={(idx) => {
            setSelectedWordIndex(idx);
            onSelectWordIndex?.(idx);
            controllerRef.current?.resetSpeed();
          }}
          onReset={onResetWordScaleByIndex}
          onWordLayout={(x, width) => handleWordLayout(index, x, width)}
        />
      );
    });
  }, [words, config, perWordFontSizeOverrides, hardLettersSet, selectedWordIndex, centeredIndex, onSelectWordIndex, onResetWordScaleByIndex, handleWordLayout]);

  return (
    <Pressable 
      style={[styles.container, {backgroundColor: config.backgroundColor}]}
      onPress={() => {
        setSelectedWordIndex(null);
        onSelectWordIndex?.(null);
      }}
    >
      <View style={styles.band}>
        <TextTicker
          key={text}
          ref={tickerRef}
          speed={speed}
          scrollX={scrollX}
          onPinchStart={handlePinchStart}
          onPinchUpdate={handlePinchUpdate}
        >
          {renderedWords}
        </TextTicker>
      </View>
      <Controller ref={controllerRef} speed={speed} maxSpeed={config.maxScrollSpeed} onReset={() => tickerRef.current?.reset()} />
      <Text 
            style={{justifyContent: 'center', opacity: 0.6, color: config.textColor, textAlign: 'center', paddingTop: 20}}
          >
            TAP any word to select it (blue highlight), then PINCH to adjust its letter spacing. Double-TAP to reset the font-size.
          </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
  },
  band: {
    height: 100, // Thicker band
    width: '100%',
    justifyContent: 'center',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    backgroundColor: '#FAFAFA'
  }
});

export default Reader;
