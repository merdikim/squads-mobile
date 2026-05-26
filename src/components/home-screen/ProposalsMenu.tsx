import { Pressable, ScrollView, Text, View } from 'react-native'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { EmptyMenuState } from '../home-screen/EmptyMenuState'
import { ProposalCard } from '../cards/ProposalCard'
import useProposals from '../../hooks/useProposals'
import { ProposalsSkeleton } from '../skeletons/ProposalsSkeleton'

type ProposalsMenuProps = {
  multisigAddress: string
  threshold: number
}

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
    <ScrollView className="mt-5" showsVerticalScrollIndicator={false}>
      {totalPages > 1 ? (
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
      ) : null}

      {proposals.map((proposal) => (
        <ProposalCard key={proposal.address} proposal={proposal} threshold={threshold} />
      ))}
    </ScrollView>
  )
}
