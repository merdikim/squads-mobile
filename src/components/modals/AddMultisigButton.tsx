import type { GestureResponderEvent } from 'react-native'
import { Pressable, Text, View } from 'react-native'
import { Plus } from 'lucide-react-native'

type AddMultisigButtonProps = {
  isBusy?: boolean
  onCreate: (event: GestureResponderEvent) => void
  onImport: (event: GestureResponderEvent) => void
}

export function AddMultisigButton({ isBusy, onCreate, onImport }: AddMultisigButtonProps) {
  return (
    <View className="gap-2">
      <Pressable
        onPress={onCreate}
        disabled={isBusy}
        className="h-11 flex-row items-center justify-center rounded-md bg-black active:bg-black/80"
      >
        <Plus color="#FFFFFF" size={16} strokeWidth={2} />
        <Text className="ml-2 text-sm font-black text-white">{isBusy ? 'Working...' : 'Create Multisig'}</Text>
      </Pressable>

      <Pressable
        onPress={onImport}
        disabled={isBusy}
        className="h-11 flex-row items-center justify-center rounded-md border border-black/15 bg-white active:bg-black/5"
      >
        <Text className="text-sm font-black text-black">Import Multisig</Text>
      </Pressable>
    </View>
  )
}
