import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native'
import { createSolTransferProposal, shortenAddress, type SquadsProposalSummary } from '../../lib/squads'
import { ProposalCard } from './ProposalCard'

type ProposalsMenuProps = {
  proposals: SquadsProposalSummary[]
  threshold: number
  isBusy?: boolean
}


export function ProposalsMenu({
  proposals,
  threshold,
  isBusy,
}: ProposalsMenuProps) {
  if (proposals.length === 0) {
    return (
      <View className="mt-5 min-h-56 items-center justify-center">
        <View className="flex-row items-center justify-center">
          <Image source={require('../../assets/logo.png')} className="mr-4 h-6 w-6" />
          <Text className="text-xl font-black text-black">No Proposals</Text>
        </View>
        <Text className="mt-2 text-center text-sm leading-6 text-black/60">No proposals for this multisig yet.</Text>
      </View>
    )
  }

  return (
    <ScrollView className="mt-5">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.address}
          proposal={proposal}
          threshold={threshold}
          isBusy={isBusy}
        />
      ))}
    </ScrollView>
  )
}
