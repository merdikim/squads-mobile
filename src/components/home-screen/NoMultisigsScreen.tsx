import { Image, Pressable, Text, View } from 'react-native'
import { Plus, Upload } from 'lucide-react-native'
import { useState } from 'react'
import { ImportMultisigModal } from '../modals/ImportMultisigModal'
import CreateMultisigModal from '../modals/CreateMultisigModal'

type NoMultisigsScreenProps = {
  isBusy?: boolean
}

export function NoMultisigsScreen({ isBusy }: NoMultisigsScreenProps) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false)
  
  return (
    <View className="flex-1">
    <View className="flex-1 px-5 pt-8">
      <View className="flex-1 justify-center">
        <View className="items-center">
          <View className="h-20 w-20 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-lg">
            <Image source={require('../../assets/logo.png')} className="h-11 w-11" resizeMode="contain" />
          </View>

          <Text className="mt-8 text-center text-3xl font-black leading-10 text-black">Start with a multisig</Text>
          <Text className="mt-3 max-w-80 text-center text-base leading-7 text-black/55">
            Create a new vault for your team or import an existing Squads multisig to manage assets and proposals.
          </Text>
        </View>

        <View className="mt-10 gap-3">
          <Pressable
            onPress={() => setIsCreatingModalOpen(true)}
            disabled={isBusy}
            className="h-14 flex-row items-center justify-center rounded-lg bg-black px-5 active:bg-black/80"
          >
            <Plus color="#FFFFFF" size={18} strokeWidth={2.4} />
            <Text className="ml-2 text-base font-black text-white">{isBusy ? 'Working...' : 'Create Multisig'}</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsImportModalOpen(true)}
            disabled={isBusy}
            className="h-14 flex-row items-center justify-center rounded-lg border border-black/15 bg-white px-5 active:bg-black/5"
          >
            <Upload color="#090A0F" size={18} strokeWidth={2.4} />
            <Text className="ml-2 text-base font-black text-black">Import Multisig</Text>
          </Pressable>
        </View>
      </View>
    </View>
    <ImportMultisigModal
      visible={isImportModalOpen}
      onClose={() => setIsImportModalOpen(false)}
    />
    <CreateMultisigModal
      visible={isCreatingModalOpen}
      onClose={() => setIsCreatingModalOpen(false)}
    />
    </View>
  )
}
