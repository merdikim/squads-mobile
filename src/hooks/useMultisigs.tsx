import { useQuery } from '@tanstack/react-query'
import { getStoredMultisigs } from '../lib/multisigStorage'
import { MultisigListItem } from '../types'

const useMultisigs = (address?: string) => {
  const { data: multisigs, isLoading: isMultisigsLoading } = useQuery({
    queryKey: ['multisigs', address],
    queryFn: async (): Promise<MultisigListItem[]> => {
      return getStoredMultisigs()
    },
  })

  return { multisigs, isMultisigsLoading }
}

export default useMultisigs
