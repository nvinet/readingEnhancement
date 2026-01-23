import React, {useMemo, useState, useRef} from 'react';
import {Text, View, StyleSheet, Pressable} from 'react-native';
import TextTicker from './TextTicker';

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
  onResetWordSpacingByIndex?: (index: number) => void;
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
  onAdjustFontSize
}) => {
  const words = useMemo(() => splitIntoWords(text), [text]);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const lastScale = useRef(1);
  
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
      if (onAdjustSelectedWordSpacing) {
        // Adjust sensitivity: delta is small (e.g. 0.05), spacing is px.
        onAdjustSelectedWordSpacing(delta * 20); 
      }
    } else {
      if (onAdjustFontSize) {
        onAdjustFontSize(delta * 10);
      }
    }
  };

  const renderedWords = useMemo(() => {
    return words.map((word, index) => {
      const doubleIndices = findDoubleLetterIndices(word);
      const perCharExtra = perWordSpacingOverrides[index] || 0;
      const chars = word.split('');
      const isSelected = selectedWordIndex === index;
      const hasCustomSpacing = perCharExtra !== 0;

      return (
        <Pressable
          key={index}
          onPress={() => {
            setSelectedWordIndex(index);
            onSelectWordIndex?.(index);
          }}
          style={{
            flexDirection: 'row',
            marginRight: config.wordSpacing,
            alignItems: 'center',
            backgroundColor: isSelected ? 'rgba(0, 123, 255, 0.2)' : 'transparent',
            borderRadius: 4,
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
          {hasCustomSpacing && (
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
  }, [words, config, perWordSpacingOverrides, hardLettersSet, selectedWordIndex, onSelectWordIndex]);

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
          onPinchStart={handlePinchStart}
          onPinchUpdate={handlePinchUpdate}
        >
          {renderedWords}
        </TextTicker>
      </View>
      <Text 
            style={{justifyContent: 'center', opacity: 0.6, color: config.textColor, textAlign: 'center', paddingTop: 20}}
            onPress={() => {
              setSelectedWordIndex(null);
              onSelectWordIndex && onSelectWordIndex(null);
            }}
          >
            {selectedWordIndex != null
              ? 'Selected word is highlighted in BLUE. Pinch OUT to zoom letters, Pinch IN to shrink. Tap here to deselect.'
              : 'TAP any word to select it (blue highlight), then PINCH to adjust its letter spacing. Pinch in empty space for global font size.'}
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
