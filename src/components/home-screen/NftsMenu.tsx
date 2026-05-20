import { Text, View } from 'react-native'

export function NftsMenu() {
  return (
    <View className="mt-5 rounded-lg border border-black/10 bg-white p-4">
      <Text className="text-base font-black text-black">NFTs</Text>
      <Text className="mt-2 text-sm leading-6 text-black/60">View collectibles held by this multisig.</Text>
    </View>
  )
}
