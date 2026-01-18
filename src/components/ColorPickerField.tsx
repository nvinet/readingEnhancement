import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import ColorPicker, { Panel1, Preview, OpacitySlider, HueSlider } from 'reanimated-color-picker';

type ColorPickerFieldProps = {
  label: string;
  value: string;
  onChange: (color: string) => void;
};

const ColorPickerField = React.memo(({ label, value, onChange }: ColorPickerFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={{marginBottom: 12}}>
      <Text style={{fontWeight: '600', marginBottom: 6}}>{label}</Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: value,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ddd',
            marginRight: 12,
          }}
        />
        <Pressable
          onPress={() => setIsVisible(true)}
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
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
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
              value={value}
              onCompleteJS={(colors) => {
                onChange(colors.hex);
                setIsVisible(false);
              }}
            >
              <Preview />
              <Panel1 />
              <HueSlider />
              <OpacitySlider />
            </ColorPicker>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 15}}>
              <Pressable
                onPress={() => setIsVisible(false)}
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
});

export default ColorPickerField;
