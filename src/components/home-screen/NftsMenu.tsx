import { Text, View } from 'react-native'
import { EmptyMenuState } from './EmptyMenuState'

type NftsMenuProps = {
  nfts?: unknown[]
}

export function NftsMenu({ nfts = [] }: NftsMenuProps) {
  if (nfts.length === 0) {
    return <EmptyMenuState title="No NFTs" description="No NFTs for this multisig yet." />
  }

  return (
    <View className="mt-5 rounded-lg border border-black/10 bg-white p-4">
      <Text className="text-base font-black text-black">NFTs</Text>
      <Text className="mt-2 text-sm leading-6 text-black/60">View collectibles held by this multisig.</Text>
    </View>
  )
}
