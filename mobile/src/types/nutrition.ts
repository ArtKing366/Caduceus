
export type NutritionData = {
  protein: number;
  fats: number;
  carbs: number;
  fiber: number;
  calories: number;
};

export type DietaryTags = {
  lactoseFree: boolean;
  sugarFree: boolean;
  glutenFree: boolean;
  vegan: boolean;
};

export type RecipeSummary = {
  recipeName: string;
  recipeCategory: string;
  nutrition: NutritionData;
  dietaryTags: DietaryTags;
  photoUri?: string;
};
