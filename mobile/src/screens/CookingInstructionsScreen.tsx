
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

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CookingInstructions'
>;

const steps = [
  'Bring a pot of salted water to a boil.',
  'Add the dry pasta and cook until al dente, approximately 8–10 minutes.',
  'Before draining, save about ¼ cup (60 ml) of pasta water. Drain the pasta.',
  'Return the pot to medium-low heat. Add the olive oil and butter, then let the butter melt.',
  'Add the minced garlic and cook for approximately 30–60 seconds, stirring gently.',
  'Reduce the heat to low so the sauce does not get too hot.',
  'Add the cream cheese and half of the reserved pasta water. Stir until the sauce becomes smooth and creamy.',
  'Add the cooked pasta. Turn off the heat, add the parmesan, and mix everything together until evenly coated.',
];

export default function CookingInstructionsScreen() {
  const navigation = useNavigation<NavigationProp>();

  function completeCooking() {
    Alert.alert(
      'Cooking completed!',
      'Your dish is ready. Enjoy your meal!',
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Image
              source={require('../../assets/images/recipes.png')}
              style={styles.headerIconImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.logo}>Caduceus</Text>
        </View>

        {/* TITLE */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Let's make your dish!</Text>
          <Text style={styles.subtitle}>
            Follow each step to prepare your meal.
          </Text>
        </View>

        {/* SCROLLABLE INSTRUCTIONS */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsHeader}>
            <Text style={styles.instructionsTitle}>
              Cooking instructions
            </Text>

            <Text style={styles.stepsCount}>
              {steps.length} steps
            </Text>
          </View>

          <ScrollView
            style={styles.stepsScroll}
            contentContainerStyle={styles.stepsContent}
            showsVerticalScrollIndicator={false}
          >
            {steps.map((step, index) => (
              <View key={index} style={styles.stepCard}>

                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>
                    {index + 1}
                  </Text>
                </View>

                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepLabel}>
                    STEP {index + 1}
                  </Text>

                  <Text style={styles.stepText}>
                    {step}
                  </Text>
                </View>

              </View>
            ))}

            <View style={styles.endMessage}>
              <Text style={styles.endEmoji}>🏁</Text>
              <Text style={styles.endTitle}>Almost there!</Text>
              <Text style={styles.endText}>
                Your delicious meal is ready to enjoy.
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* COMPLETE BUTTON */}
        <Pressable
          onPress={completeCooking}
          style={({ pressed }) => [
            styles.completeButtonWrapper,
            pressed && styles.completeButtonPressed,
          ]}
        >
          <View style={styles.completeButtonOffset} />

          <View style={styles.completeButton}>
            <Text style={styles.completeButtonText}>
              Complete cooking
            </Text>
          </View>
        </Pressable>

        {/* BOTTOM NAVIGATION */}
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
              style={styles.activeNavItem}
              onPress={() => navigation.navigate('RestaurantSearch')}
            >
              <Image
                source={require('../../assets/images/recipes.png')}
                style={styles.activeNavIcon}
                resizeMode="contain"
              />
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
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  headerIcon: {
    position: 'absolute',
    left: 0,
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FFE89E',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerIconImage: {
    width: 22,
    height: 22,
  },

  logo: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 25,
    color: '#2B56D4',
  },

  /* TITLE */

  titleSection: {
    marginTop: 12,
    marginBottom: 18,
  },

  title: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 25,
    color: '#2B56D4',
  },

  subtitle: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 14,
    color: '#777777',
    marginTop: 4,
  },

  /* INSTRUCTIONS CONTAINER */

  instructionsContainer: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0E9E2',
    padding: 15,
    marginBottom: 14,
  },

  instructionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  instructionsTitle: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 17,
    color: '#2B56D4',
  },

  stepsCount: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 12,
    color: '#777777',
    backgroundColor: '#FFF4D2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  stepsScroll: {
    flex: 1,
  },

  stepsContent: {
    paddingBottom: 8,
    gap: 12,
  },

  /* INDIVIDUAL STEP CARDS */

  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9F5',
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: '#F3EDE7',
  },

  stepNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: '#2B56D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },

  stepNumber: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },

  stepTextContainer: {
    flex: 1,
  },

  stepLabel: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 10,
    color: '#2B56D4',
    letterSpacing: 1,
    marginBottom: 4,
  },

  stepText: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 14,
    lineHeight: 21,
    color: '#343434',
  },

  /* END MESSAGE */

  endMessage: {
    alignItems: 'center',
    paddingVertical: 18,
    marginTop: 2,
  },

  endEmoji: {
    fontSize: 27,
    marginBottom: 5,
  },

  endTitle: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 18,
    color: '#2B56D4',
  },

  endText: {
    fontFamily: 'ClashDisplay-Regular',
    fontSize: 12,
    color: '#777777',
    marginTop: 3,
    textAlign: 'center',
  },

  /* COMPLETE BUTTON */

  completeButtonWrapper: {
    width: '100%',
    position: 'relative',
    marginBottom: 24,
  },

  completeButtonOffset: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: -4,
    bottom: -4,
    backgroundColor: '#2B56D4',
    borderRadius: 24,
  },

  completeButton: {
    minHeight: 50,
    backgroundColor: '#FFE89E',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
  },

  completeButtonText: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 15,
    color: '#2B56D4',
  },

  completeButtonPressed: {
    transform: [{ translateY: -1 }],
  },

  /* BOTTOM NAVIGATION */

  navBarWrapper: {
    position: 'relative',
    marginHorizontal: 0,
    marginTop: 4,
    marginBottom: 8,
  },

  navBlueLayer: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2B56D4',
    borderRadius: 24,
  },

  navBar: {
    height: 68,
    backgroundColor: '#FFE89E',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },

  navItem: {
    flex: 1,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    width: 21,
    height: 21,
  },

  activeNavItem: {
    width: 48,
    height: 48,
    borderRadius: 50,
    backgroundColor: '#FFEDA9',
    borderWidth: 3,
    borderColor: '#2B56D4',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -36 }],
  },

  activeNavIcon: {
    width: 22,
    height: 22,
  },
});
