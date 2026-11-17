
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

type OffsetButtonProps = {
  title: string;
  onPress: () => void;
};

export default function OffsetButton({
  title,
  onPress,
}: OffsetButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.container}
    >
      {({ pressed }) => (
        <View style={styles.buttonWrapper}>
          <View
            style={[
              styles.blueOffset,
              pressed && styles.blueOffsetPressed,
            ]}
          />

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
    top: 4,
    left: 0,
    right: -4,
    bottom: -4,
    backgroundColor: '#2B56D4',
    borderRadius: 24,
  },

  blueOffsetPressed: {
    bottom: -7,
  },

  button: {
    minHeight: 50,
    width: '100%',
    backgroundColor: '#FFE89E',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },

  buttonPressed: {
    transform: [{ translateY: -1 }],
  },

  buttonText: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 15,
    textAlign: 'center',
  },
});
