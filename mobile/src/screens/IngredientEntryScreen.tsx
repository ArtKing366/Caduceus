
import { useRef, useState } from 'react';

import {
  View,
  Text,
  Image,
  ImageBackground,
  TextInput,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import IngredientInput from '../components/IngredientInput';
import OffsetButton from '../components/OffsetButton';

import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'IngredientEntry'
>;

type Ingredient = {
  id: number;
  name: string;
  amount: string;
  unit: 'g' | 'ml';
};

export default function IngredientEntryScreen({
  navigation,
}: Props) {
  const nextIngredientId = useRef(5);

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: '', amount: '', unit: 'g' },
    { id: 2, name: '', amount: '', unit: 'g' },
    { id: 3, name: '', amount: '', unit: 'g' },
    { id: 4, name: '', amount: '', unit: 'g' },
  ]);

  const [recipeName, setRecipeName] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('');

  function addIngredient() {
    const newIngredient: Ingredient = {
      id: nextIngredientId.current,
      name: '',
      amount: '',
      unit: 'g',
    };

    nextIngredientId.current += 1;

    setIngredients(previous => [
      ...previous,
      newIngredient,
    ]);
  }

  function updateIngredient(
    id: number,
    field: 'name' | 'amount' | 'unit',
    value: string,
  ) {
    setIngredients(previous =>
      previous.map(ingredient => {
        if (ingredient.id !== id) {
          return ingredient;
        }

        if (field === 'name') {
          return { ...ingredient, name: value };
        }

        if (field === 'amount') {
          return { ...ingredient, amount: value };
        }

        return {
          ...ingredient,
          unit: value as 'g' | 'ml',
        };
      }),
    );
  }

  function submitRecipe() {
    const completedIngredients = ingredients.filter(
      ingredient =>
        ingredient.name.trim() !== '' &&
        ingredient.amount.trim() !== '',
    );

    if (completedIngredients.length === 0) {
      Alert.alert(
        'Add ingredients',
        'Please enter at least one ingredient and its quantity.',
      );
      return;
    }

    if (!recipeName.trim()) {
      Alert.alert(
        'Recipe name',
        'Please enter a name for your recipe.',
      );
      return;
    }

    // Temporary preview data.
    // Later, the backend will calculate these values.

    navigation.navigate('MacroSummary', {
      summary: {
        recipeName: recipeName.trim(),
        recipeCategory: recipeCategory.trim(),

        nutrition: {
          protein: 24,
          fats: 12,
          carbs: 35,
          fiber: 6,
          calories: 340,
        },

        dietaryTags: {
          lactoseFree: false,
          sugarFree: false,
          glutenFree: false,
          vegan: false,
        },
      },
    });
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page title */}
        <Text style={styles.title}>Caduceus</Text>

        {/* Ingredient list */}
        <View style={styles.ingredientsSection}>
          <ScrollView
            style={styles.ingredientsList}
            contentContainerStyle={styles.ingredientsListContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {ingredients.map(ingredient => (
              <IngredientInput
                key={ingredient.id}
                name={ingredient.name}
                amount={ingredient.amount}
                unit={ingredient.unit}
                onNameChange={value =>
                  updateIngredient(ingredient.id, 'name', value)
                }
                onAmountChange={value =>
                  updateIngredient(ingredient.id, 'amount', value)
                }
                onUnitChange={value =>
                  updateIngredient(ingredient.id, 'unit', value)
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* Add ingredient */}
        <Pressable
          onPress={addIngredient}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>
            + Add another ingredient
          </Text>
        </Pressable>

        {/* Recipe banner */}
        <ImageBackground
          source={require('../../assets/images/camerarecipe.png')}
          style={styles.banner}
          imageStyle={styles.bannerImage}
          resizeMode="cover"
        >
          <View style={styles.bannerOverlay}>
            <TextInput
              style={styles.bannerInput}
              value={recipeName}
              onChangeText={setRecipeName}
              placeholder="Type name of your recipe..."
              placeholderTextColor="#A0A0A0"
              textAlign="center"
            />

            <TextInput
              style={styles.bannerInput}
              value={recipeCategory}
              onChangeText={setRecipeCategory}
              placeholder="Type category of your recipe..."
              placeholderTextColor="#A0A0A0"
              textAlign="center"
            />
          </View>
        </ImageBackground>

        {/* Submit recipe */}
        <View style={styles.submitButton}>
          <OffsetButton
            title="Enter your recipe"
            onPress={submitRecipe}
          />
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.navBarWrapper}>
        <View style={styles.navBlueLayer} />

        <View style={styles.navBar}>
          {/* Preferences */}
          <Pressable
            style={styles.navItem}
            onPress={() => navigation.navigate('PreferenceSettingsScreen')}
          >
            <Image
              source={require('../../assets/images/leaf.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </Pressable>

          {/* Dashboard */}
          <Pressable
            style={styles.navItem}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Image
              source={require('../../assets/images/house.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </Pressable>

          {/* Active camera icon */}
          <View style={[styles.navItem, styles.activeCamera]}>
            <View style={styles.cameraBubble}>
              <Image
                source={require('../../assets/images/camera.png')}
                style={styles.navIcon}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Recipes */}
          <Pressable
            style={styles.navItem}
            onPress={() => navigation.navigate('RestaurantSearch')}
          >
            <Image
              source={require('../../assets/images/recipes.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </Pressable>

          {/* Settings */}
          <Pressable
            style={styles.navItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Image
              source={require('../../assets/images/settings.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F2',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },

  title: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 20,
  },

  ingredientsSection: {
    width: '100%',
    maxHeight: 220,
    marginBottom: 8,
  },

  ingredientsList: {
    width: '100%',
  },

  ingredientsListContent: {
    gap: 10,
    paddingBottom: 4,
  },

  addButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 16,
  },

  addButtonText: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 13,
  },

  banner: {
    width: '100%',
    height: 140,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bannerImage: {
    borderRadius: 16,
  },

  bannerOverlay: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bannerInput: {
    width: '100%',
    height: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DCDCDC',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 12,
    color: '#1A1A1A',
  },

  submitButton: {
    width: '100%',
    marginBottom: 8,
  },

  navBarWrapper: {
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },

  navBlueLayer: {
    position: 'absolute',
    top: -8,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2B56D4',
    borderRadius: 24,
  },

  navBar: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#FFE89E',
    borderRadius: 24,
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    width: 20,
    height: 20,
  },

  activeCamera: {
    transform: [{ translateY: -36 }],
  },

  cameraBubble: {
    width: 48,
    height: 48,
    backgroundColor: '#FFEDA9',
    borderColor: '#2B56D4',
    borderWidth: 3,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
