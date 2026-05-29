import { ReactNode, useEffect, useRef, useState } from 'react'
import { Animated, Easing, Modal, Pressable, View, ViewStyle } from 'react-native'

type SmoothModalProps = {
  visible: boolean
  onClose: () => void
  children: ReactNode
  backdropClassName?: string
  contentClassName?: string
  contentStyle?: ViewStyle
}

const ENTER_DURATION = 240
const EXIT_DURATION = 170

export function SmoothModal({
  visible,
  onClose,
  children,
  backdropClassName = 'flex-1 items-center justify-center bg-black/30 px-4 py-6',
  contentClassName = 'w-full rounded-xl bg-white p-5',
  contentStyle,
}: SmoothModalProps) {
  const [isMounted, setIsMounted] = useState(visible)
  const [renderedChildren, setRenderedChildren] = useState(children)
  const progress = useRef(new Animated.Value(0)).current
  const isComponentMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false
      progress.stopAnimation()
    }
  }, [progress])

  useEffect(() => {
    if (visible) {
      setRenderedChildren(children)
    }
  }, [children, visible])

  useEffect(() => {
    progress.stopAnimation()

    if (visible) {
      setIsMounted(true)
      const animation = Animated.timing(progress, {
        toValue: 1,
        duration: ENTER_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })

      animation.start()

      return () => {
        animation.stop()
      }
    }

    const animation = Animated.timing(progress, {
      toValue: 0,
      duration: EXIT_DURATION,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    })

    animation.start(({ finished }) => {
      if (finished && isComponentMountedRef.current) {
        setIsMounted(false)
      }
    })

    return () => {
      animation.stop()
    }
  }, [progress, visible])

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })
  const panelOpacity = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 1, 1],
  })
  const panelTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  })
  const panelScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.97, 1],
  })

  return (
    <Modal visible={isMounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: backdropOpacity }}>
          <Pressable className={backdropClassName} onPress={onClose}>
            <Animated.View
              className="w-full"
              style={{
                opacity: panelOpacity,
                transform: [{ translateY: panelTranslateY }, { scale: panelScale }],
              }}
            >
              <Pressable className={contentClassName} style={contentStyle} onPress={(event) => event.stopPropagation()}>
                {renderedChildren}
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}
