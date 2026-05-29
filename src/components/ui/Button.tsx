import type { ComponentProps, ReactNode } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import { cn } from '../../lib/classNames'
import { AppText } from './AppText'

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonProps = ComponentProps<typeof Pressable> & {
  children: ReactNode
  isLoading?: boolean
  leftIcon?: ReactNode
  textClassName?: string
  variant?: ButtonVariant
}

const buttonClassNames: Record<ButtonVariant, string> = {
  danger: 'bg-red-600 active:bg-red-700 disabled:opacity-60',
  primary: 'bg-black active:bg-black/80 disabled:opacity-60',
  secondary: 'border border-black/15 active:bg-black/5 disabled:opacity-60',
}

const textClassNames: Record<ButtonVariant, string> = {
  danger: 'text-white',
  primary: 'text-white',
  secondary: 'text-black',
}

export function Button({
  children,
  className,
  disabled,
  isLoading,
  leftIcon,
  textClassName,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading
  const indicatorColor = variant === 'secondary' ? '#090A0F' : '#FFFFFF'

  return (
    <Pressable
      className={cn('h-12 flex-row items-center justify-center rounded-xl px-4', buttonClassNames[variant], className)}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={indicatorColor} />
      ) : (
        <>
          {leftIcon ? <View className="mr-2">{leftIcon}</View> : null}
          <AppText variant="button" className={cn(textClassNames[variant], textClassName)}>
            {children}
          </AppText>
        </>
      )}
    </Pressable>
  )
}
