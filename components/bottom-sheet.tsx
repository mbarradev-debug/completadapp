import { useEffect, useRef } from 'react'
import {
  Animated,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/text'
import { colors } from '@/theme/colors'
import { spacing } from '@/theme/spacing'
import type { Completada } from '@/types'

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  onVerResumen: () => void
  onDuplicar: () => void
  completada: Completada | null
}

const SHEET_HEIGHT = 244
const SPRING_CONFIG = { toValue: 0, bounciness: 4, useNativeDriver: true } as const

export function BottomSheet({ visible, onClose, onVerResumen, onDuplicar }: BottomSheetProps) {
  const insets = useSafeAreaInsets()
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  const onCloseRef = useRef(onClose)
  const onVerResumenRef = useRef(onVerResumen)
  const onDuplicarRef = useRef(onDuplicar)
  onCloseRef.current = onClose
  onVerResumenRef.current = onVerResumen
  onDuplicarRef.current = onDuplicar

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, SPRING_CONFIG),
        Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start()
    }
  }, [visible])

  function slideDown(callback: () => void) {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SHEET_HEIGHT, duration: 220, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      slideAnim.setValue(SHEET_HEIGHT)
      overlayAnim.setValue(0)
      callback()
    })
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) {
          slideAnim.setValue(dy)
          overlayAnim.setValue(Math.max(0, 1 - dy / SHEET_HEIGHT))
        }
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > 80 || vy > 0.5) {
          slideDown(() => onCloseRef.current())
        } else {
          Animated.spring(slideAnim, SPRING_CONFIG).start()
        }
      },
    }),
  ).current

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => slideDown(() => onCloseRef.current())}
    >
      <TouchableWithoutFeedback onPress={() => slideDown(() => onCloseRef.current())}>
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, spacing.xl), transform: [{ translateY: slideAnim }] },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandle} />

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => slideDown(() => onVerResumenRef.current())}
        >
          <Text style={styles.rowText}>Ver resumen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => slideDown(() => onDuplicarRef.current())}
        >
          <Text style={styles.rowText}>Duplicar</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.cancelRow}
          activeOpacity={0.7}
          onPress={() => slideDown(() => onCloseRef.current())}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,26,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral.sand,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.neutral.sand,
  },
  row: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  rowText: {
    fontFamily: 'DMSans_Regular',
    fontSize: 16,
    lineHeight: 22,
    color: colors.neutral.carbon,
  },
  chevron: {
    fontFamily: 'DMSans_Regular',
    fontSize: 20,
    color: colors.neutral.grayLight,
  },
  cancelRow: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'DMSans_Regular',
    fontSize: 16,
    lineHeight: 22,
    color: colors.brand.red,
  },
})
