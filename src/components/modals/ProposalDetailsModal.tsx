import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { Check, X } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { useQueryClient } from '@tanstack/react-query'
import type { SquadsProposalData } from '../../types'
import { formatTimeAgo, shortenAddress, toPublicKey } from '../../utils'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import * as multisig from '@sqds/multisig'
import { multisigProposalsQueryKey } from '../../hooks/useProposals'

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
  const { account, connect, connection, signAndSendTransactions } = useMobileWallet()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [voteAction, setVoteAction] = useState<'approve' | 'reject' | null>(null)
  
  const visible = !!proposal
  const timeAgo = formatTimeAgo(proposal?.timestamp)
  const connectedWalletAddress = account?.address.toString() ?? ''
  const hasVoted = !!proposal && (
    proposal.approvals.includes(connectedWalletAddress)
    || proposal.rejects.includes(connectedWalletAddress)
    || proposal.cancellations.includes(connectedWalletAddress)
  )
  const canVote = !!proposal && proposal.status === 'Active' && !!account && !hasVoted && !voteAction

  const handleConnectWallet = () => {
    setError('')
    connect()
  }

  const vote = async (action: 'approve' | 'reject') => {
    setError('')

    if (!proposal) {
      return
    }

    if (!account) {
      setError('Connect your wallet before voting.')
      return
    }

    if (hasVoted) {
      setError('This wallet has already voted on this proposal.')
      return
    }

    try {
      setVoteAction(action)

      const multisigPda = toPublicKey(proposal.multisigAddress)
      // @ts-expect-error wallet adapter address is compatible with PublicKey input here.
      const member = toPublicKey(account.address)
      const instruction = action === 'approve'
        ? multisig.instructions.proposalApprove({
          multisigPda,
          transactionIndex: proposal.transactionIndex,
          member,
        })
        : multisig.instructions.proposalReject({
          multisigPda,
          transactionIndex: proposal.transactionIndex,
          member,
        })

      const {
        context: { slot: minContextSlot },
        value: latestBlockhash,
      } = await connection.getLatestBlockhashAndContext()

      const message = new TransactionMessage({
        payerKey: member,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [instruction],
      }).compileToV0Message()

      const transaction = new VersionedTransaction(message)
      const simulation = await connection.simulateTransaction(transaction, { sigVerify: false })

      if (simulation.value.err) {
        console.log(simulation.value.logs)
        throw new Error('Proposal vote simulation failed.')
      }

      const signature = await signAndSendTransactions(transaction, minContextSlot)

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
      await queryClient.invalidateQueries({ queryKey: multisigProposalsQueryKey })

      if (action === 'approve') {
        onApprove?.(proposal)
      } else {
        onReject?.(proposal)
      }

      onClose()
    } catch (err) {
      console.log(err)
      setError(action === 'approve' ? 'Failed to approve proposal.' : 'Failed to reject proposal.')
    } finally {
      setVoteAction(null)
    }
  }

  const handleApprove = () => {
    if (!proposal || !canVote) return
    void vote('approve')
  }

  const handleReject = () => {
    if (!proposal || !canVote) return
    void vote('reject')
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
                    <DetailRow label="Member address" value={shortenAddress(proposal.memberAddress|| '...', 8)} />
                    <DetailRow label="Status" value={proposal.status} />
                    <DetailRow label="Created" value={timeAgo || 'Unavailable'} />
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

                {error ? <Text className="mt-4 text-xs font-bold text-red-600">{error}</Text> : null}

                <View className="mt-6 flex-row gap-3">
                  {account ? (
                    <>
                      <Pressable
                        onPress={handleReject}
                        disabled={!canVote}
                        className={`h-12 flex-1 flex-row items-center justify-center rounded-xl border border-black/15 ${canVote ? 'active:bg-black/5' : 'bg-black/5'}`}
                      >
                        {voteAction === 'reject' ? (
                          <ActivityIndicator size="small" color="#090A0F" />
                        ) : (
                          <>
                            <X color={canVote ? '#090A0F' : 'rgba(9, 10, 15, 0.35)'} size={16} strokeWidth={2.4} />
                            <Text className={`ml-2 text-base font-bold ${canVote ? 'text-black' : 'text-black/35'}`}>
                              Reject
                            </Text>
                          </>
                        )}
                      </Pressable>
                      <Pressable
                        onPress={handleApprove}
                        disabled={!canVote}
                        className={`h-12 flex-1 flex-row items-center justify-center rounded-xl ${canVote ? 'bg-black active:bg-black/80' : 'bg-black/10'}`}
                      >
                        {voteAction === 'approve' ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Check color={canVote ? '#FFFFFF' : 'rgba(9, 10, 15, 0.35)'} size={16} strokeWidth={2.4} />
                            <Text className={`ml-2 text-base font-bold ${canVote ? 'text-white' : 'text-black/35'}`}>
                              Approve
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      onPress={handleConnectWallet}
                      className="h-12 flex-1 items-center justify-center rounded-xl bg-black active:bg-black/80"
                    >
                      <Text className="text-base font-bold text-white">Connect Wallet</Text>
                    </Pressable>
                  )}
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </SafeAreaView>
    </Modal>
  )
}
