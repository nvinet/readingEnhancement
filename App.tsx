/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useMemo, useState, useCallback, useRef, useEffect} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import Reader, {ReaderConfig} from './src/components/Reader';
import SidePanel from './src/components/SidePanel';
import {setBrightness as setNativeBrightness} from './src/native/Brightness';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [inputText, setInputText] = useState<string>('');
  const [perWordSpacingOverrides, setPerWordSpacingOverrides] = useState<Record<number, number>>({});
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState<boolean>(false);
  const [config, setConfig] = useState<ReaderConfig>({
    fontFamily: undefined,
    backgroundColor: '#FFFFFF',
    textColor: '#111111',
    doubleLetterColor: '#D32F2F',
    hardLetters: 'ghkqwxyzGHKQWXYZ', // Default hard letters
    hardLetterExtraSpacing: 2,
    wordSpacing: 8,
    baseFontSize: 20,
  });
  const [brightness, setBrightness] = useState<number>(0); // overlay darkness 0-1
  
  // Separate state for live slider values (used during dragging)
  const [liveValues, setLiveValues] = useState({
    hardLetterExtraSpacing: config.hardLetterExtraSpacing,
    wordSpacing: config.wordSpacing,
    baseFontSize: config.baseFontSize,
    brightness: brightness,
  });

  // Refs for debounce timers
  const debounceTimers = useRef<{[key: string]: NodeJS.Timeout}>({});

  // Debounced update function for config
  const debouncedUpdateConfig = useCallback((key: string, value: number, updateFn: () => void) => {
    // Clear existing timer for this key
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }
    
    // Set new timer
    debounceTimers.current[key] = setTimeout(() => {
      updateFn();
      delete debounceTimers.current[key];
    }, 100); // 100ms debounce
  }, []);

  function updatePerWordSpacing(index: number, delta: number) {
    setPerWordSpacingOverrides(prev => {
      const current = prev[index] || 0;
      const next = Math.max(0, current + delta);
      return {...prev, [index]: next};
    });
  }

  function resetSelectedWordSpacing() {
    if (selectedIndex == null) return;
    setPerWordSpacingOverrides(prev => {
      const next = {...prev};
      delete next[selectedIndex!];
      return next;
    });
  }

  const overlayStyle = useMemo(() => ({
    backgroundColor: `rgba(0,0,0,${liveValues.brightness})`,
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'none' as const,
  }), [liveValues.brightness]);

  // Memoized callbacks to prevent SidePanel re-renders
  const handleChangeFontFamily = useCallback((font: string | undefined) => {
    setConfig(prev => ({...prev, fontFamily: font}));
  }, []);

  const handleChangeBackgroundColor = useCallback((c: string) => {
    setConfig(prev => ({...prev, backgroundColor: c}));
  }, []);

  const handleChangeTextColor = useCallback((c: string) => {
    setConfig(prev => ({...prev, textColor: c}));
  }, []);

  const handleChangeDoubleLetterColor = useCallback((c: string) => {
    setConfig(prev => ({...prev, doubleLetterColor: c}));
  }, []);

  const handleChangeHardLetters = useCallback((letters: string) => {
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

  const handleChangeHardLetterExtraSpacing = useCallback((v: number) => {
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
        const raw = await AsyncStorage.getItem('reader_config_v1');
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
              }));
            }
            if (typeof parsed.brightness === 'number') {
              setBrightness(parsed.brightness);
              setLiveValues((prev) => ({...prev, brightness: parsed.brightness}));
              try { setNativeBrightness(parsed.brightness); } catch (e) { /* noop */ }
            }
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const handleSaveConfiguration = useCallback(async () => {
    try {
      const payload = JSON.stringify({
        config,
        brightness,
      });
      await AsyncStorage.setItem('reader_config_v1', payload);
    } catch (e) {
      // ignore
    }
  }, [config, brightness]);

  const handleChangeWordSpacing = useCallback((v: number) => {
    const clampedValue = Math.max(0, v);
    // Update live value immediately
    setLiveValues(prev => ({...prev, wordSpacing: clampedValue}));
    // Debounce config update
    debouncedUpdateConfig('wordSpacing', clampedValue, () => {
      setConfig(prev => ({...prev, wordSpacing: clampedValue}));
    });
  }, [debouncedUpdateConfig]);

  const handleChangeBaseFontSize = useCallback((v: number) => {
    const clampedValue = Math.max(10, v);
    // Update live value immediately
    setLiveValues(prev => ({...prev, baseFontSize: clampedValue}));
    // Debounce config update
    debouncedUpdateConfig('baseFontSize', clampedValue, () => {
      setConfig(prev => ({...prev, baseFontSize: clampedValue}));
    });
  }, [debouncedUpdateConfig]);

  const handleChangeBrightness = useCallback((v: number) => {
    // Update live value immediately
    setLiveValues(prev => ({...prev, brightness: v}));
    // Debounce brightness and native updates
    debouncedUpdateConfig('brightness', v, () => {
      setBrightness(v);
      try { setNativeBrightness(v); } catch (e) { /* noop */ }
    });
  }, [debouncedUpdateConfig]);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={{flex: 1, backgroundColor: config.backgroundColor}}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={backgroundStyle.backgroundColor} />
        <View style={{flex: 1, backgroundColor: config.backgroundColor, marginTop: 50}}>
          <View style={{padding: 12, borderBottomWidth: 1, borderBottomColor: '#ddd'}}>
            <Text style={{fontWeight: '700', marginBottom: 6}}>Paste or type text:</Text>
            <ScrollView style={{maxHeight: 200}}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                multiline
                placeholder="Paste text here..."
                style={{minHeight: 96, padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#FAFAFA'}}
              />
            </ScrollView>
          </View>
          <View style={{flex: 1, padding: 12}}>
            <Reader
              text={inputText}
              config={config}
              perWordSpacingOverrides={perWordSpacingOverrides}
              onSelectWordIndex={(idx) => setSelectedIndex(idx)}
              onAdjustSelectedWordSpacing={(delta) => {
                if (selectedIndex != null) updatePerWordSpacing(selectedIndex, delta);
              }}
              onAdjustFontSize={(delta) => setConfig(prev => ({...prev, baseFontSize: Math.max(10, prev.baseFontSize + delta)}))}
              onResetSelectedWordSpacing={resetSelectedWordSpacing}
            />
          </View>
          <View style={overlayStyle} />
        </View>

        {/* Floating Settings Button */}
        <Pressable
          onPress={() => setIsPanelVisible(true)}
          style={styles.settingsButton}
        >
          <View style={{width: 26, height: 20, justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={{width: '100%', height: 3, backgroundColor: 'white', borderRadius: 2}} />
            <View style={{width: '100%', height: 3, backgroundColor: 'white', borderRadius: 2}} />
            <View style={{width: '100%', height: 3, backgroundColor: 'white', borderRadius: 2}} />
          </View>
        </Pressable>

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
          hardLetters={config.hardLetters}
          onChangeHardLetters={handleChangeHardLetters}
          hardLetterExtraSpacing={liveValues.hardLetterExtraSpacing}
          onChangeHardLetterExtraSpacing={handleChangeHardLetterExtraSpacing}
          wordSpacing={liveValues.wordSpacing}
          onChangeWordSpacing={handleChangeWordSpacing}
          baseFontSize={liveValues.baseFontSize}
          onChangeBaseFontSize={handleChangeBaseFontSize}
          brightness={liveValues.brightness}
          onChangeBrightness={handleChangeBrightness}
          onSave={handleSaveConfiguration}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
});

export default App;
