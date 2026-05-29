import { useState } from 'react'
import { View } from 'react-native'
import type { SquadsProposalData } from '../../types'
import { formatTimeAgo, shortenAddress } from '../../utils'
import { Clock } from 'lucide-react-native'
import { ProposalDetailsModal } from '../modals/ProposalDetailsModal'
import { PressableCard } from '../ui/Card'
import { AppText } from '../ui/AppText'

type ProposalCardProps = {
  proposal: SquadsProposalData
  threshold: number
}

export function ProposalCard({ proposal, threshold }: ProposalCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const title = proposal.title ?? `Proposal #${proposal.transactionIndex.toString()}`
  const timeAgo = formatTimeAgo(proposal.timestamp)
  const relatedAddress = proposal.memberAddress ? shortenAddress(proposal.memberAddress, 6) : 'Unavailable'

  return (
    <>
      <PressableCard onPress={() => setIsDetailsOpen(true)} className="my-2 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <AppText variant="button" className="flex-1 font-mono-extrabold leading-6">
            {title}
          </AppText>
          <View className="rounded-xl bg-black px-2 py-1">
            <AppText variant="caption" className="font-mono-bold text-white">
              {proposal.status}
            </AppText>
          </View>
        </View>
        <View className="mt-4 w-full flex-row items-center justify-between">
          <AppText className="text-[11px] font-mono-light leading-6 text-black/60">{relatedAddress}</AppText>
          {timeAgo ? (
            <View className="flex-row items-center gap-1">
              <Clock size={14} />
              <AppText className="text-[11px] font-mono-light">{timeAgo}</AppText>
            </View>
          ) : null}
        </View>
      </PressableCard>

      <ProposalDetailsModal
        proposal={isDetailsOpen ? proposal : null}
        threshold={threshold}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  )
}
