import { StyleSheet, TouchableOpacity, type StyleProp, type ViewStyle } from 'react-native'
import { Text } from '@/components/text'
import { colors } from '@/theme/colors'
import { radius } from '@/theme/radius'

interface ButtonProps {
  label: string
  onPress: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  style?: StyleProp<ViewStyle>
}

export function Button({ label, onPress, disabled = false, variant = 'primary', style }: ButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.base, isPrimary ? styles.primary : styles.secondary, disabled && styles.disabled, style]}
    >
      <Text
        variant="Action/Button"
        style={[styles.label, !isPrimary && styles.labelSecondary]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: colors.brand.red,
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.neutral.sandLight,
    borderWidth: 1.5,
    borderColor: colors.neutral.sand,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: colors.neutral.white,
    textAlign: 'center',
  },
  labelSecondary: {
    color: colors.neutral.carbon,
  },
})
