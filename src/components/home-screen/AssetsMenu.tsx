import { Text, View } from 'react-native'

export function AssetsMenu() {
  return (
    <View className="mt-5 rounded-lg border border-black/10 bg-white p-4">
      <Text className="text-base font-black text-black">Assets</Text>
      <Text className="mt-2 text-sm leading-6 text-black/60">Track tokens and treasury balances.</Text>
    </View>
  )
}
