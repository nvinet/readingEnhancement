import * as Font from 'expo-font';

export const loadFonts = async () => {
  await Font.loadAsync({
    'OpenDyslexic-Bold': require('../assets/fonts/OpenDyslexic-Bold_4192668054.otf'),
    'OpenDyslexic-BoldItalic': require('../assets/fonts/OpenDyslexic-BoldItalic_2748562162.otf'),
    'OpenDyslexic-Italic': require('../assets/fonts/OpenDyslexic-Italic_2758667117.otf'),
    'OpenDyslexicAlta-Regular': require('../assets/fonts/OpenDyslexicAlta-Regular_3900816240.otf'),
    'OpenDyslexicAlta-Bold': require('../assets/fonts/OpenDyslexicAlta-Bold_2996475932.otf'),
    'OpenDyslexicAlta-BoldItalic': require('../assets/fonts/OpenDyslexicAlta-BoldItalic_3501229432.otf'),
    'OpenDyslexicAlta-Italic': require('../assets/fonts/OpenDyslexicAlta-Italic_2636942835.otf'),
    'OpenDyslexicMono-Regular': require('../assets/fonts/OpenDyslexicMono-Regular_1062049671.otf'),
  });
};