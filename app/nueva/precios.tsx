import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Easing,
  InputAccessoryView,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button } from '@/components/button'
import { ProgressStepper } from '@/components/progress-stepper'
import { Text } from '@/components/text'
import { DEFAULT_PRICES, loadPrices, savePrices } from '@/lib/defaultPrices'
import { obtenerCompletada } from '@/lib/storage'
import { colors } from '@/theme/colors'
import { radius } from '@/theme/radius'
import { spacing } from '@/theme/spacing'
import type { TipoCompleto } from '@/types'

function formatCLP(value: number): string {
  return '$' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const INGREDIENTES: {
  key: string
  label: string
  unidad: string
}[] = [
  { key: 'vienesas', label: 'Vienesas (pack x5)', unidad: 'pack' },
  { key: 'pan', label: 'Pan de completo (x8)', unidad: 'pack' },
  { key: 'palta', label: 'Palta Hass (1 kg)', unidad: 'malla' },
  { key: 'tomate', label: 'Tomate', unidad: 'kg' },
  { key: 'mayonesa', label: 'Mayonesa Kraft', unidad: 'frasco' },
  { key: 'mostaza', label: 'Mostaza', unidad: 'frasco' },
  { key: 'ketchup', label: 'Ketchup', unidad: 'frasco' },
  { key: 'chucrut', label: 'Chucrut', unidad: 'tarro' },
]

const VISIBLES_POR_TIPO: Record<TipoCompleto, string[]> = {
  italiano: ['vienesas', 'pan', 'palta', 'tomate', 'mayonesa'],
  dinamico: ['vienesas', 'pan', 'chucrut', 'tomate', 'mayonesa', 'mostaza'],
  americano: ['vienesas', 'pan', 'ketchup', 'mostaza', 'mayonesa'],
}

export default function PreciosScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { nombre, fecha, personas, tipo, duplicarId } = useLocalSearchParams<{
    nombre: string
    fecha: string
    personas: string
    tipo: TipoCompleto
    duplicarId?: string
  }>()

  const [precios, setPrecios] = useState<Record<string, number>>(DEFAULT_PRICES)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingRaw, setEditingRaw] = useState('')
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const inputRef = useRef<TextInput>(null)
  const slideAnim = useRef(new Animated.Value(320)).current

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const show = Keyboard.addListener(showEvent, (e) =>
      setKeyboardHeight(e.endCoordinates.height),
    )
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  useEffect(() => {
    if (duplicarId) {
      obtenerCompletada(duplicarId).then((c) => {
        if (c?.precios) setPrecios({ ...DEFAULT_PRICES, ...c.precios })
      })
    } else {
      loadPrices().then(setPrecios)
    }
  }, [duplicarId])

  const visibles = VISIBLES_POR_TIPO[tipo] ?? []
  const filas = INGREDIENTES.filter((i) => visibles.includes(i.key))

  function openEdit(key: string) {
    setEditingKey(key)
    setEditingRaw(String(precios[key]))
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 340,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start()
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  function confirmEdit() {
    const parsed = parseInt(editingRaw.replace(/\D/g, ''), 10)
    if (!isNaN(parsed) && parsed > 0 && editingKey) {
      setPrecios((p) => ({ ...p, [editingKey]: parsed }))
    }
    Animated.timing(slideAnim, {
      toValue: 320,
      duration: 260,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(320)
      setEditingKey(null)
    })
  }

  async function handleCalcular() {
    await savePrices(precios)
    router.push({
      pathname: '/resumen',
      params: {
        nombre,
        fecha,
        personas,
        tipo,
        precios: JSON.stringify(precios),
        ...(duplicarId ? { duplicarId } : {}),
      },
    })
  }

  const editingIngrediente = INGREDIENTES.find((i) => i.key === editingKey)

  return (
    <View style={styles.root}>
      {/* Navbar */}
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <View style={styles.navbarContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text variant="Label/Bold" style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text variant="Heading/H3-Nav" style={styles.navTitle}>Precios base</Text>
          <View style={styles.navSpacer} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.stepperRow}>
          <ProgressStepper total={4} current={4} />
        </View>

        <Text variant="Heading/H1" style={styles.heading}>
          {'Precios de\nreferencia'}
        </Text>
        <Text variant="Body/Small" style={styles.subtext}>
          Tócalos para editarlos según tu supermercado.
        </Text>

        <View style={styles.filas}>
          {filas.map(({ key, label, unidad }) => (
            <View key={key} style={styles.fila}>
              <View style={styles.filaTextos}>
                <Text style={styles.filaLabel}>{label}</Text>
                <Text style={styles.filaUnidad}>{unidad}</Text>
              </View>
              <TouchableOpacity
                style={styles.badge}
                onPress={() => openEdit(key)}
                activeOpacity={0.75}
              >
                <Text style={styles.badgeText}>{formatCLP(precios[key] ?? 0)}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.infoPill}>
          <Text style={styles.infoPillText}>
            ⚠ Precios referenciales. Actualiza los que difieran en tu zona.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <Button label="Calcular →" onPress={handleCalcular} />
      </View>

      {/* Edit modal */}
      <Modal visible={editingKey !== null} transparent animationType="none">
        <TouchableWithoutFeedback onPress={confirmEdit}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={[styles.editSheet, { bottom: Platform.OS === 'ios' ? keyboardHeight : 0 }]}>
          <Animated.View style={[styles.editCard, { transform: [{ translateY: slideAnim }] }]}>
            <Text variant="Heading/H4" style={styles.editTitle}>
              {editingIngrediente?.label}
            </Text>
            <Text variant="Body/Small" style={styles.editHint}>
              Precio por {editingIngrediente?.unidad} (CLP)
            </Text>
            <TextInput
              ref={inputRef}
              style={styles.editInput}
              value={editingRaw}
              onChangeText={setEditingRaw}
              keyboardType="number-pad"
              selectTextOnFocus
              inputAccessoryViewID="precio-input"
              onSubmitEditing={confirmEdit}
            />
            {Platform.OS === 'ios' && (
              <InputAccessoryView nativeID="precio-input" />
            )}
            <Button label="Listo" onPress={confirmEdit} />
          </Animated.View>
        </View>
      </Modal>
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
    paddingBottom: spacing['2xl'],
  },
  stepperRow: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  heading: {
    color: colors.neutral.carbon,
    marginBottom: spacing.sm,
  },
  subtext: {
    color: colors.neutral.gray,
    marginBottom: spacing.xl,
  },
  // Filas
  filas: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  fila: {
    height: 58,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.sand,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  filaTextos: {
    gap: 2,
  },
  filaLabel: {
    fontFamily: 'DMSans_Medium',
    fontSize: 14,
    lineHeight: 20,
    color: colors.neutral.carbon,
  },
  filaUnidad: {
    fontFamily: 'DMSans_Regular',
    fontSize: 11,
    lineHeight: 14,
    color: colors.neutral.grayLight,
  },
  badge: {
    height: 34,
    minWidth: 88,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.accent.mustardBorder,
    backgroundColor: colors.accent.mustardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'DMSans_Bold',
    fontSize: 15,
    lineHeight: 20,
    color: colors.accent.mustardText,
  },
  // Info pill
  infoPill: {
    backgroundColor: colors.neutral.sandLight,
    borderWidth: 1,
    borderColor: colors.neutral.sand,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoPillText: {
    fontFamily: 'DMSans_Regular',
    fontSize: 12,
    lineHeight: 18,
    color: colors.neutral.gray,
  },
  // Footer
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    backgroundColor: colors.neutral.cream,
  },
  // Edit modal
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,26,0.4)',
  },
  editSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  editCard: {
    backgroundColor: colors.neutral.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  editTitle: {
    color: colors.neutral.carbon,
  },
  editHint: {
    color: colors.neutral.gray,
  },
  editInput: {
    height: 52,
    backgroundColor: colors.neutral.white,
    borderWidth: 2,
    borderColor: colors.brand.red,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 20,
    fontFamily: 'DMSans_Bold',
    color: colors.neutral.carbon,
    marginBottom: spacing.sm,
  },
})
