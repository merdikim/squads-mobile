import { StatusBar } from 'expo-status-bar'
import { useMemo, useRef, useState } from 'react'
import { Animated, PanResponder, Pressable, ScrollView, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { CheckCircle2, Plus, Trash2, UsersRound } from 'lucide-react-native'
import { CardSkeleton } from '../../components/skeletons/CardSkeleton'
import { AddMemberModal } from '../../components/modals/AddMemberModal'
import { DeleteMemberModal } from '../../components/modals/DeleteMemberModal'
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
  const { multisigs = [], isMultisigsLoading } = useMultisigs(walletAddress)
  const { data: storedSelectedMultisigKey = '' } = useQuery({
    queryKey: ['selectedMultisigAddress'],
    queryFn: getSelectedMultisigAddress,
  })
  const selectedMultisig =
    multisigs.find((multisig) => multisig.address === storedSelectedMultisigKey)
  const selectedMultisigAddress = selectedMultisig?.address ?? storedSelectedMultisigKey
  const members = useMemo(() => {
    return selectedMultisig?.members ?? []
  }, [selectedMultisig])

  if (!selectedMultisigAddress) {
    return <NoMembersScreen />
  }

  return (
    <SafeAreaView style={{ flex:1 }}>
    <ScrollView style={{ flex: 1 }}>
      <View className="flex-1 px-6 py-8">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-black text-black">Members</Text>
              {isMultisigsLoading ? (
                <CardSkeleton className="h-5 w-6" />
              ) : (
                <Text className="text-base font-black text-black">({members.length})</Text>
              )}
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => setIsAddMemberModalOpen(true)}
                className="h-10 w-10 items-center justify-center rounded-xl bg-black active:bg-black/80"
              >
                <Plus color="#FFFFFF" size={17} strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>

          {isMultisigsLoading ? (
            <MembersLoadingSkeleton />
          ) : members.length > 0 ? (
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
              Members will appear here after a multisig is selected.
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
        members={members}
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

function MembersLoadingSkeleton() {
  const memberRows = Array.from({ length: 4 })

  return (
    <View className="mt-4 gap-3">
      {memberRows.map((_, index) => (
        <View key={index} className="flex-row items-center gap-3 rounded-xl border border-black/10 bg-white p-3">
          <CardSkeleton className="h-10 w-10" />
          <View className="flex-1">
            <CardSkeleton className="h-4 w-24" />
            <CardSkeleton className="mt-2 h-3 w-36" />
          </View>
          <CardSkeleton className="h-7 w-14" />
        </View>
      ))}
    </View>
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
  const translateXOffset = useRef(0)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(Math.max(-DELETE_REVEAL_WIDTH, Math.min(0, translateXOffset.current + gestureState.dx)))
      },
      onPanResponderRelease: (_, gestureState) => {
        const nextTranslateX = translateXOffset.current + gestureState.dx
        const shouldRevealDelete = nextTranslateX < -DELETE_REVEAL_WIDTH / 2
        translateXOffset.current = shouldRevealDelete ? -DELETE_REVEAL_WIDTH : 0

        Animated.spring(translateX, {
          toValue: translateXOffset.current,
          useNativeDriver: true,
        }).start()
      },
    }),
  ).current

  const handleDelete = () => {
    translateXOffset.current = 0
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start(onDelete)
  }

  return (
    <View className="overflow-hidden rounded-xl">
      <View className="absolute inset-y-0 right-0 w-18 items-center justify-center">
        <Pressable
          onPress={handleDelete}
          className="h-10 w-10 items-center justify-center rounded-xl border border-red-500/25 bg-white active:bg-red-100"
        >
          <Trash2 color="#DC2626" size={17} strokeWidth={2.4} />
        </Pressable>
      </View>

      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        <View className="flex-row items-center gap-3 rounded-xl border border-black/10 bg-white p-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-black/5">
            <Text className="text-sm font-black text-black">{index + 1}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-black text-black">Member {index + 1}</Text>
              {isConnectedWallet ? <CheckCircle2 color="#090A0F" size={14} strokeWidth={2.4} /> : null}
            </View>
            <Text className="mt-1 text-sm font-bold text-black/45">{shortenAddress(member)}</Text>
          </View>
          <View className="rounded-xl bg-black/5 px-2 py-1">
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
