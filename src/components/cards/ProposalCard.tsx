import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { SquadsProposalData } from '../../types'
import { formatTimeAgo, shortenAddress } from '../../utils'
import { Clock } from 'lucide-react-native'
import { ProposalDetailsModal } from '../modals/ProposalDetailsModal'

type ProposalCardProps = {
  proposal: SquadsProposalData
  threshold: number
}

export function ProposalCard({ proposal, threshold }: ProposalCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const title = proposal.title ?? `Proposal #${proposal.transactionIndex.toString()}`
  const timeAgo = formatTimeAgo(proposal.timestamp)

  return (
    <>
      <Pressable
        onPress={() => setIsDetailsOpen(true)}
        className="my-2 rounded-xl border border-black/10 bg-white p-4 active:bg-black/5"
      >
        <View className="flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-base font-black leading-6 text-black">
            {title}
          </Text>
          <View className="rounded-xl bg-black px-2 py-1">
            <Text className="text-xs font-bold text-white">{proposal.status}</Text>
          </View>
        </View>
        <View className="mt-4 w-full flex-row items-center justify-between">
          <Text className="text-sm leading-6 text-black/60">
            {shortenAddress(proposal.address, 8)}
          </Text>
          {timeAgo ? (
            <View className="flex-row items-center gap-1">
              <Clock size={14}/>
              <Text className="text-xs">{timeAgo}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      <ProposalDetailsModal
        proposal={isDetailsOpen ? proposal : null}
        threshold={threshold}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  )
}
