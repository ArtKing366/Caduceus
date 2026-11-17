
import {
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'blue' | 'cream';
};

export default function PrimaryButton({
  title,
  onPress,
  variant = 'blue',
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'blue' ? styles.blueButton : styles.creamButton,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={styles.buttonText}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderColor: '#2B56D4',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  blueButton: {
    backgroundColor: '#F6F8FE',
  },

  creamButton: {
    backgroundColor: '#FFF9F5',
  },

  buttonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#FFE89E',
  },

  buttonText: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 16,
  },
});
