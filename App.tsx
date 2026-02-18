/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

import Reader, {ReaderConfig} from './src/components/Reader';
import SettingsButton from './src/components/SettingsButton';
import SidePanel from './src/components/SidePanel';
import {
  DEBOUNCE_DELAY_MS,
  DEFAULT_BASE_FONT_SIZE,
  DEFAULT_HARD_LETTER_SPACING,
  DEFAULT_HARD_LETTERS,
  DEFAULT_MAX_SCROLL_SPEED,
  DEFAULT_WORD_SPACING,
  INPUT_ANIMATION_DURATION_MS,
  INPUT_FIELD_HEIGHT,
  INPUT_MAX_HEIGHT,
  MAX_SCROLL_SPEED,
  MIN_BASE_FONT_SIZE,
  MIN_SCROLL_SPEED,
} from './src/constants/app';
import {
  READER_COLORS,
  THEME_COLORS,
  UI_COLORS,
} from './src/constants/colors';
import {ALERTS, HELP_TEXT} from './src/constants/messages';
import {STORAGE_KEY_READER_CONFIG} from './src/constants/storage';
import {setBrightness as setNativeBrightness} from './src/native/Brightness';

/**
 * Error logging utility
 * TODO: Integrate with error tracking service (Sentry, etc.) in production
 */
function logError(context: string, error: unknown): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[${context}]`, errorMessage, error);
  // TODO: Send to error tracking service in production
  // Example: Sentry.captureException(error, { tags: { context } });
}

/**
 * Show user-facing error alert
 */
function showErrorAlert(title: string, message: string): void {
  Alert.alert(title, message, [{text: 'OK', style: 'default'}]);
}

/**
 * Show success alert
 */
function showSuccessAlert(message: string): void {
  Alert.alert('Success', message, [{text: 'OK', style: 'default'}]);
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = useMemo(
    () => ({
      backgroundColor: isDarkMode ? THEME_COLORS.darker : THEME_COLORS.lighter,
    }),
    [isDarkMode]
  );

  const [inputText, setInputText] = useState<string>('');
  const [perWordFontSizeOverrides, setPerWordFontSizeOverrides] = useState<Record<number, number>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [isInputExpanded, setIsInputExpanded] = useState<boolean>(true);
  const inputExpandProgress = useSharedValue(1);

  const toggleInput = useCallback((): void => {
    const expanding = !isInputExpanded;
    setIsInputExpanded(expanding);
    Keyboard.dismiss();
    inputExpandProgress.value = withTiming(expanding ? 1 : 0, { duration: INPUT_ANIMATION_DURATION_MS });
  }, [isInputExpanded, inputExpandProgress]);

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: inputExpandProgress.value * INPUT_MAX_HEIGHT,
    opacity: inputExpandProgress.value,
    overflow: 'hidden' as const,
  }));
  const [config, setConfig] = useState<ReaderConfig>({
    fontFamily: undefined,
    backgroundColor: READER_COLORS.BACKGROUND,
    textColor: READER_COLORS.TEXT,
    doubleLetterColor: READER_COLORS.DOUBLE_LETTER,
    hardLetters: DEFAULT_HARD_LETTERS,
    hardLetterExtraSpacing: DEFAULT_HARD_LETTER_SPACING,
    wordSpacing: DEFAULT_WORD_SPACING,
    baseFontSize: DEFAULT_BASE_FONT_SIZE,
    maxScrollSpeed: DEFAULT_MAX_SCROLL_SPEED,
    underlineColor: READER_COLORS.UNDERLINE,
  });
  const [brightness, setBrightness] = useState<number>(0); // overlay darkness 0-1
  
  // Separate state for live slider values (used during dragging)
  const [liveValues, setLiveValues] = useState({
    hardLetterExtraSpacing: config.hardLetterExtraSpacing,
    wordSpacing: config.wordSpacing,
    baseFontSize: config.baseFontSize,
    maxScrollSpeed: config.maxScrollSpeed,
    brightness: brightness,
  });

  // Refs for debounce timers
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const textInputRef = useRef<TextInput>(null);

  // Debounced update function for config
  const debouncedUpdateConfig = useCallback((key: string, value: number, updateFn: () => void): void => {
    // Clear existing timer for this key
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }
    
    // Set new timer
    debounceTimers.current[key] = setTimeout(() => {
      updateFn();
      delete debounceTimers.current[key];
    }, DEBOUNCE_DELAY_MS);
  }, []);

  function updatePerWordFontSize(index: number, delta: number): void {
    setPerWordFontSizeOverrides(prev => {
      const current = prev[index] || 0;
      const next = Math.max(0, current + delta);
      return {...prev, [index]: next};
    });
  }

  function resetSelectedWordScale(): void {
    if (selectedIndex == null) return;
    setPerWordFontSizeOverrides(prev => {
      const next = {...prev};
      delete next[selectedIndex!];
      return next;
    });
  }

  function resetWordScaleByIndex(index: number): void {
    setPerWordFontSizeOverrides(prev => {
      const next = {...prev};
      delete next[index];
      return next;
    });
  }

  function resetAllWordScales(): void {
    setPerWordFontSizeOverrides({});
  }

  const overlayStyle = useMemo(
    () => ({
      backgroundColor: `rgba(0,0,0,${liveValues.brightness})`,
      ...styles.overlay,
    }),
    [liveValues.brightness]
  );

  // Memoized callbacks to prevent SidePanel re-renders
  const handleChangeFontFamily = useCallback((font: string | undefined): void => {
    setConfig(prev => ({...prev, fontFamily: font}));
  }, []);

  const handleChangeBackgroundColor = useCallback((c: string): void => {
    setConfig(prev => ({...prev, backgroundColor: c}));
  }, []);

  const handleChangeTextColor = useCallback((c: string): void => {
    setConfig(prev => ({...prev, textColor: c}));
  }, []);

  const handleChangeDoubleLetterColor = useCallback((c: string): void => {
    setConfig(prev => ({...prev, doubleLetterColor: c}));
  }, []);

  const handleChangeUnderlineColor = useCallback((c: string): void => {
    setConfig(prev => ({...prev, underlineColor: c}));
  }, []);

  const handleChangeHardLetters = useCallback((letters: string): void => {
    // Accept any Unicode letter (e.g., ê, æ) and remove duplicates; normalize to NFC
    const normalized = (letters || '').normalize('NFC');
    const uniqueLetters: string[] = [];
    for (const ch of Array.from(normalized)) {
      if (/^\p{L}$/u.test(ch) && !uniqueLetters.includes(ch)) {
        uniqueLetters.push(ch);
      }
    }
    setConfig(prev => ({...prev, hardLetters: uniqueLetters.join('')}));
  }, []);

  const handleChangeHardLetterExtraSpacing = useCallback((v: number): void => {
    const clampedValue = Math.max(0, v);
    // Update live value immediately
    setLiveValues(prev => ({...prev, hardLetterExtraSpacing: clampedValue}));
    // Debounce config update
    debouncedUpdateConfig('hardLetterExtraSpacing', clampedValue, () => {
      setConfig(prev => ({...prev, hardLetterExtraSpacing: clampedValue}));
    });
  }, [debouncedUpdateConfig]);

  // Load saved configuration and brightness on start
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_READER_CONFIG);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            if (parsed.config) {
              setConfig((prev) => ({...prev, ...parsed.config}));
              setLiveValues((prev) => ({
                ...prev,
                hardLetterExtraSpacing: parsed.config.hardLetterExtraSpacing ?? prev.hardLetterExtraSpacing,
                wordSpacing: parsed.config.wordSpacing ?? prev.wordSpacing,
                baseFontSize: parsed.config.baseFontSize ?? prev.baseFontSize,
                maxScrollSpeed: parsed.config.maxScrollSpeed ?? prev.maxScrollSpeed,
              }));
            }
            if (typeof parsed.brightness === 'number') {
              setBrightness(parsed.brightness);
              setLiveValues((prev) => ({...prev, brightness: parsed.brightness}));
              try { 
                setNativeBrightness(parsed.brightness); 
              } catch (e) { 
                logError('SetBrightness', e);
                // Non-critical error - brightness setting failed but app continues
              }
            }
          }
        }
      } catch (e) {
        logError('LoadConfiguration', e);
        showErrorAlert(
          ALERTS.ERROR.LOAD_FAILED.title,
          ALERTS.ERROR.LOAD_FAILED.message
        );
      }
    })();
  }, []);

  const handleSaveConfiguration = useCallback(async (): Promise<void> => {
    try {
      const payload = JSON.stringify({
        config,
        brightness,
      });
      await AsyncStorage.setItem(STORAGE_KEY_READER_CONFIG, payload);
      showSuccessAlert(ALERTS.SUCCESS.CONFIGURATION_SAVED);
    } catch (e) {
      logError('SaveConfiguration', e);
      showErrorAlert(
        ALERTS.ERROR.SAVE_FAILED.title,
        ALERTS.ERROR.SAVE_FAILED.message
      );
    }
  }, [config, brightness]);

  const handleChangeWordSpacing = useCallback((v: number): void => {
    const clampedValue = Math.max(0, v);
    // Update live value immediately
    setLiveValues(prev => ({...prev, wordSpacing: clampedValue}));
    // Debounce config update
    debouncedUpdateConfig('wordSpacing', clampedValue, () => {
      setConfig(prev => ({...prev, wordSpacing: clampedValue}));
    });
  }, [debouncedUpdateConfig]);

  const handleChangeBaseFontSize = useCallback((v: number): void => {
    const clampedValue = Math.max(MIN_BASE_FONT_SIZE, v);
    // Update live value immediately
    setLiveValues(prev => ({...prev, baseFontSize: clampedValue}));
    // Debounce config update
    debouncedUpdateConfig('baseFontSize', clampedValue, () => {
      setConfig(prev => ({...prev, baseFontSize: clampedValue}));
    });
  }, [debouncedUpdateConfig]);

  const handleChangeMaxScrollSpeed = useCallback((v: number): void => {
    const clampedValue = Math.max(MIN_SCROLL_SPEED, Math.min(MAX_SCROLL_SPEED, v));
    setLiveValues(prev => ({...prev, maxScrollSpeed: clampedValue}));
    debouncedUpdateConfig('maxScrollSpeed', clampedValue, () => {
      setConfig(prev => ({...prev, maxScrollSpeed: clampedValue}));
    });
  }, [debouncedUpdateConfig]);

  const handleChangeBrightness = useCallback((v: number): void => {
    // Update live value immediately
    setLiveValues(prev => ({...prev, brightness: v}));
    // Debounce brightness and native updates
    debouncedUpdateConfig('brightness', v, () => {
      setBrightness(v);
      try { 
        setNativeBrightness(v); 
      } catch (e) { 
        logError('UpdateBrightness', e);
        // Non-critical error - brightness overlay still works, native setting failed
      }
    });
  }, [debouncedUpdateConfig]);

  const toggleInputButtonStyle = useMemo(
    () => [
      styles.toggleInputButton,
      {backgroundColor: isInputExpanded ? UI_COLORS.BUTTON_EXPANDED : UI_COLORS.BUTTON_COLLAPSED},
    ],
    [isInputExpanded]
  );

  const containerStyle = useMemo(
    () => [styles.container, {backgroundColor: config.backgroundColor}],
    [config.backgroundColor]
  );

  const safeAreaStyle = useMemo(
    () => [styles.safeArea, {backgroundColor: config.backgroundColor}],
    [config.backgroundColor]
  );

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.flex}>
        <SafeAreaView style={safeAreaStyle}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={containerStyle}>
              <Animated.View style={inputAnimatedStyle}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{HELP_TEXT.INPUT_LABEL}</Text>
                  <ScrollView
                    style={styles.inputScrollView}
                    keyboardShouldPersistTaps="handled">
                    <TextInput
                      ref={textInputRef}
                      value={inputText}
                      onChangeText={setInputText}
                      multiline
                      placeholder={HELP_TEXT.INPUT_PLACEHOLDER}
                      style={styles.textInput}
                    />
                  </ScrollView>
                </View>
              </Animated.View>
              <View style={styles.readerContainer}>
                <Reader
                  text={inputText}
                  config={config}
                  perWordFontSizeOverrides={perWordFontSizeOverrides}
                  onSelectWordIndex={(idx) => {
                    if (idx === null) {
                      Keyboard.dismiss();
                    }
                    setSelectedIndex(idx);
                  }}
                  onAdjustSelectedWordScale={(delta) => {
                    if (selectedIndex != null)
                      updatePerWordFontSize(selectedIndex, delta);
                  }}
                  onAdjustFontSize={(delta) =>
                    setConfig((prev) => ({
                      ...prev,
                      baseFontSize: Math.max(
                        MIN_BASE_FONT_SIZE,
                        prev.baseFontSize + delta
                      ),
                    }))
                  }
                  onResetSelectedWordScale={resetSelectedWordScale}
                  onResetWordScaleByIndex={resetWordScaleByIndex}
                />
              </View>
              <View style={overlayStyle} />
            </View>
          </TouchableWithoutFeedback>

          <Pressable onPress={toggleInput} style={toggleInputButtonStyle}>
            <View style={styles.toggleInputIcon}>
              <View style={styles.toggleInputIconLine} />
              <View style={styles.toggleInputIconArrow} />
            </View>
          </Pressable>

          <SettingsButton
            onPress={() => {
              textInputRef.current?.blur();
              setIsPanelVisible(true);
            }}
          />

        <SidePanel
          visible={isPanelVisible}
          onClose={() => setIsPanelVisible(false)}
          fontFamily={config.fontFamily}
          onChangeFontFamily={handleChangeFontFamily}
          backgroundColor={config.backgroundColor}
          onChangeBackgroundColor={handleChangeBackgroundColor}
          textColor={config.textColor}
          onChangeTextColor={handleChangeTextColor}
          doubleLetterColor={config.doubleLetterColor}
          onChangeDoubleLetterColor={handleChangeDoubleLetterColor}
          underlineColor={config.underlineColor}
          onChangeUnderlineColor={handleChangeUnderlineColor}
          hardLetters={config.hardLetters}
          onChangeHardLetters={handleChangeHardLetters}
          hardLetterExtraSpacing={liveValues.hardLetterExtraSpacing}
          onChangeHardLetterExtraSpacing={handleChangeHardLetterExtraSpacing}
          wordSpacing={liveValues.wordSpacing}
          onChangeWordSpacing={handleChangeWordSpacing}
          baseFontSize={liveValues.baseFontSize}
          onChangeBaseFontSize={handleChangeBaseFontSize}
          maxScrollSpeed={liveValues.maxScrollSpeed}
          onChangeMaxScrollSpeed={handleChangeMaxScrollSpeed}
          brightness={liveValues.brightness}
          onChangeBrightness={handleChangeBrightness}
          onSave={handleSaveConfiguration}
          onResetAllWordScales={resetAllWordScales}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: 50,
  },
  inputContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.BORDER,
  },
  inputLabel: {
    fontWeight: '700',
    marginBottom: 6,
  },
  inputScrollView: {
    maxHeight: INPUT_FIELD_HEIGHT,
  },
  textInput: {
    minHeight: INPUT_FIELD_HEIGHT,
    padding: 8,
    borderWidth: 1,
    borderColor: UI_COLORS.BORDER,
    borderRadius: 8,
    backgroundColor: UI_COLORS.INPUT_BACKGROUND,
    textAlignVertical: 'top',
  },
  readerContainer: {
    flex: 1,
    padding: 12,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  toggleInputButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: UI_COLORS.SHADOW,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  toggleInputIcon: {
    width: 18,
    height: 18,
    transform: [{rotate: '-45deg'}],
    justifyContent: 'flex-end',
  },
  toggleInputIconLine: {
    width: 3,
    height: 14,
    backgroundColor: 'white',
    borderRadius: 1,
  },
  toggleInputIconArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
  },
});

export default App;
