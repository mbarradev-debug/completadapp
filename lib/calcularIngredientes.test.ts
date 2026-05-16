import { calcularIngredientes } from './calcularIngredientes'

// ─── Caso base del ticket ────────────────────────────────────────────────────

describe('caso del ticket: 10 personas, todo italiano', () => {
  const result = calcularIngredientes(10, { italiano: 10, dinamico: 0, americano: 0 })

  test('vienesas: total 22, packsX5 5, packsX20 2', () => {
    expect(result.vienesas).toEqual({ total: 22, packsX5: 5, packsX20: 2 })
  })

  test('pan: total 22, packsX8 3', () => {
    expect(result.pan).toEqual({ total: 22, packsX8: 3 })
  })

  test('palta: aplica, 2 mallas', () => {
    expect(result.palta).toEqual({ aplica: true, mallas: 2 })
  })

  test('tomate: aplica, 7 unidades', () => {
    expect(result.tomate).toEqual({ aplica: true, unidades: 7 })
  })

  test('mayonesa: mediano, 1 frasco, recomendarUpgrade true (personas >= 10)', () => {
    expect(result.mayonesa).toEqual({ formato: 'mediano', cantidad: 1, recomendarUpgrade: true })
  })

  test('mostaza, ketchup, chucrut: no aplican', () => {
    expect(result.mostaza.aplica).toBe(false)
    expect(result.ketchup.aplica).toBe(false)
    expect(result.chucrut.aplica).toBe(false)
  })
})

// ─── Casos borde ────────────────────────────────────────────────────────────

describe('caso borde: 1 persona, 1 italiano (mínimo 2/persona)', () => {
  const result = calcularIngredientes(1, { italiano: 1, dinamico: 0, americano: 0 })

  test('aplica mínimo 2 por persona: ceil(2 * 1.1) = 3 completos', () => {
    expect(result.vienesas.total).toBe(3)
    expect(result.pan.packsX8).toBe(1)
  })

  test('mayo: chico alcanza (3 × 20g = 60g), recomendarUpgrade false', () => {
    expect(result.mayonesa.formato).toBe('chico')
    expect(result.mayonesa.recomendarUpgrade).toBe(false)
  })
})

describe('caso borde: 50 personas, tipos mixtos', () => {
  // total = 100, min = 100 → no escala; ceil(it*1.1)=33, din=44, ame=33 → total=110
  const result = calcularIngredientes(50, { italiano: 30, dinamico: 40, americano: 30 })

  test('vienesas: total 110, packsX5 22, packsX20 6', () => {
    expect(result.vienesas).toEqual({ total: 110, packsX5: 22, packsX20: 6 })
  })

  test('mayo: escala a 2 × grande (grams > 1262)', () => {
    expect(result.mayonesa.formato).toBe('grande')
    expect(result.mayonesa.cantidad).toBe(2)
  })

  test('mostaza aplica: (44+33)*10g / 200g = ceil(3.85) = 4 frascos', () => {
    expect(result.mostaza).toEqual({ aplica: true, frascos: 4 })
  })

  test('chucrut aplica: ceil(44*40/400) = ceil(4.4) = 5 tarros', () => {
    expect(result.chucrut).toEqual({ aplica: true, tarros: 5 })
  })

  test('palta aplica: ceil(33*50/700) = ceil(2.35) = 3 mallas', () => {
    expect(result.palta).toEqual({ aplica: true, mallas: 3 })
  })
})

describe('caso borde: solo americano (5 personas)', () => {
  // americano=5, min=10 → escala a 10; ceil(10*1.1)=11
  const result = calcularIngredientes(5, { italiano: 0, dinamico: 0, americano: 5 })

  test('palta y chucrut no aplican', () => {
    expect(result.palta.aplica).toBe(false)
    expect(result.chucrut.aplica).toBe(false)
  })

  test('tomate no aplica (solo italiano + dinámico)', () => {
    expect(result.tomate.aplica).toBe(false)
  })

  test('ketchup aplica: ceil(11*20/400) = 1 frasco', () => {
    expect(result.ketchup).toEqual({ aplica: true, frascos: 1 })
  })

  test('mostaza aplica (americano): ceil(11*10/200) = 1 frasco', () => {
    expect(result.mostaza).toEqual({ aplica: true, frascos: 1 })
  })
})

describe('caso borde: solo dinámico (8 personas)', () => {
  // dinamico=8, min=16 → escala a 16; ceil(16*1.1)=18
  const result = calcularIngredientes(8, { italiano: 0, dinamico: 8, americano: 0 })

  test('palta y ketchup no aplican', () => {
    expect(result.palta.aplica).toBe(false)
    expect(result.ketchup.aplica).toBe(false)
  })

  test('chucrut aplica: ceil(18*40/400) = ceil(1.8) = 2 tarros', () => {
    expect(result.chucrut).toEqual({ aplica: true, tarros: 2 })
  })

  test('tomate aplica: ceil(18*40/140) = ceil(5.14) = 6 unidades', () => {
    expect(result.tomate).toEqual({ aplica: true, unidades: 6 })
  })
})

// ─── Lógica de mayonesa ──────────────────────────────────────────────────────

describe('selección de frasco de mayonesa', () => {
  test('chico: grupo pequeño con poca mayo (2p, italiano:2 → 4 compl, 4×20=80g)', () => {
    const r = calcularIngredientes(2, { italiano: 2, dinamico: 0, americano: 0 })
    expect(r.mayonesa.formato).toBe('chico')
    expect(r.mayonesa.recomendarUpgrade).toBe(false)
  })

  test('recomendarUpgrade true cuando personas >= 10', () => {
    const r = calcularIngredientes(10, { italiano: 10, dinamico: 0, americano: 0 })
    expect(r.mayonesa.recomendarUpgrade).toBe(true)
  })

  test('grande: grupo muy grande desborda mediano', () => {
    // 30p, italiano:30 → min=60 → ceil(66)=66 → 66×20=1320g > 1262 → grande
    const r = calcularIngredientes(30, { italiano: 30, dinamico: 0, americano: 0 })
    expect(r.mayonesa.formato).toBe('grande')
    expect(r.mayonesa.recomendarUpgrade).toBe(false)
  })
})
