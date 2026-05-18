import { StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native'
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
  const [, mes, dia] = fecha.split('T')[0].split('-').map(Number)
  return `${dia} de ${MESES[mes - 1]}`
}

function getTipoLabel(completos: Completada['completos']): string {
  const entries = (Object.entries(completos) as [TipoCompleto, number][]).filter(([, v]) => v > 0)
  if (entries.length === 0) return ''
  const [tipo] = entries.reduce((a, b) => (b[1] > a[1] ? b : a))
  return TIPO_LABEL[tipo]
}

export function CompletadaCard({ completada, onPress }: CompletadaCardProps) {
  const tipo = getTipoLabel(completada.completos)
  const { width } = useWindowDimensions()
  const isNarrow = width < 375

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(completada)}
      activeOpacity={0.85}
    >
      <Text variant="Heading/H4" style={[styles.nombre, isNarrow && styles.nombreNarrow]}>
        {completada.nombre}
      </Text>
      <Text variant="Body/Small" style={[styles.fecha, isNarrow && styles.fechaNarrow]}>
        {formatearFecha(completada.fecha)}
      </Text>
      <Text variant="Body/Caption" style={[styles.meta, isNarrow && styles.metaNarrow]}>
        {tipo} · {completada.personas} {completada.personas !== 1 ? 'personas' : 'persona'}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.cream,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral.sand,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  nombre: {
    color: colors.neutral.carbon,
  },
  nombreNarrow: {
    fontSize: 14,
  },
  fecha: {
    color: colors.neutral.gray,
  },
  fechaNarrow: {
    fontSize: 13,
  },
  meta: {
    color: colors.neutral.grayLight,
  },
  metaNarrow: {
    fontSize: 11,
  },
})
