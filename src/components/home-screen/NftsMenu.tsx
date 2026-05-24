import { Image, ScrollView, Text, View } from 'react-native'
import { EmptyMenuState } from './EmptyMenuState'
import { CardSkeleton } from '../skeletons/CardSkeleton'
import useNfts from '../../hooks/useNfts'
import { shortenAddress } from '../../utils'

type NftsMenuProps = {
  address?: string
}

export function NftsMenu({ address }: NftsMenuProps) {
  const { nfts = [], nftsError, isNftsLoading } = useNfts(address)

  if (isNftsLoading) {
    return (
      <View className="mt-5">
        {[0, 1, 2].map((item) => (
          <View key={item} className="mb-3 flex-row items-center rounded-xl bg-neutral-100/60 p-4">
            <CardSkeleton className="h-12 w-12 rounded-lg" />
            <View className="ml-3 flex-1">
              <CardSkeleton className="h-4 w-32 rounded-md" />
              <CardSkeleton className="mt-2 h-3 w-20 rounded-md" />
            </View>
          </View>
        ))}
      </View>
    )
  }

  if (nftsError) {
    return <EmptyMenuState title='Api Error' description={nftsError.message} />
  }

  if (nfts.length === 0) {
    return <EmptyMenuState title="No NFTs found" description='No NFTs found on this account' />
  }

  return (
    <ScrollView className="mt-5" showsVerticalScrollIndicator={false}>
      {nfts.map((nft) => (
        <View key={nft.id} className="mb-3 flex-row items-center rounded-xl bg-neutral-100/60 p-4">
          <Image
            source={nft.imageUri ? { uri: nft.imageUri } : require('../../assets/logo.png')}
            className="h-12 w-12 rounded-lg bg-black/5"
          />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-extrabold text-black" numberOfLines={1}>
              {nft.name}
            </Text>
            <Text className="mt-1 text-xs font-semibold text-black/45" numberOfLines={1}>
              {nft.collectionName ?? nft.symbol ?? (nft.mint ? shortenAddress(nft.mint) : 'Collectible')}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}
