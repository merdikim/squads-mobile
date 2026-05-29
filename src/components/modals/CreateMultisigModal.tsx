import { useEffect, useState } from 'react'
import { Image, Pressable, Text, TextInput, View } from 'react-native'
import { ArrowLeft, ImagePlus, Plus, X } from 'lucide-react-native'
import { SmoothModal } from './SmoothModal'

type CreateMultisigPayload = {
  name: string
  imageUri: string
  members: string[]
}

type CreateMultisigModalProps = {
  visible: boolean
  onClose: () => void
  onCreate?: (payload: CreateMultisigPayload) => void
}

export function CreateMultisigModal({ visible, onClose, onCreate }: CreateMultisigModalProps) {
  const [step, setStep] = useState<'details' | 'members'>('details')
  const [name, setName] = useState('')
  const [imageUri, setImageUri] = useState('')
  const [members, setMembers] = useState([''])

  useEffect(() => {
    if (!visible) {
      setStep('details')
      setName('')
      setImageUri('')
      setMembers([''])
    }
  }, [visible])

  const addMember = () => {
    setMembers((currentMembers) => [...currentMembers, ''])
  }

  const updateMember = (index: number, value: string) => {
    setMembers((currentMembers) =>
      currentMembers.map((member, memberIndex) => (memberIndex === index ? value : member)),
    )
  }

  const removeMember = (index: number) => {
    setMembers((currentMembers) =>
      currentMembers.length === 1 ? [''] : currentMembers.filter((_, memberIndex) => memberIndex !== index),
    )
  }

  const canGoNext = name.trim().length > 0
  const canCreate = typeof onCreate === 'function'

  const handleCreate = () => {
    if (!onCreate) {
      return
    }

    onCreate({
      name: name.trim(),
      imageUri: imageUri.trim(),
      members: members.map((member) => member.trim()).filter(Boolean),
    })
  }

  return (
    <SmoothModal visible={visible} onClose={onClose}>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-xl font-mono-extrabold text-black">Create Multisig</Text>
          <Text className="mt-2 text-sm leading-6 text-black/60">
            {step === 'details'
              ? 'Name your multisig and add an image before inviting members.'
              : 'Add the wallet addresses that should be members of this multisig.'}
          </Text>
        </View>

        {step === 'members' ? (
          <Pressable
            onPress={() => setStep('details')}
            className="h-10 w-10 items-center justify-center rounded-xl border border-black/10 active:bg-black/5"
          >
            <ArrowLeft color="#090A0F" size={17} strokeWidth={2.4} />
          </Pressable>
        ) : null}
      </View>

      {step === 'details' ? (
        <View className="mt-5 gap-5">
          <View>
            <Text className="text-sm font-mono-bold text-black">Multisig name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Enter multisig name"
              placeholderTextColor="rgba(0,0,0,0.35)"
              className="mt-2 min-h-12 rounded-xl border border-black/15 px-3 text-sm text-black"
            />
          </View>

          <View>
            <Text className="text-sm font-mono-bold text-black">Image</Text>
            <View className="mt-2 flex-row items-center gap-3">
              <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-black/5">
                {imageUri.trim() ? (
                  <Image source={{ uri: imageUri.trim() }} className="h-full w-full" resizeMode="cover" />
                ) : (
                  <ImagePlus color="rgba(0,0,0,0.45)" size={22} strokeWidth={2.4} />
                )}
              </View>
              <TextInput
                value={imageUri}
                onChangeText={setImageUri}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter image URL"
                placeholderTextColor="rgba(0,0,0,0.35)"
                className="min-h-12 flex-1 rounded-xl border border-black/15 px-3 text-sm text-black"
              />
            </View>
          </View>
        </View>
      ) : (
        <View className="mt-5 gap-3">
          {members.map((member, index) => (
            <View key={index} className="flex-row items-center gap-2">
              <TextInput
                value={member}
                onChangeText={(value) => updateMember(index, value)}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter member address"
                placeholderTextColor="rgba(0,0,0,0.35)"
                className="min-h-12 flex-1 rounded-xl border border-black/15 px-3 text-sm text-black"
              />
              <Pressable
                onPress={() => removeMember(index)}
                className="h-12 w-12 items-center justify-center rounded-xl border border-black/10 active:bg-black/5"
              >
                <X color="#090A0F" size={17} strokeWidth={2.4} />
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={addMember}
            className="h-12 flex-row items-center justify-center rounded-xl border border-black/15 active:bg-black/5"
          >
            <Plus color="#090A0F" size={17} strokeWidth={2.4} />
            <Text className="ml-2 text-sm font-mono-extrabold text-black">Add Member</Text>
          </Pressable>
        </View>
      )}

      <View className="mt-6 flex-row gap-3">
        <Pressable
          onPress={onClose}
          className="h-12 flex-1 items-center justify-center rounded-xl border border-black/15 active:bg-black/5"
        >
          <Text className="text-base font-mono-bold text-black">Cancel</Text>
        </Pressable>
        <Pressable
          onPress={step === 'details' ? () => setStep('members') : handleCreate}
          disabled={step === 'details' ? !canGoNext : !canCreate}
          className={`h-12 flex-1 items-center justify-center rounded-xl ${
            (step === 'details' && !canGoNext) || (step === 'members' && !canCreate)
              ? 'bg-black/25'
              : 'bg-black active:bg-black/80'
          }`}
        >
          <Text className="text-base font-mono-bold text-white">{step === 'details' ? 'Next' : 'Create'}</Text>
        </Pressable>
      </View>
    </SmoothModal>
  )
}

export default CreateMultisigModal
