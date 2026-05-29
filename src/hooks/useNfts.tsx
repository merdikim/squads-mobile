import { useQuery } from '@tanstack/react-query'
import type { SquadsApiNft, SquadsNftData } from '../types'
import { isSolanaAddress } from '../utils'

const NFTS_DATA_STALE_TIME = 60 * 1000
const NFTS_DATA_GC_TIME = 10 * 60 * 1000

export const nftsQueryKey = ['nfts'] as const

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const getString = (value: unknown) => (typeof value === 'string' ? value : undefined)

const normalizeNft = (nft: SquadsApiNft, index: number): SquadsNftData => {
  const metadata = isRecord(nft.metadata) ? nft.metadata : undefined
  const collection = isRecord(nft.collection) ? nft.collection : undefined
  const mint = getString(nft.mint) ?? getString(nft.address)
  const name = getString(nft.name) ?? getString(metadata?.name) ?? mint ?? `NFT #${index + 1}`
  const imageUri =
    getString(nft.imageUri) ?? getString(nft.image) ?? getString(metadata?.imageUri) ?? getString(metadata?.image)

  return {
    id: mint ?? `${name}-${index}`,
    mint,
    name,
    symbol: getString(nft.symbol) ?? getString(metadata?.symbol),
    imageUri,
    collectionName: getString(collection?.name),
  }
}

const useNfts = (address?:string) => {

  const {
    data,
    error: nftsError,
    isLoading: isNftsLoading,
    isFetching: isNftsFetching,
    refetch: refetchNfts,
  } = useQuery({
    queryKey: [...nftsQueryKey, address],
    queryFn: async () => {
      if (!isSolanaAddress(address)) {
        return {
          nfts: [],
          nextCursor: null,
          prevCursor: null,
        }
      }

      const params = new URLSearchParams({
        useProd: 'true',
      })
      const response = await fetch(`https://v4-api.squads.so/nftsV2/${address}?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch NFTs: ${response.status}`)
      }

      const result = await response.json()

      if (!isRecord(result) || !Array.isArray(result.nfts)) {
        throw new Error('Unexpected nfts response')
      }

      return {
        nfts: result.nfts.map(normalizeNft),
        nextCursor: getString(result.next_cursor) ?? null,
        prevCursor: getString(result.prev_cursor) ?? null,
      }
    },
    enabled: !!address && isSolanaAddress(address),
    staleTime: NFTS_DATA_STALE_TIME,
    gcTime: NFTS_DATA_GC_TIME,
  })

  return {
    nfts: data?.nfts,
    nextCursor: data?.nextCursor ?? null,
    prevCursor: data?.prevCursor ?? null,
    nftsError,
    isNftsLoading,
    isNftsFetching,
    refetchNfts,
  }
}

export default useNfts
