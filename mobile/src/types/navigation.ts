
import type { RecipeSummary } from './nutrition';

export type RootStackParamList = {
  Welcome: undefined;
  Registration: undefined;
  Preferences: undefined;
  Limitations: undefined;
  Dashboard: undefined;
  Camera: undefined;
  IngredientEntry: undefined;

  MacroSummary: {
    summary?: RecipeSummary;
  } | undefined;

  PreferenceSettingsScreen: undefined;
  RestaurantSearch: undefined;
  RestaurantMenu: undefined;
  DishDetails: undefined;
  IngredientStores: undefined;
  StoreOptions: undefined;
  CookingInstructions: undefined;
  Settings: undefined;
  Security: undefined;
  PersonalInformation: undefined;
  DailyGoals: undefined;
};
