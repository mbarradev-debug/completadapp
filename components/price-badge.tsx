import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/text'
import { colors } from '@/theme/colors'
import { radius } from '@/theme/radius'

interface PriceBadgeProps {
  value: number
}

function formatCLP(value: number): string {
  return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function PriceBadge({ value }: PriceBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text variant="Label/Bold" style={styles.text}>
        {formatCLP(value)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.accent.mustardBorder,
    backgroundColor: colors.accent.mustardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.accent.mustardText,
  },
})
