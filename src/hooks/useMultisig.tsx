import { isAddress } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'
import { fetchMultisigSummary } from '../lib/squads'

const useMultisig = (multisigAddress: string, memberAddress?: string) => {
  const query = useQuery({
    queryKey: ['multisig', multisigAddress, memberAddress],
    queryFn: async () => {
      if (!isAddress(multisigAddress)) return null
      const multisigSummary = await fetchMultisigSummary({
        address: multisigAddress,
        memberAddress,
      })

      return multisigSummary
    },
    enabled: !!multisigAddress,
  })

  return { ...query, data: query.data }
}

export default useMultisig
