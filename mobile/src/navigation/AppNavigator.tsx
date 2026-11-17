
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/WelcomeScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CameraScreen from '../screens/CameraScreen';
import IngredientEntryScreen from '../screens/IngredientEntryScreen';
import MacroSummaryScreen from '../screens/MacroSummaryScreen';
import PreferenceSettingsScreen from '../screens/PreferenceSettingsScreen';
import LimitationsScreen from '../screens/LimitationsScreen';
import RestaurantSearchScreen from '../screens/RestaurantSearchScreen';
import RestaurantMenuScreen from '../screens/RestaurantMenuScreen';
import DishDetailsScreen from '../screens/DishDetailsScreen';
import IngredientStoresScreen from '../screens/IngredientStoresScreen';
import StoreOptionsScreen from '../screens/StoreOptionsScreen';
import CookingInstructionsScreen from '../screens/CookingInstructionsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SecurityScreen from '../screens/SecurityScreen';
import PersonalInformationScreen from '../screens/PersonalInformationScreen';
import DailyGoalsScreen from '../screens/DailyGoalsScreen';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="IngredientEntry" component={IngredientEntryScreen} />
      <Stack.Screen name="MacroSummary" component={MacroSummaryScreen} />
      <Stack.Screen
  name="Limitations"
  component={LimitationsScreen}
/>
      <Stack.Screen
        name="PreferenceSettingsScreen"
        component={PreferenceSettingsScreen}
      />
      <Stack.Screen
  name="RestaurantSearch"
  component={RestaurantSearchScreen}
/>
      <Stack.Screen
  name="RestaurantMenu"
  component={RestaurantMenuScreen}
/>
<Stack.Screen
  name="DishDetails"
  component={DishDetailsScreen}
/>
<Stack.Screen
  name="IngredientStores"
  component={IngredientStoresScreen}
/>
<Stack.Screen
  name="StoreOptions"
  component={StoreOptionsScreen}
/>
<Stack.Screen
  name="CookingInstructions"
  component={CookingInstructionsScreen}
/>
<Stack.Screen
  name="Settings"
  component={SettingsScreen}
/>
<Stack.Screen
  name="Security"
  component={SecurityScreen}
/>
<Stack.Screen
  name="PersonalInformation"
  component={PersonalInformationScreen}
/>
<Stack.Screen
  name="DailyGoals"
  component={DailyGoalsScreen}
/>
    </Stack.Navigator>
  );
}
