
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

type PreferenceContinueButtonProps = {
  onPress: () => void;
};

export default function PreferenceContinueButton({
  onPress,
}: PreferenceContinueButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={styles.buttonText} numberOfLines={1}>
        Continue
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 106,
    height: 46,
    backgroundColor: '#FFF9F5',
    borderColor: '#2B56D4',
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#FFE89E',
  },

  buttonText: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
});
