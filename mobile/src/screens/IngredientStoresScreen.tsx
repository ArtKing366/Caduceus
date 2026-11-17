
import { useState } from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
} from 'react-native';

import MapView, { type Region } from 'react-native-maps';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';

import OffsetButton from '../components/OffsetButton';

type BudgetOption = 'budget-friendly' | 'premium' | 'regular';

type BudgetPillProps = {
  title: string;
  selected: boolean;
  onPress: () => void;
};

const initialRegion: Region = {
  latitude: 52.0,
  longitude: 19.0,
  latitudeDelta: 5.5,
  longitudeDelta: 5.5,
};

function BudgetPill({
  title,
  selected,
  onPress,
}: BudgetPillProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={styles.budgetPill}
    >
      <View
        style={[
          styles.pillShadow,
          (isHovered || isPressed || selected) &&
            styles.pillShadowExtended,
        ]}
      />

      <View
        style={[
          styles.pillBody,
          selected && styles.selectedPill,
          (isHovered || isPressed) && styles.pillBodyActive,
        ]}
      >
        <Text
          style={[
            styles.pillText,
            selected && styles.selectedPillText,
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

export default function IngredientStoresScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [storesNearMe, setStoresNearMe] = useState(true);

  const [selectedBudget, setSelectedBudget] =
    useState<BudgetOption>('budget-friendly');

  function continueShopping() {
    navigation.navigate('StoreOptions');
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
        <Text style={styles.appTitle}>
          Caduceus
        </Text>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>
            Stores near me
          </Text>

          <Switch
            value={storesNearMe}
            onValueChange={setStoresNearMe}
            trackColor={{
              false: '#D8D8D8',
              true: '#2B56D4',
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#D8D8D8"
          />
        </View>

        <View style={styles.mapCard}>
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            mapType="standard"
            showsCompass
            showsScale
            showsBuildings
            zoomEnabled
            scrollEnabled
            rotateEnabled={false}
            pitchEnabled={false}
            toolbarEnabled={false}
          />
        </View>

        <View style={styles.budgetSection}>
          <Text style={styles.sectionTitle}>
            Choose your budget option
          </Text>

          <View style={styles.budgetOptionsRow}>
            <BudgetPill
              title="Budget-friendly"
              selected={selectedBudget === 'budget-friendly'}
              onPress={() => setSelectedBudget('budget-friendly')}
            />

            <BudgetPill
              title="Premium"
              selected={selectedBudget === 'premium'}
              onPress={() => setSelectedBudget('premium')}
            />
          </View>

          <View style={styles.budgetCenterRow}>
            <BudgetPill
              title="Regular"
              selected={selectedBudget === 'regular'}
              onPress={() => setSelectedBudget('regular')}
            />
          </View>
        </View>

        <View style={styles.continueButton}>
          <OffsetButton
            title="Continue"
            onPress={continueShopping}
          />
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.navBarWrapper}>
        <View style={styles.navBlueLayer} />

        <View style={styles.navBar}>
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

          <Pressable
            style={[styles.navItem, styles.activeRecipes]}
            onPress={() => navigation.navigate('RestaurantSearch')}
          >
            <View style={styles.recipesBubble}>
              <Image
                source={require('../../assets/images/recipes.png')}
                style={styles.navIcon}
                resizeMode="contain"
              />
            </View>
          </Pressable>

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

          <Pressable
            style={styles.navItem}
            onPress={() =>
              navigation.navigate('PreferenceSettingsScreen')
            }
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

  appTitle: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 18,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  toggleLabel: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 14,
    color: '#1A1A1A',
  },

  mapCard: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 28,
    backgroundColor: '#FFE89E',
  },

  map: {
    width: '100%',
    height: '100%',
  },

  budgetSection: {
    alignItems: 'center',
    marginBottom: 30,
  },

  sectionTitle: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 15,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 30,
  },

  budgetOptionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: 25,
  },

  budgetCenterRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  budgetPill: {
    position: 'relative',
  },

  pillShadow: {
    position: 'absolute',
    top: 0,
    bottom: -4,
    left: 0,
    right: 0,
    backgroundColor: '#2B56D4',
    borderRadius: 20,
  },

  pillShadowExtended: {
    bottom: -8,
  },

  pillBody: {
    position: 'relative',
    backgroundColor: '#FFE89E',
    borderWidth: 1.5,
    borderColor: '#2B56D4',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedPill: {
    backgroundColor: '#FFE89E',
    borderColor: '#2B56D4',
    transform: [{ translateY: -2 }],
  },

  pillBodyActive: {
    transform: [{ translateY: -2 }],
  },

  pillText: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 12,
    color: '#2B56D4',
    textAlign: 'center',
  },

  selectedPillText: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
  },

  continueButton: {
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
