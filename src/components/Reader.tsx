import React, {useMemo, useState, useRef} from 'react';
import {Text, View, StyleSheet, Pressable} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import TextTicker, { TextTickerHandle } from './TextTicker';
import Controller from './Controller';

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
  config: ReaderConfig;
  fontSizeDelta: number;
  hardLettersSet: Set<string>;
  onSelect?: (index: number) => void;
  onReset?: (index: number) => void;
};

const Word = React.memo(({ word, index, isSelected, config, fontSizeDelta, hardLettersSet, onSelect, onReset }: WordProps) => {
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
  const words = useMemo(() => splitIntoWords(text), [text]);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const lastScale = useRef(1);
  const speed = useSharedValue(0);
  const tickerRef = useRef<TextTickerHandle>(null);
  
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
          config={config}
          fontSizeDelta={perWordFontSizeOverrides[index] || 0}
          hardLettersSet={hardLettersSet}
          onSelect={(idx) => {
            setSelectedWordIndex(idx);
            onSelectWordIndex?.(idx);
          }}
          onReset={onResetWordScaleByIndex}
        />
      );
    });
  }, [words, config, perWordFontSizeOverrides, hardLettersSet, selectedWordIndex, onSelectWordIndex, onResetWordScaleByIndex]);

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
          onPinchStart={handlePinchStart}
          onPinchUpdate={handlePinchUpdate}
        >
          {renderedWords}
        </TextTicker>
      </View>
      <Controller speed={speed} onReset={() => tickerRef.current?.reset()} />
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
