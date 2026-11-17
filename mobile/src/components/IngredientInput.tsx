
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';

type IngredientInputProps = {
  name: string;
  amount: string;
  unit: 'g' | 'ml';
  onNameChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onUnitChange: (value: 'g' | 'ml') => void;
};

export default function IngredientInput({
  name,
  amount,
  unit,
  onNameChange,
  onAmountChange,
  onUnitChange,
}: IngredientInputProps) {
  return (
    <View style={styles.row}>
      <TextInput
        style={styles.nameInput}
        value={name}
        onChangeText={onNameChange}
        placeholder="Type your ingredients..."
        placeholderTextColor="#A0A0A0"
        autoCapitalize="sentences"
      />

      <View style={styles.weightGroup}>
        <TextInput
          style={styles.weightInput}
          value={amount}
          onChangeText={onAmountChange}
          placeholder="0"
          placeholderTextColor="#A0A0A0"
          keyboardType="decimal-pad"
        />

        <Pressable
          style={styles.unitButton}
          onPress={() => onUnitChange(unit === 'g' ? 'ml' : 'g')}
          accessibilityRole="button"
          accessibilityLabel={`Measurement unit ${unit}. Tap to change`}
        >
          <Text style={styles.unitText}>{unit}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  nameInput: {
    flex: 1,
    minWidth: 0,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DCDCDC',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 12,
    color: '#1A1A1A',
  },

  weightGroup: {
    width: 82,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DCDCDC',
    borderRadius: 8,
    paddingHorizontal: 7,
  },

  weightInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    padding: 0,
    fontFamily: 'ClashDisplay-Medium',
    fontSize: 12,
    color: '#1A1A1A',
    textAlign: 'center',
  },

  unitButton: {
    minWidth: 25,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  unitText: {
    color: '#2B56D4',
    fontFamily: 'ClashDisplay-Bold',
    fontSize: 12,
  },
});
