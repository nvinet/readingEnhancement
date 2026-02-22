import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import ColorPickerField from './ColorPickerField';
import {FONT_OPTIONS} from './FontOptions';
import FontPicker from './FontPicker';
import MemoizedSliderField from './MemoizedSliderField';

export type SidePanelProps = {
  visible: boolean;
  onClose: () => void;
  fontFamily: string | undefined;
  onChangeFontFamily: (font: string | undefined) => void;
  backgroundColor: string;
  onChangeBackgroundColor: (c: string) => void;
  textColor: string;
  onChangeTextColor: (c: string) => void;
  doubleLetterColor: string;
  onChangeDoubleLetterColor: (c: string) => void;
  underlineColor: string;
  onChangeUnderlineColor: (c: string) => void;
  hardLetters: string;
  onChangeHardLetters: (letters: string) => void;
  hardLetterExtraSpacing: number;
  onChangeHardLetterExtraSpacing: (v: number) => void;
  wordSpacing: number;
  onChangeWordSpacing: (v: number) => void;
  baseFontSize: number;
  onChangeBaseFontSize: (v: number) => void;
  maxScrollSpeed: number;
  onChangeMaxScrollSpeed: (v: number) => void;
  brightness: number; // 0-1 overlay darkness
  onChangeBrightness: (v: number) => void;
  onSave: () => void;
  onResetAllWordScales: () => void;
};

export const SidePanel: React.FC<SidePanelProps> = ({
  visible,
  onClose,
  fontFamily,
  onChangeFontFamily,
  backgroundColor,
  onChangeBackgroundColor,
  textColor,
  onChangeTextColor,
  doubleLetterColor,
  onChangeDoubleLetterColor,
  underlineColor,
  onChangeUnderlineColor,
  hardLetters,
  onChangeHardLetters,
  hardLetterExtraSpacing,
  onChangeHardLetterExtraSpacing,
  wordSpacing,
  onChangeWordSpacing,
  baseFontSize,
  onChangeBaseFontSize,
  maxScrollSpeed,
  onChangeMaxScrollSpeed,
  brightness,
  onChangeBrightness,
  onSave,
  onResetAllWordScales,
}) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width > 600;
  const slideAnim = useSharedValue(visible ? 0 : 400); // Start off-screen to the right
  const backdropOpacity = useSharedValue(visible ? 1 : 0);
  const [isRendered, setIsRendered] = useState(visible);

  React.useEffect(() => {
    if (visible) {
      setIsRendered(true);
      slideAnim.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      slideAnim.value = withTiming(400, { duration: 250 }, (finished) => {
        if (finished) {
          runOnJS(setIsRendered)(false);
        }
      });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible && !isRendered) {
    return null;
  }

  const panelStyle = [
    styles.panel,
    {
      width: isWide ? '40%' : '85%',
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    panelAnimatedStyle,
  ];

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 1000 }]} pointerEvents={visible ? 'auto' : 'none'}>
      <View style={styles.modalContainer}>
        {/* Backdrop - tap to close */}
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>

        {/* Settings Panel */}
        <Animated.View style={panelStyle}>
          {/* Header with close button */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <FontPicker label="Font" options={FONT_OPTIONS} value={fontFamily} onChange={onChangeFontFamily} />

            <ColorPickerField
              label="Background Color"
              value={backgroundColor}
              onChange={onChangeBackgroundColor}
            />

            <ColorPickerField
              label="Text Color"
              value={textColor}
              onChange={onChangeTextColor}
            />

            <ColorPickerField
              label="Double Letter Color"
              value={doubleLetterColor}
              onChange={onChangeDoubleLetterColor}
            />

            <ColorPickerField
              label="Underline Color"
              value={underlineColor}
              onChange={onChangeUnderlineColor}
            />

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Hard Letters :</Text>
              <TextInput
                value={hardLetters}
                onChangeText={onChangeHardLetters}
                placeholder="Enter letters like: ghkqwxyzGHKQWXYZ"
                style={styles.hardLettersInput}
                multiline={false}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {hardLetters && (
                <View style={styles.activeLettersBox}>
                  <Text style={styles.activeLettersLabel}>
                    Active Hard Letters:
                  </Text>
                  <Text style={styles.activeLettersText}>
                    {hardLetters.split('').join(' ')}
                  </Text>
                </View>
              )}
            </View>

            <MemoizedSliderField
              label="Hard-letter extra spacing"
              value={hardLetterExtraSpacing}
              onChange={onChangeHardLetterExtraSpacing}
              min={0}
              max={20}
              step={1}
            />

            <MemoizedSliderField
              label="Word spacing"
              value={wordSpacing}
              onChange={onChangeWordSpacing}
              min={0}
              max={50}
              step={1}
            />

            <MemoizedSliderField
              label="Base font size"
              value={baseFontSize}
              onChange={onChangeBaseFontSize}
              min={8}
              max={48}
              step={1}
            />

            <MemoizedSliderField
              label="Max scroll speed"
              value={maxScrollSpeed}
              onChange={onChangeMaxScrollSpeed}
              min={0.5}
              max={10}
              step={0.5}
            />

            <MemoizedSliderField
              label="Brightness (overlay %)"
              value={brightness}
              onChange={onChangeBrightness}
              min={0}
              max={1}
              step={0.05}
              displayMultiplier={100}
            />

            <View style={styles.fieldContainer}>
              <TouchableOpacity
                onPress={onResetAllWordScales}
                style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset Custom Sizes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Save Button - Fixed at bottom */}
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity
              onPress={() => {
                onSave();
                onClose();
              }}
              style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
    
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropPressable: {
    flex: 1,
  },
  panel: {
    maxWidth: 400,
    height: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 72,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontWeight: '600',
    marginBottom: 6,
  },
  hardLettersInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  activeLettersBox: {
    marginTop: 6,
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  activeLettersLabel: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  activeLettersText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1976D2',
    letterSpacing: 2,
    marginTop: 2,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ef5350',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  resetButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  saveButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#1976D2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SidePanel;
