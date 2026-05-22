import { ScrollView } from 'react-native'
import type { SquadsProposalData } from '../../types'
import { EmptyMenuState } from '../home-screen/EmptyMenuState'
import { ProposalCard } from './ProposalCard'

type ProposalsMenuProps = {
  proposals: SquadsProposalData[]
  threshold: number
  isBusy?: boolean
}


export function ProposalsMenu({
  proposals,
  threshold,
}: ProposalsMenuProps) {
  if (proposals.length === 0) {
    return <EmptyMenuState title="No active proposals" />
  }

  return (
    <ScrollView className="mt-5">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.address}
          proposal={proposal}
          threshold={threshold}
        />
      ))}
    </ScrollView>
  )
}
