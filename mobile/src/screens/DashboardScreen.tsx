
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
// Dashboard Screen
export default function DashboardScreen() {
    const navigation =
  useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Dashboard title */}
        <Text style={styles.title}>
          Welcome to Caduceus
        </Text>

        {/* Top widgets */}
        <View style={styles.widgetsRow}>

          {/* Calorie widget */}
          <View style={styles.widgetCard}>
            <Image
              source={require('../../assets/images/caloriecount.png')}
              style={styles.widgetImage}
              resizeMode="cover"
            />

            <View style={styles.widgetOverlay}>
              <Text style={styles.widgetLabel}>
                Time for a snack
              </Text>

              <Text style={styles.widgetValue}>
                1800kcal/2400kcal
              </Text>
            </View>
          </View>

          {/* Water widget */}
          <View style={styles.widgetCard}>
            <Image
              source={require('../../assets/images/waterperday.png')}
              style={styles.widgetImage}
              resizeMode="cover"
            />

            <View style={styles.widgetOverlay}>
              <Text style={styles.widgetLabel}>
                Time to drink
              </Text>

              <Text style={styles.widgetValue}>
                1.8L/3L
              </Text>
            </View>
          </View>

        </View>

        {/* Discover banner */}
        <View style={styles.bannerWrapper}>

          <View style={styles.blueShadowLayer} />

          <View style={styles.bannerCard}>
            <Image
              source={require('../../assets/images/backgrounddashboard.png')}
              style={styles.bannerImage}
              resizeMode="cover"
            />

            <View style={styles.bannerOverlay}>

              {/* Discover button with blue offset */}
              <View style={styles.discoverButtonWrapper}>
                <View style={styles.discoverButtonShadow} />

                <Text style={styles.discoverButtonText}>
                  Discover your dish
                </Text>
              </View>

            </View>
          </View>
        </View>

        {/* Recent activity */}
        <Text style={styles.sectionTitle}>
          Recent activity
        </Text>

        <View style={styles.activityList}>

          {/* Quark pancakes */}
          <View style={styles.activityWrapper}>

            <View style={styles.blueShadowLayer} />

            <View style={styles.activityCard}>

              <Image
                source={require('../../assets/images/quark-pancakes.png')}
                style={styles.foodImage}
                resizeMode="cover"
              />

              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>
                  Quark pancakes
                </Text>

                <Text style={styles.foodCalories}>
                  Total value: 350 kcal
                </Text>
              </View>

              <View style={styles.macroBadges}>
                <MacroBadge value="38gr" label="Protein" />
                <MacroBadge value="8gr" label="Fat" />
                <MacroBadge value="5gr" label="Fiber" />
              </View>

            </View>
          </View>

          {/* Croissant */}
          <View style={styles.activityWrapper}>

            <View style={styles.blueShadowLayer} />

            <View style={styles.activityCard}>

              <Image
                source={require('../../assets/images/croissant.png')}
                style={styles.foodImage}
                resizeMode="cover"
              />

              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>
                  Croissant
                </Text>

                <Text style={styles.foodCalories}>
                  Total value: 220 kcal
                </Text>
              </View>

              <View style={styles.macroBadges}>
                <MacroBadge value="8gr" label="Protein" />
                <MacroBadge value="12gr" label="Fat" />
                <MacroBadge value="3gr" label="Fiber" />
              </View>

            </View>
          </View>

        </View>

      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.navBarWrapper}>

        {/* Blue extension above navigation */}
        <View style={styles.navBlueLayer} />

        <View style={styles.navBar}>

          {/* Nutrition */}
          <View style={styles.navItem}>
            <Image
              source={require('../../assets/images/leaf.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </View>

          {/* Camera */}
          <View style={styles.navItem}>
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
          </View>

          {/* Selected Home */}
          <View style={[styles.navItem, styles.activeHome]}>
            <View style={styles.homeBubble}>
              <Image
                source={require('../../assets/images/house.png')}
                style={styles.navIcon}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Recipes */}
          <View style={styles.navItem}>
            <Image
              source={require('../../assets/images/recipes.png')}
              style={styles.navIcon}
              resizeMode="contain"
            />
          </View>

          {/* Settings */}
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


// Reusable macro badge
function MacroBadge({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.badgeItem}>
      <View style={styles.badgeCircle}>
        <Text style={styles.badgeValue}>
          {value}
        </Text>
      </View>

      <Text style={styles.badgeLabel}>
        {label}
      </Text>
    </View>
  );
}


// Styles
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FDF8F2',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },

  // Dashboard title
  title: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 24,
    marginBottom: 40,
  },

  // Top widgets
  widgetsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  widgetCard: {
    flex: 1,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },

  widgetImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  widgetOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.30)',
    justifyContent: 'flex-end',
    padding: 10,
  },

  widgetLabel: {
    color: '#FFEDA9',
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 11,
  },

  widgetValue: {
    color: '#FFEDA9',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 12,
  },

  // Banner
  bannerWrapper: {
    position: 'relative',
    marginTop: 16,
    marginRight: 6,
  },

  blueShadowLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: -6,
    backgroundColor: '#2B56D4',
    borderRadius: 20,
  },

  bannerCard: {
    position: 'relative',
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  bannerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 12,
  },

  // Discover button
  discoverButtonWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },

  discoverButtonShadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: -6,
    backgroundColor: '#2B56D4',
    borderRadius: 20,
  },

  discoverButtonText: {
    color: '#2B56D4',
    backgroundColor: '#FFE89E',
    overflow: 'hidden',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 13,
  },

  // Recent activity
  sectionTitle: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 18,
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 16,
  },

  activityList: {
    gap: 14,
  },

  activityWrapper: {
    position: 'relative',
    marginRight: 6,
  },

  activityCard: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#FFE89E',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  foodImage: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },

  foodInfo: {
    flex: 1,
    minWidth: 0,
  },

  foodName: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 12,
  },

  foodCalories: {
    color: '#666666',
    fontSize: 9,
    marginTop: 2,
  },

  // Macro badges
  macroBadges: {
    flexDirection: 'row',
    gap: 5,
  },

  badgeItem: {
    alignItems: 'center',
  },

  badgeCircle: {
    width: 29,
    height: 29,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeValue: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 8,
  },

  badgeLabel: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 8,
    marginTop: 2,
  },

  // Bottom navigation
  navBarWrapper: {
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },

  // Blue now extends upwards instead of to the right
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

  // Selected home icon
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
