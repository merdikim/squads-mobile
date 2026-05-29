import { useQuery } from '@tanstack/react-query'
import type { Multisig, SquadsApiMultisig } from '../types'
import { isSolanaAddress } from '../utils'

const MULTISIGS_DATA_STALE_TIME = 60 * 1000
const MULTISIGS_DATA_GC_TIME = 10 * 60 * 1000
const MULTISIGS_RETRY_COUNT = 2

export const multisigsQueryKey = ['multisigs'] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isApiMultisig = (value: unknown): value is SquadsApiMultisig => {
  if (!isRecord(value) || !isRecord(value.account)) {
    return false
  }

  return (
    typeof value.address === 'string' &&
    typeof value.defaultVault === 'string' &&
    Array.isArray(value.account.members) &&
    typeof value.account.threshold === 'number' &&
    typeof value.account.transactionIndex === 'string' &&
    /^\d+$/.test(value.account.transactionIndex)
  )
}

const normalizeMultisig = (multisig: SquadsApiMultisig): Multisig => {
  const metadataName = multisig.metadata?.name
  const name = typeof metadataName === 'string' && metadataName.trim() ? metadataName.trim() : multisig.address

  return {
    address: multisig.address,
    vaultAddress: multisig.defaultVault,
    members: multisig.account.members
      .map((member) => member.key)
      .filter((memberKey): memberKey is string => typeof memberKey === 'string' && isSolanaAddress(memberKey)),
    threshold: multisig.account.threshold,
    transactionIndex: BigInt(multisig.account.transactionIndex),
    name,
    imageUri: multisig.metadata?.image || undefined,
  }
}

const useMultisigs = (address?: string) => {
  const {
    data: multisigs,
    isLoading: isMultisigsLoading,
    refetch: refetchMultisig,
    isRefetching: isRefetchingMultisig,
  } = useQuery({
    queryKey: [...multisigsQueryKey, address],
    queryFn: async (): Promise<Multisig[]> => {
      if (!address || !isSolanaAddress(address)) {
        return []
      }

      const response = await fetch(`https://v4-api.squads.so/multisigs/${address}?useProd=true`)

      if (!response.ok) {
        throw new Error(`Failed to fetch multisigs: ${response.status}`)
      }

      const result = await response.json()

      if (!Array.isArray(result)) {
        throw new Error('Unexpected multisigs response')
      }

      return result.filter(isApiMultisig).map(normalizeMultisig)
    },
    enabled: !!address && isSolanaAddress(address),
    staleTime: MULTISIGS_DATA_STALE_TIME,
    gcTime: MULTISIGS_DATA_GC_TIME,
    retry: MULTISIGS_RETRY_COUNT,
  })

  return { multisigs, isMultisigsLoading, refetchMultisig, isRefetchingMultisig }
}

export default useMultisigs
