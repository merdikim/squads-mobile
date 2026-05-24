import { StatusBar } from 'expo-status-bar'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LogIn, LogOut } from 'lucide-react-native'
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
  const selectedMultisigAccount = selectedMultisig?.address ?? storedSelectedMultisigKey
  const selectedMultisigVaultAccount = selectedMultisig?.vaultAddress ?? ''
  const walletName = selectedMultisig?.name ?? ''
  const signersCount = selectedMultisig?.members.length

  const handleWalletPress = () => {
    if (!account) {
      connect()
      return
    }

    disconnect()
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 py-8">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-base font-black text-black">Settings</Text>
          </View>

          <View className="mt-4">
            <View className="h-48 flex items-center justify-center">
              <View>
                {isMultisigsLoading ? (
                  <>
                    <CardSkeleton className="h-9 w-56 rounded-lg" />
                    <CardSkeleton className="mt-3 h-7 w-40 rounded-xl" />
                  </>
                ) : (
                  <>
                    <Text className="text-3xl font-black text-black">
                      {walletName ||
                        (selectedMultisigAccount ? shortenAddress(selectedMultisigAccount) : 'No wallet selected')}
                    </Text>
                    {selectedMultisigVaultAccount ? (
                      <View className="mt-3 flex-row items-center">
                        <Text className="text-sm font-bold text-black/45">
                          {shortenAddress(selectedMultisigVaultAccount, 9)}
                        </Text>
                        <CopyText
                          text={selectedMultisigVaultAccount}
                          accessibilityLabel="Copy wallet address"
                          className="ml-1 h-8 w-8 items-center justify-center rounded-xl bg-black/5 disabled:opacity-40"
                        />
                      </View>
                    ) : null}
                  </>
                )}
              </View>
            </View>

            <View className="mt-5 gap-3">
              <SettingsValueRow
                label="Wallet Account"
                value={selectedMultisigAccount}
                displayValue={
                  selectedMultisigAccount ? shortenAddress(selectedMultisigAccount, 9) : 'No multisig selected'
                }
                isLoading={isMultisigsLoading}
                copyLabel="Copy wallet address"
              />
              <SettingsValueRow
                label="Vault Account"
                value={selectedMultisigVaultAccount}
                displayValue={
                  selectedMultisigVaultAccount ? shortenAddress(selectedMultisigVaultAccount, 9) : 'No wallet selected'
                }
                isLoading={isMultisigsLoading}
                copyLabel="Copy wallet address"
              />
              <SettingsValueRow
                label="Number of Signers"
                value={signersCount !== undefined ? String(signersCount) : ''}
                displayValue={signersCount !== undefined ? String(signersCount) : 'Unavailable'}
                isLoading={isMultisigsLoading}
              />
              <SettingsValueRow
                label="Threshold"
                value={selectedMultisig ? String(selectedMultisig.threshold) : ''}
                displayValue={selectedMultisig ? String(selectedMultisig.threshold) : 'Unavailable'}
                isLoading={isMultisigsLoading}
              />
            </View>
          </View>

          <View className="mt-auto pt-8">
            <Pressable
              onPress={handleWalletPress}
              className={`h-14 flex-row items-center justify-center rounded-xl px-5 active:bg-black/80 ${
                account ? 'border border-black/15 bg-white active:bg-black/5' : 'bg-black'
              }`}
            >
              {account ? (
                <LogOut color="#090A0F" size={16} strokeWidth={2.4} />
              ) : (
                <LogIn color="#FFFFFF" size={16} strokeWidth={2.4} />
              )}
              <Text className={`ml-2 text-sm font-black ${account ? 'text-black' : 'text-white'}`}>
                {account ? 'Disconnect Wallet' : 'Connect Wallet'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

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
  if (!copyLabel) {
    return (
      <View className="flex-row items-center justify-between gap-3 rounded-xl bg-[#F9F9F9] p-5">
        <Text className="flex-1 text-xs font-bold uppercase text-black/45">{label}</Text>
        {isLoading ? (
          <CardSkeleton className="h-4 w-20 rounded-md" />
        ) : (
          <Text className="max-w-[52%] text-right text-sm font-black text-black">{displayValue}</Text>
        )}
      </View>
    )
  }

  return (
    <View className="flex-row items-center bg-[#F9F9F9] justify-between gap-3 rounded-xl p-3">
      <View className="flex-1">
        <Text className="text-xs font-bold uppercase text-black/45">{label}</Text>
        {isLoading ? (
          <CardSkeleton className="mt-2 h-4 w-36 rounded-md" />
        ) : (
          <Text className="mt-1 text-sm font-black text-black">{displayValue}</Text>
        )}
      </View>
      {isLoading ? <CardSkeleton className="h-9 w-9 rounded-xl" /> : null}
      {!isLoading ? (
        <CopyText
          text={value}
          accessibilityLabel={copyLabel}
          className="h-9 w-9 items-center justify-center rounded-xl bg-black/5 disabled:opacity-40"
        />
      ) : null}
    </View>
  )
}
