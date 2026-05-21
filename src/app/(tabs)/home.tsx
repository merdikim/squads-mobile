import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Alert, GestureResponderEvent, Pressable, Text, View } from 'react-native'
import { RefreshCw, Trash2, UsersRound, Plus } from 'lucide-react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useQueryClient } from '@tanstack/react-query'
import { Dropdown } from '../../components/Dropdown'
import { ProposalsMenu } from '../../components/cards/ProposalsMenu'
import { AssetsMenu } from '../../components/home-screen/AssetsMenu'
import { NftsMenu } from '../../components/home-screen/NftsMenu'
import { NoMultisigsScreen } from '../../components/home-screen/NoMultisigsScreen'
import { MultisigDataSkeleton, MultisigMenuSkeleton } from '../../components/home-screen/MultisigDataSkeleton'
import { ImportMultisigModal } from '../../components/modals/ImportMultisigModal'
import { clearMultisigsFromStorage } from '../../lib/multisigStorage'
import useMultisigs from '../../hooks/useMultisigs'
import { AddMultisigButtonProps, MenuItem, SquadsMultisigData } from '../../types'
import useMultisig from '../../hooks/useMultisig'
import { formatSol, shortenAddress } from '../../utils'

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
    <ProposalsMenu
      proposals={multisigData?.proposals ?? []}
      threshold={multisigData?.threshold ?? 1}
      isBusy={isBusy}
    />
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
  const [selectedMultisigKey, setSelectedMultisigKey] = useState('')
  const { multisigData, isMultisigLoading, refetchMultisigData } = useMultisig(selectedMultisigKey, walletAddress)
  const [isBusy, setIsBusy] = useState(false)
  const selectedMultisig = multisigs.find((multisig) => multisig.address === selectedMultisigKey)
  const multisigDropdownItems = multisigs.map((multisig) => ({
    key: multisig.address,
    label: multisig.name,
  }))
  const selectedBalance = multisigData ? formatSol(multisigData.balanceLamports) : '0'
  const selectedParticipants = multisigData?.members.length ?? 0


  useEffect(() => {
    if (!selectedMultisigKey && multisigs.length > 0) {
      setSelectedMultisigKey(multisigs[0].address)
    }
  }, [multisigs, selectedMultisigKey])

  const selectMultisig = (publicKey: string) => {
    setSelectedMultisigKey(publicKey)
    setIsDropdownOpen(false)
  }

  const importMultisig = (event: GestureResponderEvent) => {
    event.stopPropagation()
    setIsDropdownOpen(false)
    setIsImportModalOpen(true)
  }

  const clearStoredMultisigs = () => {
    setIsDropdownOpen(false)

    Alert.alert('Clear stored multisigs', 'This removes all locally saved multisigs from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await clearMultisigsFromStorage()
            setSelectedMultisigKey('')
            await queryClient.invalidateQueries({ queryKey: ['multisigs', walletAddress] })
            //setStatusText('Stored multisigs cleared.')
          })()
        },
      },
    ])
  }

  

  
  if (!isMultisigsLoading && multisigs.length === 0) {
    return (
      <NoMultisigsScreen isBusy={isBusy} />  
    )
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
                    <Text className="mt-2 text-xs font-bold text-black/45">
                      Vault {shortenAddress(multisigData.vaultAddress)}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-3">
            {isMultisigLoading ? (
              <MultisigDataSkeleton className="h-4 flex-1" />
            ) : (
              <Text className="flex-1 text-xs font-bold text-black/45" numberOfLines={2}>
                {`Account ${shortenAddress(selectedMultisigKey)}`}
              </Text>
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
      <ImportMultisigModal
        visible={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
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
