import { StyleSheet, View } from 'react-native'
import { Text } from '@/components/text'
import { colors } from '@/theme/colors'
import { radius } from '@/theme/radius'
import { spacing } from '@/theme/spacing'

interface InfoPillProps {
  text: string
}

export function InfoPill({ text }: InfoPillProps) {
  return (
    <View style={styles.container}>
      <Text variant="Body/Caption" style={styles.text}>
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.sandLight,
    borderWidth: 1,
    borderColor: colors.neutral.sand,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  text: {
    color: colors.neutral.gray,
  },
})
