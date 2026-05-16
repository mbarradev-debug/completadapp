// Color tokens extracted from Figma file yNZABLj9uCBoszDnlCKXtl — collection: Design Tokens
export const colors = {
  brand: {
    red: '#C1272D',      // VariableID:45:3 — CTA principal, un solo elemento por pantalla
    redLight: '#FFF1E6', // VariableID:45:4
    teal: '#0B7A75',     // VariableID:45:5
  },
  neutral: {
    cream: '#FFF8E8',    // VariableID:45:6 — fondo base de todas las pantallas
    sand: '#D9C8A0',     // VariableID:45:7
    sandLight: '#F5EDD8',// VariableID:45:8
    white: '#FFFFFF',    // VariableID:45:9
    carbon: '#1A1A1A',   // VariableID:45:10 — texto principal
    gray: '#666666',     // VariableID:45:11 — texto secundario
    grayLight: '#999999',// VariableID:45:12
  },
  accent: {
    mustardText: '#9A6F00',   // VariableID:45:13 — solo en badges de precio
    mustardBg: '#FFF8E0',     // VariableID:45:14 — solo en badges de precio
    mustardBorder: '#D4A017', // VariableID:45:15 — solo en badges de precio
  },
} as const

export type Colors = typeof colors
