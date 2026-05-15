export type TipoCompleto = 'italiano' | 'dinamico' | 'americano'

export interface CompletosPorTipo {
  italiano: number
  dinamico: number
  americano: number
}

export interface IngredientesCalculados {
  pan: number
  salchicha: number
  mayonesa: number
  tomate: number
  palta: number
  chucrut: number
  mostaza: number
  ketchup: number
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
