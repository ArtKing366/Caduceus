
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Security'
>;

export default function SecurityScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.logo}>Caduceus</Text>
        </View>

        <Text style={styles.sectionTitle}>Security & Privacy</Text>

        <View style={styles.cardContainer}>
          <Image
            source={require('../../assets/images/privacyimg1.png')}
            style={styles.topImage}
            resizeMode="cover"
          />

          <ScrollView
            style={styles.cardBody}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.introText}>
              We take the security of your personal, biological, and dietary
              data very seriously. We implement appropriate technical,
              physical, and administrative safeguards designed to protect
              your information from unauthorized access, loss, misuse, or
              alteration.
            </Text>

            <View style={styles.securityList}>
              <Text style={styles.securityItem}>
                <Text style={styles.boldText}>
                  • Encryption in Transit and at Rest:{' '}
                </Text>
                All data transmitted between your mobile device and our cloud
                servers is encrypted using industry-standard Transport Layer
                Security (TLS/HTTPS) protocols. Data stored on our servers,
                as well as local data cached on your device, is encrypted at
                rest using strong cryptographic algorithms.
              </Text>

              <Text style={styles.securityItem}>
                <Text style={styles.boldText}>
                  • Access Control and Cloud Isolation:{' '}
                </Text>
                We utilize rigorous access controls and database architecture
                features, such as Row-Level Security (RLS), to ensure that
                your specific health logs, weight data, and meal histories
                are strictly isolated and accessible only via your
                authenticated account credentials.
              </Text>

              <Text style={styles.securityItem}>
                <Text style={styles.boldText}>
                  • Third-Party and API Integration Security:{' '}
                </Text>
                When you opt to sync our application with third-party health
                ecosystems (such as Apple Health, Google Health Connect, or
                fitness trackers), data exchange is handled securely via
                authorized tokens (OAuth). Please note that once data is
                transferred to a third-party application, its security is
                governed by the respective platform's privacy policy.
              </Text>

              <Text style={styles.securityItem}>
                <Text style={styles.boldText}>
                  • User Responsibility:{' '}
                </Text>
                While we employ robust security measures, you play a vital
                role in keeping your data safe. You are solely responsible
                for maintaining the confidentiality of your account password
                and login credentials. We strongly recommend using unique,
                strong passwords and utilizing your device's native biometric
                locks (e.g., FaceID, fingerprint authentication) to prevent
                unauthorized local access to your app.
              </Text>

              <Text style={styles.securityItem}>
                <Text style={styles.boldText}>
                  • No Absolute Guarantee:{' '}
                </Text>
                Please be aware that no method of electronic transmission
                over the internet or method of digital storage is 100% secure.
                While we strive to use commercially
              </Text>
            </View>
          </ScrollView>

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

            {/* SETTINGS - POSITION 3, CENTRE BUBBLE */}
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

  sectionTitle: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 20,
    color: '#2B56D4',
    marginTop: 10,
    marginBottom: 14,
  },

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

  cardBody: {
    flex: 1,
    padding: 16,
  },

  introText: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 12,
    lineHeight: 17,
    color: '#1A1A1A',
    marginBottom: 14,
  },

  securityList: {
    gap: 14,
  },

  securityItem: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#1A1A1A',
  },

  boldText: {
    fontFamily: 'ClashDisplay-Bold',
  },

  bottomImage: {
    width: '100%',
    height: 110,
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
