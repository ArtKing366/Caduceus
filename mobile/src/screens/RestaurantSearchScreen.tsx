
import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';

import MapView from 'react-native-maps';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';

import OffsetButton from '../components/OffsetButton';

export default function RestaurantSearchScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [searchQuery, setSearchQuery] = useState('');

  function selectRestaurant() {
    navigation.navigate('RestaurantMenu');
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
        {/* App title */}
        <Text style={styles.appTitle}>
          Caduceus
        </Text>

        {/* Search field */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchIcon}>
            <View style={styles.searchCircle} />
            <View style={styles.searchHandle} />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurant ..."
            placeholderTextColor="#A0A0A0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
          />
        </View>

        {/* Actual interactive map */}
        <View style={styles.mapWrapper}>
          <View style={styles.mapBlueOffset} />

          <View style={styles.mapCard}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 52.0,
                longitude: 19.0,
                latitudeDelta: 4.5,
                longitudeDelta: 4.5,
              }}
              mapType="standard"
              showsCompass
              zoomEnabled
              scrollEnabled
              rotateEnabled
              pitchEnabled
              showsUserLocation={false}
            />
          </View>
        </View>

        {/* Select restaurant button */}
        <OffsetButton
          title="Select the restaurant"
          onPress={selectRestaurant}
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

          {/* Recipes - active and centered */}
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

  scrollView: {
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
    marginBottom: 24,
  },

  // Search field

  searchWrapper: {
    position: 'relative',
    width: '100%',
    height: 44,
    marginBottom: 20,
    justifyContent: 'center',
  },

  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
    width: 18,
    height: 20,
  },

  searchCircle: {
    width: 13,
    height: 13,
    borderWidth: 2,
    borderColor: '#A0A0A0',
    borderRadius: 50,
  },

  searchHandle: {
    position: 'absolute',
    width: 7,
    height: 2,
    backgroundColor: '#A0A0A0',
    left: 11,
    top: 14,
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },

  searchInput: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFFFFF',
    borderColor: '#DCDCDC',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingLeft: 40,
    paddingRight: 16,
    color: '#1A1A1A',
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 13.5,
  },

  // Interactive map

  mapWrapper: {
    position: 'relative',
    width: '100%',
    height: 280,
    marginBottom: 24,
  },

  mapBlueOffset: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: -6,
    backgroundColor: '#2B56D4',
    borderRadius: 20,
  },

  mapCard: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFE89E',
  },

  map: {
    width: '100%',
    height: '100%',
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
