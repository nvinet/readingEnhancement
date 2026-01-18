import React from 'react';
import { Pressable, StyleSheet, View } from "react-native";

export type SettingsButtonProps = {
    onPress: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onPress }) => {
  return (
    <Pressable
        onPress={onPress}
        style={styles.settingsButton}
    >
        <View style={styles.button}>
            <View style={styles.line} />
            <View style={styles.line} />
            <View style={styles.line} />
        </View>
    </Pressable>);

  };

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
  button:{
    width: 26, 
    height: 20, 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  line: {
    width: '100%',
    height: 3,
    backgroundColor: 'white',
    borderRadius: 2
  }
});

export default SettingsButton;