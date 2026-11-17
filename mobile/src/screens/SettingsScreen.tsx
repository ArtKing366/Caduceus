
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();

  function openSetting(setting: string) {
    if (setting === 'Security') {
      navigation.navigate('Security');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.logo}>Caduceus</Text>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
        </View>

        <View style={styles.settingsList}>
          <Pressable
            onPress={() => navigation.navigate('PersonalInformation')}
            style={({ pressed }) => [
              styles.settingWrapper,
              pressed && styles.settingPressed,
            ]}
          >
            <View style={styles.settingBlueOffset} />
            <View style={styles.settingCard}>
              <Text style={styles.settingLabel}>
                Personal information & password
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('DailyGoals')}
            style={({ pressed }) => [
              styles.settingWrapper,
              pressed && styles.settingPressed,
            ]}
          >
            <View style={styles.settingBlueOffset} />
            <View style={styles.settingCard}>
              <Text style={styles.settingLabel}>Daily goals</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => openSetting('Security')}
            style={({ pressed }) => [
              styles.settingWrapper,
              pressed && styles.settingPressed,
            ]}
          >
            <View style={styles.settingBlueOffset} />
            <View style={styles.settingCard}>
              <Text style={styles.settingLabel}>Security</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.emptySpace} />

        {/* BOTTOM NAVIGATION */}
        <View style={styles.navBarWrapper}>
          <View style={styles.navBlueLayer} />

          <View style={styles.navBar}>
            {/* PREFERENCES - POSITION 1 */}
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

            {/* CAMERA - POSITION 2 */}
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

            {/* SETTINGS - POSITION 3, EXACT CENTRE */}
            <View style={[styles.navItem, styles.activeHome]}>
              <View style={styles.homeBubble}>
                <Image
                  source={require('../../assets/images/settings.png')}
                  style={styles.navIcon}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* RECIPES - POSITION 4 */}
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

            {/* HOME - POSITION 5 */}
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

  titleContainer: {
    marginTop: 10,
    marginBottom: 18,
  },

  sectionTitle: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 20,
    color: '#2B56D4',
  },

  settingsList: {
    gap: 16,
  },

  settingWrapper: {
    width: '100%',
    position: 'relative',
  },

  settingBlueOffset: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: -5,
    bottom: 0,
    backgroundColor: '#2B56D4',
    borderRadius: 12,
  },

  settingCard: {
    minHeight: 54,
    backgroundColor: '#FFE89E',
    borderWidth: 1.5,
    borderColor: '#2B56D4',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },

  settingLabel: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 14,
    color: '#2B56D4',
  },

  settingPressed: {
    transform: [{ translateY: -1 }],
  },

  emptySpace: {
    flex: 1,
  },

  /* BOTTOM NAVIGATION - SAME DIMENSIONS AS DASHBOARD */

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
