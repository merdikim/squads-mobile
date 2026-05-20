import { GestureResponderEvent, Pressable, ScrollView, Text, View } from 'react-native'
import { ChevronDown } from 'lucide-react-native'

export type DropdownItem = {
  key: string
  label: string
}

type DropdownProps = {
  items: DropdownItem[]
  selectedKey: string
  isOpen: boolean
  onToggle: () => void
  onSelect: (key: string) => void
  menuMaxHeight?: number
  bottomAction?: {
    label: string
    onPress: () => void
  }
}

export function Dropdown({ items, selectedKey, isOpen, onToggle, onSelect, menuMaxHeight, bottomAction }: DropdownProps) {
  const selectedItem = items.find((item) => item.key === selectedKey)
  const handleToggle = (event: GestureResponderEvent) => {
    event.stopPropagation()
    onToggle()
  }

  const handleSelect = (event: GestureResponderEvent, key: string) => {
    event.stopPropagation()
    onSelect(key)
  }

  const handleBottomAction = (event: GestureResponderEvent) => {
    event.stopPropagation()
    bottomAction?.onPress()
  }

  return (
    <View className="relative z-20">
      <Pressable onPress={handleToggle} className="h-10 flex-row items-center">
        <Text className="text-sm font-bold text-black">{selectedItem?.label}</Text>
        <ChevronDown color="#090A0F" size={16} strokeWidth={2.4} />
      </Pressable>

      {isOpen ? (
        <View
          className="absolute left-0 top-11 w-56 rounded-md border border-black/10 bg-white px-3 py-2 shadow-lg"
          style={menuMaxHeight ? { maxHeight: menuMaxHeight } : undefined}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <Pressable
                key={item.key}
                onPress={(event) => handleSelect(event, item.key)}
                className="rounded-md px-2 py-2 active:bg-black/5"
              >
                <Text className={`text-sm font-bold ${selectedKey === item.key ? 'text-black' : 'text-black/60'}`}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {bottomAction ? (
            <Pressable
              onPress={handleBottomAction}
              className="mt-2 h-11 items-center justify-center rounded-md border-t border-black/10 active:bg-black/5"
            >
              <Text className="text-sm font-black text-black">{bottomAction.label}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}
