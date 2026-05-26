import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { addressesEqual, shortenAddress, toPublicKey } from '../../utils'
import * as multisig from '@sqds/multisig'
import { buildProposalIxs } from '../../lib/squads'
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { useQueryClient } from '@tanstack/react-query'
import { multisigProposalsQueryKey } from '../../hooks/useProposals'
import { SmoothModal } from './SmoothModal'
import { multisigsQueryKey } from '../../hooks/useMultisigs'

type DeleteMemberModalProps = {
  member: string
  members: string[]
  onClose: () => void
  multisigAddress: string
}

export function DeleteMemberModal({ multisigAddress, member, members, onClose }: DeleteMemberModalProps) {
  const { account, connect, connection, signAndSendTransactions } = useMobileWallet()
  const connectedWalletAddress = account?.address.toString() ?? ''
  const isConnectedWalletMember = members.some((currentMember) => addressesEqual(currentMember, connectedWalletAddress))
  const [error, setError] = useState('')
  const [isRemoving, setIsRemoving] = useState(false)
  const queryClient = useQueryClient()

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleDeleteMember = async () => {
    if (isRemoving) {
      return
    }

    if (!member) return

    if (!account) {
      setError('Connect your wallet before removing a member.')
      return
    }

    if (!isConnectedWalletMember) {
      setError('The connected wallet must be a member of this multisig.')
      return
    }

    try {
      setIsRemoving(true)
      const multisigPda = toPublicKey(multisigAddress)
      const creator = toPublicKey(account.address.toString())
      const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(connection, multisigPda)
      const newTransactionIndex = BigInt(multisigInfo.transactionIndex.toString()) + 1n
      const removeMemberIx = multisig.instructions.configTransactionCreate({
        multisigPda,
        actions: [
          {
            __kind: 'RemoveMember',
            oldMember: toPublicKey(member),
          },
        ],
        creator,
        transactionIndex: newTransactionIndex,
        rentPayer: creator,
      })
      const proposalIxs = buildProposalIxs(multisigPda, creator, newTransactionIndex)

      const {
        context: { slot: minContextSlot },
        value: latestBlockhash,
      } = await connection.getLatestBlockhashAndContext()

      const message = new TransactionMessage({
        payerKey: creator,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [removeMemberIx, ...proposalIxs],
      }).compileToV0Message()

      const transaction = new VersionedTransaction(message)
      const simulation = await connection.simulateTransaction(transaction, { sigVerify: false })

      if (simulation.value.err) {
        console.warn('Remove member simulation failed', simulation.value.logs)
        throw new Error('Remove member simulation failed.')
      }

      const signature = await signAndSendTransactions(transaction, minContextSlot)

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
      queryClient.invalidateQueries({
        queryKey: [...multisigProposalsQueryKey, multisigAddress],
      })
      queryClient.invalidateQueries({
        queryKey: multisigsQueryKey,
      })

      handleClose()
    } catch (err) {
      console.warn('Failed to remove member', err)
      setError('Failed to remove member. Please try again.')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleConnectWallet = () => {
    setError('')
    connect()
  }

  return (
    <SmoothModal visible={!!member} onClose={handleClose}>
      <Text className="text-xl font-black text-black">Delete Member</Text>
      <Text className="mt-2 text-sm leading-6 text-black/60">
        Remove {member ? shortenAddress(member) : 'this member'} from this multisig?
      </Text>
      {error ? <Text className="mt-3 text-xs font-bold text-red-600">{error}</Text> : null}

      <View className="mt-6 flex-row gap-3">
        <Pressable
          onPress={handleClose}
          disabled={isRemoving}
          className="h-12 flex-1 items-center justify-center rounded-xl border border-black/15 active:bg-black/5"
        >
          <Text className="text-base font-bold text-black">Cancel</Text>
        </Pressable>
        {account ? (
          <Pressable
            onPress={handleDeleteMember}
            disabled={isRemoving}
            className="h-12 flex-1 items-center justify-center rounded-xl bg-red-600 active:bg-red-700 disabled:opacity-60"
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">Delete</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={handleConnectWallet}
            className="h-12 flex-1 items-center justify-center rounded-xl bg-black active:bg-black/80"
          >
            <Text className="text-base font-bold text-white">Connect Wallet</Text>
          </Pressable>
        )}
      </View>
    </SmoothModal>
  )
}
