
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';

import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    'ClashDisplay-Bold': require('./assets/fonts/ClashDisplay-Bold.otf'),
    'ClashDisplay-Medium': require('./assets/fonts/ClashDisplay-Medium.otf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
