import { StatusBar } from 'expo-status-bar'
import * as Clipboard from 'expo-clipboard'
import { useEffect, useState } from 'react'
import { GestureResponderEvent, Pressable, Text, View } from 'react-native'
import { Copy, RefreshCw, Trash2, UsersRound, Plus } from 'lucide-react-native'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Toast } from 'toastify-react-native'
import { Dropdown } from '../../components/Dropdown'
import { ProposalsMenu } from '../../components/cards/ProposalsMenu'
import { AssetsMenu } from '../../components/home-screen/AssetsMenu'
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
import NoMultisigs from '../../components/home-screen/NoMultisigs'

const menuItems: MenuItem[] = ['Proposals', 'Assets', 'NFTs']

function MenuContent({
  selectedMenuItem,
  multisigData,
  isBusy,
  isLoading,
}: {
  selectedMenuItem: MenuItem
  multisigData?: SquadsMultisigData | null
  isBusy?: boolean
  isLoading?: boolean
}) {
  if (isLoading) {
    return <MultisigMenuSkeleton />
  }

  if (selectedMenuItem === 'Assets') {
    return <AssetsMenu />
  }

  if (selectedMenuItem === 'NFTs') {
    return <NftsMenu />
  }

  return (
    <ProposalsMenu proposals={multisigData?.proposals ?? []} threshold={multisigData?.threshold ?? 1} isBusy={isBusy} />
  )
}

export default function HomeScreen() {
  const { account } = useMobileWallet()
  const queryClient = useQueryClient()
  const walletAddress = account?.address.toString() ?? ''
  const { multisigs = [], isMultisigsLoading } = useMultisigs(walletAddress)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem>('Proposals')
  const { data: storedSelectedMultisigKey = '', isFetched: isSelectedMultisigFetched } = useQuery({
    queryKey: ['selectedMultisigAddress'],
    queryFn: getSelectedMultisigAddress,
  })
  const [selectedMultisigKey, setSelectedMultisigKey] = useState('')
  const { multisigData, isMultisigLoading, refetchMultisigData } = useMultisig(selectedMultisigKey, walletAddress)
  const isBusy = false
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

  const copyAddress = async (address: string, label: string, event: GestureResponderEvent) => {
    event.stopPropagation()

    if (!address) {
      return
    }

    await Clipboard.setStringAsync(address)
    Toast.success(`${label} copied to clipboard.`, 'top')
  }

  const clearStoredMultisigs = async() => {
    setIsDropdownOpen(false)
    await clearMultisigsFromStorage()
    await clearSelectedMultisigAddress()
    setSelectedMultisigKey('')
    queryClient.setQueryData(['selectedMultisigAddress'], '')
    await queryClient.invalidateQueries({ queryKey: ['multisigs', walletAddress] })
    Toast.success('Stored multisigs cleared.', 'bottom')
  }

  if (!isMultisigsLoading && multisigs.length === 0) {
    return <NoMultisigs/>
  }

  return (
    <>
      <Pressable className="flex-1" onPress={() => setIsDropdownOpen(false)}>
        <View className="p-4">
          <View className="mt-4 h-48 w-full rounded-xl px-3 shadow-2xl">
            <View className="absolute inset-0 overflow-hidden rounded-xl border border-black/20 bg-white">
              <View className="absolute -right-16 -top-12 h-40 w-40 rounded-full bg-black/3" />
              <View className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-black/3" />
            </View>

            <View className="z-10 flex-row items-start justify-between">
              <Dropdown
                items={multisigDropdownItems}
                selectedKey={selectedMultisig?.address ?? selectedMultisigKey}
                isOpen={isDropdownOpen}
                onToggle={() => setIsDropdownOpen((value) => !value)}
                onSelect={selectMultisig}
                menuMaxHeight={260}
                button={<ImportMultisigButton isBusy={isBusy} onImport={importMultisig} />}
              />

              <View className="h-10 flex-row items-center gap-1 rounded-md">
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
                  <Text className="text-sm font-bold uppercase text-black/45">Assets balance</Text>
                  <Text className="mt-3 text-center text-4xl font-black text-black">{selectedBalance}</Text>
                  {multisigData ? (
                    <View className="mt-2 flex-row items-center justify-center gap-2">
                      <Text className="text-xs font-bold text-black/45">
                        Vault {shortenAddress(multisigData.vaultAddress)}
                      </Text>
                      <Pressable
                        onPress={(event) => copyAddress(multisigData.vaultAddress, 'Vault address', event)}
                        className="h-7 w-7 items-center justify-center rounded-md border border-black/10 active:bg-black/5"
                        accessibilityRole="button"
                        accessibilityLabel="Copy vault address"
                      >
                        <Copy color="rgba(0,0,0,0.45)" size={13} strokeWidth={2.4} />
                      </Pressable>
                    </View>
                  ) : null}
                </>
              )}
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-3">
            {isMultisigLoading ? (
              <MultisigDataSkeleton className="h-4 flex-1" />
            ) : (
              <View className="flex-1 flex-row items-center gap-2">
                <Text className="shrink text-xs font-bold text-black/45" numberOfLines={2}>
                  {`Account ${shortenAddress(selectedMultisigKey)}`}
                </Text>
                <Pressable
                  onPress={(event) => copyAddress(selectedMultisigKey, 'Account address', event)}
                  disabled={!selectedMultisigKey}
                  className="h-8 w-8 items-center justify-center rounded-md border border-black/10 active:bg-black/5 disabled:opacity-40"
                  accessibilityRole="button"
                  accessibilityLabel="Copy account address"
                >
                  <Copy color="rgba(0,0,0,0.45)" size={14} strokeWidth={2.4} />
                </Pressable>
              </View>
            )}
            <Pressable
              onPress={() => void refetchMultisigData()}
              disabled={isBusy || !selectedMultisigKey}
              className="h-10 w-10 items-center justify-center rounded-md border border-black/10 active:bg-black/5"
            >
              <RefreshCw color="#090A0F" size={16} strokeWidth={2.4} />
            </Pressable>
            <Pressable
              onPress={clearStoredMultisigs}
              disabled={isBusy}
              className="h-10 w-10 items-center justify-center rounded-md border border-red-500/25 bg-red-50 active:bg-red-100"
            >
              <Trash2 color="#DC2626" size={16} strokeWidth={2.4} />
            </Pressable>
          </View>

          <View className="mt-5 flex-row rounded-lg border border-black/10 bg-white p-1">
            {menuItems.map((item) => {
              const isSelected = selectedMenuItem === item

              return (
                <Pressable
                  key={item}
                  onPress={() => setSelectedMenuItem(item)}
                  className={`h-11 flex-1 items-center justify-center rounded-md ${isSelected ? 'bg-black' : 'bg-white active:bg-black/5'}`}
                >
                  <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-black/60'}`}>{item}</Text>
                </Pressable>
              )
            })}
          </View>

          <MenuContent
            selectedMenuItem={selectedMenuItem}
            multisigData={multisigData}
            isBusy={isBusy}
            isLoading={isMultisigLoading}
          />
        </View>

        <StatusBar style="dark" />
      </Pressable>
      <ImportMultisigModal visible={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </>
  )
}

function ImportMultisigButton({ isBusy, onImport }: AddMultisigButtonProps) {
  return (
    <View className="gap-2">
      {/* <Pressable
        onPress={onCreate}
        disabled={isBusy}
        className="h-11 flex-row items-center justify-center rounded-md bg-black active:bg-black/80"
      >
        <Plus color="#FFFFFF" size={16} strokeWidth={2} />
        <Text className="ml-2 text-sm font-black text-white">{isBusy ? 'Working...' : 'Create Multisig'}</Text>
      </Pressable> */}

      <Pressable
        onPress={onImport}
        disabled={isBusy}
        className="h-11 flex-row items-center justify-center rounded-md border border-black/15 bg-white active:bg-black/5"
      >
        <Plus color="#FFFFFF" size={16} strokeWidth={2} />
        <Text className="text-sm font-black text-black">Import Multisig</Text>
      </Pressable>
    </View>
  )
}
