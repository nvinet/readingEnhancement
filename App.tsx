/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useEffect, useMemo, useReducer, useRef, useState} from 'react';
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
import * as Brightness from 'expo-brightness';
import * as SplashScreen from 'expo-splash-screen';
import { loadFonts } from './src/utils/fonts';

import Reader from './src/components/Reader';
import SettingsButton from './src/components/SettingsButton';
import SidePanel from './src/components/SidePanel';
import {useDebounce} from './src/hooks/useDebounce';
import {appReducer} from './src/reducers/appReducer';
import {AppState} from './src/types/state';
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

/**
 * Initial application state
 * Used as the default state for the reducer
 */
const initialState: AppState = {
  config: {
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
  },
  brightness: 0, // overlay darkness 0-1
  perWordFontSizeOverrides: {},
  selectedWordIndex: null,
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = useMemo(
    () => ({
      backgroundColor: isDarkMode ? THEME_COLORS.darker : THEME_COLORS.lighter,
    }),
    [isDarkMode]
  );

  // Main state management with useReducer
  const [state, dispatch] = useReducer(appReducer, initialState);

  // UI-only state (not in reducer)
  const [inputText, setInputText] = useState<string>('');
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [isInputExpanded, setIsInputExpanded] = useState<boolean>(true);
  const inputExpandProgress = useSharedValue(1);

  // Live values for sliders (update immediately for responsive UI)
  const [liveWordSpacing, setLiveWordSpacing] = useState(state.config.wordSpacing);
  const [liveHardLetterSpacing, setLiveHardLetterSpacing] = useState(state.config.hardLetterExtraSpacing);
  const [liveBaseFontSize, setLiveBaseFontSize] = useState(state.config.baseFontSize);
  const [liveMaxScrollSpeed, setLiveMaxScrollSpeed] = useState(state.config.maxScrollSpeed);
  const [liveBrightness, setLiveBrightness] = useState(state.brightness);

  // Debounced values (update reducer after delay)
  const debouncedWordSpacing = useDebounce(liveWordSpacing, DEBOUNCE_DELAY_MS);
  const debouncedHardLetterSpacing = useDebounce(liveHardLetterSpacing, DEBOUNCE_DELAY_MS);
  const debouncedBaseFontSize = useDebounce(liveBaseFontSize, DEBOUNCE_DELAY_MS);
  const debouncedMaxScrollSpeed = useDebounce(liveMaxScrollSpeed, DEBOUNCE_DELAY_MS);
  const debouncedBrightness = useDebounce(liveBrightness, DEBOUNCE_DELAY_MS);

  const [fontsLoaded, setFontsLoaded] = useState(false);

  const textInputRef = useRef<TextInput>(null);

  // Sync debounced values to reducer
  useEffect(() => {
    dispatch({ type: 'SET_WORD_SPACING', payload: debouncedWordSpacing });
  }, [debouncedWordSpacing]);

  useEffect(() => {
    dispatch({ type: 'SET_HARD_LETTER_SPACING', payload: debouncedHardLetterSpacing });
  }, [debouncedHardLetterSpacing]);

  useEffect(() => {
    dispatch({ type: 'SET_BASE_FONT_SIZE', payload: debouncedBaseFontSize });
  }, [debouncedBaseFontSize]);

  useEffect(() => {
    dispatch({ type: 'SET_MAX_SCROLL_SPEED', payload: debouncedMaxScrollSpeed });
  }, [debouncedMaxScrollSpeed]);

  useEffect(() => {
    (async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        dispatch({ type: 'SET_BRIGHTNESS', payload: debouncedBrightness });
        try {
          setNativeBrightness(debouncedBrightness);
        } catch (e) {
          logError('UpdateBrightness', e);
          // Non-critical error - brightness overlay still works, native setting failed
        }
      }
    })();
  }, [debouncedBrightness]);

  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

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

  const overlayStyle = useMemo(
    () => ({
      backgroundColor: `rgba(0,0,0,${liveBrightness})`,
      ...styles.overlay,
    }),
    [liveBrightness]
  );

  // Event handlers - now much simpler!
  const handleChangeFontFamily = useCallback((font: string | undefined): void => {
    dispatch({ type: 'SET_FONT_FAMILY', payload: font });
  }, []);

  const handleChangeBackgroundColor = useCallback((c: string): void => {
    dispatch({ type: 'SET_BACKGROUND_COLOR', payload: c });
  }, []);

  const handleChangeTextColor = useCallback((c: string): void => {
    dispatch({ type: 'SET_TEXT_COLOR', payload: c });
  }, []);

  const handleChangeDoubleLetterColor = useCallback((c: string): void => {
    dispatch({ type: 'SET_DOUBLE_LETTER_COLOR', payload: c });
  }, []);

  const handleChangeUnderlineColor = useCallback((c: string): void => {
    dispatch({ type: 'SET_UNDERLINE_COLOR', payload: c });
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
    dispatch({ type: 'SET_HARD_LETTERS', payload: uniqueLetters.join('') });
  }, []);

  // Load saved configuration and brightness on start
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_READER_CONFIG);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            // Load into reducer
            dispatch({ type: 'LOAD_SAVED_STATE', payload: parsed });

            // Sync live values to loaded state
            if (parsed.config) {
              setLiveWordSpacing(parsed.config.wordSpacing ?? liveWordSpacing);
              setLiveHardLetterSpacing(parsed.config.hardLetterExtraSpacing ?? liveHardLetterSpacing);
              setLiveBaseFontSize(parsed.config.baseFontSize ?? liveBaseFontSize);
              setLiveMaxScrollSpeed(parsed.config.maxScrollSpeed ?? liveMaxScrollSpeed);
            }

            if (typeof parsed.brightness === 'number') {
              (async () => {
                const { status } = await Brightness.requestPermissionsAsync();
                if (status === 'granted') {
                  setLiveBrightness(parsed.brightness);
                  try {
                    setNativeBrightness(parsed.brightness);
                  } catch (e) {
                    logError('SetBrightness', e);
                    // Non-critical error - brightness setting failed but app continues
                  }
                }
              })();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleSaveConfiguration = useCallback(async (): Promise<void> => {
    try {
      const payload = JSON.stringify({
        config: state.config,
        brightness: state.brightness,
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
  }, [state.config, state.brightness]);

  const toggleInputButtonStyle = useMemo(
    () => [
      styles.toggleInputButton,
      {backgroundColor: isInputExpanded ? UI_COLORS.BUTTON_EXPANDED : UI_COLORS.BUTTON_COLLAPSED},
    ],
    [isInputExpanded]
  );

  const containerStyle = useMemo(
    () => [styles.container, {backgroundColor: state.config.backgroundColor}],
    [state.config.backgroundColor]
  );

  const safeAreaStyle = useMemo(
    () => [styles.safeArea, {backgroundColor: state.config.backgroundColor}],
    [state.config.backgroundColor]
  );

  if (!fontsLoaded) {
    return null;
  }

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
                  config={state.config}
                  perWordFontSizeOverrides={state.perWordFontSizeOverrides}
                  onSelectWordIndex={(idx) => {
                    if (idx === null) {
                      Keyboard.dismiss();
                    }
                    dispatch({ type: 'SELECT_WORD', payload: idx });
                  }}
                  onAdjustSelectedWordScale={(delta) => {
                    if (state.selectedWordIndex != null) {
                      dispatch({
                        type: 'ADJUST_WORD_FONT_SIZE',
                        payload: { index: state.selectedWordIndex, delta },
                      });
                    }
                  }}
                  onAdjustFontSize={(delta) => {
                    const newSize = state.config.baseFontSize + delta;
                    setLiveBaseFontSize(newSize);
                  }}
                  onResetSelectedWordScale={() => {
                    if (state.selectedWordIndex != null) {
                      dispatch({ type: 'RESET_WORD_FONT_SIZE', payload: state.selectedWordIndex });
                    }
                  }}
                  onResetWordScaleByIndex={(index) => {
                    dispatch({ type: 'RESET_WORD_FONT_SIZE', payload: index });
                  }}
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
            fontFamily={state.config.fontFamily}
            onChangeFontFamily={handleChangeFontFamily}
            backgroundColor={state.config.backgroundColor}
            onChangeBackgroundColor={handleChangeBackgroundColor}
            textColor={state.config.textColor}
            onChangeTextColor={handleChangeTextColor}
            doubleLetterColor={state.config.doubleLetterColor}
            onChangeDoubleLetterColor={handleChangeDoubleLetterColor}
            underlineColor={state.config.underlineColor}
            onChangeUnderlineColor={handleChangeUnderlineColor}
            hardLetters={state.config.hardLetters}
            onChangeHardLetters={handleChangeHardLetters}
            hardLetterExtraSpacing={liveHardLetterSpacing}
            onChangeHardLetterExtraSpacing={setLiveHardLetterSpacing}
            wordSpacing={liveWordSpacing}
            onChangeWordSpacing={setLiveWordSpacing}
            baseFontSize={liveBaseFontSize}
            onChangeBaseFontSize={setLiveBaseFontSize}
            maxScrollSpeed={liveMaxScrollSpeed}
            onChangeMaxScrollSpeed={setLiveMaxScrollSpeed}
            brightness={liveBrightness}
            onChangeBrightness={setLiveBrightness}
            onSave={handleSaveConfiguration}
            onResetAllWordScales={() => dispatch({ type: 'RESET_ALL_WORD_FONT_SIZES' })}
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
