import { Text, View } from 'react-native'
import { EmptyMenuState } from './EmptyMenuState'

type CoinsMenuProps = {
  assets?: unknown[]
}

export function CoinsMenu({ assets = [] }: CoinsMenuProps) {
  if (assets.length === 0) {
    return <EmptyMenuState title="No coins found" />
  }

  return (
    <View className="mt-5 rounded-xl border border-black/10 bg-white p-4">
      <Text className="text-base font-black text-black">Assets</Text>
      <Text className="mt-2 text-sm leading-6 text-black/60">Track tokens and treasury balances.</Text>
    </View>
  )
}
