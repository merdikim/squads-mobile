import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { shortenAddress, toPublicKey } from '../../utils'
import * as multisig from '@sqds/multisig'
import { buildProposalIx } from '../../lib/squads'
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { QueryClient } from '@tanstack/react-query'
import { multisigProposalsQueryKey } from '../../hooks/useProposals'

type DeleteMemberModalProps = {
  member: string
  members: string[]
  onClose: () => void
  multisigAddress:string
}

export function DeleteMemberModal({ multisigAddress, member, members, onClose }: DeleteMemberModalProps) {
  const { account, connect, connection, signAndSendTransactions } = useMobileWallet()
  const connectedWalletAddress = account?.address.toString() ?? ''
  const isConnectedWalletMember = members.includes(connectedWalletAddress)
  const [error, setError] = useState('')
  const [isRemoving, setIsRemoving] = useState(false)
  const queryClient = new QueryClient()
  

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleDeleteMember = async() => {
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
      // @ts-expect-error
      const creator = toPublicKey(account.address)
      const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(connection, multisigPda)
      const newTransactionIndex = BigInt(Number(multisigInfo.transactionIndex) + 1)
      const addMemberIx = multisig.instructions.configTransactionCreate({
        multisigPda,
        actions: [
          {
            __kind: 'RemoveMember',
            oldMember: toPublicKey(member)
          },
        ],
        creator,
        transactionIndex: newTransactionIndex,
        rentPayer: creator,
      })
      const proposalIx = buildProposalIx(multisigPda, creator, newTransactionIndex)

      const {
        context: { slot: minContextSlot },
        value: latestBlockhash,
      } = await connection.getLatestBlockhashAndContext()

      const message = new TransactionMessage({
        payerKey: creator,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [addMemberIx, proposalIx],
      }).compileToV0Message()

      const transaction = new VersionedTransaction(message)

      const signature = await signAndSendTransactions(transaction, minContextSlot)

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')
      queryClient.invalidateQueries({
        queryKey: [...multisigProposalsQueryKey, multisigAddress]
      })

      handleClose()
    } catch (err) {
      console.log(err)
      setError('Failed to add member. Please try again.')
    } finally {
      setIsRemoving(false)
    }
    handleClose()
  }

  const handleConnectWallet = () => {
    setError('')
    connect()
  }

  return (
    <Modal visible={!!member} transparent animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <Pressable className="flex-1 justify-end bg-black/30 px-4 pb-6" onPress={handleClose}>
          <Pressable className="rounded-xl bg-white p-5" onPress={(event) => event.stopPropagation()}>
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
                  className="h-12 flex-1 items-center justify-center rounded-xl bg-red-600 active:bg-red-700"
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
          </Pressable>
        </Pressable>
      </SafeAreaView>
    </Modal>
  )
}
