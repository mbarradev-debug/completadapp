import { useEffect, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Button } from '@/components/button'
import { InfoPill } from '@/components/info-pill'
import { ProgressStepper } from '@/components/progress-stepper'
import { Text } from '@/components/text'
import { obtenerCompletada } from '@/lib/storage'
import { colors } from '@/theme/colors'
import { radius } from '@/theme/radius'
import { spacing } from '@/theme/spacing'

const MIN = 1
const MAX = 50

export default function PersonasScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { nombre, fecha, duplicarId } = useLocalSearchParams<{
    nombre: string
    fecha: string
    duplicarId?: string
  }>()

  const [personas, setPersonas] = useState(MIN)

  useEffect(() => {
    if (duplicarId) {
      obtenerCompletada(duplicarId).then((c) => {
        if (c) setPersonas(c.personas)
      })
    }
  }, [duplicarId])

  function decrement() {
    setPersonas((p) => Math.max(MIN, p - 1))
  }

  function increment() {
    setPersonas((p) => Math.min(MAX, p + 1))
  }

  function handleContinuar() {
    router.push({
      pathname: '/nueva/tipo',
      params: {
        nombre,
        fecha,
        personas: String(personas),
        ...(duplicarId ? { duplicarId } : {}),
      },
    })
  }

  return (
    <View style={styles.root}>
      {/* Navbar */}
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <View style={styles.navbarContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text variant="Label/Bold" style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text variant="Heading/H3-Nav" style={styles.navTitle}>Participantes</Text>
          <View style={styles.navSpacer} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.stepperRow}>
          <ProgressStepper total={4} current={2} />
        </View>

        <Text variant="Heading/H1" style={styles.heading}>
          {'¿Cuántos van\na la completada?'}
        </Text>

        <Text variant="Body/Small" style={styles.subtext}>Mínimo 1 persona</Text>

        {/* Stepper card */}
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.btn, styles.btnMinus, personas <= MIN && styles.btnDisabled]}
            onPress={decrement}
            disabled={personas <= MIN}
            activeOpacity={0.7}
          >
            <Text variant="Action/Stepper" style={styles.btnMinusText}>−</Text>
          </TouchableOpacity>

          <Text variant="Heading/Stepper" style={styles.number}>
            {personas}
          </Text>

          <TouchableOpacity
            style={[styles.btn, styles.btnPlus, personas >= MAX && styles.btnDisabled]}
            onPress={increment}
            disabled={personas >= MAX}
            activeOpacity={0.7}
          >
            <Text variant="Action/Stepper" style={styles.btnPlusText}>+</Text>
          </TouchableOpacity>
        </View>

        <InfoPill text="Puedes ajustar esto si alguien se suma o se baja." />
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
        <Button label="Continuar →" onPress={handleContinuar} />
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
  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
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
    color: colors.neutral.grayLight,
    marginBottom: spacing.xl,
  },
  // Stepper card
  card: {
    height: 120,
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.neutral.sand,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMinus: {
    backgroundColor: colors.neutral.sandLight,
    borderWidth: 1.5,
    borderColor: colors.neutral.sand,
  },
  btnPlus: {
    backgroundColor: colors.brand.red,
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnMinusText: {
    color: colors.neutral.carbon,
  },
  btnPlusText: {
    color: colors.neutral.white,
  },
  number: {
    color: colors.brand.red,
  },
  // Footer
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    backgroundColor: colors.neutral.cream,
  },
})
