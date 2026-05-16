import { StyleSheet, View } from 'react-native'
import { colors } from '@/theme/colors'

interface ProgressStepperProps {
  current: number
  total: number
}

export function ProgressStepper({ current, total }: ProgressStepperProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => {
        const active = i < current
        return (
          <View
            key={i}
            style={[styles.dot, active ? styles.dotActive : styles.dotInactive]}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 12,
    backgroundColor: colors.brand.red,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.neutral.sand,
  },
})
