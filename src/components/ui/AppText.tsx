import type { ComponentProps } from 'react'
import { Text } from 'react-native'
import { cn } from '../../lib/classNames'

type AppTextVariant = 'body' | 'button' | 'caption' | 'error' | 'heading' | 'label' | 'muted' | 'title'
type AppTextProps = ComponentProps<typeof Text> & {
  variant?: AppTextVariant
}

const variantClassNames: Record<AppTextVariant, string> = {
  body: 'text-sm font-mono text-black',
  button: 'text-base font-mono-bold text-black',
  caption: 'text-xs font-mono-semibold text-black/45',
  error: 'text-xs font-mono-bold text-red-600',
  heading: 'text-3xl font-mono-extrabold text-black',
  label: 'text-xs font-mono-bold uppercase text-black/45',
  muted: 'text-sm font-mono leading-6 text-black/60',
  title: 'text-xl font-mono-extrabold text-black',
}

export function AppText({ className, variant = 'body', ...props }: AppTextProps) {
  return <Text className={cn(variantClassNames[variant], className)} {...props} />
}
