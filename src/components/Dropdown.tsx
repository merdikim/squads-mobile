import { GestureResponderEvent, Image, Pressable, ScrollView, View } from 'react-native'
import { ChevronDown } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { AppText } from './ui'

export type DropdownItem = {
  key: string
  label: unknown
  subtitle?: unknown
  imageUri?: string
}

type DropdownProps = {
  items: DropdownItem[]
  selectedKey: string
  isOpen: boolean
  onToggle: () => void
  onSelect: (key: string) => void
  menuMaxHeight?: number
  button?: ReactNode
}

export function Dropdown({ items, selectedKey, isOpen, onToggle, onSelect, menuMaxHeight, button }: DropdownProps) {
  const selectedItem = items.find((item) => item.key === selectedKey)
  const selectedLabel = getDisplayText(selectedItem?.label, 'Select multisig')
  const handleToggle = (event: GestureResponderEvent) => {
    event.stopPropagation()
    onToggle()
  }

  const handleSelect = (event: GestureResponderEvent, key: string) => {
    event.stopPropagation()
    onSelect(key)
  }

  return (
    <View className="relative z-20">
      <Pressable onPress={handleToggle} className="h-10 flex-row items-center gap-2">
        <DropdownImage imageUri={selectedItem?.imageUri} label={selectedLabel} sizeClassName="h-8 w-8" />
        <AppText className="max-w-40 font-mono-semibold" numberOfLines={1}>
          {selectedLabel}
        </AppText>
        <ChevronDown color="#090A0F" size={16} strokeWidth={2.4} />
      </Pressable>

      {isOpen ? (
        <View
          className="absolute left-0 top-11 w-56 rounded-xl border border-black/10 bg-white px-3 py-2 shadow-lg"
          style={menuMaxHeight ? { maxHeight: menuMaxHeight } : undefined}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {items.map((item) => {
              const label = getDisplayText(item.label, item.key)
              const subtitle = getDisplayText(item.subtitle)

              return (
                <Pressable
                  key={item.key}
                  onPress={(event) => handleSelect(event, item.key)}
                  className="flex-row items-center gap-3 rounded-xl px-2 py-2 active:bg-black/5"
                >
                  <DropdownImage imageUri={item.imageUri} label={label} sizeClassName="h-9 w-9" />
                  <View className="flex-1">
                    <AppText
                      className={`font-mono-bold ${selectedKey === item.key ? 'text-black' : 'text-black/60'}`}
                      numberOfLines={1}
                    >
                      {label}
                    </AppText>
                    {subtitle ? (
                      <AppText variant="caption" className="mt-0.5 text-black/40" numberOfLines={1}>
                        {subtitle}
                      </AppText>
                    ) : null}
                  </View>
                </Pressable>
              )
            })}
          </ScrollView>

          {button ? <View className="mt-2 border-t border-black/10 pt-2">{button}</View> : null}
        </View>
      ) : null}
    </View>
  )
}

function getDisplayText(value: unknown, fallback = '') {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return value.toString()
  }

  return fallback
}

function DropdownImage({
  imageUri,
  label,
  sizeClassName,
}: {
  imageUri?: string
  label: string
  sizeClassName: string
}) {
  if (imageUri) {
    return <Image source={{ uri: imageUri }} className={`${sizeClassName} rounded-xl bg-black/5`} resizeMode="cover" />
  }

  return (
    <View className={`${sizeClassName} items-center justify-center rounded-xl bg-black/5`}>
      <AppText variant="caption" className="font-mono-extrabold text-black/50">
        {label.slice(0, 1).toUpperCase()}
      </AppText>
    </View>
  )
}
