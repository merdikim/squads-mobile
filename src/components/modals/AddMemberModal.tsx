import { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native'
import { isAddress } from '@solana/kit'
import { X } from 'lucide-react-native'
import { addMember } from '../../lib/squads'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'

type AddMemberModalProps = {
  visible: boolean
  members: string[]
  multisigAddress: string
  onClose: () => void
}

export function AddMemberModal({
  visible,
  members,
  multisigAddress,
  onClose,
}: AddMemberModalProps) {
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const { account, signAndSendTransactions } = useMobileWallet()

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

    if (!account) {
      setError('Connect your wallet before adding a member.')
      return
    }

    try {
      setIsAdding(true)
      await addMember({
        multisigAddress,
        creatorAddress: account.address.toString(),
        newMemberAddress: nextMemberAddress,
        signAndSendTransactions,
      })
      handleClose()
    } catch {
      setError('Failed to add member. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable className="flex-1 justify-end bg-black/30 px-4 pb-6" onPress={handleClose}>
        <Pressable className="rounded-lg bg-white p-5" onPress={(event) => event.stopPropagation()}>
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xl font-black text-black">Add Member</Text>
              <Text className="mt-2 text-sm leading-6 text-black/60">Enter a wallet address to add to this multisig.</Text>
            </View>
            <Pressable
              onPress={handleClose}
              className="h-10 w-10 items-center justify-center rounded-md border border-black/10 active:bg-black/5"
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
              className="mt-2 min-h-12 rounded-lg border border-black/15 px-3 text-sm text-black"
            />
            {error ? <Text className="mt-2 text-xs font-bold text-red-600">{error}</Text> : null}
          </View>

          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={handleClose}
              className="h-12 flex-1 items-center justify-center rounded-lg border border-black/15 active:bg-black/5"
            >
              <Text className="text-base font-bold text-black">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleAddMember}
              className="h-12 flex-1 items-center justify-center rounded-lg bg-black active:bg-black/80"
            >
              { isAdding ? 
                (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-base font-bold text-white">Add</Text>
                )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
