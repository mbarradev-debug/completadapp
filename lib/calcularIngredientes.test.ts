import { calcularIngredientes } from './calcularIngredientes'

// ─── DBO-119 · Caso 1 — 10 personas, Italiano puro ───────────────────────────
// minTotal=10 = total → sin escalar → conMargen(10) = 11 completos

describe('DBO-119 · Caso 1 — 10 personas, Italiano puro', () => {
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
  test('mayonesa: 1 frasco mediano (11 × 50g = 550g, 394 < 550 ≤ 789)', () => {
    expect(r.mayonesa.formato).toBe('mediano')
    expect(r.mayonesa.cantidad).toBe(1)
  })
  test('mostaza, ketchup, chucrut: no aplican', () => {
    expect(r.mostaza.aplica).toBe(false)
    expect(r.ketchup.aplica).toBe(false)
    expect(r.chucrut.aplica).toBe(false)
  })
})

// ─── DBO-119 · Caso 2 — 1 persona, Americano ─────────────────────────────────
// minTotal=1 = total → sin escalar → conMargen(1) = 2 completos

describe('DBO-119 · Caso 2 — 1 persona, Americano', () => {
  const r = calcularIngredientes(1, { italiano: 0, dinamico: 0, americano: 1 })

  test('2 completos post-margen (ceil(1×1.1))', () => {
    expect(r.vienesas.total).toBe(2)
  })
  test('vienesas: 1 pack x5', () => expect(r.vienesas.packsX5).toBe(1))
  test('pan: 1 pack x8', () => expect(r.pan.packsX8).toBe(1))
  test('mayonesa: chico (2 × 25g = 50g ≤ 394g)', () => {
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
})

// ─── DBO-119 · Caso 3 — 50 personas, Dinámico puro ───────────────────────────
// minTotal=50 = total → sin escalar → conMargen(50) = 55 completos

describe('DBO-119 · Caso 3 — 50 personas, Dinámico puro', () => {
  const r = calcularIngredientes(50, { italiano: 0, dinamico: 50, americano: 0 })

  test('vienesas: 11 packs x5 (ceil(55/5))', () => expect(r.vienesas.packsX5).toBe(11))
  test('pan: 7 packs x8 (ceil(55/8))', () => expect(r.pan.packsX8).toBe(7))
  test('chucrut: 6 tarros (55 × 40g = 2200g → ceil(2200/400) = 6)', () => {
    expect(r.chucrut).toEqual({ aplica: true, tarros: 6 })
  })
  test('mayonesa: 2 frascos grandes (55 × 30g = 1650g → ceil(1650/1262) = 2)', () => {
    expect(r.mayonesa.formato).toBe('grande')
    expect(r.mayonesa.cantidad).toBe(2)
  })
  test('palta y ketchup no aplican', () => {
    expect(r.palta.aplica).toBe(false)
    expect(r.ketchup.aplica).toBe(false)
  })
})

// ─── DBO-119 · Caso 4 — Mixto (10 personas) ──────────────────────────────────
// total=10 = minTotal → sin escalar
// italiano=ceil(5.5)=6, dinamico=ceil(3.3)=4, americano=ceil(2.2)=3 → totalCompletos=13

describe('DBO-119 · Caso 4 — Mixto: 5 Italiano, 3 Dinámico, 2 Americano (10 personas)', () => {
  const r = calcularIngredientes(10, { italiano: 5, dinamico: 3, americano: 2 })

  test('vienesas: 3 packs x5 (ceil(13/5) = 3)', () => expect(r.vienesas.packsX5).toBe(3))
  test('palta: 1 malla (6 × 70g = 420g → ceil(420/700) = 1)', () => {
    expect(r.palta).toEqual({ aplica: true, mallas: 1 })
  })
  test('tomate: 3 unidades ((6+4) × 40g = 400g → ceil(400/140) = 3)', () => {
    expect(r.tomate).toEqual({ aplica: true, unidades: 3 })
  })
  test('mayonesa: 1 frasco mediano (6×50 + 4×30 + 3×25 = 495g, 394 < 495 ≤ 789)', () => {
    expect(r.mayonesa.formato).toBe('mediano')
    expect(r.mayonesa.cantidad).toBe(1)
  })
  test('mostaza: 1 frasco ((4+3) × 10g = 70g → ceil(70/200) = 1)', () => {
    expect(r.mostaza).toEqual({ aplica: true, frascos: 1 })
  })
  test('ketchup: 1 frasco (3 × 20g = 60g → ceil(60/400) = 1)', () => {
    expect(r.ketchup).toEqual({ aplica: true, frascos: 1 })
  })
  test('chucrut: 1 tarro (4 × 40g = 160g → ceil(160/400) = 1)', () => {
    expect(r.chucrut).toEqual({ aplica: true, tarros: 1 })
  })
})

// ─── DBO-119 · Caso 5 — Costo por persona ────────────────────────────────────

describe('DBO-119 · Caso 5 — Costo por persona (ceil)', () => {
  test('ceil(total / personas) nunca trunca', () => {
    expect(Math.ceil(32240 / 8)).toBe(4030)
    expect(Math.ceil(32241 / 8)).toBe(4031)
    expect(Math.ceil(1000 / 3)).toBe(334)
  })
})

// ─── Casos borde adicionales ──────────────────────────────────────────────────

describe('caso borde: solo dinámico (8 personas)', () => {
  // dinamico=8, min=8 → sin escalar; conMargen(8) = ceil(8.8) = 9
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
  test('mayonesa: chico (9 × 30g = 270g ≤ 394g)', () => {
    expect(r.mayonesa.formato).toBe('chico')
    expect(r.mayonesa.cantidad).toBe(1)
  })
})

describe('caso borde: solo americano (5 personas)', () => {
  // americano=5, min=5 → sin escalar; conMargen(5) = ceil(5.5) = 6
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
  test('mayonesa: chico (6 × 25g = 150g ≤ 394g)', () => {
    expect(r.mayonesa.formato).toBe('chico')
  })
})

describe('selección de frasco de mayonesa', () => {
  test('chico: 2 personas italiano → 3 compl → 3×50g=150g ≤ 394g', () => {
    const r = calcularIngredientes(2, { italiano: 2, dinamico: 0, americano: 0 })
    expect(r.mayonesa.formato).toBe('chico')
    expect(r.mayonesa.recomendarUpgrade).toBe(false)
  })
  test('recomendarUpgrade true cuando personas >= 10', () => {
    const r = calcularIngredientes(10, { italiano: 10, dinamico: 0, americano: 0 })
    expect(r.mayonesa.recomendarUpgrade).toBe(true)
  })
  test('grande × múltiples frascos: 30p italiano → 33 compl → 33×50=1650g → ceil(1650/1262) = 2 frascos', () => {
    const r = calcularIngredientes(30, { italiano: 30, dinamico: 0, americano: 0 })
    expect(r.mayonesa.formato).toBe('grande')
    expect(r.mayonesa.cantidad).toBe(2)
  })
})
