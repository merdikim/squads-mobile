import { useCallback } from 'react'
import { Image as ExpoImage } from 'expo-image'
import { FlatList, StyleSheet, View } from 'react-native'
import { EmptyMenuState } from './EmptyMenuState'
import { CardSkeleton } from '../skeletons/CardSkeleton'
import useNfts from '../../hooks/useNfts'
import { shortenAddress } from '../../utils'
import type { SquadsNftData } from '../../types'
import { Card } from '../ui/Card'
import { AppText } from '../ui/AppText'

const keyExtractor = (nft: SquadsNftData) => nft.id

function NftRow({ nft }: { nft: SquadsNftData }) {
  return (
    <Card className="mb-3 flex-row items-center p-4">
      <ExpoImage
        source={nft.imageUri ? { uri: nft.imageUri } : require('../../assets/logo.png')}
        style={styles.nftImage}
        cachePolicy="disk"
        contentFit="cover"
        transition={120}
      />
      <View className="ml-3 flex-1">
        <AppText className="font-mono-extrabold" numberOfLines={1}>
          {nft.name}
        </AppText>
        <AppText variant="caption" className="mt-1" numberOfLines={1}>
          {nft.collectionName ?? nft.symbol ?? (nft.mint ? shortenAddress(nft.mint) : 'Collectible')}
        </AppText>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  nftImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
})

export function NftsMenu({ address }: { address?: string }) {
  const { nfts = [], nftsError, isNftsLoading } = useNfts(address)
  const renderNft = useCallback(({ item }: { item: SquadsNftData }) => <NftRow nft={item} />, [])

  if (isNftsLoading) {
    return (
      <View className="mt-5">
        {[0, 1, 2].map((item) => (
          <Card key={item} className="mb-3 flex-row items-center p-4">
            <CardSkeleton className="h-12 w-12 rounded-lg" />
            <View className="ml-3 flex-1">
              <CardSkeleton className="h-4 w-32 rounded-md" />
              <CardSkeleton className="mt-2 h-3 w-20 rounded-md" />
            </View>
          </Card>
        ))}
      </View>
    )
  }

  if (nftsError) {
    return <EmptyMenuState title="Api Error" description={nftsError.message} />
  }

  if (nfts.length === 0) {
    return <EmptyMenuState title="No NFTs found" description="No NFTs found on this account" />
  }

  return (
    <FlatList
      className="mt-5"
      data={nfts}
      keyExtractor={keyExtractor}
      renderItem={renderNft}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={7}
      showsVerticalScrollIndicator={false}
    />
  )
}
