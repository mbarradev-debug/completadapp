import { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
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
import { obtenerCompletada } from '@/lib/storage'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function formatFecha(d: Date): string {
  return `${d.getDate()} de ${MESES[d.getMonth()]}`
}

export default function NombreScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { duplicarId } = useLocalSearchParams<{ duplicarId?: string }>()

  const [nombre, setNombre] = useState('')
  const [fecha, setFecha] = useState(new Date())
  const [nombreFocused, setNombreFocused] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [tempFecha, setTempFecha] = useState(new Date())

  useEffect(() => {
    if (duplicarId) {
      obtenerCompletada(duplicarId).then((c) => {
        if (c) {
          setNombre(c.nombre)
          const d = new Date(c.fecha)
          setFecha(d)
          setTempFecha(d)
        }
      })
    }
  }, [duplicarId])

  function openPicker() {
    setTempFecha(fecha)
    setShowPicker(true)
  }

  function confirmPicker() {
    setFecha(tempFecha)
    setShowPicker(false)
  }

  function changeDay(delta: number) {
    const d = new Date(tempFecha)
    d.setDate(d.getDate() + delta)
    setTempFecha(d)
  }

  function changeMonth(delta: number) {
    const d = new Date(tempFecha)
    d.setMonth(d.getMonth() + delta)
    setTempFecha(d)
  }

  function handleContinuar() {
    router.push({
      pathname: '/nueva/personas',
      params: {
        nombre: nombre.trim(),
        fecha: fecha.toISOString(),
        ...(duplicarId ? { duplicarId } : {}),
      },
    })
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Navbar */}
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <View style={styles.navbarContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text variant="Label/Bold" style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text variant="Heading/H3-Nav" style={styles.navTitle}>Nueva completada</Text>
          <View style={styles.navSpacer} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress stepper */}
        <View style={styles.stepperRow}>
          <ProgressStepper total={4} current={1} />
        </View>

        {/* Heading */}
        <Text variant="Heading/H1" style={styles.heading}>
          {'¿Cómo se llama\ntu completada?'}
        </Text>

        {/* Nombre */}
        <View style={styles.fieldGroup}>
          <Text variant="Special/FormLabel" style={styles.label}>Nombre del evento</Text>
          <TextInput
            style={[styles.input, nombreFocused ? styles.inputFocused : styles.inputDefault]}
            placeholder="Ej: Completada del viernes"
            placeholderTextColor={colors.neutral.grayLight}
            value={nombre}
            onChangeText={setNombre}
            onFocus={() => setNombreFocused(true)}
            onBlur={() => setNombreFocused(false)}
            returnKeyType="done"
          />
        </View>

        {/* Fecha */}
        <View style={styles.fieldGroup}>
          <Text variant="Special/FormLabel" style={styles.label}>Fecha del evento</Text>
          <TouchableOpacity
            style={[styles.input, styles.inputDefault, styles.dateRow]}
            onPress={openPicker}
            activeOpacity={0.8}
          >
            <Text variant="Body/Regular" style={styles.dateText}>
              {formatFecha(fecha)}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <Button
          label="Continuar →"
          onPress={handleContinuar}
          disabled={nombre.trim().length === 0}
        />
      </View>

      {/* Date picker modal */}
      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={styles.pickerOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.pickerSheet}>
          <Text variant="Heading/H3-Nav" style={styles.pickerTitle}>Selecciona la fecha</Text>

          <View style={styles.pickerRow}>
            <TouchableOpacity style={styles.pickerArrow} onPress={() => changeMonth(-1)}>
              <Text variant="Action/Button" style={styles.pickerArrowText}>‹</Text>
            </TouchableOpacity>
            <Text variant="Label/Bold" style={styles.pickerValue}>
              {MESES[tempFecha.getMonth()]}
            </Text>
            <TouchableOpacity style={styles.pickerArrow} onPress={() => changeMonth(1)}>
              <Text variant="Action/Button" style={styles.pickerArrowText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerRow}>
            <TouchableOpacity style={styles.pickerArrow} onPress={() => changeDay(-1)}>
              <Text variant="Action/Button" style={styles.pickerArrowText}>‹</Text>
            </TouchableOpacity>
            <Text variant="Heading/H1" style={styles.pickerDayValue}>
              {tempFecha.getDate()}
            </Text>
            <TouchableOpacity style={styles.pickerArrow} onPress={() => changeDay(1)}>
              <Text variant="Action/Button" style={styles.pickerArrowText}>›</Text>
            </TouchableOpacity>
          </View>

          <Button label="Listo" onPress={confirmPicker} />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const INPUT_RADIUS = 10
const INPUT_SHADOW = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
} as const

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
    marginBottom: spacing.xl,
  },
  // Fields
  fieldGroup: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  label: {
    color: colors.neutral.gray,
  },
  input: {
    height: 52,
    borderRadius: INPUT_RADIUS,
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: 'DMSans_Regular',
    color: colors.neutral.carbon,
    ...INPUT_SHADOW,
  },
  inputDefault: {
    borderWidth: 1.5,
    borderColor: colors.neutral.sand,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: colors.brand.red,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: colors.neutral.carbon,
  },
  calendarIcon: {
    fontSize: 18,
  },
  // Footer
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    backgroundColor: colors.neutral.cream,
  },
  // Date picker modal
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,26,0.5)',
  },
  pickerSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    gap: spacing.xl,
  },
  pickerTitle: {
    color: colors.neutral.carbon,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerArrow: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerArrowText: {
    color: colors.brand.red,
    fontSize: 28,
  },
  pickerValue: {
    flex: 1,
    textAlign: 'center',
    color: colors.neutral.carbon,
    textTransform: 'capitalize',
  },
  pickerDayValue: {
    flex: 1,
    textAlign: 'center',
    color: colors.neutral.carbon,
  },
})
