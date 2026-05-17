import { calcularIngredientes } from './calcularIngredientes'

// ─── DBO-119 · Caso 1 — 10 personas, Italiano puro ───────────────────────────
// aplicarMinimo: total=10 < minTotal=20 → escala a {italiano:20}
// conMargen: ceil(20×1.1) = 22 completos

describe('DBO-119 · Caso 1 — 10 personas, Italiano puro', () => {
  const r = calcularIngredientes(10, { italiano: 10, dinamico: 0, americano: 0 })

  test('vienesas: 5 packs x5, 2 packs x20', () => {
    expect(r.vienesas).toEqual({ total: 22, packsX5: 5, packsX20: 2 })
  })
  test('pan: 3 packs x8', () => {
    expect(r.pan).toEqual({ total: 22, packsX8: 3 })
  })
  test('palta: 3 mallas (22 × 70g = 1540g → ceil(1540/700) = 3)', () => {
    expect(r.palta).toEqual({ aplica: true, mallas: 3 })
  })
  test('tomate: 7 unidades (22 × 40g = 880g → ceil(880/140) = 7)', () => {
    expect(r.tomate).toEqual({ aplica: true, unidades: 7 })
  })
  test('mayonesa: 1 frasco grande (22 × 50g = 1100g > 789g)', () => {
    expect(r.mayonesa.formato).toBe('grande')
    expect(r.mayonesa.cantidad).toBe(1)
  })
  test('mostaza, ketchup, chucrut: no aplican', () => {
    expect(r.mostaza.aplica).toBe(false)
    expect(r.ketchup.aplica).toBe(false)
    expect(r.chucrut.aplica).toBe(false)
  })
})

// ─── DBO-119 · Caso 2 — 1 persona, Americano ─────────────────────────────────
// aplicarMinimo: total=1 < minTotal=2 → escala a {americano:2}
// conMargen: ceil(2×1.1) = 3 completos

describe('DBO-119 · Caso 2 — 1 persona, Americano (mínimo 2/persona)', () => {
  const r = calcularIngredientes(1, { italiano: 0, dinamico: 0, americano: 1 })

  test('aplica mínimo: 3 completos post-margen (ceil(2×1.1))', () => {
    expect(r.vienesas.total).toBe(3)
  })
  test('vienesas: 1 pack x5', () => expect(r.vienesas.packsX5).toBe(1))
  test('pan: 1 pack x8', () => expect(r.pan.packsX8).toBe(1))
  test('mayonesa: chico (3 × 25g = 75g ≤ 394g)', () => {
    expect(r.mayonesa.formato).toBe('chico')
    expect(r.mayonesa.cantidad).toBe(1)
  })
  test('ketchup: 1 frasco (3 × 20g = 60g → ceil(60/400) = 1)', () => {
    expect(r.ketchup).toEqual({ aplica: true, frascos: 1 })
  })
  test('mostaza: 1 frasco (3 × 10g = 30g → ceil(30/200) = 1)', () => {
    expect(r.mostaza).toEqual({ aplica: true, frascos: 1 })
  })
  test('palta y chucrut no aplican', () => {
    expect(r.palta.aplica).toBe(false)
    expect(r.chucrut.aplica).toBe(false)
  })
})

// ─── DBO-119 · Caso 3 — 50 personas, Dinámico puro ───────────────────────────
// aplicarMinimo: total=50 < minTotal=100 → escala a {dinamico:100}
// conMargen: ceil(100×1.1) = 110 completos

describe('DBO-119 · Caso 3 — 50 personas, Dinámico puro (sin overflow)', () => {
  const r = calcularIngredientes(50, { italiano: 0, dinamico: 50, americano: 0 })

  test('vienesas: 22 packs x5 (ceil(110/5))', () => expect(r.vienesas.packsX5).toBe(22))
  test('pan: 14 packs x8 (ceil(110/8))', () => expect(r.pan.packsX8).toBe(14))
  test('chucrut: 11 tarros (110 × 40g = 4400g → ceil(4400/400) = 11)', () => {
    expect(r.chucrut).toEqual({ aplica: true, tarros: 11 })
  })
  test('mayonesa: 3 frascos grandes (110 × 30g = 3300g → ceil(3300/1262) = 3)', () => {
    expect(r.mayonesa.formato).toBe('grande')
    expect(r.mayonesa.cantidad).toBe(3)
  })
  test('palta y ketchup no aplican', () => {
    expect(r.palta.aplica).toBe(false)
    expect(r.ketchup.aplica).toBe(false)
  })
})

// ─── DBO-119 · Caso 4 — Mixto (10 personas) ──────────────────────────────────
// aplicarMinimo: total=10 < minTotal=20 → factor=2 → {italiano:10, dinamico:6, americano:4}
// conMargen: italiano=11, dinamico=7, americano=5 → totalCompletos=23

describe('DBO-119 · Caso 4 — Mixto: 5 Italiano, 3 Dinámico, 2 Americano (10 personas)', () => {
  const r = calcularIngredientes(10, { italiano: 5, dinamico: 3, americano: 2 })

  test('vienesas: 5 packs x5 (ceil(23/5) = 5)', () => expect(r.vienesas.packsX5).toBe(5))
  test('palta: 2 mallas (11 × 70g = 770g → ceil(770/700) = 2)', () => {
    expect(r.palta).toEqual({ aplica: true, mallas: 2 })
  })
  test('tomate: 6 unidades ((11+7) × 40g = 720g → ceil(720/140) = 6)', () => {
    expect(r.tomate).toEqual({ aplica: true, unidades: 6 })
  })
  test('mayonesa: 1 frasco grande (11×50 + 7×30 + 5×25 = 885g ≤ 1262g)', () => {
    expect(r.mayonesa.formato).toBe('grande')
    expect(r.mayonesa.cantidad).toBe(1)
  })
  test('mostaza: 1 frasco ((7+5) × 10g = 120g → ceil(120/200) = 1)', () => {
    expect(r.mostaza).toEqual({ aplica: true, frascos: 1 })
  })
  test('ketchup: 1 frasco (5 × 20g = 100g → ceil(100/400) = 1)', () => {
    expect(r.ketchup).toEqual({ aplica: true, frascos: 1 })
  })
  test('chucrut: 1 tarro (7 × 40g = 280g → ceil(280/400) = 1)', () => {
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
  // dinamico=8, min=16 → escala a 16; ceil(16×1.1) = 18
  const r = calcularIngredientes(8, { italiano: 0, dinamico: 8, americano: 0 })

  test('palta y ketchup no aplican', () => {
    expect(r.palta.aplica).toBe(false)
    expect(r.ketchup.aplica).toBe(false)
  })
  test('chucrut: 2 tarros (ceil(18×40/400) = ceil(1.8) = 2)', () => {
    expect(r.chucrut).toEqual({ aplica: true, tarros: 2 })
  })
  test('tomate: 6 unidades (ceil(18×40/140) = ceil(5.14) = 6)', () => {
    expect(r.tomate).toEqual({ aplica: true, unidades: 6 })
  })
  test('mayonesa: mediano (18 × 30g = 540g → 394 < 540 ≤ 789)', () => {
    expect(r.mayonesa.formato).toBe('mediano')
    expect(r.mayonesa.cantidad).toBe(1)
  })
})

describe('caso borde: solo americano (5 personas)', () => {
  // americano=5, min=10 → escala a 10; ceil(10×1.1) = 11
  const r = calcularIngredientes(5, { italiano: 0, dinamico: 0, americano: 5 })

  test('palta, chucrut, tomate no aplican', () => {
    expect(r.palta.aplica).toBe(false)
    expect(r.chucrut.aplica).toBe(false)
    expect(r.tomate.aplica).toBe(false)
  })
  test('ketchup: 1 frasco (ceil(11×20/400) = 1)', () => {
    expect(r.ketchup).toEqual({ aplica: true, frascos: 1 })
  })
  test('mostaza: 1 frasco (ceil(11×10/200) = 1)', () => {
    expect(r.mostaza).toEqual({ aplica: true, frascos: 1 })
  })
  test('mayonesa: chico (11 × 25g = 275g ≤ 394g)', () => {
    expect(r.mayonesa.formato).toBe('chico')
  })
})

describe('selección de frasco de mayonesa', () => {
  test('chico: 2 personas italiano → 4 compl → 4×50g=200g ≤ 394g', () => {
    const r = calcularIngredientes(2, { italiano: 2, dinamico: 0, americano: 0 })
    expect(r.mayonesa.formato).toBe('chico')
    expect(r.mayonesa.recomendarUpgrade).toBe(false)
  })
  test('recomendarUpgrade true cuando personas >= 10', () => {
    const r = calcularIngredientes(10, { italiano: 10, dinamico: 0, americano: 0 })
    expect(r.mayonesa.recomendarUpgrade).toBe(true)
  })
  test('grande × múltiples frascos: 30p italiano → 66 compl → 66×50=3300g → 3 frascos', () => {
    const r = calcularIngredientes(30, { italiano: 30, dinamico: 0, americano: 0 })
    expect(r.mayonesa.formato).toBe('grande')
    expect(r.mayonesa.cantidad).toBe(3)
  })
})
