import { useCallback, useState } from 'react'
import { FlatList, Image, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useRouter } from 'expo-router'
import { BottomSheet } from '@/components/bottom-sheet'
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

  useFocusEffect(
    useCallback(() => {
      listarCompletadas().then(setCompletadas)
    }, []),
  )

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
              <CompletadaCard completada={item} onPress={setSelected} />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={10}
          />
        )}
      </View>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing['2xl']) }]}>
        <Button
          label="+ Nueva completada"
          onPress={() => router.push('/nueva/nombre')}
        />
      </View>

      <BottomSheet
        visible={selected !== null}
        completada={selected}
        onClose={() => setSelected(null)}
        onVerResumen={() => {
          const id = selected?.id
          setSelected(null)
          router.push(`/resumen?id=${id}`)
        }}
        onDuplicar={() => {
          const id = selected?.id
          setSelected(null)
          router.push(`/nueva/nombre?duplicarId=${id}`)
        }}
      />
    </View>
  )
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIllustration}>
        <Image
          source={require('@/assets/icons/icon-hotdog.png')}
          style={styles.emptyImage}
          resizeMode="contain"
        />
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
  emptyImage: {
    width: 120,
    height: 120,
  },
  emptyTitle: {
    color: colors.neutral.carbon,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.neutral.gray,
    textAlign: 'center',
  },
})
