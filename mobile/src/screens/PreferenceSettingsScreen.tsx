
import { useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';

import PreferenceToggle from '../components/PreferenceToggle';

export default function PreferenceSettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [preferences, setPreferences] = useState({
    vegan: false,
    glutenFree: true,
    noAddedSugar: true,
    dairyFree: false,
    nutFree: true,
    highProtein: false,
    budgetFriendly: true,
  });

  function updatePreference(
    key: keyof typeof preferences,
    value: boolean
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function applyChanges() {
    Alert.alert(
      'Preferences updated',
      'Your preferences have been updated.'
    );
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
        <Text style={styles.appTitle}>Caduceus</Text>

        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.preferencesList}>
          <PreferenceToggle
            title="Vegan"
            value={preferences.vegan}
            onValueChange={(value) => updatePreference('vegan', value)}
          />

          <PreferenceToggle
            title="Gluten-free"
            value={preferences.glutenFree}
            onValueChange={(value) => updatePreference('glutenFree', value)}
          />

          <PreferenceToggle
            title="No added sugar"
            value={preferences.noAddedSugar}
            onValueChange={(value) => updatePreference('noAddedSugar', value)}
          />

          <PreferenceToggle
            title="Dairy-free"
            value={preferences.dairyFree}
            onValueChange={(value) => updatePreference('dairyFree', value)}
          />

          <PreferenceToggle
            title="Nut-free"
            value={preferences.nutFree}
            onValueChange={(value) => updatePreference('nutFree', value)}
          />

          <PreferenceToggle
            title="High protein"
            value={preferences.highProtein}
            onValueChange={(value) => updatePreference('highProtein', value)}
          />

          <PreferenceToggle
            title="Budget-friendly"
            value={preferences.budgetFriendly}
            onValueChange={(value) => updatePreference('budgetFriendly', value)}
          />
        </View>

        {/* Action buttons */}
        <View style={styles.buttonsRow}>
          <Pressable
            style={styles.buttonWrapper}
            onPress={() => navigation.navigate('Limitations')}
          >
            {({ pressed }) => (
              <>
                <View
                  style={[
                    styles.buttonBlueOffset,
                    pressed && styles.buttonBlueOffsetPressed,
                  ]}
                />

                <View
                  style={[
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  <Text style={styles.actionButtonText}>
                    Limitations
                  </Text>
                </View>
              </>
            )}
          </Pressable>

          <Pressable
            style={styles.buttonWrapper}
            onPress={applyChanges}
          >
            {({ pressed }) => (
              <>
                <View
                  style={[
                    styles.buttonBlueOffset,
                    pressed && styles.buttonBlueOffsetPressed,
                  ]}
                />

                <View
                  style={[
                    styles.actionButton,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  <Text style={styles.actionButtonText}>
                    Apply changes
                  </Text>
                </View>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.navBarWrapper}>
        <View style={styles.navBlueLayer} />

        <View style={styles.navBar}>
          {/* Home - left */}
          <View style={styles.navItem}>
            <Image
              source={require('../../assets/images/house.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </View>

          {/* Camera - left of center */}
          <View style={styles.navItem}>
            <Image
              source={require('../../assets/images/camera.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </View>

          {/* Leaf - exact center, active */}
          <View style={[styles.navItem, styles.activeLeaf]}>
            <View style={styles.leafBubble}>
              <Image
                source={require('../../assets/images/leaf.png')}
                style={styles.navIcon}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Recipes - right of center */}
          <View style={styles.navItem}>
            <Image
              source={require('../../assets/images/recipes.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </View>

          {/* Settings - right */}
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

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },

  appTitle: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 18,
    marginBottom: 14,
  },

  preferencesList: {
    gap: 10,
    marginBottom: 18,
  },

  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },

  buttonWrapper: {
    flex: 1,
    minHeight: 54,
    position: 'relative',
  },

  buttonBlueOffset: {
    position: 'absolute',
    top: 7,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2B56D4',
    borderRadius: 20,
  },

  buttonBlueOffsetPressed: {
    top: 10,
  },

  actionButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: 46,
    backgroundColor: '#FFE89E',
    borderColor: '#2B56D4',
    borderWidth: 1.5,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },

  actionButtonPressed: {
    top: 3,
  },

  actionButtonText: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 12,
    textAlign: 'center',
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

  activeLeaf: {
    transform: [{ translateY: -36 }],
  },

  leafBubble: {
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
