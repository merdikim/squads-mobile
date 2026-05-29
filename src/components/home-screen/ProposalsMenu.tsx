import { useCallback, useMemo } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { EmptyMenuState } from '../home-screen/EmptyMenuState'
import { ProposalCard } from '../cards/ProposalCard'
import useProposals from '../../hooks/useProposals'
import { ProposalsSkeleton } from '../skeletons/ProposalsSkeleton'
import type { SquadsProposalData } from '../../types'

type ProposalsMenuProps = {
  multisigAddress?: string
  threshold: number
}

const keyExtractor = (proposal: SquadsProposalData) => proposal.address

export function ProposalsMenu({ multisigAddress, threshold }: ProposalsMenuProps) {
  const {
    proposals = [],
    proposalsError,
    isProposalsLoading,
    isProposalsFetching,
    page,
    totalPages,
    totalEntries,
    hasPreviousPage,
    hasNextPage,
    previousPage,
    nextPage,
  } = useProposals(multisigAddress)
  const renderProposal = useCallback(
    ({ item }: { item: SquadsProposalData }) => <ProposalCard proposal={item} threshold={threshold} />,
    [threshold],
  )
  const listHeader = useMemo(() => {
    if (totalPages <= 1) {
      return null
    }

    return (
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase text-black/40">{totalEntries} active proposals</Text>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={previousPage}
            disabled={!hasPreviousPage || isProposalsFetching}
            accessibilityLabel="Previous proposals page"
            className={`h-9 min-w-9 items-center justify-center rounded-xl border border-black/15 px-3 ${hasPreviousPage ? 'bg-white active:bg-black/5' : 'bg-black/5'}`}
          >
            <ChevronLeft color={hasPreviousPage ? '#090A0F' : 'rgba(9, 10, 15, 0.3)'} size={16} strokeWidth={2.6} />
          </Pressable>
          <Text className="text-xs font-bold text-black/50">
            {page} / {totalPages}
          </Text>
          <Pressable
            onPress={nextPage}
            disabled={!hasNextPage || isProposalsFetching}
            accessibilityLabel="Next proposals page"
            className={`h-9 min-w-9 items-center justify-center rounded-xl border border-black/15 px-3 ${hasNextPage ? 'bg-white active:bg-black/5' : 'bg-black/5'}`}
          >
            <ChevronRight color={hasNextPage ? '#090A0F' : 'rgba(9, 10, 15, 0.3)'} size={16} strokeWidth={2.6} />
          </Pressable>
        </View>
      </View>
    )
  }, [
    hasNextPage,
    hasPreviousPage,
    isProposalsFetching,
    nextPage,
    page,
    previousPage,
    totalEntries,
    totalPages,
  ])

  if (isProposalsLoading) {
    return <ProposalsSkeleton />
  }

  if (proposalsError) {
    return <EmptyMenuState title="Api Error" description={proposalsError.message} />
  }

  if (!isProposalsLoading && proposals.length === 0) {
    return <EmptyMenuState title="No Proposals" description="No active proposals found" />
  }

  return (
    <FlatList
      className="mt-5"
      data={proposals}
      keyExtractor={keyExtractor}
      renderItem={renderProposal}
      ListHeaderComponent={listHeader}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      showsVerticalScrollIndicator={false}
    />
  )
}
