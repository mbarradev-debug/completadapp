import { useEffect, useRef, useState } from 'react'
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/text'
import { calcularIngredientes } from '@/lib/calcularIngredientes'
import { guardarCompletada, obtenerCompletada } from '@/lib/storage'
import { colors } from '@/theme/colors'
import { radius } from '@/theme/radius'
import { spacing } from '@/theme/spacing'
import type { Completada, CompletosPorTipo, IngredientesCalculados, TipoCompleto } from '@/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const TIPO_LABELS: Record<TipoCompleto, string> = {
  italiano: 'Italiano',
  dinamico: 'Dinámico',
  americano: 'Americano',
}

function formatCLP(value: number): string {
  return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function formatFecha(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} de ${MESES[d.getMonth()]}`
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// ─── Shopping list ───────────────────────────────────────────────────────────

type ListItem = { nombre: string; cantidad: string }

function buildShoppingList(ing: IngredientesCalculados): ListItem[] {
  const items: ListItem[] = []
  items.push({ nombre: 'Vienesas', cantidad: `${ing.vienesas.packsX5} packs x5` })
  items.push({ nombre: 'Pan de completo', cantidad: `${ing.pan.packsX8} packs x8` })
  if (ing.palta.aplica)
    items.push({ nombre: 'Palta Hass', cantidad: `${ing.palta.mallas} malla${ing.palta.mallas !== 1 ? 's' : ''} 1 kg` })
  if (ing.tomate.aplica)
    items.push({ nombre: 'Tomate', cantidad: `${ing.tomate.unidades} unidad${ing.tomate.unidades !== 1 ? 'es' : ''}` })
  items.push({
    nombre: 'Mayonesa Kraft',
    cantidad: `${ing.mayonesa.cantidad} frasco${ing.mayonesa.cantidad !== 1 ? 's' : ''} ${ing.mayonesa.formato}`,
  })
  if (ing.mostaza.aplica)
    items.push({ nombre: 'Mostaza', cantidad: `${ing.mostaza.frascos} frasco${ing.mostaza.frascos !== 1 ? 's' : ''}` })
  if (ing.ketchup.aplica)
    items.push({ nombre: 'Ketchup', cantidad: `${ing.ketchup.frascos} frasco${ing.ketchup.frascos !== 1 ? 's' : ''}` })
  if (ing.chucrut.aplica)
    items.push({ nombre: 'Chucrut', cantidad: `${ing.chucrut.tarros} tarro${ing.chucrut.tarros !== 1 ? 's' : ''}` })
  return items
}

function calcularTotal(ing: IngredientesCalculados, precios: Record<string, number>): number {
  let total = 0
  total += ing.vienesas.packsX5 * (precios.vienesas ?? 0)
  total += ing.pan.packsX8 * (precios.pan ?? 0)
  if (ing.palta.aplica) total += ing.palta.mallas * (precios.palta ?? 0)
  if (ing.tomate.aplica) total += ing.tomate.unidades * (precios.tomate ?? 0)
  total += ing.mayonesa.cantidad * (precios.mayonesa ?? 0)
  if (ing.mostaza.aplica) total += ing.mostaza.frascos * (precios.mostaza ?? 0)
  if (ing.ketchup.aplica) total += ing.ketchup.frascos * (precios.ketchup ?? 0)
  if (ing.chucrut.aplica) total += ing.chucrut.tarros * (precios.chucrut ?? 0)
  return total
}

function generarMensaje(
  nombre: string,
  fecha: string,
  personas: number,
  tipo: TipoCompleto,
  items: ListItem[],
  total: number,
): string {
  const porPersona = Math.ceil(total / personas)
  const tipoLabel = TIPO_LABELS[tipo]
  const listaStr = items.map((i) => `· ${i.nombre} — ${i.cantidad}`).join('\n')
  return [
    `🌭 *${nombre}*`,
    `📅 ${formatFecha(fecha)}  |  👥 ${personas} personas  |  ${tipoLabel}`,
    '',
    `🛒 *Lista de compras*`,
    listaStr,
    '',
    `💰 *Total: ${formatCLP(total)}*  ·  ${formatCLP(porPersona)} por persona`,
    '',
    `¿Tú organizas el próximo? → completadapp.cl`,
  ].join('\n')
}

// ─── TabToggle ───────────────────────────────────────────────────────────────

function TabToggle({
  active,
  onChange,
}: {
  active: 'individual' | 'colaborativo'
  onChange: (v: 'individual' | 'colaborativo') => void
}) {
  return (
    <View style={toggle.container}>
      <TouchableOpacity
        style={[toggle.tab, active === 'individual' && toggle.tabActive]}
        onPress={() => onChange('individual')}
        activeOpacity={0.8}
      >
        <Text style={[toggle.tabText, active === 'individual' && toggle.tabTextActive]}>
          Individual
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[toggle.tab, active === 'colaborativo' && toggle.tabActive]}
        onPress={() => onChange('colaborativo')}
        activeOpacity={0.8}
      >
        <Text style={[toggle.tabText, active === 'colaborativo' && toggle.tabTextActive]}>
          Colaborativo
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const toggle = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.sandLight,
    borderRadius: 22,
    height: 44,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  tabActive: {
    backgroundColor: colors.brand.red,
  },
  tabText: {
    fontFamily: 'DMSans_Regular',
    fontSize: 14,
    color: colors.neutral.gray,
  },
  tabTextActive: {
    fontFamily: 'AlfaSlabOne_Regular',
    color: colors.neutral.white,
  },
})

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function ResumenScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const params = useLocalSearchParams<{
    // reading mode
    id?: string
    // creation mode
    nombre?: string
    fecha?: string
    personas?: string
    tipo?: TipoCompleto
    precios?: string
    duplicarId?: string
  }>()

  const modoCreacion = !params.id
  const savedRef = useRef(false)

  const [modo, setModo] = useState<'individual' | 'colaborativo'>('individual')
  const [completada, setCompletada] = useState<Completada | null>(null)

  useEffect(() => {
    if (!modoCreacion && params.id) {
      obtenerCompletada(params.id).then(setCompletada)
      return
    }

    // Creation mode: build and save
    const nombre = params.nombre ?? ''
    const fecha = params.fecha ?? new Date().toISOString()
    const personas = parseInt(params.personas ?? '1', 10)
    const tipo: TipoCompleto = params.tipo ?? 'italiano'
    const precios: Record<string, number> = params.precios ? JSON.parse(params.precios) : {}

    const completos: CompletosPorTipo = {
      italiano: tipo === 'italiano' ? personas : 0,
      dinamico: tipo === 'dinamico' ? personas : 0,
      americano: tipo === 'americano' ? personas : 0,
    }
    const ingredientes = calcularIngredientes(personas, completos)

    const nueva: Completada = {
      id: generateId(),
      nombre,
      fecha,
      personas,
      completos,
      precios,
      ingredientes,
      creadaEn: new Date().toISOString(),
    }

    setCompletada(nueva)

    if (!savedRef.current) {
      savedRef.current = true
      guardarCompletada(nueva)
    }
  }, [])

  if (!completada) return <View style={styles.root} />

  const { nombre, fecha, personas, completos, precios, ingredientes } = completada
  const tipoEntries = Object.entries(completos) as [TipoCompleto, number][]
  const tipo = tipoEntries.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
  const tipoLabel = TIPO_LABELS[tipo]

  const items = buildShoppingList(ingredientes)
  const total = calcularTotal(ingredientes, precios)
  const porPersona = Math.ceil(total / personas)

  const mensajeCompleto = generarMensaje(nombre, fecha, personas, tipo, items, total)
  const previewLine1 = `🌭 *${nombre}*`
  const previewLine2 = `📅 ${formatFecha(fecha)} · 👥 ${personas} · ${formatCLP(total)} total · ${formatCLP(porPersona)} c/u`

  function compartir() {
    const url = `https://wa.me/?text=${encodeURIComponent(mensajeCompleto)}`
    Linking.openURL(url)
  }

  return (
    <View style={styles.root}>
      {/* Navbar */}
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <View style={styles.navbarContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text variant="Label/Bold" style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text variant="Heading/H3-Nav" style={styles.navTitle}>Tu completada</Text>
          <View style={styles.navSpacer} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Event header */}
        <Text variant="Heading/H2" style={styles.eventNombre}>{nombre}</Text>
        <Text variant="Body/XSmall" style={styles.eventMeta}>
          {`📅 ${formatFecha(fecha)}  ·  👥 ${personas} personas  ·  ${tipoLabel}`}
        </Text>

        {/* Stats box */}
        <View style={styles.statsBox}>
          <View style={styles.statHalf}>
            <Text variant="Special/Category" style={styles.statLabel}>TOTAL</Text>
            <Text variant="Heading/H2" style={styles.statValue}>{formatCLP(total)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statHalf}>
            <Text variant="Special/Category" style={styles.statLabel}>POR PERSONA</Text>
            <Text variant="Heading/H2" style={styles.statValue}>{formatCLP(porPersona)}</Text>
          </View>
        </View>

        {/* Toggle */}
        <TabToggle active={modo} onChange={setModo} />

        {/* Lista de compras */}
        <Text variant="Heading/H4" style={styles.listHeading}>{'🛒  Lista de compras'}</Text>
        <View style={styles.listBox}>
          {items.map((item, i) => (
            <View key={item.nombre}>
              <View style={styles.listRow}>
                <View style={styles.listDot} />
                <Text style={styles.listNombre}>{item.nombre}</Text>
                <Text variant="Body/XSmall" style={styles.listCantidad}>{item.cantidad}</Text>
              </View>
              {i < items.length - 1 && <View style={styles.listDivider} />}
            </View>
          ))}
        </View>

        {/* WhatsApp preview */}
        <View style={styles.waPreview}>
          <Text style={styles.waPreviewTitle}>{'📲  Vista previa'}</Text>
          <Text style={styles.waPreviewText}>{previewLine1}</Text>
          <Text style={styles.waPreviewText}>{previewLine2}</Text>
        </View>
      </ScrollView>

      {/* Footer — WhatsApp button always visible */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <TouchableOpacity style={styles.waButton} onPress={compartir} activeOpacity={0.85}>
          <Text variant="Action/Button" style={styles.waButtonText}>
            Compartir por WhatsApp
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral.cream,
  },
  // Navbar
  navbar: {
    backgroundColor: colors.brand.red,
  },
  navbarContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backText: {
    color: colors.neutral.white,
    fontSize: 20,
  },
  navTitle: {
    flex: 1,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  navSpacer: {
    width: 32,
  },
  // Scroll
  scroll: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  eventNombre: {
    color: colors.neutral.carbon,
  },
  eventMeta: {
    color: colors.neutral.gray,
    marginTop: -spacing.sm,
  },
  // Stats
  statsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.mustardBg,
    borderWidth: 1.5,
    borderColor: colors.accent.mustardBorder,
    borderRadius: 14,
    height: 72,
    shadowColor: colors.accent.mustardBorder,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  statHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.accent.mustardBorder,
  },
  statLabel: {
    color: colors.accent.mustardText,
  },
  statValue: {
    color: colors.accent.mustardText,
  },
  // Shopping list
  listHeading: {
    color: colors.neutral.carbon,
    marginTop: spacing.sm,
  },
  listBox: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.neutral.sand,
    borderRadius: 14,
    paddingVertical: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.red,
  },
  listNombre: {
    flex: 1,
    fontFamily: 'DMSans_Medium',
    fontSize: 15,
    lineHeight: 21,
    color: colors.neutral.carbon,
  },
  listCantidad: {
    color: colors.neutral.gray,
    textAlign: 'right',
  },
  listDivider: {
    height: 1,
    backgroundColor: colors.neutral.sandLight,
    marginHorizontal: spacing.md,
  },
  // WhatsApp preview
  waPreview: {
    backgroundColor: '#E7FBE6',
    borderWidth: 1.5,
    borderColor: '#25D366',
    borderRadius: 14,
    padding: spacing.md,
    gap: 4,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  waPreviewTitle: {
    fontFamily: 'DMSans_Bold',
    fontSize: 15,
    lineHeight: 20,
    color: '#128C7E',
  },
  waPreviewText: {
    fontFamily: 'DMSans_Regular',
    fontSize: 12,
    lineHeight: 17,
    color: colors.neutral.carbon,
  },
  // Footer
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    backgroundColor: colors.neutral.cream,
  },
  waButton: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  waButtonText: {
    color: colors.neutral.white,
  },
})
