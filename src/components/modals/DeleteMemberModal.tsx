import { Modal, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { shortenAddress } from '../../utils'

type DeleteMemberModalProps = {
  member: string
  onClose: () => void
  onDeleteMember: (member: string) => void
}

export function DeleteMemberModal({
  member,
  onClose,
  onDeleteMember,
}: DeleteMemberModalProps) {
  const handleDeleteMember = () => {
    if (!member) return

    onDeleteMember(member)
    onClose()
  }

  return (
    <Modal visible={!!member} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <Pressable className="flex-1 justify-end bg-black/30 px-4 pb-6" onPress={onClose}>
          <Pressable className="rounded-xl bg-white p-5" onPress={(event) => event.stopPropagation()}>
            <Text className="text-xl font-black text-black">Delete Member</Text>
            <Text className="mt-2 text-sm leading-6 text-black/60">
              Remove {member ? shortenAddress(member) : 'this member'} from this multisig?
            </Text>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                onPress={onClose}
                className="h-12 flex-1 items-center justify-center rounded-xl border border-black/15 active:bg-black/5"
              >
                <Text className="text-base font-bold text-black">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteMember}
                className="h-12 flex-1 items-center justify-center rounded-xl bg-red-600 active:bg-red-700"
              >
                <Text className="text-base font-bold text-white">Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </SafeAreaView>
    </Modal>
  )
}
