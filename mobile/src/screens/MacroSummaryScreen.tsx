
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';
import type { RecipeSummary } from '../types/nutrition';

import SaveRecipeButton from '../components/SaveRecipeButton';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'MacroSummary'
>;

type MacroItem = {
  name: string;
  value: number | undefined;
};

export default function MacroSummaryScreen({
  navigation,
  route,
}: Props) {
  const summary: RecipeSummary | undefined = route.params?.summary;

  const nutrition = summary?.nutrition;

  const macros: MacroItem[] = [
    { name: 'Protein', value: nutrition?.protein },
    { name: 'Fats', value: nutrition?.fats },
    { name: 'Carbs', value: nutrition?.carbs },
    { name: 'Fiber', value: nutrition?.fiber },
  ];

  function getProgress(value: number | undefined) {
    if (value === undefined || !Number.isFinite(value)) {
      return '0%';
    }

    // Visual scale for the progress bar, not a dietary target.
    return `${Math.min((value / 40) * 100, 100)}%`;
  }

  const dietaryTags = [
    {
      name: 'Lactose-free',
      icon: require('../../assets/images/lactose-free.png'),
      enabled: summary?.dietaryTags.lactoseFree,
    },
    {
      name: 'Sugar-free',
      icon: require('../../assets/images/sugar-free.png'),
      enabled: summary?.dietaryTags.sugarFree,
    },
    {
      name: 'Gluten-free',
      icon: require('../../assets/images/gluten-free.png'),
      enabled: summary?.dietaryTags.glutenFree,
    },
    {
      name: 'Vegan',
      icon: require('../../assets/images/vegan.png'),
      enabled: summary?.dietaryTags.vegan,
    },
  ];

  function handleSaveAndReturn() {
    navigation.navigate('Dashboard');
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
      >
        {/* Screen title */}
        <Text style={styles.title}>Caduceus</Text>

        {/* Macro cards */}
        <View style={styles.macrosList}>
          {macros.map(macro => (
            <View
              key={macro.name}
              style={styles.macroRowWrapper}
            >
              <View style={styles.blueShadowLayer} />

              <View style={styles.macroCard}>
                <Text style={styles.macroName}>
                  {macro.name}
                </Text>

                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: getProgress(macro.value) },
                    ]}
                  />
                </View>

                <Text style={styles.macroValue}>
                  {macro.value === undefined
                    ? '—'
                    : `${macro.value.toFixed(1)}g`}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Total calories */}
        <Text style={styles.totalCalories}>
          Total count: {
            nutrition
              ? `${Math.round(nutrition.calories)} kcal`
              : '— kcal'
          }
        </Text>

        {/* Middle image and dietary tags */}
        <View style={styles.middleCardWrapper}>
          <View style={styles.blueShadowLayer} />

          <View style={styles.middleCard}>
            <ImageBackground
              source={require('../../assets/images/middlesection.png')}
              style={styles.middleBackground}
              imageStyle={styles.middleBackgroundImage}
              resizeMode="cover"
            >
              <View style={styles.tagsContainer}>
                {dietaryTags.map(tag => (
                  <View
                    key={tag.name}
                    style={styles.tagPill}
                  >
                    <Image
                      source={tag.icon}
                      style={styles.tagIcon}
                      resizeMode="contain"
                    />

                    <Text
                      style={styles.tagText}
                      numberOfLines={1}
                    >
                      {tag.name}
                    </Text>

                    <Text style={styles.checkMark}>
                      {tag.enabled === undefined
                        ? '—'
                        : tag.enabled
                          ? '✓'
                          : '✕'}
                    </Text>
                  </View>
                ))}
              </View>
            </ImageBackground>
          </View>
        </View>

        {/* Recipe name, if provided */}
        {summary?.recipeName ? (
          <Text style={styles.recipeName}>
            {summary.recipeName}
          </Text>
        ) : null}

        {/* Save and return */}
        <View style={styles.saveButton}>
          <SaveRecipeButton
            title="Save recipe & return to main page"
            onPress={handleSaveAndReturn}
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

  // Macro cards

  macrosList: {
    width: '100%',
    gap: 12,
  },

  macroRowWrapper: {
    width: '100%',
    position: 'relative',
  },

  blueShadowLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: -5,
    backgroundColor: '#2B56D4',
    borderRadius: 16,
  },

  macroCard: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    backgroundColor: '#FFE89E',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  macroName: {
    width: 55,
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 13,
  },

  progressBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#2B56D4',
    borderRadius: 10,
  },

  macroValue: {
    width: 48,
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 12,
    textAlign: 'right',
  },

  // Calories

  totalCalories: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 18,
  },

  // Middle image and dietary tags

  middleCardWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 24,
  },

  middleCard: {
    height: 160,
    width: '100%',
    position: 'relative',
    zIndex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },

  middleBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },

  middleBackgroundImage: {
    borderRadius: 16,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 10,
    padding: 14,
  },

  tagPill: {
    width: '47%',
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#2B56D4',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 5,
  },

  tagIcon: {
    width: 16,
    height: 16,
  },

  tagText: {
    flex: 1,
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 10,
  },

  checkMark: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 12,
  },

  recipeName: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 16,
    marginBottom: 12,
  },

  // Save button

  saveButton: {
    width: '100%',
    marginBottom: 8,
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
