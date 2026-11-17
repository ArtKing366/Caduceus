
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CameraScreen from '../screens/CameraScreen';
import IngredientEntryScreen from '../screens/IngredientEntryScreen';
import MacroSummaryScreen from '../screens/MacroSummaryScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
      />

      <Stack.Screen
        name="Registration"
        component={RegistrationScreen}
      />

      <Stack.Screen
        name="Preferences"
        component={PreferencesScreen}
      />

      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
      />

      <Stack.Screen
        name="Camera"
        component={CameraScreen}
      />
        <Stack.Screen
  name="IngredientEntry"
  component={IngredientEntryScreen}
        />
        <Stack.Screen
  name="MacroSummary"
  component={MacroSummaryScreen}
/>
    </Stack.Navigator>
  );
}
