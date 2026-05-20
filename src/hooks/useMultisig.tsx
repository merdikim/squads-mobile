import { isAddress } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'
import { fetchMultisigSummary } from '../lib/squads'

const useMultisig = (multisigAddress: string) => {
  const { data: multisig } = useQuery({
    queryKey: ['multisig', multisigAddress],
    queryFn: async () => {
        if (!isAddress(multisigAddress)) return null    
        const multisigSummary = await fetchMultisigSummary({
            address: multisigAddress,
            memberAddress: ''
        })

        return multisigSummary
    },
    enabled: !!multisigAddress,
  })

  return { data: multisig }
}

export default useMultisig
