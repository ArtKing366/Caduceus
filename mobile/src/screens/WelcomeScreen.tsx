
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';
import PrimaryButton from '../components/PrimaryButton';

export default function WelcomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>

      {/* Top illustration */}
      <Image
        source={require('../../assets/images/top-illustration.png')}
        style={styles.topImage}
        resizeMode="cover"
      />

      {/* Center content */}
      <View style={styles.cardBody}>
        <Text style={styles.title}>
          Welcome to{"\n"}Caduceus
        </Text>

        <PrimaryButton
          title="Start your journey"
          onPress={() => navigation.navigate('Registration')}
        />
      </View>

      {/* Bottom illustration */}
      <Image
        source={require('../../assets/images/bottom-illustration.png')}
        style={styles.bottomImage}
        resizeMode="cover"
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F2',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  topImage: {
    width: '100%',
    height: '32%',
  },

  cardBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 25,
    paddingHorizontal: 20,
  },

title: {
  color: '#1E56CD',
  textAlign: 'center',
  fontFamily: 'ClashDisplay-Bold',
  fontSize: 48,
  fontWeight: 'normal',
},

  bottomImage: {
    width: '100%',
    height: '32%',
  },
});
