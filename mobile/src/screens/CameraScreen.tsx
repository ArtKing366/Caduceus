
import { useRef, useState } from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

import OffsetButton from '../components/OffsetButton';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  async function takePhoto() {
    if (!cameraRef.current || !cameraReady) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo) {
        setCapturedPhoto(photo.uri);
      }
    } catch (error) {
      console.log('Could not take photo:', error);
    }
  }

  function retakePhoto() {
    setCapturedPhoto(null);
    setCameraReady(false);
  }

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>
          Loading camera...
        </Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.title}>Caduceus</Text>

          <Text style={styles.permissionText}>
            We need access to your camera so you can
            take pictures of your food.
          </Text>

          <Pressable
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Allow Camera Access
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Caduceus</Text>

        <View style={styles.cameraContainer}>
          {capturedPhoto ? (
            <Image
              source={{ uri: capturedPhoto }}
              style={styles.cameraPreview}
              resizeMode="cover"
            />
          ) : (
            <CameraView
              ref={cameraRef}
              style={styles.cameraPreview}
              facing="back"
              onCameraReady={() => setCameraReady(true)}
            />
          )}
        </View>

        <View style={styles.actionsGroup}>
          {capturedPhoto ? (
            <OffsetButton
              title="Retake Photo"
              onPress={retakePhoto}
            />
          ) : (
            <>
              <OffsetButton
                title={cameraReady ? 'Take Photo' : 'Preparing camera...'}
                onPress={takePhoto}
              />

              <Text style={styles.dividerText}>OR</Text>

              <OffsetButton
                title="Enter your own ingredients"
                onPress={() => navigation.navigate('IngredientEntry')}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.navBarWrapper}>
        <View style={styles.navBlueLayer} />

        <View style={styles.navBar}>
          {/* Preferences */}
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

          {/* Dashboard */}
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

          {/* Active camera icon */}
          <View style={[styles.navItem, styles.activeCamera]}>
            <View style={styles.cameraBubble}>
              <Image
                source={require('../../assets/images/camera.png')}
                style={styles.navIcon}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Recipes */}
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
    backgroundColor: '#FDF8F2',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    alignItems: 'center',
  },

  title: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 24,
  },

  cameraContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#FFE89E',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },

  cameraPreview: {
    width: '100%',
    height: '100%',
  },

  actionsGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },

  dividerText: {
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 14,
    color: '#1A1A1A',
    marginVertical: 4,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  permissionText: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 16,
    color: '#2B56D4',
    textAlign: 'center',
    marginBottom: 24,
  },

  permissionButton: {
    backgroundColor: '#FFE89E',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 24,
  },

  permissionButtonText: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 15,
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

  activeCamera: {
    transform: [{ translateY: -36 }],
  },

  cameraBubble: {
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
