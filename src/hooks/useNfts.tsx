import { useQuery } from '@tanstack/react-query'
import type { SquadsApiNft, SquadsApiNftsResponse, SquadsNftData } from '../types'
import { isSolanaAddress } from '../utils'

const NFTS_DATA_STALE_TIME = 60 * 1000
const NFTS_DATA_GC_TIME = 10 * 60 * 1000
const DEFAULT_NFTS_ADDRESS = 'BKKZkyuNZPu6ACKjXJmazW5ZYQoC6JEgukDNQqJbQu1y'

export const nftsQueryKey = ['nfts'] as const

const getString = (value: unknown) => (typeof value === 'string' ? value : undefined)

const normalizeNft = (nft: SquadsApiNft, index: number): SquadsNftData => {
  const metadata = nft.metadata
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
    collectionName: getString(nft.collection?.name),
  }
}

const useNfts = (address = DEFAULT_NFTS_ADDRESS) => {
  const selectedAddress = address || DEFAULT_NFTS_ADDRESS

  const {
    data,
    error: nftsError,
    isLoading: isNftsLoading,
    isFetching: isNftsFetching,
    refetch: refetchNfts,
  } = useQuery({
    queryKey: [...nftsQueryKey, selectedAddress],
    queryFn: async () => {
      if (!isSolanaAddress(selectedAddress)) {
        return {
          nfts: [],
          nextCursor: null,
          prevCursor: null,
        }
      }

      const params = new URLSearchParams({
        useProd: 'true',
      })
      const response = await fetch(`https://v4-api.squads.so/nftsV2/${selectedAddress}?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch NFTs: ${response.status}`)
      }

      const result = (await response.json()) as SquadsApiNftsResponse

      return {
        nfts: (result.nfts ?? []).map(normalizeNft),
        nextCursor: result.next_cursor,
        prevCursor: result.prev_cursor,
      }
    },
    enabled: !!selectedAddress && isSolanaAddress(selectedAddress),
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
