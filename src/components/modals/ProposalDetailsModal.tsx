import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { Check, X } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { SquadsProposalData } from '../../types'
import { formatTimeAgo, shortenAddress } from '../../utils'

type ProposalDetailsModalProps = {
  proposal: SquadsProposalData | null
  threshold: number
  onClose: () => void
  onApprove?: (proposal: SquadsProposalData) => void
  onReject?: (proposal: SquadsProposalData) => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 border-b border-black/10 py-3">
      <Text className="text-xs font-bold uppercase text-black/40">{label}</Text>
      <Text className="max-w-[68%] text-right text-sm font-bold text-black">{value}</Text>
    </View>
  )
}

export function ProposalDetailsModal({
  proposal,
  threshold,
  onClose,
  onApprove,
  onReject,
}: ProposalDetailsModalProps) {
  const visible = !!proposal
  const timeAgo = formatTimeAgo(proposal?.timestamp)
  const canVote = proposal?.status === 'Active' && !proposal.hasApproved

  const handleApprove = () => {
    if (!proposal || !canVote) return
    onApprove?.(proposal)
  }

  const handleReject = () => {
    if (!proposal || !canVote) return
    onReject?.(proposal)
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <Pressable className="flex-1 justify-end bg-black/30 px-4 pb-6" onPress={onClose}>
          <Pressable className="max-h-[86%] rounded-xl bg-white p-5" onPress={(event) => event.stopPropagation()}>
            {proposal ? (
              <>
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-xl font-black text-black">{proposal.title}</Text>
                    <Text className="mt-2 text-sm leading-6 text-black/60">
                      {proposal.memo || `${proposal.category} proposal`}
                    </Text>
                  </View>
                  <Pressable
                    onPress={onClose}
                    className="h-10 w-10 items-center justify-center rounded-xl border border-black/10 active:bg-black/5"
                  >
                    <X color="#090A0F" size={17} strokeWidth={2.4} />
                  </Pressable>
                </View>

                <ScrollView className="mt-5" showsVerticalScrollIndicator={false}>
                  <View className="rounded-xl border border-black/10 px-4">
                    <DetailRow label="Status" value={proposal.status} />
                    <DetailRow label="Created" value={timeAgo || 'Unavailable'} />
                    <DetailRow label="Transaction" value={`#${proposal.transactionIndex.toString()}`} />
                    <DetailRow label="Address" value={shortenAddress(proposal.address, 8)} />
                    <DetailRow label="Approvals" value={`${proposal.approvals.length} of ${threshold}`} />
                    <DetailRow label="Rejected" value={String(proposal.rejects.length)} />
                    <DetailRow label="Cancelled" value={String(proposal.cancellations.length)} />
                  </View>

                  {proposal.approvals.length > 0 ? (
                    <View className="mt-5">
                      <Text className="text-xs font-bold uppercase text-black/40">Approved by</Text>
                      <View className="mt-2 gap-2">
                        {proposal.approvals.map((member) => (
                          <Text key={member} className="text-sm font-bold text-black">
                            {shortenAddress(member, 8)}
                          </Text>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </ScrollView>

                <View className="mt-6 flex-row gap-3">
                  <Pressable
                    onPress={handleReject}
                    disabled={!canVote}
                    className={`h-12 flex-1 flex-row items-center justify-center rounded-xl border border-black/15 ${canVote ? 'active:bg-black/5' : 'bg-black/5'}`}
                  >
                    <X color={canVote ? '#090A0F' : 'rgba(9, 10, 15, 0.35)'} size={16} strokeWidth={2.4} />
                    <Text className={`ml-2 text-base font-bold ${canVote ? 'text-black' : 'text-black/35'}`}>
                      Reject
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleApprove}
                    disabled={!canVote}
                    className={`h-12 flex-1 flex-row items-center justify-center rounded-xl ${canVote ? 'bg-black active:bg-black/80' : 'bg-black/10'}`}
                  >
                    <Check color={canVote ? '#FFFFFF' : 'rgba(9, 10, 15, 0.35)'} size={16} strokeWidth={2.4} />
                    <Text className={`ml-2 text-base font-bold ${canVote ? 'text-white' : 'text-black/35'}`}>
                      Approve
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </SafeAreaView>
    </Modal>
  )
}
