import { useQuery } from '@tanstack/react-query'
import type { SquadsApiBalance, SquadsBalanceData } from '../types'
import { isSolanaAddress } from '../utils'

const BALANCES_DATA_STALE_TIME = 60 * 1000
const BALANCES_DATA_GC_TIME = 10 * 60 * 1000

export const balancesQueryKey = ['balances'] as const

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const isApiBalance = (value: unknown): value is SquadsApiBalance => {
  if (!isRecord(value)) {
    return false
  }

  return (
    isFiniteNumber(value.amount) &&
    isFiniteNumber(value.uiAmount) &&
    isFiniteNumber(value.uiPrice) &&
    isFiniteNumber(value.pricePerUnit) &&
    isFiniteNumber(value.decimals) &&
    typeof value.source === 'string' &&
    typeof value.mint === 'string' &&
    typeof value.symbol === 'string' &&
    typeof value.name === 'string'
  )
}

const normalizeBalance = (balance: SquadsApiBalance): SquadsBalanceData => ({
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

const useBalances = (address?: string) => {
  const {
    data,
    error: balancesError,
    isLoading: isBalancesLoading,
  } = useQuery({
    queryKey: [...balancesQueryKey, address],
    queryFn: async () => {
      if (!isSolanaAddress(address)) {
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
        `https://balances-v4-api.squads.so/balancesDasV2Cached/${address}?${params.toString()}`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch balances: ${response.status}`)
      }

      const result = await response.json()

      if (!isRecord(result) || !Array.isArray(result.balances)) {
        throw new Error('Unexpected balances response')
      }

      const balances = result.balances
        .filter(isApiBalance)
        .map(normalizeBalance)
        .filter((balance) => balance.amount > 0 || balance.uiAmount > 0 || balance.uiPrice > 0)

      return {
        balances,
        totalUsd: balances.reduce((total, balance) => total + balance.uiPrice, 0),
      }
    },
    enabled: !!address && isSolanaAddress(address),
    staleTime: BALANCES_DATA_STALE_TIME,
    gcTime: BALANCES_DATA_GC_TIME,
  })

  return {
    balances: data?.balances,
    balancesError,
    isBalancesLoading,
    totalUsd: data?.totalUsd ?? 0,
  }
}

export default useBalances
