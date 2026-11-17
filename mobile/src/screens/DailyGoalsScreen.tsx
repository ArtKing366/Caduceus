
import { useState } from 'react';

import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DailyGoals'
>;

export default function DailyGoalsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [calories, setCalories] = useState('');
  const [water, setWater] = useState('');

  function applyChanges() {
    const caloriesValue = Number(calories);
    const waterValue = Number(water.replace(',', '.'));

    if (
      calories.trim() === '' ||
      water.trim() === '' ||
      !Number.isFinite(caloriesValue) ||
      !Number.isFinite(waterValue) ||
      caloriesValue <= 0 ||
      waterValue <= 0
    ) {
      Alert.alert(
        'Invalid goals',
        'Please enter a valid positive number for both fields.',
      );
      return;
    }

    Alert.alert(
      'Goals entered',
      'Your daily goals have been validated. Saving them permanently can be connected later.',
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.logo}>Caduceus</Text>
        </View>

        {/* SECTION TITLE */}
        <Text style={styles.sectionTitle}>
          Daily Goals
        </Text>

        {/* MAIN CARD */}
        <View style={styles.cardContainer}>

          {/* TOP IMAGE */}
          <Image
            source={require('../../assets/images/privacyimg1.png')}
            style={styles.topImage}
            resizeMode="cover"
          />

          {/* FORM */}
          <ScrollView
            style={styles.cardBody}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* CALORIES */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Set your daily goals (calories)
              </Text>

              <TextInput
                value={calories}
                onChangeText={setCalories}
                style={styles.formInput}
                placeholder="Ex: 2500 kcal"
                placeholderTextColor="#D0D0D0"
                keyboardType="numeric"
                autoCorrect={false}
              />
            </View>

            {/* WATER */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Set your desired water consumption
              </Text>

              <TextInput
                value={water}
                onChangeText={setWater}
                style={styles.formInput}
                placeholder="Ex: 3L"
                placeholderTextColor="#D0D0D0"
                keyboardType="decimal-pad"
                autoCorrect={false}
              />
            </View>

            {/* APPLY BUTTON */}
            <Pressable
              onPress={applyChanges}
              style={({ pressed }) => [
                styles.buttonWrapper,
                pressed && styles.buttonPressed,
              ]}
            >
              <View style={styles.buttonBlueOffset} />

              <View style={styles.applyButton}>
                <Text style={styles.buttonText}>
                  Apply changes
                </Text>
              </View>
            </Pressable>

          </ScrollView>

          {/* BOTTOM IMAGE */}
          <Image
            source={require('../../assets/images/privacyimg2.png')}
            style={styles.bottomImage}
            resizeMode="cover"
          />

        </View>

        <View style={styles.emptySpace} />

        {/* BOTTOM NAVIGATION */}
        <View style={styles.navBarWrapper}>
          <View style={styles.navBlueLayer} />

          <View style={styles.navBar}>

            {/* PREFERENCES */}
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

            {/* CAMERA */}
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

            {/* SETTINGS - CENTRE BUBBLE */}
            <View style={[styles.navItem, styles.activeHome]}>
              <View style={styles.homeBubble}>
                <Image
                  source={require('../../assets/images/settings.png')}
                  style={styles.navIcon}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* RECIPES */}
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

            {/* HOME */}
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
    paddingHorizontal: 20,
    backgroundColor: '#FFF9F5',
  },

  /* HEADER */

  header: {
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 28,
    color: '#2B56D4',
  },

  sectionTitle: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 20,
    color: '#2B56D4',
    marginTop: 10,
    marginBottom: 14,
  },

  /* MAIN CARD */

  cardContainer: {
    flex: 1,
    backgroundColor: '#FFF9F5',
    borderRadius: 20,
    overflow: 'hidden',
  },

  topImage: {
    width: '100%',
    height: 125,
  },

  bottomImage: {
    width: '100%',
    height: 110,
  },

  /* FORM */

  cardBody: {
    flex: 1,
  },

  formContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'flex-start',
  },

  formGroup: {
    width: '100%',
    marginBottom: 20,
  },

  formLabel: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 8,
  },

  formInput: {
    width: 160,
    height: 42,
    paddingHorizontal: 14,
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 13,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAEAEA',
    borderRadius: 10,
  },

  /* APPLY BUTTON */

  buttonWrapper: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: 12,
  },

  buttonBlueOffset: {
    position: 'absolute',
    top: 0,
    bottom: -5,
    left: 0,
    right: 0,
    backgroundColor: '#2B56D4',
    borderRadius: 20,
  },

  applyButton: {
    backgroundColor: '#FFE89E',
    borderWidth: 1.5,
    borderColor: '#2B56D4',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignItems: 'center',
  },

  buttonText: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 15,
    color: '#2B56D4',
  },

  buttonPressed: {
    transform: [{ translateY: 2 }],
  },

  emptySpace: {
    height: 8,
  },

  /* BOTTOM NAVIGATION */

  navBarWrapper: {
    position: 'relative',
    marginHorizontal: 0,
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

  activeHome: {
    transform: [{ translateY: -36 }],
  },

  homeBubble: {
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
