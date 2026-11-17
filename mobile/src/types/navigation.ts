import type { RecipeSummary } from './nutrition';

export type RootStackParamList = {
  Welcome: undefined;
  Registration: undefined;
  Preferences: undefined;
  Dashboard: undefined;
  Camera: undefined;
  IngredientEntry: undefined;

  MacroSummary: {
    summary?: RecipeSummary;
  } | undefined;
};