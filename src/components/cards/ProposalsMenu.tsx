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
  isBusy,
}: ProposalsMenuProps) {
  if (proposals.length === 0) {
    return <EmptyMenuState title="No Proposals" description="No proposals for this multisig yet." />
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
