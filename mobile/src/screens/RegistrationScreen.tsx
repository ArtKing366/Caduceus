import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import PasswordInput from '../components/PasswordInput';

export default function RegistrationScreen() {
const navigation =
  useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { height } = useWindowDimensions();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const passwordIsValid =
    password.length >= 8 && /[#$%*&]/.test(password);

const handleContinue = () => {
  setSubmitted(true);
  setMessage('');

  if (!username.trim() || !passwordIsValid) {
    return;
  }

  navigation.navigate('Preferences');
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

      {/* Registration form */}
      <View style={styles.formArea}>

        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.form}>

            {/* Name input */}
            <View style={styles.formGroup}>

              <Text style={styles.label}>
                Choose your name
              </Text>

              <TextInput
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setMessage('');
                }}
                style={[
                  styles.input,
                  submitted && !username.trim() && styles.errorInput,
                ]}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />

              {submitted && !username.trim() && (
                <Text style={styles.errorText}>
                  Please enter your name.
                </Text>
              )}

            </View>

            {/* Password component */}
            <PasswordInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setMessage('');
              }}
              status={
                !submitted
                  ? 'default'
                  : passwordIsValid
                    ? 'success'
                    : 'error'
              }
            />

            {submitted && !passwordIsValid && (
              <Text style={styles.errorText}>
                Please check the password requirements.
              </Text>
            )}

            {/* Continue button */}
            <PrimaryButton
              title="Continue"
              variant="cream"
              onPress={handleContinue}
            />

            {message !== '' && (
              <Text style={styles.successText}>
                {message}
              </Text>
            )}

          </View>

        </ScrollView>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFF9F5',
  },

  // Top illustration
  topImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
  },

  // Bottom illustration
  bottomImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
  },

  // Form stays in its original position
  formArea: {
    flex: 1,
    zIndex: 1,
  },

  formScroll: {
    flex: 1,
    width: '100%',
  },

  formContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

  form: {
    width: '100%',
    alignItems: 'center',
  },

  formGroup: {
    width: '100%',
    marginBottom: 20,
  },

  label: {
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DCDCDC',
    borderRadius: 12,
  },

  errorInput: {
    borderColor: '#E54D42',
  },

  errorText: {
    fontSize: 12,
    color: '#E54D42',
    marginTop: 5,
  },

  successText: {
    fontSize: 12,
    color: '#2ECC71',
    textAlign: 'center',
    marginTop: 12,
  },

});
