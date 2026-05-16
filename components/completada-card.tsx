import { StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from '@/components/text'
import { colors } from '@/theme/colors'
import { radius } from '@/theme/radius'
import { spacing } from '@/theme/spacing'
import type { Completada, TipoCompleto } from '@/types'

interface CompletadaCardProps {
  completada: Completada
  onPress: (completada: Completada) => void
}

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

const TIPO_LABEL: Record<TipoCompleto, string> = {
  italiano: 'Italiano',
  dinamico: 'Dinámico',
  americano: 'Americano',
}

function formatearFecha(fecha: string): string {
  const d = new Date(fecha)
  if (isNaN(d.getTime())) return 'Fecha no disponible'
  return `${d.getDate()} de ${MESES[d.getMonth()]}`
}

// Defensive extraction: AsyncStorage data saved before the getString() fix may have
// stored nombre as string[] if useLocalSearchParams returned an array at runtime.
function extractNombre(value: string): string {
  const raw = value as unknown as string | string[]
  if (Array.isArray(raw)) return raw[raw.length - 1] ?? ''
  return raw ?? ''
}

function getTipoLabel(completos: Completada['completos']): string {
  const entries = (Object.entries(completos) as [TipoCompleto, number][]).filter(([, v]) => v > 0)
  if (entries.length === 0) return ''
  const [tipo] = entries.reduce((a, b) => (b[1] > a[1] ? b : a))
  return TIPO_LABEL[tipo]
}

export function CompletadaCard({ completada, onPress }: CompletadaCardProps) {
  const tipo = getTipoLabel(completada.completos)
  const nombre = extractNombre(completada.nombre)

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(completada)}
      activeOpacity={0.85}
    >
      <Text variant="Heading/H4" style={styles.nombre}>
        {nombre}
      </Text>
      <Text variant="Body/Small" style={styles.fecha}>
        {formatearFecha(completada.fecha)}
      </Text>
      <Text variant="Body/Caption" style={styles.meta}>
        {tipo} · {completada.personas} personas
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral.sand,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  nombre: {
    color: colors.neutral.carbon,
  },
  fecha: {
    color: colors.neutral.gray,
  },
  meta: {
    color: colors.neutral.grayLight,
  },
})
