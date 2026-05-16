// Border radius tokens from Figma file yNZABLj9uCBoszDnlCKXtl — collection: Design Tokens
export const radius = {
  sm:   8,   // VariableID:45:22 — chips, badges
  md:   12,  // VariableID:45:23 — cards de contenido
  lg:   16,  // VariableID:45:24 — cards principales
  pill: 100, // VariableID:45:25 — botones CTA, steppers
} as const

export type RadiusKey = keyof typeof radius
