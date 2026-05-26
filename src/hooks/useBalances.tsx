import { useQuery } from '@tanstack/react-query'
import type { SquadsApiBalancesResponse, SquadsBalanceData } from '../types'
import { isSolanaAddress } from '../utils'

const BALANCES_DATA_STALE_TIME = 60 * 1000
const BALANCES_DATA_GC_TIME = 10 * 60 * 1000

export const balancesQueryKey = ['balances'] as const

const normalizeBalance = (balance: SquadsBalanceData): SquadsBalanceData => ({
  amount: balance.amount,
  uiAmount: balance.uiAmount,
  uiPrice: balance.uiPrice,
  pricePerUnit: balance.pricePerUnit,
  source: balance.source,
  mint: balance.mint,
  symbol: balance.symbol,
  decimals: balance.decimals,
  logoUri: balance.logoUri,
  name: balance.name,
})

const useBalances = (address: string) => {
  const selectedAddress = address

  const {
    data,
    error: balancesError,
    isLoading: isBalancesLoading,
    isFetching: isBalancesFetching,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: [...balancesQueryKey, selectedAddress],
    queryFn: async () => {
      if (!isSolanaAddress(selectedAddress)) {
        return {
          balances: [],
          totalUsd: 0,
        }
      }

      const params = new URLSearchParams({
        sendAll: 'true',
        cacheBypass: 'false',
        useProd: 'true',
      })
      const response = await fetch(
        `https://balances-v4-api.squads.so/balancesDasV2Cached/${selectedAddress}?${params.toString()}`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch balances: ${response.status}`)
      }

      const result = (await response.json()) as SquadsApiBalancesResponse
      const balances = (result.balances ?? [])
        .map(normalizeBalance)
        .filter((balance) => balance.amount > 0 || balance.uiAmount > 0 || balance.uiPrice > 0)

      return {
        balances,
        totalUsd: balances.reduce((total, balance) => total + balance.uiPrice, 0),
      }
    },
    enabled: !!selectedAddress && isSolanaAddress(selectedAddress),
    staleTime: BALANCES_DATA_STALE_TIME,
    gcTime: BALANCES_DATA_GC_TIME,
  })

  return {
    balances: data?.balances,
    balancesError,
    isBalancesLoading,
    isBalancesFetching,
    refetchBalances,
    totalUsd: data?.totalUsd ?? 0,
  }
}

export default useBalances
