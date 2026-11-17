
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
  'PersonalInformation'
>;

export default function PersonalInformationScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const hasMinimumLength = password.length >= 8;
  const hasSpecialCharacter = /[#$%*&]/.test(password);

  const passwordIsValid = hasMinimumLength && hasSpecialCharacter;
  const nameIsValid = username.trim().length > 0;

  function applyChanges() {
    setSubmitted(true);

    if (!nameIsValid) {
      Alert.alert('Missing name', 'Please enter your new name.');
      return;
    }

    if (!passwordIsValid) {
      Alert.alert(
        'Invalid password',
        'Please check the password requirements.',
      );
      return;
    }

    Alert.alert(
      'Details validated',
      'Your new name and password meet the requirements. Saving changes will be connected to the backend later.',
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* APP TITLE */}
        <View style={styles.header}>
          <Text style={styles.logo}>Caduceus</Text>
        </View>

        {/* SECTION TITLE */}
        <Text style={styles.sectionTitle}>
          Personal Information & Password
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
            {/* USERNAME */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Choose your new name
              </Text>

              <TextInput
                value={username}
                onChangeText={setUsername}
                style={[
                  styles.formInput,
                  submitted && !nameIsValid && styles.inputError,
                ]}
                autoCapitalize="words"
                autoCorrect={false}
              />

              {submitted && !nameIsValid && (
                <Text style={styles.errorText}>
                  Please enter your name.
                </Text>
              )}
            </View>

            {/* PASSWORD */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Choose your new password
              </Text>

              <TextInput
                value={password}
                onChangeText={setPassword}
                style={[
                  styles.formInput,
                  submitted && !passwordIsValid && styles.inputError,
                ]}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* PASSWORD REQUIREMENTS */}
              <View style={styles.inputHints}>
                <Text
                  style={[
                    styles.hintText,
                    password.length > 0 &&
                      hasMinimumLength &&
                      styles.validHint,
                  ]}
                >
                  {hasMinimumLength && password.length > 0 ? '✓' : '*'}
                  Password must contain at least 8 characters
                </Text>

                <Text
                  style={[
                    styles.hintText,
                    password.length > 0 &&
                      hasSpecialCharacter &&
                      styles.validHint,
                  ]}
                >
                  {hasSpecialCharacter && password.length > 0 ? '✓' : '*'}
                  Password must contain at least one sign (#, $, %, *, &)
                </Text>
              </View>

              {submitted && !passwordIsValid && (
                <Text style={styles.errorText}>
                  Please check the password requirements.
                </Text>
              )}
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
              onPress={() => navigation.navigate('PreferenceSettingsScreen')}
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
    paddingVertical: 28,
    alignItems: 'center',
  },

  formGroup: {
    width: '100%',
    marginBottom: 20,
  },

  formLabel: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 8,
  },

  formInput: {
    width: '100%',
    height: 48,
    paddingHorizontal: 16,
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DCDCDC',
    borderRadius: 12,
  },

  inputError: {
    borderColor: '#E54D42',
  },

  inputHints: {
    marginTop: 6,
  },

  hintText: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#999999',
  },

  validHint: {
    color: '#2ECC71',
  },

  errorText: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 12,
    color: '#E54D42',
    marginTop: 5,
  },

  /* APPLY BUTTON */

  buttonWrapper: {
    position: 'relative',
    marginTop: 8,
    alignSelf: 'center',
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
