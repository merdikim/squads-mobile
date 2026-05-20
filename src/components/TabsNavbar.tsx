import { useState } from 'react'
import { Image, Modal, Pressable, Text, View } from 'react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { UserCircle } from 'lucide-react-native'
import logo from '../assets/logo.png'

export function TabsNavbar() {
  const { account, connect, disconnect } = useMobileWallet()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const closeProfile = () => setIsProfileOpen(false)

  const handleDisconnect = () => {
    disconnect()
    closeProfile()
  }

  const handleConnect = () => {
    connect()
    closeProfile()
  }

  return (
    <View>
      <View className="h-16 flex-row items-center justify-between border-b border-black/10 px-4">
        <Image source={logo} className="h-8 w-8" resizeMode="contain" />

        <Pressable
          onPress={() => setIsProfileOpen(true)}
        >
          <UserCircle color="#090A0F" size={32} strokeWidth={2.2} />
        </Pressable>
      </View>

      <Modal visible={isProfileOpen} transparent animationType="slide" onRequestClose={closeProfile}>
        <Pressable className="flex-1 justify-end bg-black/30 px-6 pb-6" onPress={closeProfile}>
          <Pressable className="w-full rounded-lg bg-white p-4" onPress={(event) => event.stopPropagation()}>
            <Text className="text-lg font-black text-black">Profile</Text>
            <Text className="mt-2 text-sm leading-6 text-black/60">
              {account ? `Connected: ${account.address.toString().slice(0, 8)}...` : 'Connect your wallet to get started.'}
            </Text>

            <Pressable
              onPress={account ? handleDisconnect : handleConnect}
              className="mt-5 h-12 items-center justify-center rounded-lg border border-black/30 bg-white active:bg-black/5"
              style={{ borderWidth: 1, borderColor: 'black' }}
            >
              <Text className="text-base font-bold text-black">{account ? 'Disconnect Wallet' : 'Connect Wallet'}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
