import { isAddress } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'
import { fetchMultisigData } from '../lib/squads'

const MULTISIG_DATA_STALE_TIME = 180 * 1000
const MULTISIG_DATA_GC_TIME = 10 * 60 * 1000

const useMultisig = (multisigAddress: string, memberAddress?: string) => {
  const normalizedMultisigAddress = multisigAddress.trim()
  const normalizedMemberAddress = memberAddress?.trim() || null

  const {data:multisigData, isLoading: isMultisigLoading, refetch:refetchMultisigData} = useQuery({
    queryKey: ['multisig', normalizedMultisigAddress, normalizedMemberAddress],
    queryFn: async () => {
      const multisigData = await fetchMultisigData({
        address: normalizedMultisigAddress,
        memberAddress: normalizedMemberAddress ?? undefined,
      })

      return multisigData
    },
    enabled: isAddress(normalizedMultisigAddress),
    staleTime: MULTISIG_DATA_STALE_TIME,
    gcTime: MULTISIG_DATA_GC_TIME,
  })

  return { multisigData, isMultisigLoading, refetchMultisigData }
}

export default useMultisig
