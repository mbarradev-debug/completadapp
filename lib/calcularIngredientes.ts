import type { CompletosPorTipo, FormatoMayonesa, IngredientesCalculados } from '@/types'

// Capacidades de compra
const PACK_VIENESAS_X5 = 5
const PACK_VIENESAS_X20 = 20
const PACK_PAN = 8
const GRAMOS_PALTA_USABLE = 700    // de una malla de 1kg
const GRAMOS_TOMATE = 140
const GRAMOS_MAYO_CHICO = 394
const GRAMOS_MAYO_MEDIANO = 789
const GRAMOS_MAYO_GRANDE = 1262
const GRAMOS_MOSTAZA_FRASCO = 200
const GRAMOS_KETCHUP_FRASCO = 400
const GRAMOS_CHUCRUT_TARRO = 400

// Gramos por completo por tipo
const MAYO_ITALIANO = 20
const MAYO_DINAMICO = 15
const MAYO_AMERICANO = 15
const PALTA_POR_COMPLETO = 50
const TOMATE_POR_COMPLETO = 40
const MOSTAZA_POR_COMPLETO = 10
const KETCHUP_POR_COMPLETO = 20
const CHUCRUT_POR_COMPLETO = 40

function conMargen(n: number): number {
  return Math.ceil(n * 1.1)
}

function aplicarMinimo(personas: number, completos: CompletosPorTipo): CompletosPorTipo {
  const total = completos.italiano + completos.dinamico + completos.americano
  const minTotal = personas * 2
  if (total >= minTotal) return completos
  if (total === 0) return { italiano: minTotal, dinamico: 0, americano: 0 }
  const factor = minTotal / total
  return {
    italiano: Math.round(completos.italiano * factor),
    dinamico: Math.round(completos.dinamico * factor),
    americano: Math.round(completos.americano * factor),
  }
}

function calcularMayonesa(
  grams: number,
  personas: number,
): IngredientesCalculados['mayonesa'] {
  const recomendarUpgrade = personas >= 10

  if (grams <= GRAMOS_MAYO_CHICO) {
    return { formato: 'chico', cantidad: 1, recomendarUpgrade }
  }
  if (grams <= GRAMOS_MAYO_MEDIANO) {
    return { formato: 'mediano', cantidad: 1, recomendarUpgrade }
  }
  if (grams <= GRAMOS_MAYO_GRANDE) {
    return { formato: 'grande', cantidad: 1, recomendarUpgrade: false }
  }
  return {
    formato: 'grande',
    cantidad: Math.ceil(grams / GRAMOS_MAYO_GRANDE),
    recomendarUpgrade: false,
  }
}

export function calcularIngredientes(
  personas: number,
  completos: CompletosPorTipo,
): IngredientesCalculados {
  const escalado = aplicarMinimo(personas, completos)

  const italiano = conMargen(escalado.italiano)
  const dinamico = conMargen(escalado.dinamico)
  const americano = conMargen(escalado.americano)
  const totalCompletos = italiano + dinamico + americano

  const gramsMayo =
    italiano * MAYO_ITALIANO +
    dinamico * MAYO_DINAMICO +
    americano * MAYO_AMERICANO

  const gramsMostaza = (dinamico + americano) * MOSTAZA_POR_COMPLETO
  const gramsTomate = (italiano + dinamico) * TOMATE_POR_COMPLETO

  return {
    vienesas: {
      total: totalCompletos,
      packsX5: Math.ceil(totalCompletos / PACK_VIENESAS_X5),
      packsX20: Math.ceil(totalCompletos / PACK_VIENESAS_X20),
    },
    pan: {
      total: totalCompletos,
      packsX8: Math.ceil(totalCompletos / PACK_PAN),
    },
    palta: {
      aplica: italiano > 0,
      mallas: italiano > 0
        ? Math.ceil((italiano * PALTA_POR_COMPLETO) / GRAMOS_PALTA_USABLE)
        : 0,
    },
    tomate: {
      aplica: italiano > 0 || dinamico > 0,
      unidades: italiano > 0 || dinamico > 0
        ? Math.ceil(gramsTomate / GRAMOS_TOMATE)
        : 0,
    },
    mayonesa: calcularMayonesa(gramsMayo, personas),
    mostaza: {
      aplica: dinamico > 0 || americano > 0,
      frascos: dinamico > 0 || americano > 0
        ? Math.ceil(gramsMostaza / GRAMOS_MOSTAZA_FRASCO)
        : 0,
    },
    ketchup: {
      aplica: americano > 0,
      frascos: americano > 0
        ? Math.ceil((americano * KETCHUP_POR_COMPLETO) / GRAMOS_KETCHUP_FRASCO)
        : 0,
    },
    chucrut: {
      aplica: dinamico > 0,
      tarros: dinamico > 0
        ? Math.ceil((dinamico * CHUCRUT_POR_COMPLETO) / GRAMOS_CHUCRUT_TARRO)
        : 0,
    },
  }
}
