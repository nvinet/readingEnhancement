import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {runOnJS, useAnimatedReaction, useSharedValue} from 'react-native-reanimated';

import Controller, {ControllerHandle} from './Controller';
import TextTicker, {TextTickerHandle} from './TextTicker';
import {
  DEFAULT_HARD_LETTERS,
  DOUBLE_TAP_THRESHOLD_MS,
  MIN_FONT_SIZE,
  PINCH_SENSITIVITY_FONT_SIZE,
  PINCH_SENSITIVITY_WORD_SPACING,
  TICKER_BAND_HEIGHT,
} from '../constants/app';
import {UI_COLORS} from '../constants/colors';
import {HELP_TEXT} from '../constants/messages';

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
      indices.push(i, i + 1); // color both letters of the pair
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
  const effectiveFontSize = Math.max(MIN_FONT_SIZE, config.baseFontSize + fontSizeDelta);

  const lastTap = useRef<number>(0);
  const handlePress = () => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_THRESHOLD_MS) {
      onReset?.(index);
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      onSelect?.(index);
    }
  };

  const wordContainerStyle = [
    wordStyles.wordContainer,
    {marginRight: config.wordSpacing},
    isSelected && wordStyles.wordContainerSelected,
    isSelected && {
      borderRadius: 100,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
  ];

  const underlineStyle = [
    wordStyles.underline,
    {backgroundColor: config.underlineColor},
  ];

  return (
    <Pressable
      onPress={handlePress}
      onLayout={(e) => {
        const {x, width} = e.nativeEvent.layout;
        onWordLayout?.(x, width);
      }}
      style={wordContainerStyle}>
      {chars.map((ch, i) => {
        const isDoubleColored = doubleIndices.includes(i);
        const isHard = hardLettersSet.has(ch);
        const hardLetterSpacing = isHard ? config.hardLetterExtraSpacing : 0;

        return (
          <Text
            key={i}
            style={{
              color: isDoubleColored
                ? config.doubleLetterColor
                : config.textColor,
              fontFamily: config.fontFamily,
              fontSize: effectiveFontSize,
              marginHorizontal: hardLetterSpacing,
            }}>
            {ch}
          </Text>
        );
      })}
      {hasCustomScale && <View style={wordStyles.customScaleIndicator} />}
      {isCentered && <View style={underlineStyle} />}
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
        onAdjustSelectedWordScale(delta * PINCH_SENSITIVITY_WORD_SPACING); 
      }
    } else {
      if (onAdjustFontSize) {
        onAdjustFontSize(delta * PINCH_SENSITIVITY_FONT_SIZE);
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
      <Controller
        ref={controllerRef}
        speed={speed}
        maxSpeed={config.maxScrollSpeed}
        onReset={() => tickerRef.current?.reset()}
      />
      <Text style={[styles.helpText, {color: config.textColor}]}>
        {HELP_TEXT.READER_INSTRUCTIONS}
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
    height: TICKER_BAND_HEIGHT,
    width: '100%',
    justifyContent: 'center',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderWidth: 1,
    borderColor: UI_COLORS.BORDER,
    borderRadius: 8,
    backgroundColor: UI_COLORS.INPUT_BACKGROUND,
  },
  helpText: {
    justifyContent: 'center',
    opacity: 0.6,
    textAlign: 'center',
    paddingTop: 20,
  },
});

const wordStyles = StyleSheet.create({
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.TRANSPARENT,
    borderRadius: 4,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  wordContainerSelected: {
    backgroundColor: UI_COLORS.SELECTION_BACKGROUND,
  },
  customScaleIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: UI_COLORS.SCALE_INDICATOR,
  },
  underline: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
  },
});

export default Reader;
