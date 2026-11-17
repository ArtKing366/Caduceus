import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';

import OffsetButton from '../components/OffsetButton';

const ingredients = [
  {
    name: 'Pasta',
    packaging: '450 g - 500 g',
    serving: '110 g - 125 g',
  },
  {
    name: 'Cream-cheese',
    packaging: '200 g - 225 g',
    serving: '50 g - 55 g',
  },
  {
    name: 'Parmesan-cheese',
    packaging: '150 g - 200 g',
    serving: '12 g - 15 g',
  },
  {
    name: 'Garlic',
    packaging: '50 g',
    serving: '1 small clove',
  },
  {
    name: 'Butter',
    packaging: '200 g',
    serving: '1 teaspoon',
  },
  {
    name: 'Olive oil',
    packaging: '460 g',
    serving: '1 tablespoon',
  },
];

export default function DishDetailsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

function skipToMakingDish() {
  navigation.navigate('CookingInstructions');
}

function shopForIngredients() {
  navigation.navigate('IngredientStores');
}

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <ScrollView
        style={styles.screenScroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App title */}
        <Text style={styles.appTitle}>
          Caduceus
        </Text>

        {/* Dish image */}
        <View style={styles.dishBanner}>
          <Image
            source={require('../../assets/images/Bigcheesecreampasta.png')}
            style={styles.dishImage}
            resizeMode="cover"
          />
        </View>

        {/* Dish name */}
        <Text style={styles.dishTitle}>
          Cream-cheese pasta
        </Text>

        {/* Ingredients table */}
        <View style={styles.tableContainer}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <View style={[styles.tableCell, styles.ingredientColumn]}>
              <Text style={styles.headerIngredientText}>
                Ingredients
              </Text>
            </View>

            <View style={[styles.tableCell, styles.packagingColumn]}>
              <Text style={styles.headerText}>
                Normal packaging
              </Text>
            </View>

            <View style={[styles.tableCell, styles.servingColumn, styles.lastColumn]}>
              <Text style={styles.headerText}>
                Per 1 Serving
              </Text>
            </View>
          </View>

          {/* Ingredient rows */}
          {ingredients.map((ingredient, index) => (
            <View
              key={ingredient.name}
              style={[
                styles.tableRow,
                index === ingredients.length - 1 && styles.lastRow,
              ]}
            >
              <View style={[styles.tableCell, styles.ingredientColumn]}>
                <Text style={styles.ingredientName}>
                  {ingredient.name}
                </Text>
              </View>

              <View style={[styles.tableCell, styles.packagingColumn]}>
                <Text style={styles.cellText}>
                  {ingredient.packaging}
                </Text>
              </View>

              <View style={[styles.tableCell, styles.servingColumn, styles.lastColumn]}>
                <Text style={styles.cellText}>
                  {ingredient.serving}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtonsGrid}>
          <View style={styles.actionButtonCell}>
            <OffsetButton
              title="Skip to making dish"
              onPress={skipToMakingDish}
              compact
            />
          </View>

          <View style={styles.actionButtonCell}>
            <OffsetButton
              title="Shop for ingredients"
              onPress={shopForIngredients}
              compact
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.navBarWrapper}>
        <View style={styles.navBlueLayer} />

        <View style={styles.navBar}>
          {/* Preferences */}
          <Pressable
            style={styles.navItem}
            onPress={() =>
              navigation.navigate('PreferenceSettingsScreen')
            }
          >
            <Image
              source={require('../../assets/images/leaf.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </Pressable>

          {/* Camera */}
          <Pressable
            style={styles.navItem}
            onPress={() => navigation.navigate('Camera')}
          >
            <Image
              source={require('../../assets/images/camera.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </Pressable>

          {/* Recipes - active */}
          <View style={[styles.navItem, styles.activeRecipes]}>
            <View style={styles.recipesBubble}>
              <Image
                source={require('../../assets/images/recipes.png')}
                style={styles.navIcon}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Home */}
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

          {/* Settings */}
          <View style={styles.navItem}>
            <Image
              source={require('../../assets/images/settings.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },

  screenScroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
  },

  // App title
  appTitle: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Dish image
  dishBanner: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },

  dishImage: {
    width: '100%',
    height: '100%',
  },

  dishTitle: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 17,
    color: '#2B56D4',
    textAlign: 'center',
    marginBottom: 14,
  },

  // Ingredients table
  tableContainer: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#2B56D4',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFE89E',
    marginBottom: 18,
  },

  tableHeader: {
    flexDirection: 'row',
    minHeight: 52,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 1.5,
    borderBottomColor: '#2B56D4',
  },

  tableRow: {
    flexDirection: 'row',
    minHeight: 45,
    borderBottomWidth: 1.5,
    borderBottomColor: '#2B56D4',
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 7,
    borderRightWidth: 1.5,
    borderRightColor: '#2B56D4',
  },

  ingredientColumn: {
    flex: 1.15,
    alignItems: 'flex-start',
    paddingLeft: 8,
  },

  packagingColumn: {
    flex: 1.2,
  },

  servingColumn: {
    flex: 1,
  },

  lastColumn: {
    borderRightWidth: 0,
  },

  headerIngredientText: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 11.5,
    color: '#2B56D4',
  },

  headerText: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 10,
    color: '#2B56D4',
    textAlign: 'center',
  },

  ingredientName: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 10.5,
    color: '#2B56D4',
  },

  cellText: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 9.5,
    color: '#2B56D4',
    textAlign: 'center',
  },

  // Action buttons
  actionButtonsGrid: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },

  actionButtonCell: {
    flex: 1,
    minWidth: 0,
  },

  // Bottom navigation
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

  activeRecipes: {
    transform: [{ translateY: -36 }],
  },

  recipesBubble: {
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