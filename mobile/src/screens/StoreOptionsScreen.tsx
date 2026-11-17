
import { useState } from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
} from 'react-native';

import MapView from 'react-native-maps';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StoreOptions'
>;

type Store = {
  id: string;
  name: string;
  distance: string;
  price: string;
  image: any;
};

const stores: Store[] = [
  {
    id: 'biedronka',
    name: 'Biedronka',
    distance: '500m from you',
    price: '$19.00',
    image: require('../../assets/images/biedronka.png'),
  },
  {
    id: 'dino',
    name: 'Dino',
    distance: '300m from you',
    price: '$23.00',
    image: require('../../assets/images/dino.png'),
  },
];

export default function StoreOptionsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [storesNearMe, setStoresNearMe] = useState(true);
  const [selectedStore, setSelectedStore] = useState('biedronka');

  function proceedToDish() {
    Alert.alert(
      'Store selected',
      `You selected ${stores.find(store => store.id === selectedStore)?.name}.`
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Caduceus</Text>

          {/* Stores near me toggle */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Stores near me</Text>

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

          {/* Actual interactive map */}
          <View style={styles.mapCard}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 52.0,
                longitude: 19.0,
                latitudeDelta: 5.5,
                longitudeDelta: 5.5,
              }}
              mapType="standard"
              showsCompass
              zoomEnabled
              scrollEnabled
              rotateEnabled
              pitchEnabled
              toolbarEnabled={false}
            />
          </View>

          {/* Store options */}
          <View style={styles.storesContainer}>
            <View style={styles.storesHeader}>
              <Text style={styles.storesHeaderText}>
                Options of stores where you can find ingredients
              </Text>
            </View>

            <View style={styles.storesList}>
              {stores.map((store, index) => {
                const selected = selectedStore === store.id;

                return (
                  <Pressable
                    key={store.id}
                    onPress={() => setSelectedStore(store.id)}
                    style={[
                      styles.storeItem,
                      selected && styles.selectedStore,
                      index === stores.length - 1 && styles.lastStore,
                    ]}
                  >
                    <Image
                      source={store.image}
                      style={styles.storeLogo}
                      resizeMode="contain"
                    />

                    <View style={styles.storeInfo}>
                      <Text style={styles.storeName}>
                        {store.name}
                      </Text>

                      <View style={styles.distanceRow}>
                        <Text style={styles.pinIcon}>⌖</Text>
                        <Text style={styles.storeDistance}>
                          {store.distance}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.storePrice}>
                      <Text style={styles.priceLabel}>
                        Total price:
                      </Text>
                      <Text style={styles.priceValue}>
                        {store.price}
                      </Text>
                    </View>

                    {selected && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Proceed button */}
          <Pressable
            onPress={proceedToDish}
            style={styles.buttonContainer}
          >
            {({ pressed }) => (
              <View style={styles.buttonWrapper}>
                <View
                  style={[
                    styles.buttonOffset,
                    pressed && styles.buttonOffsetPressed,
                  ]}
                />

                <View
                  style={[
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  <Text style={styles.actionButtonText}>
                    Proceed to make dish
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
        </ScrollView>

        {/* Bottom navigation */}
        <View style={styles.navBarWrapper}>
          <View style={styles.navBlueLayer} />

          <View style={styles.navBar}>
            <Pressable
              style={styles.navItem}
              onPress={() => navigation.navigate('PreferenceSettingsScreen')}
            >
              <Image
                source={require('../../assets/images/leaf.png')}
                style={styles.navIcon}
              />
            </Pressable>

            <Pressable
              style={styles.navItem}
              onPress={() => navigation.navigate('Camera')}
            >
              <Image
                source={require('../../assets/images/camera.png')}
                style={styles.navIcon}
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
              />
            </Pressable>

            <Pressable
              style={styles.navItem}
              onPress={() => navigation.navigate('PreferenceSettingsScreen')}
            >
              <Image
                source={require('../../assets/images/settings.png')}
                style={styles.navIcon}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },

  screen: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },

  title: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 12,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },

  toggleLabel: {
    color: '#1A1A1A',
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 14,
  },

  mapCard: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#FFE89E',
  },

  map: {
    width: '100%',
    height: '100%',
  },

  storesContainer: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#2B56D4',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFE89E',
    marginBottom: 20,
  },

  storesHeader: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#2B56D4',
    alignItems: 'center',
  },

  storesHeaderText: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },

  storesList: {
    flexDirection: 'column',
  },

  storeItem: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 9,
    borderBottomWidth: 1.5,
    borderBottomColor: '#2B56D4',
  },

  selectedStore: {
    backgroundColor: 'rgba(43, 86, 212, 0.12)',
  },

  lastStore: {
    borderBottomWidth: 0,
  },

  storeLogo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  storeInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  storeName: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 14,
    marginBottom: 2,
  },

  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  pinIcon: {
    color: '#2B56D4',
    fontSize: 15,
    fontFamily: 'ClashDisplay-Bold',
  },

  storeDistance: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 10,
  },

  storePrice: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  priceLabel: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 9,
  },

  priceValue: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 12,
  },

  selectedIndicator: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#2B56D4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkmark: {
    color: '#FFFFFF',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 12,
  },

  buttonContainer: {
    width: '100%',
  },

  buttonWrapper: {
    position: 'relative',
    width: '100%',
  },

  buttonOffset: {
    position: 'absolute',
    top: 4,
    bottom: -4,
    left: 0,
    right: 0,
    backgroundColor: '#2B56D4',
    borderRadius: 24,
  },

  buttonOffsetPressed: {
    bottom: -7,
  },

  actionButton: {
    minHeight: 48,
    backgroundColor: '#FFE89E',
    borderWidth: 1.5,
    borderColor: '#2B56D4',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },

  actionButtonPressed: {
    transform: [{ translateY: -1 }],
  },

  actionButtonText: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 14,
    textAlign: 'center',
  },

  /* Bottom navigation — Caduceus design */

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
    resizeMode: 'contain',
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
