
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

type SaveRecipeButtonProps = {
  title: string;
  onPress: () => void;
};

export default function SaveRecipeButton({
  title,
  onPress,
}: SaveRecipeButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
    >
      {({ pressed }) => (
        <View style={styles.buttonWrapper}>
          {/* Blue offset layer */}
          <View
            style={[
              styles.blueOffset,
              pressed && styles.blueOffsetPressed,
            ]}
          />

          {/* Yellow button */}
          <View
            style={[
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {title}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  buttonWrapper: {
    position: 'relative',
    width: '100%',
  },

  blueOffset: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -5,
    right: -5,
    backgroundColor: '#2B56D4',
    borderRadius: 24,
  },

  blueOffsetPressed: {
    top: -4,
    bottom: -4,
    left: -4,
    right: -4,
  },

  button: {
    width: '100%',
    minHeight: 50,
    backgroundColor: '#FFE89E',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 14,
    textAlign: 'center',
  },
});
