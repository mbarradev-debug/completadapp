import { calcularIngredientes } from './calcularIngredientes'
import type { IngredientesCalculados } from '@/types'

// Precios base CLAUDE.md — sin editar
const P = {
  vienesas: 1750,
  pan: 1990,
  palta: 5500,
  tomate: 1990,
  mostaza: 2090,
  ketchup: 2995,
  chucrut: 990,
}
const MAYO_P = { chico: 5590, mediano: 6590, grande: 9390 }

function calcularCosto(r: IngredientesCalculados): number {
  const { vienesas, pan, palta, tomate, mayonesa, mostaza, ketchup, chucrut } = r
  let t = vienesas.packsX5 * P.vienesas
  t += pan.packsX8 * P.pan
  if (palta.aplica) t += palta.mallas * P.palta
  if (tomate.aplica) t += Math.ceil(tomate.unidades * 140 / 1000) * P.tomate
  t += mayonesa.cantidad * MAYO_P[mayonesa.formato]
  if (mostaza.aplica) t += mostaza.frascos * P.mostaza
  if (ketchup.aplica) t += ketchup.frascos * P.ketchup
  if (chucrut.aplica) t += chucrut.tarros * P.chucrut
  return t
}

// ─── Caso 1 — 10 personas, Italiano puro ─────────────────────────────────────
// total_italiano = ceil(10 × 1.1) = 11 completos
// Mayo: 11 × 50g = 550g + 10% = 605g → mediano
// Total: $5.250 + $3.980 + $11.000 + $1.990 + $6.590 = $28.810

describe('Caso 1 — 10 personas, Italiano puro', () => {
  const r = calcularIngredientes(10, { italiano: 10, dinamico: 0, americano: 0 })

  test('vienesas: 3 packs x5, 1 pack x20', () => {
    expect(r.vienesas).toEqual({ total: 11, packsX5: 3, packsX20: 1 })
  })
  test('pan: 2 packs x8', () => {
    expect(r.pan).toEqual({ total: 11, packsX8: 2 })
  })
  test('palta: 2 mallas (11 × 70g = 770g → ceil(770/700) = 2)', () => {
    expect(r.palta).toEqual({ aplica: true, mallas: 2 })
  })
  test('tomate: 4 unidades (11 × 40g = 440g → ceil(440/140) = 4)', () => {
    expect(r.tomate).toEqual({ aplica: true, unidades: 4 })
  })
  test('mayonesa: 1 frasco mediano (11 × 50g = 550g + 10% = 605g ≤ 789g)', () => {
    expect(r.mayonesa.formato).toBe('mediano')
    expect(r.mayonesa.cantidad).toBe(1)
  })
  test('mostaza, ketchup, chucrut: no aplican', () => {
    expect(r.mostaza.aplica).toBe(false)
    expect(r.ketchup.aplica).toBe(false)
    expect(r.chucrut.aplica).toBe(false)
  })
  test('total $28.810 (vienesas $5.250 + pan $3.980 + palta $11.000 + tomate $1.990 + mayo $6.590)', () => {
    expect(calcularCosto(r)).toBe(28810)
  })
  test('costo por persona: ceil(28810 / 10) = $2.881', () => {
    expect(Math.ceil(calcularCosto(r) / 10)).toBe(2881)
  })
})

// ─── Caso 2 — 1 persona, Americano ───────────────────────────────────────────
// total_americano = ceil(1 × 1.1) = 2 completos
// Mayo: 2 × 25g = 50g + 10% = 55g → chico
// Total: $1.750 + $1.990 + $2.995 + $2.090 + $5.590 = $14.415

describe('Caso 2 — 1 persona, Americano', () => {
  const r = calcularIngredientes(1, { italiano: 0, dinamico: 0, americano: 1 })

  test('2 completos (ceil(1 × 1.1))', () => {
    expect(r.vienesas.total).toBe(2)
  })
  test('vienesas: 1 pack x5', () => expect(r.vienesas.packsX5).toBe(1))
  test('pan: 1 pack x8', () => expect(r.pan.packsX8).toBe(1))
  test('mayonesa: chico (2 × 25g = 50g + 10% = 55g ≤ 394g)', () => {
    expect(r.mayonesa.formato).toBe('chico')
    expect(r.mayonesa.cantidad).toBe(1)
  })
  test('ketchup: 1 frasco (2 × 20g = 40g → ceil(40/400) = 1)', () => {
    expect(r.ketchup).toEqual({ aplica: true, frascos: 1 })
  })
  test('mostaza: 1 frasco (2 × 10g = 20g → ceil(20/200) = 1)', () => {
    expect(r.mostaza).toEqual({ aplica: true, frascos: 1 })
  })
  test('palta y chucrut no aplican', () => {
    expect(r.palta.aplica).toBe(false)
    expect(r.chucrut.aplica).toBe(false)
  })
  test('total $14.415 (vienesas $1.750 + pan $1.990 + ketchup $2.995 + mostaza $2.090 + mayo $5.590)', () => {
    expect(calcularCosto(r)).toBe(14415)
  })
  test('costo por persona: ceil(14415 / 1) = $14.415', () => {
    expect(Math.ceil(calcularCosto(r) / 1)).toBe(14415)
  })
})

// ─── Caso 3 — 50 personas, Dinámico ──────────────────────────────────────────
// total_dinamico = ceil(50 × 1.1) = 55 completos
// Mayo: 55 × 30g = 1.650g + 10% = 1.815g → ceil(1815/1262) = 2 grandes
// Total: $19.250 + $13.930 + $5.970 + $5.940 + $6.270 + $18.780 = $70.140

describe('Caso 3 — 50 personas, Dinámico', () => {
  const r = calcularIngredientes(50, { italiano: 0, dinamico: 50, americano: 0 })

  test('vienesas: 11 packs x5 (ceil(55/5))', () => expect(r.vienesas.packsX5).toBe(11))
  test('pan: 7 packs x8 (ceil(55/8))', () => expect(r.pan.packsX8).toBe(7))
  test('tomate: 16 unidades (55 × 40g = 2.200g → ceil(2200/140) = 16)', () => {
    expect(r.tomate).toEqual({ aplica: true, unidades: 16 })
  })
  test('chucrut: 6 tarros (55 × 40g = 2.200g → ceil(2200/400) = 6)', () => {
    expect(r.chucrut).toEqual({ aplica: true, tarros: 6 })
  })
  test('mostaza: 3 frascos (55 × 10g = 550g → ceil(550/200) = 3)', () => {
    expect(r.mostaza).toEqual({ aplica: true, frascos: 3 })
  })
  test('mayonesa: 2 frascos grandes (55 × 30g = 1.650g + 10% = 1.815g → ceil(1815/1262) = 2)', () => {
    expect(r.mayonesa.formato).toBe('grande')
    expect(r.mayonesa.cantidad).toBe(2)
  })
  test('palta y ketchup no aplican', () => {
    expect(r.palta.aplica).toBe(false)
    expect(r.ketchup.aplica).toBe(false)
  })
  test('total $70.140 (vienesas $19.250 + pan $13.930 + tomate $5.970 + chucrut $5.940 + mostaza $6.270 + mayo $18.780)', () => {
    expect(calcularCosto(r)).toBe(70140)
  })
  test('costo por persona: ceil(70140 / 50) = $1.403', () => {
    expect(Math.ceil(calcularCosto(r) / 50)).toBe(1403)
  })
})

// ─── Caso 4 — Mixto (referencia futura, motor OK) ────────────────────────────
// total: italiano=6, dinamico=4, americano=3 → 13 completos
// No testeable en la app actual (1 tipo por evento)

describe('Caso 4 — Mixto: 5 Italiano, 3 Dinámico, 2 Americano (10 personas)', () => {
  const r = calcularIngredientes(10, { italiano: 5, dinamico: 3, americano: 2 })

  test('vienesas: 3 packs x5 (ceil(13/5))', () => expect(r.vienesas.packsX5).toBe(3))
  test('palta: 1 malla (6 × 70g = 420g → ceil(420/700) = 1)', () => {
    expect(r.palta).toEqual({ aplica: true, mallas: 1 })
  })
  test('tomate: 3 unidades ((6+4) × 40g = 400g → ceil(400/140) = 3)', () => {
    expect(r.tomate).toEqual({ aplica: true, unidades: 3 })
  })
  test('mayonesa: 1 frasco mediano (6×50 + 4×30 + 3×25 = 495g + 10% = 545g, 394 < 545 ≤ 789)', () => {
    expect(r.mayonesa.formato).toBe('mediano')
    expect(r.mayonesa.cantidad).toBe(1)
  })
  test('mostaza: 1 frasco', () => expect(r.mostaza).toEqual({ aplica: true, frascos: 1 }))
  test('ketchup: 1 frasco', () => expect(r.ketchup).toEqual({ aplica: true, frascos: 1 }))
  test('chucrut: 1 tarro', () => expect(r.chucrut).toEqual({ aplica: true, tarros: 1 }))
  test('total referencia $29.385', () => {
    expect(calcularCosto(r)).toBe(29385)
  })
})

// ─── Caso 5 — Costo por persona ───────────────────────────────────────────────

describe('Caso 5 — Costo por persona (ceil)', () => {
  test('Caso 1: ceil(28810 / 10) = $2.881', () => {
    const r = calcularIngredientes(10, { italiano: 10, dinamico: 0, americano: 0 })
    expect(Math.ceil(calcularCosto(r) / 10)).toBe(2881)
  })
  test('Caso 2: ceil(14415 / 1) = $14.415', () => {
    const r = calcularIngredientes(1, { italiano: 0, dinamico: 0, americano: 1 })
    expect(Math.ceil(calcularCosto(r) / 1)).toBe(14415)
  })
  test('Caso 3: ceil(70140 / 50) = $1.403', () => {
    const r = calcularIngredientes(50, { italiano: 0, dinamico: 50, americano: 0 })
    expect(Math.ceil(calcularCosto(r) / 50)).toBe(1403)
  })
})

// ─── Casos borde ──────────────────────────────────────────────────────────────

describe('caso borde: solo dinámico (8 personas)', () => {
  // conMargen(8) = ceil(8.8) = 9 completos
  const r = calcularIngredientes(8, { italiano: 0, dinamico: 8, americano: 0 })

  test('palta y ketchup no aplican', () => {
    expect(r.palta.aplica).toBe(false)
    expect(r.ketchup.aplica).toBe(false)
  })
  test('chucrut: 1 tarro (9 × 40g = 360g → ceil(360/400) = 1)', () => {
    expect(r.chucrut).toEqual({ aplica: true, tarros: 1 })
  })
  test('tomate: 3 unidades (9 × 40g = 360g → ceil(360/140) = 3)', () => {
    expect(r.tomate).toEqual({ aplica: true, unidades: 3 })
  })
  test('mayonesa: chico (9 × 30g = 270g + 10% = 297g ≤ 394g)', () => {
    expect(r.mayonesa.formato).toBe('chico')
    expect(r.mayonesa.cantidad).toBe(1)
  })
})

describe('caso borde: solo americano (5 personas)', () => {
  // conMargen(5) = ceil(5.5) = 6 completos
  const r = calcularIngredientes(5, { italiano: 0, dinamico: 0, americano: 5 })

  test('palta, chucrut, tomate no aplican', () => {
    expect(r.palta.aplica).toBe(false)
    expect(r.chucrut.aplica).toBe(false)
    expect(r.tomate.aplica).toBe(false)
  })
  test('ketchup: 1 frasco (ceil(6×20/400) = 1)', () => {
    expect(r.ketchup).toEqual({ aplica: true, frascos: 1 })
  })
  test('mostaza: 1 frasco (ceil(6×10/200) = 1)', () => {
    expect(r.mostaza).toEqual({ aplica: true, frascos: 1 })
  })
  test('mayonesa: chico (6 × 25g = 150g + 10% = 165g ≤ 394g)', () => {
    expect(r.mayonesa.formato).toBe('chico')
  })
})

describe('selección de frasco de mayonesa', () => {
  test('chico: 2 personas italiano → 3 compl → 3×50g+10%=165g ≤ 394g', () => {
    const r = calcularIngredientes(2, { italiano: 2, dinamico: 0, americano: 0 })
    expect(r.mayonesa.formato).toBe('chico')
    expect(r.mayonesa.recomendarUpgrade).toBe(false)
  })
  test('recomendarUpgrade true cuando personas >= 10', () => {
    const r = calcularIngredientes(10, { italiano: 10, dinamico: 0, americano: 0 })
    expect(r.mayonesa.recomendarUpgrade).toBe(true)
  })
  test('grande × 2 frascos: 30p italiano → 33 compl → 33×50g+10%=1815g → ceil(1815/1262)=2', () => {
    const r = calcularIngredientes(30, { italiano: 30, dinamico: 0, americano: 0 })
    expect(r.mayonesa.formato).toBe('grande')
    expect(r.mayonesa.cantidad).toBe(2)
  })
})
