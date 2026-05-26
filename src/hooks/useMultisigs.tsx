import { useQuery } from '@tanstack/react-query'
import type { Multisig, SquadsApiMultisigsResponse } from '../types'
import { isSolanaAddress } from '../utils'

export const multisigsQueryKey = ['multisigs'] as const

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

      const result = (await response.json()) as SquadsApiMultisigsResponse
      const multisigs = result.map((multisig) => {
        const metadataName = multisig.metadata?.name
        const name = typeof metadataName === 'string' && metadataName.trim() ? metadataName.trim() : multisig.address

        return {
          address: multisig.address,
          vaultAddress: multisig.defaultVault,
          balanceLamports: 0,
          members: multisig.account.members.map((member) => member.key),
          threshold: multisig.account.threshold,
          transactionIndex: BigInt(multisig.account.transactionIndex),
          proposals: [],
          name,
          imageUri: multisig.metadata?.image || undefined,
        }
      })
      return multisigs
    },
    enabled: !!address && isSolanaAddress(address),
  })

  return { multisigs, isMultisigsLoading, refetchMultisig, isRefetchingMultisig }
}

export default useMultisigs
