import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import ColorPicker, {
  HueSlider,
  OpacitySlider,
  Panel1,
  Preview,
} from 'reanimated-color-picker';

type ColorPickerFieldProps = {
  label: string;
  value: string;
  onChange: (color: string) => void;
};

const ColorPickerField = React.memo(
  ({label, value, onChange}: ColorPickerFieldProps) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.row}>
          <View
            style={[
              styles.colorPreview,
              {backgroundColor: value},
            ]}
          />
          <Pressable
            onPress={() => setIsVisible(true)}
            style={styles.chooseButton}>
            <Text style={styles.chooseButtonText}>Choose Color</Text>
          </Pressable>
        </View>

        <Modal
          visible={isVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{label}</Text>

              <ColorPicker
                style={styles.colorPicker}
                value={value}
                onCompleteJS={(colors) => {
                  onChange(colors.hex);
                  setIsVisible(false);
                }}>
                <Preview />
                <Panel1 />
                <HueSlider />
                <OpacitySlider />
              </ColorPicker>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setIsVisible(false)}
                  style={styles.cancelButton}>
                  <Text>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 12,
  },
  chooseButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1976D2',
    borderRadius: 6,
  },
  chooseButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  colorPicker: {
    width: '100%',
    height: 250,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
});

export default ColorPickerField;
