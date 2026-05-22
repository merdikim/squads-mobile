import { useQuery } from '@tanstack/react-query'
import { getStoredMultisigs } from '../lib/multisigStorage'
import { MultisigListItem } from '../types'

export const multisigsQueryKey = ['multisigs'] as const

const useMultisigs = () => {
  const { data: multisigs, isLoading: isMultisigsLoading } = useQuery({
    queryKey: multisigsQueryKey,
    queryFn: async (): Promise<MultisigListItem[]> => {
      return getStoredMultisigs()
    },
  })

  return { multisigs, isMultisigsLoading }
}

export default useMultisigs
