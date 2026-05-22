import * as Clipboard from 'expo-clipboard'
import { useEffect, useRef, useState } from 'react'
import { GestureResponderEvent, Pressable } from 'react-native'
import { CheckCheck, Copy } from 'lucide-react-native'

type CopyTextProps = {
  text: string
  accessibilityLabel?: string
  className?: string
  iconColor?: string
  iconSize?: number
  successDurationMs?: number
}

export function CopyText({
  text,
  accessibilityLabel = 'Copy text',
  className = 'h-8 w-8 items-center justify-center rounded-xl disabled:opacity-40',
  iconColor = 'rgba(0,0,0,0.45)',
  iconSize = 14,
  successDurationMs = 2000,
}: CopyTextProps) {
  const [didCopy, setDidCopy] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const copyText = async (event: GestureResponderEvent) => {
    event.stopPropagation()

    if (!text) {
      return
    }

    await Clipboard.setStringAsync(text)
    setDidCopy(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDidCopy(false)
      timeoutRef.current = null
    }, successDurationMs)
  }

  const Icon = didCopy ? CheckCheck : Copy

  return (
    <Pressable
      onPress={copyText}
      disabled={!text}
      className={className}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Icon color={iconColor} size={iconSize} strokeWidth={2.4} />
    </Pressable>
  )
}
