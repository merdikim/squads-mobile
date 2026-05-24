import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'
import { isAddress } from '@solana/kit'
import { X } from 'lucide-react-native'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import * as multisig from '@sqds/multisig'
import { TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import { buildProposalIx } from '../../lib/squads'
import { toPublicKey } from '../../utils'
import { multisigProposalsQueryKey } from '../../hooks/useProposals'
import { useQueryClient } from '@tanstack/react-query'
import { SmoothModal } from './SmoothModal'

const { Permissions } = multisig.types

type AddMemberModalProps = {
  visible: boolean
  members: string[]
  multisigAddress: string
  onClose: () => void
}

export function AddMemberModal({ visible, members, multisigAddress, onClose }: AddMemberModalProps) {
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const { account, connect, connection, signAndSendTransactions } = useMobileWallet()
  const connectedWalletAddress = account?.address.toString() ?? ''
  const isConnectedWalletMember = members.includes(connectedWalletAddress)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!visible) {
      setAddress('')
      setError('')
    }
  }, [visible])

  const handleClose = () => {
    setAddress('')
    setError('')
    onClose()
  }

  const handleAddMember = async () => {
    const nextMemberAddress = address.trim()
    setError('')

    if (!account) {
      setError('Connect your wallet before adding a member.')
      return
    }

    if (!isConnectedWalletMember) {
      setError('The connected wallet must be a member of this multisig.')
      return
    }

    if (!nextMemberAddress) {
      setError('Wallet address is required.')
      return
    }

    if (!isAddress(nextMemberAddress)) {
      setError('Enter a valid Solana wallet address.')
      return
    }

    if (members.includes(nextMemberAddress)) {
      setError('This wallet is already a member.')
      return
    }

    try {
      setIsAdding(true)
      const multisigPda = toPublicKey(multisigAddress)
      // @ts-expect-error
      const creator = toPublicKey(account.address)
      const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(connection, multisigPda)
      const newTransactionIndex = BigInt(Number(multisigInfo.transactionIndex) + 1)
      const addMemberIx = multisig.instructions.configTransactionCreate({
        multisigPda,
        actions: [
          {
            __kind: 'AddMember',
            newMember: {
              key: toPublicKey(nextMemberAddress),
              permissions: Permissions.all(),
            },
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
      const simulation = await connection.simulateTransaction(transaction, { sigVerify: false })

      if (simulation.value.err) {
        console.log(simulation.value.logs)
        throw new Error('Add member simulation failed.')
      }

      const signature = await signAndSendTransactions(transaction, minContextSlot)

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed')

      queryClient.invalidateQueries({
        queryKey: [...multisigProposalsQueryKey, multisigAddress],
      })

      handleClose()
    } catch (err) {
      console.log(err)
      setError('Failed to add member. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  const handleConnectWallet = () => {
    setError('')
    connect()
  }

  return (
    <SmoothModal visible={visible} onClose={handleClose}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-xl font-black text-black">Add Member</Text>
          <Text className="mt-2 text-sm leading-6 text-black/60">Enter a wallet address to add to this multisig.</Text>
        </View>
        <Pressable
          onPress={handleClose}
          className="h-10 w-10 items-center justify-center rounded-xl border border-black/10 active:bg-black/5"
        >
          <X color="#090A0F" size={17} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View className="mt-5">
        <Text className="text-sm font-bold text-black">Wallet address</Text>
        <TextInput
          value={address}
          onChangeText={(value) => {
            setAddress(value)
            setError('')
          }}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Enter member wallet address"
          placeholderTextColor="rgba(0,0,0,0.35)"
          className="mt-2 min-h-12 rounded-xl border border-black/15 px-3 text-sm text-black"
        />
        {error ? <Text className="mt-2 text-xs font-bold text-red-600">{error}</Text> : null}
      </View>

      <View className="mt-6 flex-row gap-3">
        <Pressable
          onPress={handleClose}
          disabled={isAdding}
          className="h-12 flex-1 items-center justify-center rounded-xl border border-black/15 active:bg-black/5"
        >
          <Text className="text-base font-bold text-black">Cancel</Text>
        </Pressable>
        {account ? (
          <Pressable
            onPress={handleAddMember}
            disabled={isAdding}
            className="h-12 flex-1 items-center justify-center rounded-xl bg-black active:bg-black/80 disabled:opacity-60"
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">Add</Text>
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
