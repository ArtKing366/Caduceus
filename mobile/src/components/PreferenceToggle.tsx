
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

type PreferenceToggleProps = {
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export default function PreferenceToggle({
  title,
  value,
  onValueChange,
}: PreferenceToggleProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.blueShadow} />

      <Pressable
        style={styles.card}
        onPress={() => onValueChange(!value)}
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityState={{ checked: value }}
      >
        <Text style={styles.title}>
          {title}
        </Text>

        <View
          style={[
            styles.toggle,
            value && styles.toggleActive,
          ]}
        >
          <View
            style={[
              styles.toggleKnob,
              value && styles.toggleKnobActive,
            ]}
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginRight: 5,
  },

  blueShadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: -5,
    backgroundColor: '#2B56D4',
    borderRadius: 12,
  },

  card: {
    minHeight: 48,
    backgroundColor: '#FFE89E',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 14,
  },

  toggle: {
    width: 48,
    height: 24,
    backgroundColor: '#D8D8D8',
    borderRadius: 20,
    justifyContent: 'center',
    padding: 3,
  },

  toggleActive: {
    backgroundColor: '#2B56D4',
  },

  toggleKnob: {
    width: 18,
    height: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    elevation: 2,
  },

  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
});
