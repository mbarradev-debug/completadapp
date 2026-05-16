// Spacing tokens from Figma file yNZABLj9uCBoszDnlCKXtl — collection: Design Tokens
export const spacing = {
  xs:    4,  // VariableID:45:16
  sm:    8,  // VariableID:45:17
  md:    12, // VariableID:45:18
  lg:    16, // VariableID:45:19 — padding interno de cards
  xl:    24, // VariableID:45:20 — gap entre cards y secciones
  '2xl': 32, // VariableID:45:21 — padding horizontal base de todas las pantallas
} as const

export type SpacingKey = keyof typeof spacing
