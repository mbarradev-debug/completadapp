import { Text as RNText, type TextProps } from 'react-native'
import { typography, type TypographyVariant } from '@/theme/typography'

type Props = TextProps & {
  variant?: TypographyVariant
}

export function Text({ variant = 'Body/Regular', style, ...props }: Props) {
  return <RNText style={[typography[variant], style]} {...props} />
}
