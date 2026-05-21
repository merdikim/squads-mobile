import { isAddress } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'
import { fetchMultisigData } from '../lib/squads'

const useMultisig = (multisigAddress: string, memberAddress?: string) => {
  const {data:multisigData, isLoading: isMultisigLoading, refetch:refetchMultisigData} = useQuery({
    queryKey: ['multisig', multisigAddress, memberAddress],
    queryFn: async () => {
      if (!isAddress(multisigAddress)) return null
      const multisigData = await fetchMultisigData({
        address: multisigAddress,
        memberAddress,
      })

      return multisigData
    },
    enabled: !!multisigAddress,
  })

  return { multisigData, isMultisigLoading, refetchMultisigData }
}

export default useMultisig
