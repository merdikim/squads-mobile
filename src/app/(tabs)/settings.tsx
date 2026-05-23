import { StatusBar } from 'expo-status-bar'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LogIn, LogOut, WalletCards } from 'lucide-react-native'
import { useQuery } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { CopyText } from '../../components/CopyText'
import { CardSkeleton } from '../../components/skeletons/CardSkeleton'
import useMultisigs from '../../hooks/useMultisigs'
import { getSelectedMultisigAddress } from '../../lib/selectedMultisigStorage'
import { shortenAddress } from '../../utils'

export default function SettingsScreen() {
  const { account, connect, disconnect } = useMobileWallet()
  const walletAddress = account?.address.toString() ?? ''
  const { multisigs = [], isMultisigsLoading } = useMultisigs(walletAddress)
  const { data: storedSelectedMultisigKey = '' } = useQuery({
    queryKey: ['selectedMultisigAddress'],
    queryFn: getSelectedMultisigAddress,
  })
  const selectedMultisig = multisigs.find((multisig) => multisig.address === storedSelectedMultisigKey)
  const selectedMultisigAddress = selectedMultisig?.address ?? storedSelectedMultisigKey

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
                isLoading={isMultisigsLoading}
                copyLabel="Copy multisig account"
              />
              <SettingsValueRow
                label="Selected Vault"
                value={selectedMultisig?.vaultAddress ?? ''}
                displayValue={selectedMultisig?.vaultAddress ? shortenAddress(selectedMultisig.vaultAddress, 9) : 'Unavailable'}
                isLoading={isMultisigsLoading}
                copyLabel="Copy vault address"
              />
              <SettingsValueRow
                label="Threshold"
                value={selectedMultisig ? String(selectedMultisig.threshold) : ''}
                displayValue={selectedMultisig ? `${selectedMultisig.threshold} of ${selectedMultisig.members.length}` : 'Unavailable'}
                isLoading={isMultisigsLoading}
              />
            </View>
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
          <CardSkeleton className="mt-2 h-4 w-28" />
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
