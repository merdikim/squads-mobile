import { Pressable, Text, View } from 'react-native'
import type { SquadsProposalData } from '../../types'

type ProposalCardProps = {
  proposal: SquadsProposalData
  threshold: number
  isBusy?: boolean
}

export function ProposalCard({ proposal, threshold, isBusy }: ProposalCardProps) {
  const canApprove = proposal.status === 'Active' && !proposal.hasApproved

  return (
    <View className="my-2 rounded-lg border border-black/10 bg-white p-4">
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-base font-black leading-6 text-black">
          Vault transaction #{proposal.transactionIndex.toString()}
        </Text>
        <View className="rounded-md bg-black px-2 py-1">
          <Text className="text-xs font-bold text-white">{proposal.status}</Text>
        </View>
      </View>

      <Text className="mt-2 text-sm leading-6 text-black/60">
        Proposal account {proposal.address.slice(0, 8)}...{proposal.address.slice(-8)}
      </Text>

      <View className="mt-4 flex-row items-center justify-between border-t border-black/10 pt-3">
        <Text className="text-xs font-bold uppercase text-black/40">Approvals</Text>
        <Text className="text-sm font-black text-black">
          {proposal.approvals} of {threshold}
        </Text>
      </View>

      <View className="mt-4 flex-row gap-3">
        <Pressable
          //onPress={() => canApprove && vote(proposal)}
          disabled={isBusy || !canApprove}
          className={`h-11 flex-1 items-center justify-center rounded-lg border border-black/15 ${canApprove ? 'bg-white active:bg-black/5' : 'bg-black/5'}`}
        >
          <Text className={`text-sm font-bold ${canApprove ? 'text-black' : 'text-black/35'}`}>
            {proposal.hasApproved ? 'Approved' : 'Approve'}
          </Text>
        </Pressable>

        {/* <Pressable
              onPress={() => canExecute && onExecuteProposal(proposal)}
              disabled={isBusy || !canExecute}
              className={`h-11 flex-1 items-center justify-center rounded-lg ${canExecute ? 'bg-black active:bg-black/80' : 'bg-black/10'}`}
            >
              <Text className={`text-sm font-bold ${canExecute ? 'text-white' : 'text-black/35'}`}>Execute</Text>
            </Pressable> */}
      </View>
    </View>
  )
}
