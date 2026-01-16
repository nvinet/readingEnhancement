import React, { useState } from 'react';
import {ScrollView, Text, View, Pressable, Modal, TextInput, TouchableOpacity, useWindowDimensions} from 'react-native';
import ColorPicker, { Panel1, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, runOnJS, clamp, withTiming } from 'react-native-reanimated';
import {PanGestureHandler, PanGestureHandlerGestureEvent} from 'react-native-gesture-handler';

// Memoized Slider Component that won't re-render unless its specific props change
const MemoizedSliderField = React.memo(({
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 100, 
  step = 1,
  displayMultiplier = 1
}: {
  label: string; 
  value: number; 
  onChange: (n: number) => void; 
  min?: number; 
  max?: number; 
  step?: number;
  displayMultiplier?: number;
}) => {
  const SLIDER_WIDTH = 180;
  const sliderProgress = useSharedValue(((value - min) / (max - min)) * SLIDER_WIDTH);

  const updateValue = (progress: number) => {
    const normalizedProgress = progress / SLIDER_WIDTH;
    const newValue = min + normalizedProgress * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    onChange(clampedValue);
  };

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startValue: number }
  >({
    onStart: (_, context) => {
      context.startValue = sliderProgress.value;
    },
    onActive: (event, context) => {
      const newProgress = clamp(context.startValue + event.translationX, 0, SLIDER_WIDTH);
      sliderProgress.value = newProgress;
      runOnJS(updateValue)(newProgress);
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sliderProgress.value }],
    };
  });

  // Update slider position when value changes externally
  React.useEffect(() => {
    sliderProgress.value = ((value - min) / (max - min)) * SLIDER_WIDTH;
  }, [value, min, max, sliderProgress]);

  return (
    <View style={{marginBottom: 12}}>
      <Text style={{fontWeight: '600', marginBottom: 6}}>
        {label}: {Math.round(value * displayMultiplier)}
      </Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Pressable 
          onPress={() => onChange(Math.max(min, value - step))} 
          style={{
            padding: 8, 
            backgroundColor: '#e0e0e0', 
            borderRadius: 6, 
            marginRight: 12,
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text style={{fontSize: 16, fontWeight: '600'}}>-</Text>
        </Pressable>
        
        <View style={{width: SLIDER_WIDTH, height: 40, justifyContent: 'center'}}>
          <View style={{
            height: 4,
            backgroundColor: '#e0e0e0',
            borderRadius: 2,
            width: SLIDER_WIDTH,
          }} />
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View 
              style={[
                {
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  backgroundColor: '#1976D2',
                  borderRadius: 10,
                  top: 10,
                  marginLeft: -10,
                },
                thumbStyle
              ]}
            />
          </PanGestureHandler>
        </View>
        
        <Pressable 
          onPress={() => onChange(Math.min(max, value + step))} 
          style={{
            padding: 8, 
            backgroundColor: '#e0e0e0', 
            borderRadius: 6, 
            marginLeft: 12,
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text style={{fontSize: 16, fontWeight: '600'}}>+</Text>
        </Pressable>
      </View>
    </View>
  );
});

// FontPicker Component with Dropdown
const FontPicker = React.memo(({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string | undefined;
  options: Option<string | undefined>[];
  onChange: (value: string | undefined) => void;
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value) || options[0];
  
  return (
    <View style={{marginBottom: 12, zIndex: 1000}}>
      <Text style={{fontWeight: '600', marginBottom: 6}}>{label}</Text>
      
      <View style={{position: 'relative'}}>
        <Pressable
          onPress={() => setIsDropdownVisible(!isDropdownVisible)}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDropdownVisible ? '#1976D2' : '#ddd',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text 
            style={{
              fontSize: 16,
              fontFamily: selectedOption.value,
              flex: 1,
            }}
          >
            {selectedOption.label}
          </Text>
          <Text style={{
            color: '#666', 
            fontSize: 16,
            transform: [{rotate: isDropdownVisible ? '180deg' : '0deg'}]
          }}>
            ▼
          </Text>
        </Pressable>

        {isDropdownVisible && (
          <View style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ddd',
            marginTop: 4,
            maxHeight: 300,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            zIndex: 1001,
          }}>
            <ScrollView style={{maxHeight: 300}} nestedScrollEnabled={true}>
              {options.map((item) => (
                <Pressable
                  key={String(item.value)}
                  onPress={() => {
                    onChange(item.value);
                    setIsDropdownVisible(false);
                  }}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: value === item.value ? '#1976D2' : 'transparent',
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f0f0',
                  }}
                >
                  <Text 
                    style={{
                      fontSize: 16,
                      fontFamily: item.value,
                      color: value === item.value ? 'white' : 'black',
                    }}
                  >
                    {item.label}
                  </Text>
                  {/* Show preview text in the font */}
                  <Text 
                    style={{
                      fontSize: 12,
                      fontFamily: item.value,
                      color: value === item.value ? '#e3f2fd' : '#666',
                      marginTop: 2,
                    }}
                  >
                    The quick brown fox jumps
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Invisible overlay to close dropdown when clicking outside */}
      {isDropdownVisible && (
        <Pressable 
          style={{
            position: 'absolute',
            top: 0,
            left: -1000,
            right: -1000,
            bottom: -1000,
            zIndex: 999,
          }}
          onPress={() => setIsDropdownVisible(false)}
        />
      )}
    </View>
  );
});

type Option<T extends string | undefined> = { label: string; value: T };

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
  hardLetters: string;
  onChangeHardLetters: (letters: string) => void;
  hardLetterExtraSpacing: number;
  onChangeHardLetterExtraSpacing: (v: number) => void;
  wordSpacing: number;
  onChangeWordSpacing: (v: number) => void;
  baseFontSize: number;
  onChangeBaseFontSize: (v: number) => void;
  brightness: number; // 0-1 overlay darkness
  onChangeBrightness: (v: number) => void;
  onSave: () => void;
};

const FONT_OPTIONS: Option<string | undefined>[] = [
  { label: 'System', value: undefined },
  { label: 'Serif', value: 'Times New Roman' },
  { label: 'Sans', value: 'Helvetica' },
  { label: 'Monospace', value: 'Courier New' },
  // OpenDyslexic fonts (using the actual PostScript names)
  { label: 'OpenDyslexic Bold', value: 'OpenDyslexic-Bold' },
  { label: 'OpenDyslexic Italic', value: 'OpenDyslexic-Italic' },
  { label: 'OpenDyslexic Bold Italic', value: 'OpenDyslexic-BoldItalic' },
  { label: 'OpenDyslexicAlta Regular', value: 'OpenDyslexicAlta-Regular' },
  { label: 'OpenDyslexicAlta Bold', value: 'OpenDyslexicAlta-Bold' },
  { label: 'OpenDyslexicAlta Italic', value: 'OpenDyslexicAlta-Italic' },
  { label: 'OpenDyslexicAlta Bold Italic', value: 'OpenDyslexicAlta-BoldItalic' },
  { label: 'OpenDyslexicMono', value: 'OpenDyslexicMono-Regular' },
];

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
  hardLetters,
  onChangeHardLetters,
  hardLetterExtraSpacing,
  onChangeHardLetterExtraSpacing,
  wordSpacing,
  onChangeWordSpacing,
  baseFontSize,
  onChangeBaseFontSize,
  brightness,
  onChangeBrightness,
  onSave,
}) => {
  console.log('SidePanel render');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isWide = width > 600;


  function ColorPickerField({label, color, onChange, pickerId}: {label: string; color: string; onChange: (color: string) => void; pickerId: string}) {
    return (
      <View style={{marginBottom: 12}}>
        <Text style={{fontWeight: '600', marginBottom: 6}}>{label}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: color,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#ddd',
              marginRight: 12,
            }}
          />
          <Pressable
            onPress={() => setShowColorPicker(pickerId)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: '#1976D2',
              borderRadius: 6,
            }}
          >
            <Text style={{color: 'white', fontWeight: '600'}}>Choose Color</Text>
          </Pressable>
        </View>
        
        <Modal
          visible={showColorPicker === pickerId}
          transparent={true}
          animationType="slide"
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
            <View style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 12,
              width: '80%',
              maxWidth: 350,
            }}>
              <Text style={{fontSize: 18, fontWeight: '600', marginBottom: 15}}>{label}</Text>
              
              <ColorPicker
                style={{ width: '100%', height: 250 }}
                value={color}
                onCompleteJS={(colors) => {
                  onChange(colors.hex);
                  setShowColorPicker(null);
                }}
              >
                <Preview />
                <Panel1 />
                <HueSlider />
                <OpacitySlider />
                {/* <Swatches 
                  colors={[
                    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
                    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
                    '#F6F8FA', '#FAF3DD', '#FFF3E0', '#EFEFEF', '#FFEBEE',
                    '#E3F2FD', '#222222', '#555555', '#888888', '#1A237E'
                  ]}
                /> */}
              </ColorPicker>
              
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 15}}>
                <Pressable
                  onPress={() => setShowColorPicker(null)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: '#e0e0e0',
                    borderRadius: 6,
                  }}
                >
                  <Text>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  const slideAnim = useSharedValue(visible ? 0 : 400); // Start off-screen to the right
  const backdropOpacity = useSharedValue(visible ? 1 : 0);

  React.useEffect(() => {
    if (visible) {
      slideAnim.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      slideAnim.value = withTiming(400, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible && slideAnim.value >= 400) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
      }}>
        {/* Backdrop - tap to close */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
            backdropAnimatedStyle,
          ]}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={onClose}
          />
        </Animated.View>

        {/* Settings Panel */}
        <Animated.View style={[
          {
            width: isWide ? '40%' : '85%',
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
          panelAnimatedStyle,
        ]}>
          {/* Header with close button */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
          }}>
            <Text style={{fontSize: 20, fontWeight: '700'}}>Settings</Text>
            <Pressable
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#f5f5f5',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{fontSize: 20, fontWeight: '600', color: '#666'}}>×</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 72}}>
            <FontPicker label="Font" options={FONT_OPTIONS} value={fontFamily} onChange={onChangeFontFamily} />

            <ColorPickerField
              label="Background Color"
              color={backgroundColor}
              onChange={onChangeBackgroundColor}
              pickerId="background"
            />

            <ColorPickerField
              label="Text Color"
              color={textColor}
              onChange={onChangeTextColor}
              pickerId="text"
            />

            <ColorPickerField
              label="Double Letter Color"
              color={doubleLetterColor}
              onChange={onChangeDoubleLetterColor}
              pickerId="doubleLetters"
            />

            <View style={{marginBottom: 12}}>
              <Text style={{fontWeight: '600', marginBottom: 6}}>Hard Letters :</Text>
              <TextInput
                value={hardLetters}
                onChangeText={onChangeHardLetters}
                placeholder="Enter letters like: ghkqwxyzGHKQWXYZ"
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  backgroundColor: '#FAFAFA',
                  fontFamily: 'monospace',
                  fontSize: 14,
                }}
                multiline={false}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {hardLetters && (
                <View style={{
                  marginTop: 6,
                  padding: 8,
                  backgroundColor: '#e3f2fd',
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: '#1976D2',
                }}>
                  <Text style={{fontSize: 12, color: '#1976D2', fontWeight: '600'}}>
                    Active Hard Letters:
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    fontFamily: 'monospace',
                    color: '#1976D2',
                    letterSpacing: 2,
                    marginTop: 2,
                  }}>
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
              label="Brightness (overlay %)"
              value={brightness}
              onChange={onChangeBrightness}
              min={0}
              max={1}
              step={0.05}
              displayMultiplier={100}
            />
          </ScrollView>

          {/* Save Button - Fixed at bottom */}
          <View style={{
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: '#eee',
            backgroundColor: 'white',
          }}>
            <TouchableOpacity
              onPress={() => {
                onSave();
                onClose();
              }}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
                backgroundColor: '#1976D2',
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{color: 'white', fontWeight: '700', fontSize: 16}}>Save Configuration</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SidePanel;
