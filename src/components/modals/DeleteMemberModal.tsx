import { useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { shortenAddress } from '../../utils'

type DeleteMemberModalProps = {
  member: string
  members: string[]
  onClose: () => void
  onDeleteMember: (member: string) => void
}

export function DeleteMemberModal({ member, members, onClose, onDeleteMember }: DeleteMemberModalProps) {
  const { account, connect } = useMobileWallet()
  const connectedWalletAddress = account?.address.toString() ?? ''
  const isConnectedWalletMember = members.includes(connectedWalletAddress)
  const [error, setError] = useState('')

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleDeleteMember = () => {
    if (!member) return

    if (!account) {
      setError('Connect your wallet before removing a member.')
      return
    }

    if (!isConnectedWalletMember) {
      setError('The connected wallet must be a member of this multisig.')
      return
    }

    onDeleteMember(member)
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
                className="h-12 flex-1 items-center justify-center rounded-xl border border-black/15 active:bg-black/5"
              >
                <Text className="text-base font-bold text-black">Cancel</Text>
              </Pressable>
              {account ? (
                <Pressable
                  onPress={handleDeleteMember}
                  className="h-12 flex-1 items-center justify-center rounded-xl bg-red-600 active:bg-red-700"
                >
                  <Text className="text-base font-bold text-white">Delete</Text>
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
