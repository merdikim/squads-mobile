import { useState } from 'react'
import { Pressable, Text } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { useQueryClient } from '@tanstack/react-query'
import { UserCircle } from 'lucide-react-native'
import { SmoothModal } from './SmoothModal'
import { clearSelectedMultisigAddress } from '../../lib/selectedMultisigStorage'

export function ProfileModalTrigger() {
  const { account, connect, disconnect } = useMobileWallet()
  const queryClient = useQueryClient()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const closeProfile = () => setIsProfileOpen(false)

  const handleDisconnect = () => {
    disconnect()
    queryClient.setQueryData(['selectedMultisigAddress'], '')
    void clearSelectedMultisigAddress()
    closeProfile()
  }

  const handleConnect = () => {
    connect()
    closeProfile()
  }

  return (
    <>
      <Pressable onPress={() => setIsProfileOpen(true)}>
        <UserCircle color="#090A0F" size={32} strokeWidth={2.2} />
      </Pressable>

      <SmoothModal
        visible={isProfileOpen}
        onClose={closeProfile}
        backdropClassName="flex-1 items-center justify-center bg-black/30 px-6 py-6"
        contentClassName="w-full rounded-xl bg-white p-4"
      >
        <Text className="text-lg font-black text-black">Profile</Text>
        <Text className="mt-2 text-sm leading-6 text-black/60">
          {account ? `Connected: ${account.address.toString().slice(0, 8)}...` : 'Connect your wallet to get started.'}
        </Text>

        <Pressable
          onPress={account ? handleDisconnect : handleConnect}
          className="mt-5 h-12 items-center justify-center rounded-xl border border-black/30 bg-white active:bg-black/5"
          style={{ borderWidth: 1, borderColor: 'black' }}
        >
          <Text className="text-base font-bold text-black">{account ? 'Disconnect Wallet' : 'Connect Wallet'}</Text>
        </Pressable>
      </SmoothModal>
    </>
  )
}
