import { useCallback, useMemo } from 'react'
import { Image as ExpoImage } from 'expo-image'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { EmptyMenuState } from './EmptyMenuState'
import { CardSkeleton } from '../skeletons/CardSkeleton'
import useBalances from '../../hooks/useBalances'
import type { SquadsBalanceData } from '../../types'

const formatTokenAmount = (amount: number) => {
  if (amount === 0) {
    return '0'
  }

  return amount.toLocaleString(undefined, {
    maximumFractionDigits: amount < 1 ? 6 : 4,
  })
}

const formatUsd = (amount: number) => {
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount < 1 ? 4 : 2,
  })
}

const keyExtractor = (balance: SquadsBalanceData) => `${balance.mint}-${balance.source}`

function CoinRow({ balance }: { balance: SquadsBalanceData }) {
  return (
    <View className="mb-3 flex-row items-center rounded-xl bg-neutral-100/60 p-4">
      <ExpoImage
        source={balance.logoUri ? { uri: balance.logoUri } : require('../../assets/logo.png')}
        style={styles.coinImage}
        cachePolicy="disk"
        contentFit="cover"
        transition={120}
      />
      <View className="ml-3 flex-1">
        <Text className="text-sm font-mono-extrabold text-black" numberOfLines={1}>
          {balance.symbol || balance.name}
        </Text>
        <Text className="mt-1 text-xs font-mono-semibold text-black/45" numberOfLines={1}>
          {balance.name}
        </Text>
      </View>
      <View className="ml-3 items-end">
        <Text className="text-sm font-mono-extrabold text-black" numberOfLines={1}>
          {formatTokenAmount(balance.uiAmount)}
        </Text>
        <Text className="mt-1 text-xs font-mono-bold text-black/45">{formatUsd(balance.uiPrice)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  coinImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
})

export function CoinsMenu({ address }: { address?: string }) {
  const { balances = [], balancesError, isBalancesLoading } = useBalances(address)
  const sortedBalances = useMemo(() => [...balances].sort((a, b) => b.uiPrice - a.uiPrice), [balances])
  const renderCoin = useCallback(({ item }: { item: SquadsBalanceData }) => <CoinRow balance={item} />, [])

  if (isBalancesLoading) {
    return (
      <View className="mt-5">
        {[0, 1, 2].map((item) => (
          <View key={item} className="mb-3 flex-row items-center rounded-xl bg-neutral-100/60 p-4">
            <CardSkeleton className="h-10 w-10 rounded-full" />
            <View className="ml-3 flex-1">
              <CardSkeleton className="h-4 w-28 rounded-md" />
              <CardSkeleton className="mt-2 h-3 w-20 rounded-md" />
            </View>
            <View className="ml-3 items-end">
              <CardSkeleton className="h-4 w-16 rounded-md" />
              <CardSkeleton className="mt-2 h-3 w-12 rounded-md" />
            </View>
          </View>
        ))}
      </View>
    )
  }

  if (balancesError) {
    return <EmptyMenuState title="API Error" description={balancesError.message} />
  }

  if (sortedBalances.length === 0) {
    return <EmptyMenuState title="No coins found" description="No coins found in custody of this account" />
  }

  return (
    <FlatList
      className="mt-5"
      data={sortedBalances}
      keyExtractor={keyExtractor}
      renderItem={renderCoin}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      showsVerticalScrollIndicator={false}
    />
  )
}
