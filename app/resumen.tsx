import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Text } from '@/components/text'
import { calcularIngredientes } from '@/lib/calcularIngredientes'
import { guardarCompletada, obtenerCompletada } from '@/lib/storage'
import { compartirPorWhatsApp } from '@/lib/whatsapp'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import type { Completada, CompletosPorTipo, IngredientesCalculados, TipoCompleto } from '@/types'

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const WA_GREEN = '#25d366'
const WA_GREEN_BG = '#e7fbe6'
const WA_TEAL = '#128c7e'
const TEAL = '#0b7a75'
const CARD_RADIUS = 14

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function formatFecha(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} de ${MESES[d.getMonth()]}`
}

function formatCLP(n: number): string {
  return '$' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function calcularCostoTotal(ingredientes: IngredientesCalculados, precios: Record<string, number>): number {
  const { vienesas, pan, palta, tomate, mayonesa, mostaza, ketchup, chucrut } = ingredientes
  let t = vienesas.packsX5 * (precios.vienesas ?? 0)
  t += pan.packsX8 * (precios.pan ?? 0)
  if (palta.aplica) t += palta.mallas * (precios.palta ?? 0)
  if (tomate.aplica) t += tomate.unidades * (precios.tomate ?? 0)
  t += mayonesa.cantidad * (precios.mayonesa ?? 0)
  if (mostaza.aplica) t += mostaza.frascos * (precios.mostaza ?? 0)
  if (ketchup.aplica) t += ketchup.frascos * (precios.ketchup ?? 0)
  if (chucrut.aplica) t += chucrut.tarros * (precios.chucrut ?? 0)
  return t
}

type ItemLista = { label: string; cantidad: string }

function buildLista(ingredientes: IngredientesCalculados): ItemLista[] {
  const { vienesas, pan, palta, tomate, mayonesa, mostaza, ketchup, chucrut } = ingredientes
  const items: ItemLista[] = []
  items.push({ label: 'Vienesas', cantidad: `${vienesas.packsX5} packs x5` })
  items.push({ label: 'Pan de completo', cantidad: `${pan.packsX8} packs x8` })
  if (palta.aplica) items.push({ label: 'Palta Hass', cantidad: `${palta.mallas} malla${palta.mallas !== 1 ? 's' : ''} 1 kg` })
  if (tomate.aplica) items.push({ label: 'Tomate', cantidad: `${tomate.unidades} unidad${tomate.unidades !== 1 ? 'es' : ''}` })
  items.push({ label: 'Mayonesa Kraft', cantidad: `${mayonesa.cantidad} frasco ${mayonesa.formato}` })
  if (mostaza.aplica) items.push({ label: 'Mostaza', cantidad: `${mostaza.frascos} frasco${mostaza.frascos !== 1 ? 's' : ''}` })
  if (ketchup.aplica) items.push({ label: 'Ketchup', cantidad: `${ketchup.frascos} frasco${ketchup.frascos !== 1 ? 's' : ''}` })
  if (chucrut.aplica) items.push({ label: 'Chucrut', cantidad: `${chucrut.tarros} tarro${chucrut.tarros !== 1 ? 's' : ''}` })
  return items
}

export default function ResumenScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams<{
    nombre?: string
    fecha?: string
    personas?: string
    tipo?: string
    precios?: string
    id?: string
  }>()

  const [completada, setCompletada] = useState<Completada | null>(null)
  const [modo, setModo] = useState<'individual' | 'colaborativo'>('individual')

  useEffect(() => {
    if (params.id) {
      obtenerCompletada(params.id).then(setCompletada)
    } else {
      const personasNum = parseInt(params.personas!, 10)
      const tipo = params.tipo as TipoCompleto
      const precios = JSON.parse(params.precios!) as Record<string, number>
      const completos: CompletosPorTipo = {
        italiano: tipo === 'italiano' ? personasNum : 0,
        dinamico: tipo === 'dinamico' ? personasNum : 0,
        americano: tipo === 'americano' ? personasNum : 0,
      }
      const ingredientes = calcularIngredientes(personasNum, completos)
      const nueva: Completada = {
        id: uuid(),
        nombre: params.nombre!,
        fecha: params.fecha!,
        personas: personasNum,
        completos,
        precios,
        ingredientes,
        creadaEn: new Date().toISOString(),
      }
      setCompletada(nueva)
      guardarCompletada(nueva)
    }
  }, [])

  if (!completada) return <View style={styles.root} />

  const { nombre, fecha, personas, completos, ingredientes, precios } = completada
  const tipo = completos.italiano > 0 ? 'Italiano' : completos.dinamico > 0 ? 'Dinámico' : 'Americano'
  const costoTotal = calcularCostoTotal(ingredientes, precios)
  const costoPorPersona = Math.ceil(costoTotal / personas)
  const items = buildLista(ingredientes)
  const preview1 = `🌭 *${nombre}*`
  const preview2 = `📅 ${formatFecha(fecha)} · 👥 ${personas} · ${formatCLP(costoTotal)} total · ${formatCLP(costoPorPersona)} c/u`

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
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 92 + Math.max(insets.bottom, spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Event info */}
        <Text variant="Heading/H2" style={styles.nombre}>{nombre}</Text>
        <Text variant="Body/XSmall" style={styles.subtitulo}>
          {`📅 ${formatFecha(fecha)}  ·  👥 ${personas} personas  ·  ${tipo}`}
        </Text>

        {/* Stats card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text variant="Special/Category" style={styles.statLabel}>TOTAL</Text>
            <Text variant="Heading/H2" style={styles.statValor}>{formatCLP(costoTotal)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="Special/Category" style={styles.statLabel}>POR PERSONA</Text>
            <Text variant="Heading/H2" style={styles.statValor}>{formatCLP(costoPorPersona)}</Text>
          </View>
        </View>

        {/* Toggle Individual / Colaborativo */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleTab, modo === 'individual' && styles.toggleTabActive]}
            onPress={() => setModo('individual')}
            activeOpacity={0.85}
          >
            <Text style={[styles.toggleLabel, modo === 'individual' ? styles.toggleLabelActive : styles.toggleLabelInactive]}>
              Individual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleTab, modo === 'colaborativo' && styles.toggleTabActive]}
            onPress={() => setModo('colaborativo')}
            activeOpacity={0.85}
          >
            <Text style={[styles.toggleLabel, modo === 'colaborativo' ? styles.toggleLabelActive : styles.toggleLabelInactive]}>
              Colaborativo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Shopping list */}
        <Text variant="Heading/H4" style={styles.listaHeading}>{'🛒  Lista de compras'}</Text>
        <View style={styles.listaCard}>
          {items.map((item, i) => (
            <View key={item.label}>
              <View style={styles.listaRow}>
                <View style={styles.dot} />
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemCantidad}>{item.cantidad}</Text>
              </View>
              {i < items.length - 1 && <View style={styles.separador} />}
            </View>
          ))}
        </View>

        {/* WhatsApp preview */}
        <View style={styles.waPreview}>
          <Text style={styles.waPreviewHeader}>{'📲  Vista previa'}</Text>
          <Text style={styles.waPreviewLine}>{preview1}</Text>
          <Text style={styles.waPreviewLine}>{preview2}</Text>
        </View>
      </ScrollView>

      {/* Footer — always visible */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <TouchableOpacity
          style={styles.waButton}
          onPress={() => compartirPorWhatsApp(completada)}
          activeOpacity={0.85}
        >
          <Text style={styles.waButtonLabel}>Compartir por WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

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
    paddingTop: spacing.xl,
  },
  // Event info
  nombre: {
    color: colors.neutral.carbon,
  },
  subtitulo: {
    color: colors.neutral.gray,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  // Stats card
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.mustardBg,
    borderWidth: 1.5,
    borderColor: colors.accent.mustardBorder,
    borderRadius: CARD_RADIUS,
    height: 72,
    shadowColor: colors.accent.mustardBorder,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statLabel: {
    color: colors.accent.mustardText,
  },
  statValor: {
    color: colors.accent.mustardText,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.accent.mustardBorder,
  },
  // Toggle
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.sandLight,
    borderRadius: 22,
    height: 44,
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: spacing.xl,
  },
  toggleTab: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTabActive: {
    backgroundColor: colors.brand.red,
  },
  toggleLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
  toggleLabelActive: {
    fontFamily: 'AlfaSlabOne_Regular',
    color: colors.neutral.white,
  },
  toggleLabelInactive: {
    fontFamily: 'DMSans_Regular',
    color: colors.neutral.gray,
  },
  // Shopping list
  listaHeading: {
    color: colors.neutral.carbon,
    marginBottom: spacing.md,
  },
  listaCard: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.neutral.sand,
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: spacing.xl,
  },
  listaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand.red,
  },
  itemLabel: {
    flex: 1,
    fontFamily: 'DMSans_Medium',
    fontSize: 15,
    lineHeight: 21,
    color: colors.neutral.carbon,
  },
  itemCantidad: {
    fontFamily: 'DMSans_Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.neutral.gray,
  },
  separador: {
    height: 1,
    backgroundColor: colors.neutral.sandLight,
  },
  // WhatsApp preview
  waPreview: {
    backgroundColor: WA_GREEN_BG,
    borderWidth: 1.5,
    borderColor: WA_GREEN,
    borderRadius: CARD_RADIUS,
    padding: spacing.md,
    gap: spacing.xs,
    shadowColor: WA_GREEN,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
  },
  waPreviewHeader: {
    fontFamily: 'DMSans_Bold',
    fontSize: 15,
    lineHeight: 20,
    color: WA_TEAL,
  },
  waPreviewLine: {
    fontFamily: 'DMSans_Regular',
    fontSize: 12,
    lineHeight: 17,
    color: colors.neutral.carbon,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    backgroundColor: colors.neutral.cream,
  },
  waButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  waButtonLabel: {
    fontFamily: 'AlfaSlabOne_Regular',
    fontSize: 17,
    lineHeight: 22,
    color: colors.neutral.white,
    textAlign: 'center',
  },
})
