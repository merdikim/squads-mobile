import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, GestureResponderEvent, Pressable, Text, View } from 'react-native'
import { RefreshCw, UsersRound } from 'lucide-react-native'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Dropdown } from '../../components/Dropdown'
import { ProposalsMenu } from '../../components/cards/ProposalsMenu'
import { AssetsMenu } from '../../components/home-screen/AssetsMenu'
import { NftsMenu } from '../../components/home-screen/NftsMenu'
import { NoMultisigsScreen } from '../../components/home-screen/NoMultisigsScreen'
import { AddMultisigButton } from '../../components/modals/AddMultisigButton'
import { ImportMultisigModal } from '../../components/modals/ImportMultisigModal'
import {
  approveProposal,
  createSingleMemberMultisig,
  createSolTransferProposal,
  executeProposal,
  fetchImportableMultisig,
  fetchMultisigSummary,
  formatSol,
  shortenAddress,
  type SignWeb3Transaction,
  type SquadsMultisigSummary,
  type SquadsProposalSummary,
} from '../../lib/squads'
import { saveMultisigToStorage } from '../../lib/multisigStorage'
import { getSelectedMultisigAddress, saveSelectedMultisigAddress } from '../../lib/selectedMultisigStorage'
import useMultisigs from '../../hooks/useMultisigs'

const menuItems = ['Proposals', 'Assets', 'NFTs'] as const

type MenuItem = (typeof menuItems)[number]

function MenuContent({
  selectedMenuItem,
  summary,
  isBusy,
  onCreateProposal,
  onApproveProposal,
  onExecuteProposal,
}: {
  selectedMenuItem: MenuItem
  summary?: SquadsMultisigSummary
  isBusy?: boolean
  onCreateProposal: () => void
  onApproveProposal: (proposal: SquadsProposalSummary) => void
  onExecuteProposal: (proposal: SquadsProposalSummary) => void
}) {
  if (selectedMenuItem === 'Assets') {
    return <AssetsMenu />
  }

  if (selectedMenuItem === 'NFTs') {
    return <NftsMenu />
  }

  return (
    <ProposalsMenu
      proposals={summary?.proposals ?? []}
      threshold={summary?.threshold ?? 1}
      isBusy={isBusy}
      onCreateProposal={onCreateProposal}
      onApproveProposal={onApproveProposal}
      onExecuteProposal={onExecuteProposal}
    />
  )
}

export default function HomeScreen() {
  const { account, signTransaction } = useMobileWallet()
  const queryClient = useQueryClient()
  const walletAddress = account?.address.toString()
  const { data: multisigs = [] } = useMultisigs(walletAddress ?? '')
  const { data: storedSelectedMultisigKey = '' } = useQuery({
    queryKey: ['selectedMultisigAddress'],
    queryFn: getSelectedMultisigAddress,
  })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem>('Proposals')
  const [selectedMultisigKey, setSelectedMultisigKey] = useState('')
  const [selectedSummary, setSelectedSummary] = useState<SquadsMultisigSummary>()
  const [statusText, setStatusText] = useState('')
  const [isBusy, setIsBusy] = useState(false)
  const selectedMultisig = multisigs.find((multisig) => multisig.address === selectedMultisigKey)
  const multisigDropdownItems = multisigs.map((multisig) => ({
    key: multisig.address,
    label: multisig.name,
  }))
  const selectedBalance = selectedSummary ? formatSol(selectedSummary.balanceLamports) : 'No multisig'
  const selectedParticipants = selectedSummary?.members.length ?? 0
  const signWeb3Transaction = signTransaction as unknown as SignWeb3Transaction

  const existingAddresses = useMemo(() => multisigs.map((multisig) => multisig.address), [multisigs])

  const persistSelectedMultisig = useCallback(
    async (address: string) => {
      await saveSelectedMultisigAddress(address)
      queryClient.setQueryData(['selectedMultisigAddress'], address)
    },
    [queryClient],
  )

  useEffect(() => {
    if (!selectedMultisigKey && multisigs[0]) {
      const storedMultisig = multisigs.find((multisig) => multisig.address === storedSelectedMultisigKey)
      const nextMultisigKey = storedMultisig?.address ?? multisigs[0].address

      setSelectedMultisigKey(nextMultisigKey)
      void persistSelectedMultisig(nextMultisigKey)
    }
  }, [multisigs, persistSelectedMultisig, selectedMultisigKey, storedSelectedMultisigKey])

  const refreshSelectedMultisig = useCallback(
    async (address = selectedMultisigKey) => {
      if (!address) {
        setSelectedSummary(undefined)
        return
      }

      setStatusText('Loading multisig...')

      try {
        const summary = await fetchMultisigSummary({ address, memberAddress: walletAddress })
        setSelectedSummary(summary)
        setStatusText('')
      } catch (error) {
        setSelectedSummary(undefined)
        setStatusText(error instanceof Error ? error.message : 'Unable to load this multisig.')
      }
    },
    [selectedMultisigKey, walletAddress],
  )

  useEffect(() => {
    void refreshSelectedMultisig()
  }, [refreshSelectedMultisig])

  const selectMultisig = (publicKey: string) => {
    setSelectedMultisigKey(publicKey)
    setIsDropdownOpen(false)
    void persistSelectedMultisig(publicKey)
  }

  const importMultisig = (event: GestureResponderEvent) => {
    event.stopPropagation()
    setIsDropdownOpen(false)
    setIsImportModalOpen(true)
  }

  const createMultisig = (event: GestureResponderEvent) => {
    event.stopPropagation()
    setIsDropdownOpen(false)

    if (!walletAddress) {
      Alert.alert('Connect wallet', 'Connect your wallet before creating a Squads multisig.')
      return
    }

    Alert.alert(
      'Create devnet multisig',
      `Your wallet will sign a Squads V4 multisig with threshold 1 and member ${shortenAddress(walletAddress)}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: () => {
            void runAction(async () => {
              const created = await createSingleMemberMultisig({
                creatorAddress: walletAddress,
                signTransaction: signWeb3Transaction,
              })
              const importedMultisig = {
                name: `Multisig ${shortenAddress(created.address)}`,
                address: created.address,
              }

              const savedMultisig = await saveMultisigToStorage(importedMultisig)
              await queryClient.invalidateQueries({ queryKey: ['multisigs'] })
              setSelectedMultisigKey(savedMultisig.address)
              await persistSelectedMultisig(savedMultisig.address)
              Alert.alert('Multisig created', `Signature ${shortenAddress(created.signature)}`)
            })
          },
        },
      ],
    )
  }

  const handleImportMultisig = async (address: string) => {
    const importableMultisig = await fetchImportableMultisig(address)
    const savedMultisig = await saveMultisigToStorage(importableMultisig)

    await queryClient.invalidateQueries({ queryKey: ['multisigs'] })
    setSelectedMultisigKey(savedMultisig.address)
    await persistSelectedMultisig(savedMultisig.address)

    return savedMultisig
  }

  const runAction = async (action: () => Promise<void>) => {
    setIsBusy(true)
    setStatusText('Waiting for wallet approval...')

    try {
      await action()
      await refreshSelectedMultisig()
      setStatusText('')
    } catch (error) {
      setStatusText(error instanceof Error ? error.message : 'Transaction failed.')
    } finally {
      setIsBusy(false)
    }
  }

  const createProposal = () => {
    if (!walletAddress || !selectedMultisigKey) {
      Alert.alert('Select multisig', 'Connect your wallet and select a Squads multisig first.')
      return
    }

    Alert.alert(
      'Create transfer proposal',
      `This creates a proposal to transfer 0.01 SOL from vault ${shortenAddress(selectedSummary?.vaultAddress ?? selectedMultisigKey)} to ${shortenAddress(walletAddress)} on devnet.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: () => {
            void runAction(async () => {
              const result = await createSolTransferProposal({
                multisigAddress: selectedMultisigKey,
                creatorAddress: walletAddress,
                recipientAddress: walletAddress,
                signTransaction: signWeb3Transaction,
              })

              Alert.alert('Proposal created', `Transaction #${result.transactionIndex.toString()}`)
            })
          },
        },
      ],
    )
  }

  const approveSelectedProposal = (proposal: SquadsProposalSummary) => {
    if (!walletAddress || !selectedMultisigKey) {
      return
    }

    Alert.alert('Approve proposal', `Approve transaction #${proposal.transactionIndex.toString()} with your wallet.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => {
          void runAction(async () => {
            const signature = await approveProposal({
              multisigAddress: selectedMultisigKey,
              memberAddress: walletAddress,
              transactionIndex: proposal.transactionIndex,
              signTransaction: signWeb3Transaction,
            })
            Alert.alert('Proposal approved', `Signature ${shortenAddress(signature)}`)
          })
        },
      },
    ])
  }

  const executeSelectedProposal = (proposal: SquadsProposalSummary) => {
    if (!walletAddress || !selectedMultisigKey) {
      return
    }

    Alert.alert(
      'Execute proposal',
      `Execute vault transaction #${proposal.transactionIndex.toString()} on devnet. The vault must have enough SOL for the transfer.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Execute',
          onPress: () => {
            void runAction(async () => {
              const signature = await executeProposal({
                multisigAddress: selectedMultisigKey,
                memberAddress: walletAddress,
                transactionIndex: proposal.transactionIndex,
                signTransaction: signWeb3Transaction,
              })
              Alert.alert('Proposal executed', `Signature ${shortenAddress(signature)}`)
            })
          },
        },
      ],
    )
  }

  if (multisigs.length === 0) {
    return (
      <>
        <NoMultisigsScreen isBusy={isBusy} onCreate={createMultisig} onImport={importMultisig} />
        <StatusBar style="dark" />
        <ImportMultisigModal
          visible={isImportModalOpen}
          existingAddresses={existingAddresses}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportMultisig}
        />
      </>
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
                button={<AddMultisigButton isBusy={isBusy} onCreate={createMultisig} onImport={importMultisig} />}
              />

              <View className="h-10 flex-row items-center gap-1 rounded-md">
                <UsersRound color="#090A0F" size={16} strokeWidth={2.4} />
                <Text className="text-sm font-bold text-black">{selectedParticipants}</Text>
              </View>
            </View>

            <View className="z-0 flex-1 items-center justify-center">
              <Text className="text-sm font-bold uppercase text-black/45">Assets balance</Text>
              <Text className="mt-3 text-center text-4xl font-black text-black">{selectedBalance}</Text>
              {selectedSummary ? (
                <Text className="mt-2 text-xs font-bold text-black/45">
                  Vault {shortenAddress(selectedSummary.vaultAddress)}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-xs font-bold text-black/45" numberOfLines={2}>
              {statusText ||
                (selectedMultisigKey ? `Devnet ${shortenAddress(selectedMultisigKey)}` : 'Create or import a multisig')}
            </Text>
            <Pressable
              onPress={() => void refreshSelectedMultisig()}
              disabled={isBusy || !selectedMultisigKey}
              className="h-10 w-10 items-center justify-center rounded-md border border-black/10 active:bg-black/5"
            >
              <RefreshCw color="#090A0F" size={16} strokeWidth={2.4} />
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
            summary={selectedSummary}
            isBusy={isBusy}
            onCreateProposal={createProposal}
            onApproveProposal={approveSelectedProposal}
            onExecuteProposal={executeSelectedProposal}
          />
        </View>

        <StatusBar style="dark" />
      </Pressable>
      <ImportMultisigModal
        visible={isImportModalOpen}
        existingAddresses={existingAddresses}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportMultisig}
      />
    </>
  )
}
