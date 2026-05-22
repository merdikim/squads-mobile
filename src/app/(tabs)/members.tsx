import { StatusBar } from 'expo-status-bar'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, PanResponder, Pressable, ScrollView, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { CheckCircle2, Plus, ShieldCheck, Trash2, UsersRound } from 'lucide-react-native'
import { AddMemberModal } from '../../components/modals/AddMemberModal'
import { DeleteMemberModal } from '../../components/modals/DeleteMemberModal'
import useMultisig from '../../hooks/useMultisig'
import useMultisigs from '../../hooks/useMultisigs'
import { getSelectedMultisigAddress } from '../../lib/selectedMultisigStorage'
import { shortenAddress } from '../../utils'
import { SafeAreaView } from 'react-native-safe-area-context'

const DELETE_REVEAL_WIDTH = 72

export default function MembersScreen() {
  const { account } = useMobileWallet()
  const walletAddress = account?.address.toString()
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState('')
  const { multisigs = [] } = useMultisigs(walletAddress ?? '')
  const { data: storedSelectedMultisigKey = '' } = useQuery({
    queryKey: ['selectedMultisigAddress'],
    queryFn: getSelectedMultisigAddress,
  })
  const selectedMultisig =
    multisigs.find((multisig) => multisig.address === storedSelectedMultisigKey)
  const selectedMultisigAddress = selectedMultisig?.address ?? storedSelectedMultisigKey
  const { multisigData, isMultisigLoading } = useMultisig(selectedMultisigAddress, walletAddress)
  const members = useMemo(() => {
    return multisigData?.members ?? []
  }, [multisigData])
  const threshold = multisigData?.threshold ?? 0

  if (!selectedMultisigAddress) {
    return <NoMembersScreen />
  }

  return (
    <SafeAreaView style={{ flex:1 }}>
    <ScrollView style={{ flex: 1 }}>
      <View className="flex-1 px-6 py-8">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-base font-black text-black">Members ({isMultisigLoading ? '...' : `${members.length}`})</Text>
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => setIsAddMemberModalOpen(true)}
                className="h-10 w-10 items-center justify-center rounded-md bg-black active:bg-black/80"
              >
                <Plus color="#FFFFFF" size={17} strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>

          {members.length > 0 ? (
            <View className="mt-4 gap-3">
              {members.map((member, index) => {
                const isConnectedWallet = member === walletAddress

                return (
                  <MemberCard
                    key={member}
                    index={index}
                    member={member}
                    isConnectedWallet={isConnectedWallet}
                    onDelete={() => setMemberToDelete(member)}
                  />
                )
              })}
            </View>
          ) : (
            <Text className="mt-3 text-sm leading-6 text-black/65">
              {isMultisigLoading ? 'Loading members for this multisig.' : 'Members will appear here after a multisig is selected.'}
            </Text>
          )}
        </View>

      <StatusBar style="dark" />
      <AddMemberModal
        visible={isAddMemberModalOpen}
        members={members}
        multisigAddress={selectedMultisigAddress}
        onClose={() => setIsAddMemberModalOpen(false)}
      />
      <DeleteMemberModal
        member={memberToDelete}
        onClose={() => setMemberToDelete('')}
        onDeleteMember={(member) => {
          // setDeletedMembers((currentMembers) => [...currentMembers, member])
          // setAddedMembers((currentMembers) => currentMembers.filter((addedMember) => addedMember !== member))
        }}
      />
    </ScrollView>
    </SafeAreaView>
  )
}

function MemberCard({
  index,
  member,
  isConnectedWallet,
  onDelete,
}: {
  index: number
  member: string
  isConnectedWallet: boolean
  onDelete: () => void
}) {
  const translateX = useRef(new Animated.Value(0)).current
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dx < -8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(Math.max(-DELETE_REVEAL_WIDTH, Math.min(0, gestureState.dx)))
      },
      onPanResponderRelease: (_, gestureState) => {
        Animated.spring(translateX, {
          toValue: gestureState.dx < -DELETE_REVEAL_WIDTH / 2 ? -DELETE_REVEAL_WIDTH : 0,
          useNativeDriver: true,
        }).start()
      },
    }),
  ).current

  const handleDelete = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start(onDelete)
  }

  return (
    <View className="overflow-hidden rounded-md">
      <View className="absolute inset-y-0 right-0 w-18 items-center justify-center rounded-md bg-red-50">
        <Pressable
          onPress={handleDelete}
          className="h-10 w-10 items-center justify-center rounded-md border border-red-500/25 bg-white active:bg-red-100"
        >
          <Trash2 color="#DC2626" size={17} strokeWidth={2.4} />
        </Pressable>
      </View>

      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        <View className="flex-row items-center gap-3 rounded-md border border-black/10 bg-white p-3">
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
      </Animated.View>
    </View>
  )
}

function NoMembersScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6">
      <UsersRound color="#090A0F" size={48} strokeWidth={1.5} />
      <Text className="text-center text-lg font-bold text-black">No Members</Text>
      <Text className="text-center text-sm text-black/65">Select a multisig from the home screen to view its members.</Text>
      <StatusBar style="dark" />
    </View>
  )
}
