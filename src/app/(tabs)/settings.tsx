import { StatusBar } from 'expo-status-bar'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LogIn, LogOut, Trash2, WalletCards } from 'lucide-react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { CopyText } from '../../components/CopyText'
import { MultisigDataSkeleton } from '../../components/home-screen/MultisigDataSkeleton'
import useMultisig from '../../hooks/useMultisig'
import useMultisigs, { multisigsQueryKey } from '../../hooks/useMultisigs'
import { clearMultisigsFromStorage } from '../../lib/multisigStorage'
import {
  clearSelectedMultisigAddress,
  getSelectedMultisigAddress,
} from '../../lib/selectedMultisigStorage'
import { shortenAddress } from '../../utils'

export default function SettingsScreen() {
  const { account, connect, disconnect } = useMobileWallet()
  const queryClient = useQueryClient()
  const walletAddress = account?.address.toString() ?? ''
  const { multisigs = [] } = useMultisigs()
  const { data: storedSelectedMultisigKey = '' } = useQuery({
    queryKey: ['selectedMultisigAddress'],
    queryFn: getSelectedMultisigAddress,
  })
  const selectedMultisig = multisigs.find((multisig) => multisig.address === storedSelectedMultisigKey)
  const selectedMultisigAddress = selectedMultisig?.address ?? storedSelectedMultisigKey
  const { multisigData, isMultisigLoading } = useMultisig(selectedMultisigAddress, walletAddress)

  const clearStoredMultisigs = async () => {
    await clearMultisigsFromStorage()
    await clearSelectedMultisigAddress()
    queryClient.setQueryData(['selectedMultisigAddress'], '')
    await queryClient.invalidateQueries({ queryKey: multisigsQueryKey })
  }

  const handleWalletPress = () => {
    if (!account) {
      connect()
      return
    }

    disconnect()
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View className="flex-1 px-6 py-8">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-base font-black text-black">Settings</Text>
          </View>

          <View className="mt-8 rounded-xl border border-black/10 bg-white p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-black/5">
                <WalletCards color="#090A0F" size={20} strokeWidth={2.4} />
              </View>
              <View className="flex-1">
                <Text className="mt-1 text-xs font-bold text-black/45">
                  {walletAddress ? `Wallet ${shortenAddress(walletAddress)}` : 'No wallet connected'}
                </Text>
              </View>
            </View>

            <View className="mt-5 gap-3">
              <SettingsValueRow
                label="Selected Multisig Account"
                value={selectedMultisigAddress}
                displayValue={selectedMultisigAddress ? shortenAddress(selectedMultisigAddress, 9) : 'No multisig selected'}
                isLoading={isMultisigLoading}
                copyLabel="Copy multisig account"
              />
              <SettingsValueRow
                label="Selected Vault"
                value={multisigData?.vaultAddress ?? ''}
                displayValue={multisigData?.vaultAddress ? shortenAddress(multisigData.vaultAddress, 9) : 'Unavailable'}
                isLoading={isMultisigLoading}
                copyLabel="Copy vault address"
              />
              <SettingsValueRow
                label="Threshold"
                value={multisigData ? String(multisigData.threshold) : ''}
                displayValue={multisigData ? `${multisigData.threshold} of ${multisigData.members.length}` : 'Unavailable'}
                isLoading={isMultisigLoading}
              />
            </View>
          </View>

          <View className="mt-4 rounded-xl border border-black/10 bg-white p-4">
            <Text className="mt-2 text-sm leading-6 text-black/60">
              Clear imported multisigs and the saved selected multisig from this device.
            </Text>
            <Pressable
              onPress={clearStoredMultisigs}
              className="mt-4 h-12 flex-row items-center justify-center rounded-xl border border-red-500/25 bg-red-50 active:bg-red-100"
            >
              <Trash2 color="#DC2626" size={16} strokeWidth={2.4} />
              <Text className="ml-2 text-sm font-black text-red-600">Clear Stored Multisigs</Text>
            </Pressable>
          </View>

          <View>
            <Pressable
              onPress={handleWalletPress}
              className="mt-20 h-12 flex-row items-center justify-center rounded-xl bg-black active:bg-black/80"
            >
              {account ? (
                <LogOut color="#F87171" size={16} strokeWidth={2.4} />
              ) : (
                <LogIn color="#FFFFFF" size={16} strokeWidth={2.4} />
              )}
              <Text className={`ml-2 text-sm font-black ${account ? 'text-red-400' : 'text-white'}`}>
                {account ? 'Disconnect Wallet' : 'Connect Wallet'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  )
}

function SettingsValueRow({
  label,
  value,
  displayValue,
  isLoading,
  copyLabel,
}: {
  label: string
  value: string
  displayValue: string
  isLoading?: boolean
  copyLabel?: string
}) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-xl border border-black/10 px-3 py-3">
      <View className="flex-1">
        <Text className="text-xs font-bold uppercase text-black/45">{label}</Text>
        {isLoading ? (
          <MultisigDataSkeleton className="mt-2 h-4 w-28" />
        ) : (
          <Text className="mt-1 text-sm font-black text-black">{displayValue}</Text>
        )}
      </View>
      {copyLabel ? (
        <CopyText
          text={value}
          accessibilityLabel={copyLabel}
          className="h-9 w-9 items-center justify-center rounded-xl bg-white disabled:opacity-40"
        />
      ) : null}
    </View>
  )
}
