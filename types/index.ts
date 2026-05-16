export type TipoCompleto = 'italiano' | 'dinamico' | 'americano'

export interface CompletosPorTipo {
  italiano: number
  dinamico: number
  americano: number
}

export type FormatoMayonesa = 'chico' | 'mediano' | 'grande'

export interface IngredientesCalculados {
  vienesas: { total: number; packsX5: number; packsX20: number }
  pan: { total: number; packsX8: number }
  palta: { aplica: boolean; mallas: number }
  tomate: { aplica: boolean; unidades: number }
  mayonesa: { formato: FormatoMayonesa; cantidad: number; recomendarUpgrade: boolean }
  mostaza: { aplica: boolean; frascos: number }
  ketchup: { aplica: boolean; frascos: number }
  chucrut: { aplica: boolean; tarros: number }
}

export interface Completada {
  id: string
  nombre: string
  fecha: string
  personas: number
  completos: CompletosPorTipo
  precios: Record<string, number>
  ingredientes: IngredientesCalculados
  creadaEn: string
}
