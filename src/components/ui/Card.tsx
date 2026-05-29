import type { ComponentProps } from 'react'
import { Pressable, View } from 'react-native'
import { cn } from '../../lib/classNames'

const defaultCardClassName = 'rounded-xl bg-neutral-100/60 shadow-xs'

type CardProps = ComponentProps<typeof View>
type PressableCardProps = ComponentProps<typeof Pressable>

export function Card({ className, ...props }: CardProps) {
  return <View className={cn(defaultCardClassName, className)} {...props} />
}

export function PressableCard({ className, ...props }: PressableCardProps) {
  return <Pressable className={cn(defaultCardClassName, className)} {...props} />
}
