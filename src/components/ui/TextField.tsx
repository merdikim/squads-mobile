import type { ComponentProps } from 'react'
import { TextInput } from 'react-native'
import { cn } from '../../lib/classNames'

type TextFieldProps = ComponentProps<typeof TextInput>

export function TextField({ className, placeholderTextColor = 'rgba(0,0,0,0.35)', ...props }: TextFieldProps) {
  return (
    <TextInput
      className={cn('min-h-12 rounded-xl border border-black/15 px-3 text-sm text-black', className)}
      placeholderTextColor={placeholderTextColor}
      {...props}
    />
  )
}
