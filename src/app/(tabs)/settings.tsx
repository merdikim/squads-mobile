import { StatusBar } from 'expo-status-bar'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Trash2 } from 'lucide-react-native'
import { Toast } from 'toastify-react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { clearMultisigsFromStorage } from '../../lib/multisigStorage'
import { clearSelectedMultisigAddress } from '../../lib/selectedMultisigStorage'

export default function SettingsScreen() {
  const { account } = useMobileWallet()
  const queryClient = useQueryClient()
  const walletAddress = account?.address.toString() ?? ''

  const clearStoredMultisigs = async () => {
    await clearMultisigsFromStorage()
    await clearSelectedMultisigAddress()
    queryClient.setQueryData(['selectedMultisigAddress'], '')
    await queryClient.invalidateQueries({ queryKey: ['multisigs', walletAddress] })
    Toast.success('Stored multisigs cleared.', 'bottom')
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 px-6 py-8">
        <Text className="text-sm font-bold uppercase text-black/45">Multisig</Text>
        <Text className="mt-3 text-4xl font-black leading-tight text-black">Settings</Text>
        <Text className="mt-4 text-base leading-7 text-black/65">
          Manage local app data and multisig preferences for this device.
        </Text>

        <View className="mt-8 rounded-lg border border-black/10 bg-white p-4">
          <Text className="text-base font-black text-black">Local Data</Text>
          <Text className="mt-2 text-sm leading-6 text-black/65">
            Clear imported multisigs and the saved selected multisig from this device.
          </Text>
          <Pressable
            onPress={clearStoredMultisigs}
            className="mt-4 h-12 flex-row items-center justify-center rounded-lg border border-red-500/25 bg-red-50 active:bg-red-100"
          >
            <Trash2 color="#DC2626" size={16} strokeWidth={2.4} />
            <Text className="ml-2 text-sm font-black text-red-600">Clear Stored Multisigs</Text>
          </Pressable>
        </View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  )
}
