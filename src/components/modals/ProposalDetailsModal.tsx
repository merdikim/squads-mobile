import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { Check, X } from 'lucide-react-native'
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { useQueryClient } from '@tanstack/react-query'
import type { SquadsProposalData } from '../../types'
import { addressesEqual, formatTimeAgo, shortenAddress, toPublicKey } from '../../utils'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import * as multisig from '@sqds/multisig'
import { multisigProposalsQueryKey } from '../../hooks/useProposals'
import { SmoothModal } from './SmoothModal'
import { AppText, Button, IconButton, ModalHeader } from '../ui'

type ProposalDetailsModalProps = {
  proposal: SquadsProposalData | null
  threshold: number
  onClose: () => void
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4 border-b border-black/10 py-3">
      <AppText variant="label" className="text-black/40">
        {label}
      </AppText>
      <AppText className="max-w-[68%] text-right font-mono-bold">{value}</AppText>
    </View>
  )
}

export function ProposalDetailsModal({ proposal, threshold, onClose }: ProposalDetailsModalProps) {
  const { account, connect, connection, signAndSendTransactions } = useMobileWallet()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [voteAction, setVoteAction] = useState<'approve' | 'reject' | null>(null)

  const visible = !!proposal
  const isMountedRef = useRef(true)
  const isVisibleRef = useRef(visible)
  const timeAgo = formatTimeAgo(proposal?.timestamp)
  const connectedWalletAddress = account?.address.toString() ?? ''
  const hasVoted =
    !!proposal &&
    (proposal.approvals.some((address) => addressesEqual(address, connectedWalletAddress)) ||
      proposal.rejects.some((address) => addressesEqual(address, connectedWalletAddress)) ||
      proposal.cancellations.some((address) => addressesEqual(address, connectedWalletAddress)))
  const canVote = !!proposal && proposal.status === 'Active' && !!account && !hasVoted && !voteAction
  const relatedAddressLabel = proposal?.relatedAddressLabel ?? 'Related address'
  const relatedAddress = proposal?.memberAddress ? shortenAddress(proposal.memberAddress, 8) : 'Unavailable'

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    isVisibleRef.current = visible

    if (!visible) {
      setError('')
      setVoteAction(null)
    }
  }, [visible])

  const canUpdateState = () => isMountedRef.current && isVisibleRef.current

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
      const member = toPublicKey(account.address.toString())
      const instruction =
        action === 'approve'
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
        console.warn('Proposal vote simulation failed', simulation.value.logs)
        throw new Error('Proposal vote simulation failed.')
      }

      const signature = await signAndSendTransactions(transaction, minContextSlot)

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
      await queryClient.invalidateQueries({ queryKey: multisigProposalsQueryKey })

      if (canUpdateState()) {
        onClose()
      }
    } catch (err) {
      console.warn('Failed to vote on proposal', err)

      if (canUpdateState()) {
        setError(action === 'approve' ? 'Failed to approve proposal.' : 'Failed to reject proposal.')
      }
    } finally {
      if (canUpdateState()) {
        setVoteAction(null)
      }
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
    <SmoothModal visible={visible} onClose={onClose} contentClassName="w-full rounded-xl bg-white p-5">
      {proposal ? (
        <>
          <ModalHeader
            title={proposal.title}
            description={proposal.memo || `${proposal.category} proposal`}
            action={
              <IconButton onPress={onClose}>
                <X color="#090A0F" size={17} strokeWidth={2.4} />
              </IconButton>
            }
          />

          <View className="rounded-xl mt-5 border border-black/10 px-4">
            <DetailRow label={relatedAddressLabel} value={relatedAddress} />
            <DetailRow label="Status" value={proposal.status} />
            <DetailRow label="Approvals" value={`${proposal.approvals.length} of ${threshold}`} />
            <DetailRow label="Rejected" value={String(proposal.rejects.length)} />
            <DetailRow label="Cancelled" value={String(proposal.cancellations.length)} />
          </View>

          <View className="w-full flex-row justify-end my-5">
            <AppText>{timeAgo}</AppText>
          </View>

          {error ? (
            <AppText variant="error" className="mt-4">
              {error}
            </AppText>
          ) : null}

          <View className="mt-6 flex-row gap-3">
            {account ? (
              <>
                <Button
                  onPress={handleReject}
                  disabled={!canVote}
                  isLoading={voteAction === 'reject'}
                  variant="secondary"
                  className="flex-1"
                  leftIcon={<X color="#090A0F" size={16} strokeWidth={2.4} />}
                >
                  Reject
                </Button>
                <Button
                  onPress={handleApprove}
                  disabled={!canVote}
                  isLoading={voteAction === 'approve'}
                  className="flex-1"
                  leftIcon={<Check color="#FFFFFF" size={16} strokeWidth={2.4} />}
                >
                  Approve
                </Button>
              </>
            ) : (
              <Button onPress={handleConnectWallet} className="flex-1">
                Connect Wallet
              </Button>
            )}
          </View>
        </>
      ) : null}
    </SmoothModal>
  )
}
