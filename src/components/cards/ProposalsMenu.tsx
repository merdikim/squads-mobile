import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import type { SquadsProposalSummary } from '../../lib/squads'
import { ProposalCard } from './ProposalCard'

type ProposalsMenuProps = {
  proposals: SquadsProposalSummary[]
  threshold: number
  isBusy?: boolean
  onCreateProposal: () => void
  onApproveProposal: (proposal: SquadsProposalSummary) => void
  onExecuteProposal: (proposal: SquadsProposalSummary) => void
}

export function ProposalsMenu({
  proposals,
  threshold,
  isBusy,
  onCreateProposal,
  onApproveProposal,
  onExecuteProposal,
}: ProposalsMenuProps) {
  if (proposals.length === 0) {
    return (
      <View className="mt-5 min-h-56 items-center justify-center">
        <View className="flex-row items-center justify-center">
          <Image source={require('../../assets/logo.png')} className="mr-4 h-6 w-6" />
          <Text className="text-xl font-black text-black">No Proposals</Text>
        </View>
        <Text className="mt-2 text-center text-sm leading-6 text-black/60">No proposals for this multisig yet.</Text>
        <Pressable
          onPress={onCreateProposal}
          disabled={isBusy}
          className="mt-9 h-12 min-w-44 items-center justify-center rounded-lg bg-black px-5 active:bg-black/80"
        >
          <Text className="text-base font-bold text-white">{isBusy ? 'Working...' : 'Create SOL proposal'}</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView className="mt-5">
      <Pressable
        onPress={onCreateProposal}
        disabled={isBusy}
        className="mb-3 h-12 items-center justify-center rounded-lg bg-black active:bg-black/80"
      >
        <Text className="text-base font-bold text-white">{isBusy ? 'Working...' : 'Create SOL proposal'}</Text>
      </Pressable>

      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.address}
          proposal={proposal}
          threshold={threshold}
          isBusy={isBusy}
          onApproveProposal={onApproveProposal}
          onExecuteProposal={onExecuteProposal}
        />
      ))}
    </ScrollView>
  )
}
