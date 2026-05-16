import { useEffect, useState } from 'react'
import { Image, ImageSourcePropType, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ProgressStepper } from '@/components/progress-stepper'
import { Text } from '@/components/text'
import { obtenerCompletada } from '@/lib/storage'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import type { TipoCompleto } from '@/types'

const CARDS: {
  tipo: TipoCompleto
  nombre: string
  descripcion: string
  imagen: ImageSourcePropType
}[] = [
  {
    tipo: 'italiano',
    nombre: 'Italiano',
    descripcion: 'Con palta, tomate y mayonesa',
    imagen: require('@/assets/images/completos/italiano.png'),
  },
  {
    tipo: 'dinamico',
    nombre: 'Dinámico',
    descripcion: 'Con chucrut, tomate, mayonesa y mostaza',
    imagen: require('@/assets/images/completos/dinamico.png'),
  },
  {
    tipo: 'americano',
    nombre: 'Americano',
    descripcion: 'Con ketchup, mostaza y mayonesa',
    imagen: require('@/assets/images/completos/americano.png'),
  },
]

export default function TipoScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { nombre, fecha, personas, duplicarId } = useLocalSearchParams<{
    nombre: string
    fecha: string
    personas: string
    duplicarId?: string
  }>()

  const [preseleccionado, setPreseleccionado] = useState<TipoCompleto | null>(null)

  useEffect(() => {
    if (duplicarId) {
      obtenerCompletada(duplicarId).then((c) => {
        if (c) {
          const entries = Object.entries(c.completos) as [TipoCompleto, number][]
          const dominante = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
          setPreseleccionado(dominante)
        }
      })
    }
  }, [duplicarId])

  function handleSeleccionar(tipo: TipoCompleto) {
    router.push({
      pathname: '/nueva/precios',
      params: {
        nombre,
        fecha,
        personas,
        tipo,
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
          <Text variant="Heading/H3-Nav" style={styles.navTitle}>Tipo de completo</Text>
          <View style={styles.navSpacer} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepperRow}>
          <ProgressStepper total={4} current={3} />
        </View>

        <Text variant="Heading/H1" style={styles.heading}>
          {'¿Qué tipo de\ncompleto van a hacer?'}
        </Text>

        <View style={styles.cards}>
          {CARDS.map(({ tipo, nombre: cardNombre, descripcion, imagen }) => {
            const seleccionado = preseleccionado === tipo
            return (
              <TouchableOpacity
                key={tipo}
                style={[styles.card, seleccionado ? styles.cardSelected : styles.cardDefault]}
                onPress={() => handleSeleccionar(tipo)}
                activeOpacity={0.85}
              >
                <Image source={imagen} style={styles.imagen} />
                <View style={styles.textos}>
                  <Text
                    variant="Heading/H3-Nav"
                    style={[styles.cardNombre, seleccionado && styles.cardNombreSelected]}
                  >
                    {cardNombre}
                  </Text>
                  <Text variant="Body/XSmall" style={styles.descripcion}>
                    {descripcion}
                  </Text>
                </View>
                {seleccionado && (
                  <Text variant="Label/Bold" style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

const CARD_RADIUS = 14

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
  // Cards
  cards: {
    gap: spacing.lg,
  },
  card: {
    height: 104,
    borderRadius: CARD_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  cardDefault: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.neutral.sand,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: {
    backgroundColor: colors.brand.redLight,
    borderWidth: 2,
    borderColor: colors.brand.red,
    shadowColor: colors.brand.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  imagen: {
    width: 72,
    height: 72,
  },
  textos: {
    flex: 1,
    gap: 4,
  },
  cardNombre: {
    color: colors.neutral.carbon,
  },
  cardNombreSelected: {
    color: colors.brand.red,
  },
  descripcion: {
    color: colors.neutral.gray,
  },
  checkmark: {
    color: colors.brand.red,
  },
})
