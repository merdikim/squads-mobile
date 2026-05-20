import { useQuery } from '@tanstack/react-query'
import { getStoredMultisigs } from '../lib/multisigStorage'

export type MultisigListItem = {
  name: string
  address: string
  threshold?: number
  members?: string[]
}

const useMultisigs = (address: string) => {
  const { data: multisigs } = useQuery({
    queryKey: ['multisigs', address],
    queryFn: async (): Promise<MultisigListItem[]> => {
      return getStoredMultisigs()
    },
  })

  return { data: multisigs }
}

export default useMultisigs
