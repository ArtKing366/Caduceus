
import { useState } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';

import PreferenceContinueButton from '../components/PreferenceContinueButton';
import PreferencePill from '../components/PreferencePill';

export default function PreferencesScreen() {
  const { height } = useWindowDimensions();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedPreferences, setSelectedPreferences] =
    useState<string[]>([]);

  const togglePreference = (preference: string) => {
    setSelectedPreferences((current) =>
      current.includes(preference)
        ? current.filter((item) => item !== preference)
        : [...current, preference]
    );
  };

  const imageHeight = height * 0.32;

  return (
    <View style={styles.container}>
      {/* Top illustration */}
      <Image
        source={require('../../assets/images/top-illustration.png')}
        style={[styles.topImage, { height: imageHeight }]}
        resizeMode="cover"
      />

      {/* Bottom illustration */}
      <Image
        source={require('../../assets/images/bottom-illustration.png')}
        style={[styles.bottomImage, { height: imageHeight }]}
        resizeMode="cover"
      />

      <View style={styles.contentArea}>
        <Text style={styles.title}>
          Choose your food{' '}
          {'\n'}
          preferences
        </Text>

        <View style={styles.crossLayout}>

          {/* Top */}
          <View style={styles.topPreference}>
            <PreferencePill
              title="Vegan"
              icon={require('../../assets/images/vegan.png')}
              selected={selectedPreferences.includes('Vegan')}
              onPress={() => togglePreference('Vegan')}
            />
          </View>

          {/* Middle row */}
          <View style={styles.middleRow}>

            {/* Left */}
            <View style={styles.sidePreference}>
              <PreferencePill
                title="Gluten-free"
                icon={require('../../assets/images/gluten-free.png')}
                selected={selectedPreferences.includes('Gluten-free')}
                onPress={() => togglePreference('Gluten-free')}
              />
            </View>

            {/* Center */}
            <View style={styles.centerButton}>
<PreferenceContinueButton
  onPress={() => navigation.navigate('Dashboard')}
/>
            </View>

            {/* Right */}
            <View style={styles.sidePreference}>
              <PreferencePill
                title="Sugar-free"
                icon={require('../../assets/images/sugar-free.png')}
                selected={selectedPreferences.includes('Sugar-free')}
                onPress={() => togglePreference('Sugar-free')}
              />
            </View>

          </View>

          {/* Bottom */}
          <View style={styles.bottomPreference}>
            <PreferencePill
              title="Lactose-free"
              icon={require('../../assets/images/lactose-free.png')}
              selected={selectedPreferences.includes('Lactose-free')}
              onPress={() => togglePreference('Lactose-free')}
            />
          </View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },

  topImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
  },

  bottomImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
  },

  contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    paddingHorizontal: 16,
  },

  title: {
    color: '#1E56CD',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 32,
  },

  crossLayout: {
    width: '100%',
    alignItems: 'center',
  },

  topPreference: {
    marginBottom: 24,
  },

  middleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sidePreference: {
    flex: 1,
    alignItems: 'center',
  },

  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },

  bottomPreference: {
    marginTop: 24,
  },
});
