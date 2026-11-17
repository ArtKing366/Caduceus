
import {
  Pressable,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

type PreferencePillProps = {
  title: string;
  icon: any;
  selected: boolean;
  onPress: () => void;
};

export default function PreferencePill({
  title,
  icon,
  selected,
  onPress,
}: PreferencePillProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={[
        styles.pill,
        selected && styles.selectedPill,
      ]}
    >
      <Image
        source={icon}
        style={[
          styles.icon,
          selected && styles.selectedIcon,
        ]}
        resizeMode="contain"
      />

      <Text
        style={[
          styles.text,
          selected && styles.selectedText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    minHeight: 40,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  selectedPill: {
    backgroundColor: '#2B56D4',
    borderColor: '#2B56D4',
    shadowColor: '#2B56D4',
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 10,
    elevation: 4,
  },

  icon: {
    width: 20,
    height: 20,
  },

  selectedIcon: {
    tintColor: '#FFFFFF',
  },

  text: {
    color: '#1A1A1A',
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 14,
  },

  selectedText: {
    color: '#FFFFFF',
  },

});
