import { StatusBar } from 'expo-status-bar'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Animated, FlatList, PanResponder, Pressable, Text, View } from 'react-native'
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
import { APP_BACKGROUND_COLOR } from '../../constants'

const DELETE_REVEAL_WIDTH = 72
const keyExtractor = (member: string) => member

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
  const selectedMultisig = multisigs.find((multisig) => multisig.address === storedSelectedMultisigKey)
  const selectedMultisigAddress = selectedMultisig?.address ?? storedSelectedMultisigKey
  const members = useMemo(() => {
    return selectedMultisig?.members ?? []
  }, [selectedMultisig])
  const openAddMemberModal = useCallback(() => {
    setIsAddMemberModalOpen(true)
  }, [])
  const closeAddMemberModal = useCallback(() => {
    setIsAddMemberModalOpen(false)
  }, [])
  const closeDeleteMemberModal = useCallback(() => {
    setMemberToDelete('')
  }, [])
  const renderMember = useCallback(
    ({ item: member, index }: { item: string; index: number }) => {
      const isConnectedWallet = member === walletAddress

      return (
        <View className="mb-3">
          <MemberCard
            index={index}
            member={member}
            isConnectedWallet={isConnectedWallet}
            onDelete={() => setMemberToDelete(member)}
          />
        </View>
      )
    },
    [walletAddress],
  )
  const listHeader = useMemo(
    () => (
      <>
        <View className="flex-row items-center justify-between gap-3 mb-8">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-mono-extrabold text-black">Members</Text>
            {isMultisigsLoading ? (
              <CardSkeleton className="h-5 w-6 rounded-md" />
            ) : (
              <Text className="text-base font-mono-extrabold text-black">({members.length})</Text>
            )}
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={openAddMemberModal}
              className="h-10 w-10 items-center justify-center rounded-xl bg-black active:bg-black/80"
            >
              <Plus color="#FFFFFF" size={17} strokeWidth={2.4} />
            </Pressable>
          </View>
        </View>

        {isMultisigsLoading ? (
          <MembersLoadingSkeleton />
        ) : members.length === 0 ? (
          <Text className="mt-3 text-sm leading-6 text-black/65">
            Members will appear here after a multisig is selected.
          </Text>
        ) : null}
      </>
    ),
    [isMultisigsLoading, members.length, openAddMemberModal],
  )
  const listFooter = useMemo(
    () => (
      <>
        <StatusBar style="dark" />
        <AddMemberModal
          visible={isAddMemberModalOpen}
          members={members}
          multisigAddress={selectedMultisigAddress}
          onClose={closeAddMemberModal}
        />
        <DeleteMemberModal
          member={memberToDelete}
          members={members}
          multisigAddress={selectedMultisigAddress}
          onClose={closeDeleteMemberModal}
        />
      </>
    ),
    [
      closeAddMemberModal,
      closeDeleteMemberModal,
      isAddMemberModalOpen,
      memberToDelete,
      members,
      selectedMultisigAddress,
    ],
  )

  if (!selectedMultisigAddress) {
    return <NoMembersScreen />
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: APP_BACKGROUND_COLOR }}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32 }}
        data={isMultisigsLoading ? [] : members}
        keyExtractor={keyExtractor}
        renderItem={renderMember}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

function MembersLoadingSkeleton() {
  const memberRows = Array.from({ length: 4 })

  return (
    <View className="mt-4 gap-3">
      {memberRows.map((_, index) => (
        <View key={index} className="flex-row items-center gap-3 rounded-xl bg-neutral-100/60 p-3 shadow-xs">
          <CardSkeleton className="h-10 w-10 rounded-xl" />
          <View className="flex-1">
            <CardSkeleton className="h-4 w-24 rounded-md" />
            <CardSkeleton className="mt-2 h-4 w-28 rounded-md" />
          </View>
          <CardSkeleton className="h-7 w-14 rounded-xl" />
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
  const canDelete = !isConnectedWallet
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        canDelete && Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
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
    onDelete()
    translateXOffset.current = 0
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start()
  }
  const deleteOpacity = translateX.interpolate({
    inputRange: [-DELETE_REVEAL_WIDTH, -12, 0],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  })

  return (
    <View className="overflow-hidden rounded-xl bg-neutral-100/60 shadow-xs">
      {canDelete ? (
        <Animated.View
          className="absolute inset-y-0 right-0 w-18 items-center justify-center"
          style={{ opacity: deleteOpacity }}
        >
          <Pressable
            onPress={handleDelete}
            className="h-10 w-10 items-center justify-center rounded-xl border border-red-500/25 bg-white active:bg-red-100"
          >
            <Trash2 color="#DC2626" size={17} strokeWidth={2.4} />
          </Pressable>
        </Animated.View>
      ) : null}

      <Animated.View style={{ transform: [{ translateX }] }} {...(canDelete ? panResponder.panHandlers : {})}>
        <View className="flex-row items-center gap-3 rounded-xl bg-neutral-100/60 p-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-black/5">
            <Text className="text-sm font-mono-extrabold text-black">{index + 1}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-mono-extrabold text-black">Member {index + 1}</Text>
              {isConnectedWallet ? <CheckCircle2 color="#090A0F" size={14} strokeWidth={2.4} /> : null}
            </View>
            <Text className="mt-1 text-sm font-mono-bold text-black/45">{shortenAddress(member)}</Text>
          </View>
          <View className="rounded-xl bg-black/5 px-2 py-1">
            <Text className="text-xs font-mono-bold text-black/60">{isConnectedWallet ? 'You' : 'Signer'}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  )
}

function NoMembersScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-6" style={{ backgroundColor: APP_BACKGROUND_COLOR }}>
      <UsersRound color="#090A0F" size={48} strokeWidth={1.5} />
      <Text className="text-center text-lg font-mono-bold text-black">No Members</Text>
      <Text className="text-center text-sm text-black/65">
        Select a multisig from the home screen to view its members.
      </Text>
      <StatusBar style="dark" />
    </View>
  )
}
