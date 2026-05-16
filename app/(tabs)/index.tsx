import { useCallback, useRef, useState } from 'react'
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { Button } from '@/components/button'
import { CompletadaCard } from '@/components/completada-card'
import { Text } from '@/components/text'
import { listarCompletadas } from '@/lib/storage'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import type { Completada } from '@/types'

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [completadas, setCompletadas] = useState<Completada[]>([])
  const [selected, setSelected] = useState<Completada | null>(null)
  const slideAnim = useRef(new Animated.Value(300)).current

  useFocusEffect(
    useCallback(() => {
      listarCompletadas().then(setCompletadas)
    }, []),
  )

  function openSheet(completada: Completada) {
    setSelected(completada)
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start()
  }

  function closeSheet(callback?: () => void) {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setSelected(null)
      slideAnim.setValue(300)
      callback?.()
    })
  }

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <View style={styles.navbarContent}>
          <Text variant="Display/Logo" style={styles.logo}>
            Completadapp
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {completadas.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={completadas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CompletadaCard completada={item} onPress={openSheet} />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <Button
          label="+ Nueva completada"
          onPress={() => router.push('/nueva/nombre')}
        />
      </View>

      {/* Bottom Sheet */}
      <Modal
        visible={selected !== null}
        transparent
        animationType="none"
        onRequestClose={() => closeSheet()}
      >
        <TouchableWithoutFeedback onPress={() => closeSheet()}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.dragHandle} />

          <TouchableOpacity
            style={styles.sheetRow}
            activeOpacity={0.7}
            onPress={() => closeSheet(() => router.push(`/resumen?id=${selected?.id}`))}
          >
            <Text variant="Body/Regular" style={styles.sheetRowText}>
              Ver resumen
            </Text>
            <Text variant="Body/Regular" style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.sheetRow}
            activeOpacity={0.7}
            onPress={() => closeSheet(() => router.push(`/nueva/nombre?duplicarId=${selected?.id}`))}
          >
            <Text variant="Body/Regular" style={styles.sheetRowText}>
              Duplicar
            </Text>
            <Text variant="Body/Regular" style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelRow}
            activeOpacity={0.7}
            onPress={() => closeSheet()}
          >
            <Text variant="Action/Button" style={styles.cancelText}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  )
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIllustration}>
        <Text style={styles.emptyEmoji}>🌭</Text>
      </View>
      <Text variant="Heading/H2" style={styles.emptyTitle}>
        ¡Todo listo para tu próxima completada!
      </Text>
      <Text variant="Body/Regular" style={styles.emptySubtitle}>
        Aquí verás el historial de tus completadas una vez que crees la primera.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.cream,
  },
  navbar: {
    backgroundColor: colors.brand.red,
  },
  navbarContent: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    color: colors.neutral.white,
  },
  content: {
    flex: 1,
  },
  list: {
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.lg,
    backgroundColor: colors.neutral.cream,
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.xl,
  },
  emptyIllustration: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.neutral.sandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 72,
  },
  emptyTitle: {
    color: colors.neutral.carbon,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.neutral.gray,
    textAlign: 'center',
  },
  // Bottom sheet
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,26,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 244,
    backgroundColor: colors.neutral.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral.sand,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  sheetRowText: {
    color: colors.neutral.carbon,
  },
  chevron: {
    color: colors.neutral.gray,
    fontSize: 20,
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral.sand,
  },
  cancelRow: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  cancelText: {
    color: colors.brand.red,
  },
})
