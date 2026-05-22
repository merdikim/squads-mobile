import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { GestureResponderEvent, Pressable, Text, View } from 'react-native'
import { RefreshCw, UsersRound, Plus } from 'lucide-react-native'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Toast } from 'toastify-react-native'
import { CopyText } from '../../components/CopyText'
import { Dropdown } from '../../components/Dropdown'
import { ProposalsMenu } from '../../components/cards/ProposalsMenu'
import { CoinsMenu } from '../../components/home-screen/CoinsMenu'
import { NftsMenu } from '../../components/home-screen/NftsMenu'
import { MultisigDataSkeleton, MultisigMenuSkeleton } from '../../components/home-screen/MultisigDataSkeleton'
import { ImportMultisigModal } from '../../components/modals/ImportMultisigModal'
import { clearMultisigsFromStorage } from '../../lib/multisigStorage'
import {
  clearSelectedMultisigAddress,
  getSelectedMultisigAddress,
  saveSelectedMultisigAddress,
} from '../../lib/selectedMultisigStorage'
import useMultisigs from '../../hooks/useMultisigs'
import { AddMultisigButtonProps, MenuItem, SquadsMultisigData } from '../../types'
import useMultisig from '../../hooks/useMultisig'
import { formatSol, shortenAddress } from '../../utils'
import { SafeAreaView } from 'react-native-safe-area-context'

const menuItems: MenuItem[] = ['Proposals', 'Coins', 'NFTs']

function MenuContent({
  selectedMenuItem,
  multisigData,
  isLoading,
}: {
  selectedMenuItem: MenuItem
  multisigData?: SquadsMultisigData | null
  isLoading?: boolean
}) {
  if (isLoading) {
    return <MultisigMenuSkeleton />
  }

  if (selectedMenuItem === 'Coins') {
    return <CoinsMenu />
  }

  if (selectedMenuItem === 'NFTs') {
    return <NftsMenu />
  }

  return (
    <ProposalsMenu proposals={multisigData?.proposals ?? []} threshold={multisigData?.threshold ?? 1} />
  )
}

export default function HomeScreen() {
  const { account } = useMobileWallet()
  const queryClient = useQueryClient()
  const walletAddress = account?.address.toString() ?? ''
  const { multisigs = [] } = useMultisigs(walletAddress)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem>('Proposals')
  const { data: storedSelectedMultisigKey = '', isFetched: isSelectedMultisigFetched } = useQuery({
    queryKey: ['selectedMultisigAddress'],
    queryFn: getSelectedMultisigAddress,
  })
  const [selectedMultisigKey, setSelectedMultisigKey] = useState('')
  const { multisigData, isMultisigLoading, refetchMultisigData } = useMultisig(selectedMultisigKey, walletAddress)
  const selectedMultisig = multisigs.find((multisig) => multisig.address === selectedMultisigKey)
  const multisigDropdownItems = multisigs.map((multisig) => ({
    key: multisig.address,
    label: multisig.name,
  }))
  const selectedBalance = multisigData ? formatSol(multisigData.balanceLamports) : '0'
  const selectedParticipants = multisigData?.members.length ?? 0

  useEffect(() => {
    if (!isSelectedMultisigFetched || selectedMultisigKey || multisigs.length === 0) {
      return
    }

    const storedSelection = multisigs.find((multisig) => multisig.address === storedSelectedMultisigKey)
    const nextSelection = storedSelection?.address ?? multisigs[0].address

    setSelectedMultisigKey(nextSelection)
    queryClient.setQueryData(['selectedMultisigAddress'], nextSelection)
    void saveSelectedMultisigAddress(nextSelection)
  }, [isSelectedMultisigFetched, multisigs, queryClient, selectedMultisigKey, storedSelectedMultisigKey])

  const selectMultisig = (publicKey: string) => {
    setSelectedMultisigKey(publicKey)
    queryClient.setQueryData(['selectedMultisigAddress'], publicKey)
    void saveSelectedMultisigAddress(publicKey)
    setIsDropdownOpen(false)
  }

  const importMultisig = (event: GestureResponderEvent) => {
    event.stopPropagation()
    setIsDropdownOpen(false)
    setIsImportModalOpen(true)
  }

  const clearStoredMultisigs = async () => {
    setIsDropdownOpen(false)
    await clearMultisigsFromStorage()
    await clearSelectedMultisigAddress()
    setSelectedMultisigKey('')
    queryClient.setQueryData(['selectedMultisigAddress'], '')
    await queryClient.invalidateQueries({ queryKey: ['multisigs', walletAddress] })
    Toast.success('Stored multisigs cleared.', 'bottom')
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Pressable className="flex-1" onPress={() => setIsDropdownOpen(false)}>
        <View className="p-4 flex-1">
          <View className=" h-48 w-full rounded-xl px-3 shadow-2xl">
            <View className="absolute inset-0 overflow-hidden rounded-xl border border-black/10 bg-white">
              <View className="absolute -right-16 -top-12 h-36 w-36 rounded-xl bg-black/2" />
              <View className="absolute -bottom-2 -left-12 h-24 w-24 rounded-xl bg-black/3" />
            </View>

            <View className="z-10 flex-row items-start justify-between">
              <Dropdown
                items={multisigDropdownItems}
                selectedKey={selectedMultisig?.address ?? selectedMultisigKey}
                isOpen={isDropdownOpen}
                onToggle={() => setIsDropdownOpen((value) => !value)}
                onSelect={selectMultisig}
                menuMaxHeight={260}
                button={<ImportMultisigButton onImport={importMultisig} />}
              />

              <View className="h-10 flex-row items-center gap-1 rounded-xl">
                <UsersRound color="#090A0F" size={16} strokeWidth={2.4} />
                {isMultisigLoading ? (
                  <MultisigDataSkeleton className="h-4 w-5" />
                ) : (
                  <Text className="text-sm font-bold text-black">{selectedParticipants}</Text>
                )}
              </View>
            </View>

            <View className="z-0 flex-1 items-center justify-center">
              {isMultisigLoading ? (
                <View className="items-center">
                  <MultisigDataSkeleton className="h-4 w-28" />
                  <MultisigDataSkeleton className="mt-4 h-10 w-36" />
                  <MultisigDataSkeleton className="mt-3 h-3 w-24" />
                </View>
              ) : (
                <>
                  <Text className="text-xs font-semibold text-black/45">Total Balance</Text>
                  <Text className="mt-3 text-center text-4xl font-black text-black">{selectedBalance}</Text>
                  {multisigData ? (
                    <View className="mt-2 flex-row items-center justify-center">
                      <Text className="text-xs font-bold text-black/45">
                        Vault {shortenAddress(multisigData.vaultAddress)}
                      </Text>
                      <CopyText
                        text={multisigData.vaultAddress}
                        accessibilityLabel="Copy vault address"
                        className="h-7 w-7 items-center justify-center disabled:opacity-40"
                        iconSize={13}
                      />
                    </View>
                  ) : null}
                </>
              )}
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-3 px-2">
            {isMultisigLoading ? (
              <MultisigDataSkeleton className="h-4 flex-1" />
            ) : (
              <View className="flex-1 flex-row items-center">
                <Text className="shrink text-xs font-bold text-black/45" numberOfLines={2}>
                  {`Account ${shortenAddress(selectedMultisigKey)}`}
                </Text>
                <CopyText text={selectedMultisigKey} accessibilityLabel="Copy account address" />
              </View>
            )}
            <Pressable
              onPress={() => void refetchMultisigData()}
              disabled={!selectedMultisigKey}
            >
              <RefreshCw color="#090A0F" size={16} strokeWidth={2.4} />
            </Pressable>
          </View>

          <View className="mt-4 flex-row p-1 gap-4">
            {menuItems.map((item) => {
              const isSelected = selectedMenuItem === item

              return (
                <Pressable
                  key={item}
                  onPress={() => setSelectedMenuItem(item)}
                  className="h-11 flex-1 items-center justify-end"
                >
                  <Text className={`mb-2 text-sm font-semibold ${isSelected ? 'text-black font-extrabold' : 'text-black/60'}`}>{item}</Text>
                  <View
                    className="w-full"
                    style={{
                      height: isSelected ? 4 : 2,
                      backgroundColor: isSelected ? '#000000' : 'rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </Pressable>
              )
            })}
          </View>

          <MenuContent
            selectedMenuItem={selectedMenuItem}
            multisigData={multisigData}
            isLoading={isMultisigLoading}
          />
        </View>

        <StatusBar style="dark" />
      </Pressable>
      <ImportMultisigModal visible={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </SafeAreaView>
  )
}

function ImportMultisigButton({ isBusy, onImport }: AddMultisigButtonProps) {
  return (
    <View className="gap-2">
      {/* <Pressable
        onPress={onCreate}
        disabled={isBusy}
        className="h-11 flex-row items-center justify-center rounded-xl bg-black active:bg-black/80"
      >
        <Plus color="#FFFFFF" size={16} strokeWidth={2} />
        <Text className="ml-2 text-sm font-black text-white">{isBusy ? 'Working...' : 'Create Multisig'}</Text>
      </Pressable> */}

      <Pressable
        onPress={onImport}
        disabled={isBusy}
        className="h-11 flex-row items-center justify-center rounded-xl border border-black/15 bg-white active:bg-black/5"
      >
        <Plus color="#FFFFFF" size={16} strokeWidth={2} />
        <Text className="text-sm font-black text-black">Import Multisig</Text>
      </Pressable>
    </View>
  )
}
