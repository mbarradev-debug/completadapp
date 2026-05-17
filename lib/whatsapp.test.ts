jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
  Linking: { canOpenURL: jest.fn(), openURL: jest.fn() },
}))

import { generarMensajeWhatsApp } from './whatsapp'
import type { Completada } from '@/types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

// Escenario 1: Italiano, 8 personas → 9 completos (ceil(8 × 1.1))
const ITALIANO_8P: Completada = {
  id: 'test-1',
  nombre: 'Completada del viernes',
  fecha: '2026-05-16',
  personas: 8,
  completos: { italiano: 8, dinamico: 0, americano: 0 },
  precios: {
    vienesas: 1750, pan: 1990, palta: 5500, tomate: 1990,
    mayonesa: 6590, mostaza: 2090, ketchup: 2995, chucrut: 990,
  },
  ingredientes: {
    vienesas: { total: 9, packsX5: 2, packsX20: 1 },
    pan: { total: 9, packsX8: 2 },
    palta: { aplica: true, mallas: 1 },
    tomate: { aplica: true, unidades: 3 },
    mayonesa: { formato: 'mediano', cantidad: 1, recomendarUpgrade: false },
    mostaza: { aplica: false, frascos: 0 },
    ketchup: { aplica: false, frascos: 0 },
    chucrut: { aplica: false, tarros: 0 },
  },
  creadaEn: '2026-05-16T12:00:00.000Z',
}
// Total: 2×1750 + 2×1990 + 1×5500 + ceil(3×140/1000)×1990 + 1×6590 = $21.560
// Por persona: ceil(21560/8) = $2.695

// Escenario 2: Dinámico, 5 personas → 6 completos (ceil(5 × 1.1))
const DINAMICO_5P: Completada = {
  id: 'test-2',
  nombre: 'Asado del barrio',
  fecha: '2026-06-01',
  personas: 5,
  completos: { italiano: 0, dinamico: 5, americano: 0 },
  precios: {
    vienesas: 1750, pan: 1990, palta: 5500, tomate: 1990,
    mayonesa: 6590, mostaza: 2090, ketchup: 2995, chucrut: 990,
  },
  ingredientes: {
    vienesas: { total: 6, packsX5: 2, packsX20: 1 },
    pan: { total: 6, packsX8: 1 },
    palta: { aplica: false, mallas: 0 },
    tomate: { aplica: true, unidades: 2 },
    mayonesa: { formato: 'chico', cantidad: 1, recomendarUpgrade: false },
    mostaza: { aplica: true, frascos: 1 },
    ketchup: { aplica: false, frascos: 0 },
    chucrut: { aplica: true, tarros: 1 },
  },
  creadaEn: '2026-06-01T10:00:00.000Z',
}
// Total: 2×1750 + 1×1990 + ceil(2×140/1000)×1990 + 1×6590 + 1×2090 + 1×990 = $17.150
// Por persona: ceil(17150/5) = $3.430

// Escenario 3: Americano, 3 personas → 4 completos (ceil(3 × 1.1))
const AMERICANO_3P: Completada = {
  id: 'test-3',
  nombre: 'Cumple de Mateo',
  fecha: '2026-07-20',
  personas: 3,
  completos: { italiano: 0, dinamico: 0, americano: 3 },
  precios: {
    vienesas: 1750, pan: 1990, palta: 5500, tomate: 1990,
    mayonesa: 6590, mostaza: 2090, ketchup: 2995, chucrut: 990,
  },
  ingredientes: {
    vienesas: { total: 4, packsX5: 1, packsX20: 1 },
    pan: { total: 4, packsX8: 1 },
    palta: { aplica: false, mallas: 0 },
    tomate: { aplica: false, unidades: 0 },
    mayonesa: { formato: 'chico', cantidad: 1, recomendarUpgrade: false },
    mostaza: { aplica: true, frascos: 1 },
    ketchup: { aplica: true, frascos: 1 },
    chucrut: { aplica: false, tarros: 0 },
  },
  creadaEn: '2026-07-20T09:00:00.000Z',
}
// Total: 1×1750 + 1×1990 + 1×6590 + 1×2090 + 1×2995 = $15.415
// Por persona: ceil(15415/3) = $5.139

// ─── Formato general ─────────────────────────────────────────────────────────

describe('formato general del mensaje', () => {
  test('primera línea: emoji + nombre en negrita', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')
    expect(msg.split('\n')[0]).toBe('🌭 *Completada del viernes*')
  })

  test('nombre con espacios al final queda trimmeado', () => {
    const c = { ...ITALIANO_8P, nombre: 'Completada del viernes  ' }
    expect(generarMensajeWhatsApp(c, 'individual').split('\n')[0])
      .toBe('🌭 *Completada del viernes*')
  })

  test('segunda línea: fecha, personas y tipo con emojis', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')
    expect(msg.split('\n')[1]).toBe('📅 16 de mayo  |  👥 8 personas  |  Italiano')
  })

  test('fecha: "1 de junio" (sin cero inicial)', () => {
    const msg = generarMensajeWhatsApp(DINAMICO_5P, 'individual')
    expect(msg.split('\n')[1]).toContain('1 de junio')
  })

  test('encabezado de lista en negrita con emoji', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')
    expect(msg).toContain('🛒 *Lista de compras*')
  })

  test('total en negrita con emoji', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')
    expect(msg).toContain('💰 *Total:')
  })

  test('línea en blanco entre encabezado y lista', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')
    const lineas = msg.split('\n')
    const idxLista = lineas.indexOf('🛒 *Lista de compras*')
    expect(lineas[idxLista - 1]).toBe('')
  })

  test('línea en blanco entre lista y costo', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')
    const lineas = msg.split('\n')
    const idxCosto = lineas.findIndex((l) => l.startsWith('💰'))
    expect(lineas[idxCosto - 1]).toBe('')
  })

  test('link completadapp.cl al final', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')
    const lineas = msg.split('\n')
    expect(lineas[lineas.length - 1]).toBe('¿Tú organizas el próximo? → completadapp.cl')
  })

  test('línea en blanco antes del link', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')
    const lineas = msg.split('\n')
    const idxLink = lineas.findIndex((l) => l.includes('completadapp.cl'))
    expect(lineas[idxLink - 1]).toBe('')
  })
})

// ─── Individual vs Colaborativo ───────────────────────────────────────────────

describe('modo individual vs colaborativo', () => {
  test('individual: línea de costo sin "por persona"', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')
    const lineaCosto = msg.split('\n').find((l) => l.startsWith('💰'))!
    expect(lineaCosto).toBe('💰 *Total: $21.560*')
    expect(lineaCosto).not.toContain('por persona')
  })

  test('colaborativo: línea de costo incluye precio por persona', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'colaborativo')
    const lineaCosto = msg.split('\n').find((l) => l.startsWith('💰'))!
    expect(lineaCosto).toBe('💰 *Total: $21.560*  ·  $2.695 por persona')
  })

  test('costo por persona usa ceil(total / personas)', () => {
    // 21560 / 8 = 2695 exacto — verificamos con caso que no divide exacto
    const c = { ...AMERICANO_3P }
    const msg = generarMensajeWhatsApp(c, 'colaborativo')
    // 15415 / 3 = 5138.33... → ceil = 5139
    expect(msg).toContain('$5.139 por persona')
  })
})

// ─── Escenario 1: Italiano ────────────────────────────────────────────────────

describe('escenario Italiano — 8 personas (9 completos)', () => {
  const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')

  test('tipo detectado como Italiano', () => {
    expect(msg.split('\n')[1]).toContain('Italiano')
  })

  test('vienesas: 2 packs x5', () => {
    expect(msg).toContain('· Vienesas — 2 packs x5')
  })

  test('pan: 2 packs x8', () => {
    expect(msg).toContain('· Pan de completo — 2 packs x8')
  })

  test('palta: 1 malla (singular)', () => {
    expect(msg).toContain('· Palta Hass — 1 malla 1 kg')
  })

  test('tomate: 3 unidades', () => {
    expect(msg).toContain('· Tomate — 3 unidades')
  })

  test('mayonesa: 1 frasco mediano', () => {
    expect(msg).toContain('· Mayonesa Kraft — 1 frasco mediano')
  })

  test('no incluye mostaza, ketchup ni chucrut', () => {
    expect(msg).not.toContain('Mostaza')
    expect(msg).not.toContain('Ketchup')
    expect(msg).not.toContain('Chucrut')
  })

  test('total $21.560', () => {
    expect(msg).toContain('$21.560')
  })
})

// ─── Escenario 2: Dinámico ────────────────────────────────────────────────────

describe('escenario Dinámico — 5 personas (6 completos)', () => {
  const msg = generarMensajeWhatsApp(DINAMICO_5P, 'individual')

  test('tipo detectado como Dinámico', () => {
    expect(msg.split('\n')[1]).toContain('Dinámico')
  })

  test('vienesas: 2 packs x5', () => {
    expect(msg).toContain('· Vienesas — 2 packs x5')
  })

  test('pan: 1 pack x8 (singular)', () => {
    expect(msg).toContain('· Pan de completo — 1 pack x8')
  })

  test('tomate: 2 unidades', () => {
    expect(msg).toContain('· Tomate — 2 unidades')
  })

  test('mayonesa: 1 frasco chico', () => {
    expect(msg).toContain('· Mayonesa Kraft — 1 frasco chico')
  })

  test('mostaza: 1 frasco (singular)', () => {
    expect(msg).toContain('· Mostaza — 1 frasco')
  })

  test('chucrut: 1 tarro (singular)', () => {
    expect(msg).toContain('· Chucrut — 1 tarro')
  })

  test('no incluye palta ni ketchup', () => {
    expect(msg).not.toContain('Palta')
    expect(msg).not.toContain('Ketchup')
  })

  test('total $17.150', () => {
    expect(msg).toContain('$17.150')
  })

  test('por persona $3.430 en modo colaborativo', () => {
    const msgColab = generarMensajeWhatsApp(DINAMICO_5P, 'colaborativo')
    expect(msgColab).toContain('$3.430 por persona')
  })
})

// ─── Escenario 3: Americano ───────────────────────────────────────────────────

describe('escenario Americano — 3 personas (4 completos)', () => {
  const msg = generarMensajeWhatsApp(AMERICANO_3P, 'individual')

  test('tipo detectado como Americano', () => {
    expect(msg.split('\n')[1]).toContain('Americano')
  })

  test('ketchup: 1 frasco', () => {
    expect(msg).toContain('· Ketchup — 1 frasco')
  })

  test('mostaza: 1 frasco', () => {
    expect(msg).toContain('· Mostaza — 1 frasco')
  })

  test('no incluye palta, tomate ni chucrut', () => {
    expect(msg).not.toContain('Palta')
    expect(msg).not.toContain('Tomate')
    expect(msg).not.toContain('Chucrut')
  })

  test('total $15.415', () => {
    expect(msg).toContain('$15.415')
  })
})

// ─── Plurales ─────────────────────────────────────────────────────────────────

describe('plurales de unidades', () => {
  test('1 malla (singular)', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')
    expect(msg).toContain('1 malla 1 kg')
    expect(msg).not.toContain('1 mallas')
  })

  test('2 mallas (plural)', () => {
    const c: Completada = {
      ...ITALIANO_8P,
      ingredientes: { ...ITALIANO_8P.ingredientes, palta: { aplica: true, mallas: 2 } },
    }
    expect(generarMensajeWhatsApp(c, 'individual')).toContain('2 mallas 1 kg')
  })

  test('1 unidad de tomate (singular)', () => {
    const c: Completada = {
      ...ITALIANO_8P,
      ingredientes: { ...ITALIANO_8P.ingredientes, tomate: { aplica: true, unidades: 1 } },
    }
    expect(generarMensajeWhatsApp(c, 'individual')).toContain('1 unidad')
    expect(generarMensajeWhatsApp(c, 'individual')).not.toContain('1 unidades')
  })

  test('1 frasco de mostaza (singular)', () => {
    const msg = generarMensajeWhatsApp(DINAMICO_5P, 'individual')
    expect(msg).toContain('1 frasco\n')
  })

  test('2 frascos de mostaza (plural)', () => {
    const c: Completada = {
      ...DINAMICO_5P,
      ingredientes: { ...DINAMICO_5P.ingredientes, mostaza: { aplica: true, frascos: 2 } },
    }
    expect(generarMensajeWhatsApp(c, 'individual')).toContain('2 frascos')
  })

  test('1 tarro de chucrut (singular)', () => {
    const msg = generarMensajeWhatsApp(DINAMICO_5P, 'individual')
    expect(msg).toContain('1 tarro')
    expect(msg).not.toContain('1 tarros')
  })

  test('2 tarros de chucrut (plural)', () => {
    const c: Completada = {
      ...DINAMICO_5P,
      ingredientes: { ...DINAMICO_5P.ingredientes, chucrut: { aplica: true, tarros: 2 } },
    }
    expect(generarMensajeWhatsApp(c, 'individual')).toContain('2 tarros')
  })
})

// ─── Formato CLP ─────────────────────────────────────────────────────────────

describe('formato de precios CLP', () => {
  test('miles separados por punto: $21.560', () => {
    const msg = generarMensajeWhatsApp(ITALIANO_8P, 'individual')
    expect(msg).toContain('$21.560')
  })

  test('precios menores a mil no tienen punto: total $990', () => {
    const c: Completada = {
      ...AMERICANO_3P,
      personas: 1,
      ingredientes: {
        ...AMERICANO_3P.ingredientes,
        vienesas: { total: 2, packsX5: 1, packsX20: 1 },
        pan: { total: 2, packsX8: 1 },
        mayonesa: { formato: 'chico', cantidad: 1, recomendarUpgrade: false },
        mostaza: { aplica: false, frascos: 0 },
        ketchup: { aplica: false, frascos: 0 },
      },
      precios: { ...AMERICANO_3P.precios, vienesas: 0, pan: 0, ketchup: 0, mostaza: 0, mayonesa: 990 },
    }
    expect(generarMensajeWhatsApp(c, 'individual')).toContain('$990')
  })
})
