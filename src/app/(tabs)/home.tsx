import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, Pressable, Text, View } from 'react-native'
import { Plus, RefreshCw, UsersRound } from 'lucide-react-native'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { CopyText } from '../../components/CopyText'
import { Dropdown } from '../../components/Dropdown'
import { ProposalsMenu } from '../../components/home-screen/ProposalsMenu'
import { CoinsMenu } from '../../components/home-screen/CoinsMenu'
import { NftsMenu } from '../../components/home-screen/NftsMenu'
import CreateMultisigModal from '../../components/modals/CreateMultisigModal'
import { getSelectedMultisigAddress, saveSelectedMultisigAddress } from '../../lib/selectedMultisigStorage'
import useBalances from '../../hooks/useBalances'
import useMultisigs from '../../hooks/useMultisigs'
import { MenuItem, SquadsMultisigData } from '../../types'
import { shortenAddress } from '../../utils'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CardSkeleton } from '../../components/skeletons/CardSkeleton'
import { APP_BACKGROUND_COLOR } from '../../constants'

const menuItems: MenuItem[] = ['Proposals', 'Coins', 'NFTs']

const formatUsd = (amount: number) => {
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount < 1 ? 4 : 2,
  })
}

function MenuContent({
  selectedMenuItem,
  multisigData,
}: {
  selectedMenuItem: MenuItem
  multisigData?: SquadsMultisigData | null
  isLoading?: boolean
}) {
  if (selectedMenuItem === 'Coins') {
    return <CoinsMenu address={multisigData?.vaultAddress ?? ''} />
  }

  if (selectedMenuItem === 'NFTs') {
    return <NftsMenu />
  }

  return <ProposalsMenu multisigAddress={multisigData?.address ?? ''} threshold={multisigData?.threshold ?? 0} />
}

export default function HomeScreen() {
  const { account } = useMobileWallet()
  const queryClient = useQueryClient()
  const walletAddress = account?.address.toString() ?? ''
  const { multisigs = [], isMultisigsLoading, isRefetchingMultisig } = useMultisigs(walletAddress)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem>('Proposals')
  const { data: storedSelectedMultisigKey = '', isFetched: isSelectedMultisigFetched } = useQuery({
    queryKey: ['selectedMultisigAddress'],
    queryFn: getSelectedMultisigAddress,
  })
  const [selectedMultisigKey, setSelectedMultisigKey] = useState('')
  const selectedMultisig = multisigs.find((multisig) => multisig.address === selectedMultisigKey)
  const multisigDropdownItems = multisigs.map((multisig) => ({
    key: multisig.address,
    label:
      typeof multisig.name === 'string' && multisig.name.trim()
        ? multisig.name.trim()
        : shortenAddress(multisig.address),
    subtitle: shortenAddress(multisig.address, 6),
    imageUri: multisig.imageUri,
  }))
  const selectedParticipants = selectedMultisig?.members.length ?? 0
  const selectedVaultAddress = selectedMultisig?.vaultAddress
  const { totalUsd, isBalancesLoading } = useBalances(selectedVaultAddress ?? '')
  const selectedBalance = formatUsd(totalUsd)
  const refetchSpinValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!isRefetchingMultisig) {
      refetchSpinValue.stopAnimation()
      refetchSpinValue.setValue(0)
      return
    }

    const animation = Animated.loop(
      Animated.timing(refetchSpinValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [isRefetchingMultisig, refetchSpinValue])

  const refetchSpin = refetchSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  useEffect(() => {
    if (!isMultisigsLoading && multisigs.length === 0) {
      router.replace('/')
    }
  }, [isMultisigsLoading, multisigs.length])

  useEffect(() => {
    if (!isSelectedMultisigFetched) {
      return
    }

    if (multisigs.length === 0) {
      if (selectedMultisigKey) {
        setSelectedMultisigKey('')
      }

      return
    }

    const selectedMultisigExists = multisigs.some((multisig) => multisig.address === selectedMultisigKey)

    if (selectedMultisigKey && selectedMultisigExists) {
      return
    }

    const storedSelection = multisigs.find((multisig) => multisig.address === storedSelectedMultisigKey)
    const nextSelection = storedSelection?.address ?? multisigs[0].address

    setSelectedMultisigKey(nextSelection)

    if (storedSelectedMultisigKey !== nextSelection) {
      queryClient.setQueryData(['selectedMultisigAddress'], nextSelection)
      void saveSelectedMultisigAddress(nextSelection)
    }
  }, [isSelectedMultisigFetched, multisigs, queryClient, selectedMultisigKey, storedSelectedMultisigKey])

  const selectMultisig = (address: string) => {
    setSelectedMultisigKey(address)
    queryClient.setQueryData(['selectedMultisigAddress'], address)
    void saveSelectedMultisigAddress(address)
    setIsDropdownOpen(false)
  }

  const openCreateMultisig = () => {
    setIsDropdownOpen(false)
    setIsCreatingModalOpen(true)
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: APP_BACKGROUND_COLOR }}>
      <Pressable className="flex-1" onPress={() => setIsDropdownOpen(false)}>
        <View className="p-4 flex-1">
          <View className="h-56 w-full px-3">
            <View className="z-10 flex-row items-start justify-between">
              <Dropdown
                items={multisigDropdownItems}
                selectedKey={selectedMultisig?.address ?? selectedMultisigKey}
                isOpen={isDropdownOpen}
                onToggle={() => setIsDropdownOpen((value) => !value)}
                onSelect={selectMultisig}
                menuMaxHeight={260}
                button={
                  <Pressable
                    onPress={openCreateMultisig}
                    className="h-11 flex-row items-center justify-center rounded-xl bg-black active:bg-black/80"
                  >
                    <Plus color="#FFFFFF" size={16} strokeWidth={2.4} />
                    <Text className="ml-2 text-sm font-black text-white">Create Multisig</Text>
                  </Pressable>
                }
              />

              <View className="h-10 flex-row items-center gap-1 rounded-xl">
                <UsersRound color="#090A0F" size={16} strokeWidth={2.4} />
                {isMultisigsLoading && !selectedMultisig ? (
                  <CardSkeleton className="h-4 w-5 rounded-md" />
                ) : (
                  <Text className="text-sm font-bold text-black">{selectedParticipants}</Text>
                )}
              </View>
            </View>

            <View className="z-0 flex-1 items-center justify-center">
              {isMultisigsLoading || isBalancesLoading ? (
                <View className="items-center">
                  <CardSkeleton className="h-4 w-28 rounded-md" />
                  <CardSkeleton className="mt-4 h-10 w-36 rounded-lg" />
                  <CardSkeleton className="mt-3 h-3 w-24 rounded-md" />
                </View>
              ) : (
                <>
                  <Text className="text-xs font-semibold text-black/45">Total Balance</Text>
                  <Text className="mt-3 text-center text-4xl font-black text-black">{selectedBalance}</Text>
                  {selectedVaultAddress ? (
                    <View className="mt-2 flex-row items-center justify-center">
                      <Text className="text-xs font-bold text-black/45">
                        Vault {shortenAddress(selectedVaultAddress)}
                      </Text>
                      <CopyText
                        text={selectedVaultAddress}
                        accessibilityLabel="Copy vault address"
                        className="h-7 w-7 items-center justify-center disabled:opacity-40"
                        iconSize={13}
                      />
                    </View>
                  ) : null}
                </>
              )}
            </View>
            {/* <View className="mt-4 flex-row items-center justify-between gap-3 px-2">
            {isMultisigsLoading ? (
              <View className='flex-1'>
                <CardSkeleton className="h-4 w-32 rounded-md" />
              </View>
            ) : (
              <View className="flex-1 flex-row items-center">
                <Text className="shrink text-xs font-bold text-black/45" numberOfLines={2}>
                  {`Account ${shortenAddress(selectedMultisigKey)}`}
                </Text>
                <CopyText text={selectedMultisigKey} accessibilityLabel="Copy account address" />
              </View>
            )}
            <Pressable
              onPress={() => void refetchMultisig()}
              disabled={!selectedMultisigKey || isRefetchingMultisig}
            >
              <Animated.View style={{ transform: [{ rotate: refetchSpin }] }}>
                <RefreshCw color="#090A0F" size={16} strokeWidth={2.4} />
              </Animated.View>
            </Pressable>
          </View> */}
          </View>

          <View className="mt-3 flex-row p-1 gap-4">
            {menuItems.map((item) => {
              const isSelected = selectedMenuItem === item

              return (
                <Pressable
                  key={item}
                  onPress={() => setSelectedMenuItem(item)}
                  className="h-11 flex-1 items-center justify-end"
                >
                  <Text
                    className={`mb-2 text-sm font-semibold ${isSelected ? 'text-black font-extrabold' : 'text-black/60'}`}
                  >
                    {item}
                  </Text>
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

          <MenuContent selectedMenuItem={selectedMenuItem} multisigData={selectedMultisig} />
        </View>

        <StatusBar style="dark" />
      </Pressable>

      <CreateMultisigModal visible={isCreatingModalOpen} onClose={() => setIsCreatingModalOpen(false)} />
    </SafeAreaView>
  )
}
