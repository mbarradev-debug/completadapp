import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'

type Props = ScrollViewProps & {
  padded?: boolean
}

export function Screen({ padded = true, style, contentContainerStyle, ...props }: Props) {
  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={[padded && styles.content, contentContainerStyle]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.cream,
  },
  content: {
    paddingHorizontal: spacing['2xl'],
  },
})
