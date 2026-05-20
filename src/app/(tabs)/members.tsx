import { StatusBar } from 'expo-status-bar'
import { ScrollView, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { CheckCircle2, ShieldCheck, UsersRound } from 'lucide-react-native'
import useMultisig from '../../hooks/useMultisig'
import useMultisigs from '../../hooks/useMultisigs'
import { getSelectedMultisigAddress } from '../../lib/selectedMultisigStorage'
import { shortenAddress } from '../../lib/squads'

export default function MembersScreen() {
  const { account } = useMobileWallet()
  const walletAddress = account?.address.toString()
  const { data: multisigs = [] } = useMultisigs(walletAddress ?? '')
  const { data: storedSelectedMultisigKey = '' } = useQuery({
    queryKey: ['selectedMultisigAddress'],
    queryFn: getSelectedMultisigAddress,
  })
  const selectedMultisig =
    multisigs.find((multisig) => multisig.address === storedSelectedMultisigKey) ?? multisigs[0]
  const selectedMultisigAddress = selectedMultisig?.address ?? storedSelectedMultisigKey
  const { data: summary, isFetching } = useMultisig(selectedMultisigAddress, walletAddress)
  const members = summary?.members ?? selectedMultisig?.members ?? []
  const threshold = summary?.threshold ?? selectedMultisig?.threshold ?? 0

  return (
    <ScrollView style={{ flex: 1 }}>
      <View className="flex-1 px-6 pb-12">
        <View className="mt-4 rounded-lg border border-black/10 bg-white p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-md bg-black/5">
              <ShieldCheck color="#090A0F" size={18} strokeWidth={2.4} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-black">
                {threshold > 0 && members.length > 0 ? `${threshold} of ${members.length} approvals` : 'Approvals'}
              </Text>
              <Text className="mt-1 text-sm leading-6 text-black/65">
                {threshold > 0
                  ? `A proposal needs ${threshold} member approval${threshold === 1 ? '' : 's'} before execution.`
                  : isFetching
                    ? 'Loading approval rules for this multisig.'
                    : 'Select a multisig to view approval rules.'}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-4 rounded-lg border border-black/10 bg-white p-4">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-base font-black text-black">Owners</Text>
            <Text className="text-xs font-bold uppercase text-black/45">
              {isFetching ? 'Refreshing' : `${members.length} total`}
            </Text>
          </View>

          {members.length > 0 ? (
            <View className="mt-4 gap-3">
              {members.map((member, index) => {
                const isConnectedWallet = member === walletAddress

                return (
                  <View key={member} className="flex-row items-center gap-3 rounded-md border border-black/10 p-3">
                    <View className="h-10 w-10 items-center justify-center rounded-md bg-black/5">
                      <Text className="text-sm font-black text-black">{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-sm font-black text-black">Member {index + 1}</Text>
                        {isConnectedWallet ? <CheckCircle2 color="#090A0F" size={14} strokeWidth={2.4} /> : null}
                      </View>
                      <Text className="mt-1 text-sm font-bold text-black/45">{shortenAddress(member)}</Text>
                    </View>
                    <View className="rounded-md bg-black/5 px-2 py-1">
                      <Text className="text-xs font-bold text-black/60">
                        {isConnectedWallet ? 'You' : 'Signer'}
                      </Text>
                    </View>
                  </View>
                )
              })}
            </View>
          ) : (
            <Text className="mt-3 text-sm leading-6 text-black/65">
              {isFetching ? 'Loading members for this multisig.' : 'Members will appear here after a multisig is selected.'}
            </Text>
          )}
        </View>
      </View>

      <StatusBar style="dark" />
    </ScrollView>
  )
}
