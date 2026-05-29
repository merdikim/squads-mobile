import type { ReactNode } from 'react'
import { View } from 'react-native'
import { AppText } from './AppText'

type ModalHeaderProps = {
  action?: ReactNode
  description?: string
  title: string
}

export function ModalHeader({ action, description, title }: ModalHeaderProps) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <View className="flex-1">
        <AppText variant="title">{title}</AppText>
        {description ? (
          <AppText variant="muted" className="mt-2">
            {description}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  )
}
