import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { FontOption } from './FontOptions';


type FontPickerProps = {
  label: string;
  value: string | undefined;
  options: FontOption<string | undefined>[];
  onChange: (value: string | undefined) => void;
};

const FontPicker = React.memo(({
  label,
  value,
  options,
  onChange
}: FontPickerProps) => {
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
              fontFamily: selectedOption?.value,
              flex: 1,
            }}
          >
            {selectedOption?.label ?? 'Select'}
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
              {options.map((item, index) => (
                <Pressable
                  key={index}
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
            top: -1000,
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

export default FontPicker;