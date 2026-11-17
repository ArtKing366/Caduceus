
import { useState } from 'react';

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

const menuItems = [
  {
    id: '1',
    name: 'Quark pancakes',
    category: 'Dessert',
    image: require('../../assets/images/quarkpancakes-screen.png'),
  },
  {
    id: '2',
    name: 'Croissants',
    category: 'Dessert',
    image: require('../../assets/images/croissants.png'),
  },
  {
    id: '3',
    name: 'Cream-cheese pasta',
    category: 'Main serving',
    image: require('../../assets/images/cream-cheese-pasta.png'),
  },
  {
    id: '4',
    name: 'Cream pasta with oysters',
    category: 'Main serving',
    image: require('../../assets/images/cream-pasta-with-oysters.png'),
  },
  {
    id: '5',
    name: 'Steak medium-rare',
    category: 'Main serving',
    image: require('../../assets/images/steak-medium-rare.png'),
  },
  {
    id: '6',
    name: 'Cinnamon rolls',
    category: 'Dessert',
    image: require('../../assets/images/cinnamon-rolls.png'),
  },
  {
    id: '7',
    name: 'Cream fish',
    category: 'Main serving',
    image: require('../../assets/images/cream-fish.png'),
  },
];

export default function RestaurantMenuScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  function toggleItem(id: string) {
    setSelectedItems((currentItems) => {
      if (currentItems.includes(id)) {
        return currentItems.filter((itemId) => itemId !== id);
      }

      return [...currentItems, id];
    });
  }

  function confirmChoice() {
    if (selectedItems.length === 0) {
      Alert.alert(
        'No dishes selected',
        'Please select at least one dish from the menu.'
      );
      return;
    }

    navigation.navigate('DishDetails');
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

        {/* Restaurant menu */}
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuHeaderText}>
              Menu of the restaurant
            </Text>
          </View>

          {/* Scrollable menu items */}
          <ScrollView
            style={styles.menuList}
            nestedScrollEnabled
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {menuItems.map((item, index) => {
              const isSelected = selectedItems.includes(item.id);

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.menuItem,
                    isSelected && styles.menuItemSelected,
                    index === menuItems.length - 1 &&
                      styles.lastMenuItem,
                  ]}
                  onPress={() => toggleItem(item.id)}
                >
                  <Image
                    source={item.image}
                    style={styles.menuThumb}
                    resizeMode="cover"
                  />

                  <View style={styles.menuInfo}>
                    <Text style={styles.itemTitle}>
                      {item.name}
                    </Text>

                    <Text style={styles.itemCategory}>
                      Category: {item.category}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.selectIndicator,
                      isSelected && styles.selectIndicatorSelected,
                    ]}
                  >
                    {isSelected && (
                      <Text style={styles.checkmark}>
                        ✓
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Confirm selection */}
        <OffsetButton
          title="Confirm choice"
          onPress={confirmChoice}
        />
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.navBarWrapper}>
        <View style={styles.navBlueLayer} />

        <View style={styles.navBar}>
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

  // Menu container

  menuContainer: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#2B56D4',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFE89E',
    marginBottom: 20,
  },

  menuHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2B56D4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuHeaderText: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 16,
    color: '#2B56D4',
  },

  // Scrollable menu list

  menuList: {
    height: 380,
    flexGrow: 0,
  },

  menuItem: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(43, 86, 212, 0.4)',
  },

  lastMenuItem: {
    borderBottomWidth: 0,
  },

  menuItemSelected: {
    backgroundColor: 'rgba(43, 86, 212, 0.12)',
  },

  menuThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },

  menuInfo: {
    flex: 1,
  },

  itemTitle: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 13.5,
    color: '#2B56D4',
    marginBottom: 2,
  },

  itemCategory: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 10.5,
    color: '#2B56D4',
    opacity: 0.8,
  },

  // Selection indicator

  selectIndicator: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#2B56D4',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectIndicatorSelected: {
    backgroundColor: '#2B56D4',
  },

  checkmark: {
    color: '#FFFFFF',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 12,
    lineHeight: 15,
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
