import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {FontOption} from './FontOptions';

type FontPickerProps = {
  label: string;
  value: string | undefined;
  options: FontOption<string | undefined>[];
  onChange: (value: string | undefined) => void;
};

const FontPicker = React.memo(
  ({label, value, options, onChange}: FontPickerProps) => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value) || options[0];

    const pickerButtonStyle = [
      styles.pickerButton,
      {borderColor: isDropdownVisible ? '#1976D2' : '#ddd'},
    ];

    const arrowStyle = {
      ...styles.arrow,
      transform: [{rotate: isDropdownVisible ? '180deg' : '0deg'}],
    };

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>

        <View style={styles.relative}>
          <Pressable
            onPress={() => setIsDropdownVisible(!isDropdownVisible)}
            style={pickerButtonStyle}>
            <Text
              style={[
                styles.selectedText,
                {fontFamily: selectedOption?.value},
              ]}>
              {selectedOption?.label ?? 'Select'}
            </Text>
            <Text style={arrowStyle}>▼</Text>
          </Pressable>

          {isDropdownVisible && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.scrollView} nestedScrollEnabled={true}>
                {options.map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      onChange(item.value);
                      setIsDropdownVisible(false);
                    }}
                    style={[
                      styles.option,
                      {
                        backgroundColor:
                          value === item.value ? '#1976D2' : 'transparent',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          fontFamily: item.value,
                          color: value === item.value ? 'white' : 'black',
                        },
                      ]}>
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionPreview,
                        {
                          fontFamily: item.value,
                          color: value === item.value ? '#e3f2fd' : '#666',
                        },
                      ]}>
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
            style={styles.overlay}
            onPress={() => setIsDropdownVisible(false)}
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    zIndex: 1000,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  relative: {
    position: 'relative',
  },
  pickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    flex: 1,
  },
  arrow: {
    color: '#666',
    fontSize: 16,
  },
  dropdown: {
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
  },
  scrollView: {
    maxHeight: 300,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionLabel: {
    fontSize: 16,
  },
  optionPreview: {
    fontSize: 12,
    marginTop: 2,
  },
  overlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
});

export default FontPicker;