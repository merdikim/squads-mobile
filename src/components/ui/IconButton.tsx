import type { ComponentProps, ReactNode } from 'react'
import { Pressable } from 'react-native'
import { cn } from '../../lib/classNames'

type IconButtonVariant = 'ghost' | 'soft'
type IconButtonProps = ComponentProps<typeof Pressable> & {
  children: ReactNode
  variant?: IconButtonVariant
}

const variantClassNames: Record<IconButtonVariant, string> = {
  ghost: 'border border-black/10 active:bg-black/5',
  soft: 'bg-black/5 active:bg-black/10',
}

export function IconButton({ children, className, variant = 'ghost', ...props }: IconButtonProps) {
  return (
    <Pressable
      className={cn('h-10 w-10 items-center justify-center rounded-xl', variantClassNames[variant], className)}
      {...props}
    >
      {children}
    </Pressable>
  )
}
