
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';

type PasswordInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  status?: 'default' | 'error' | 'success';
};

export default function PasswordInput({
  value,
  onChangeText,
  status = 'default',
}: PasswordInputProps) {
  return (
    <View style={styles.container}>

      <Text style={styles.label}>
        Choose your password
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        style={[
          styles.input,
          status === 'error' && styles.errorInput,
          status === 'success' && styles.successInput,
        ]}
      />

      <View style={styles.hints}>
        <Text style={styles.hintText}>
          *Password must contain at least 8 characters
        </Text>

        <Text style={styles.hintText}>
          *Password must contain at least one sign (#, $, %, *, &)
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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

  successInput: {
    borderColor: '#2ECC71',
  },

  hints: {
    marginTop: 6,
  },

  hintText: {
    fontSize: 11,
    color: '#999999',
    lineHeight: 16,
  },
});
