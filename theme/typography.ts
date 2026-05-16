import type { TextStyle } from 'react-native'

// Font family names registered in app/_layout.tsx via expo-font (DBO-99)
export const fontFamily = {
  heading: 'AlfaSlabOne_Regular',
  body: 'DMSans_Regular',
  bodyMedium: 'DMSans_Medium',
  bodyBold: 'DMSans_Bold',
  logo: 'Pacifico_Regular',
  label: 'SpecialElite_Regular',
} as const

// Text styles — verified 1:1 against Figma file yNZABLj9uCBoszDnlCKXtl (node 23:144)
// lineHeight values are absolute pixels (React Native convention)
export const typography = {
  'Display/Logo':      { fontFamily: fontFamily.logo,       fontSize: 24, lineHeight: 32 },
  'Heading/H1':        { fontFamily: fontFamily.heading,    fontSize: 26, lineHeight: 34 },
  'Heading/H2':        { fontFamily: fontFamily.heading,    fontSize: 22, lineHeight: 28 },
  'Heading/H3-Nav':    { fontFamily: fontFamily.heading,    fontSize: 18, lineHeight: 24 },
  'Heading/H4':        { fontFamily: fontFamily.heading,    fontSize: 16, lineHeight: 21 },
  'Heading/Stepper':   { fontFamily: fontFamily.heading,    fontSize: 60, lineHeight: 78 },
  'Action/Button':     { fontFamily: fontFamily.heading,    fontSize: 17, lineHeight: 22 },
  'Action/Stepper':    { fontFamily: fontFamily.heading,    fontSize: 30, lineHeight: 39 },
  'Body/Regular':      { fontFamily: fontFamily.body,       fontSize: 15, lineHeight: 21 },
  'Body/Small':        { fontFamily: fontFamily.body,       fontSize: 14, lineHeight: 20 },
  'Body/XSmall':       { fontFamily: fontFamily.body,       fontSize: 13, lineHeight: 18 },
  'Body/Caption':      { fontFamily: fontFamily.body,       fontSize: 12, lineHeight: 17 },
  'Label/Bold':        { fontFamily: fontFamily.bodyBold,   fontSize: 15, lineHeight: 20 },
  'Label/Medium-15':   { fontFamily: fontFamily.bodyMedium, fontSize: 15, lineHeight: 21 },
  'Special/FormLabel': { fontFamily: fontFamily.label,      fontSize: 12, lineHeight: 16 },
  'Special/Category':  { fontFamily: fontFamily.label,      fontSize: 10, lineHeight: 13 },
} satisfies Record<string, TextStyle>

export type TypographyVariant = keyof typeof typography
