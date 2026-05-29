import { useEffect, useState } from 'react'
import { Image, View } from 'react-native'
import { ArrowLeft, ImagePlus, Plus, X } from 'lucide-react-native'
import { SmoothModal } from './SmoothModal'
import { AppText, Button, IconButton, ModalHeader, TextField } from '../ui'

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
      <ModalHeader
        title="Create Multisig"
        description={
          step === 'details'
            ? 'Name your multisig and add an image before inviting members.'
            : 'Add the wallet addresses that should be members of this multisig.'
        }
        action={
          step === 'members' ? (
            <IconButton accessibilityLabel="Back to multisig details" onPress={() => setStep('details')}>
              <ArrowLeft color="#090A0F" size={17} strokeWidth={2.4} />
            </IconButton>
          ) : null
        }
      />

      {step === 'details' ? (
        <View className="mt-5 gap-5">
          <View>
            <AppText className="font-mono-bold">Multisig name</AppText>
            <TextField
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholder="Enter multisig name"
              className="mt-2"
            />
          </View>

          <View>
            <AppText className="font-mono-bold">Image</AppText>
            <View className="mt-2 flex-row items-center gap-3">
              <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-black/5">
                {imageUri.trim() ? (
                  <Image source={{ uri: imageUri.trim() }} className="h-full w-full" resizeMode="cover" />
                ) : (
                  <ImagePlus color="rgba(0,0,0,0.45)" size={22} strokeWidth={2.4} />
                )}
              </View>
              <TextField
                value={imageUri}
                onChangeText={setImageUri}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter image URL"
                className="flex-1"
              />
            </View>
          </View>
        </View>
      ) : (
        <View className="mt-5 gap-3">
          {members.map((member, index) => (
            <View key={index} className="flex-row items-center gap-2">
              <TextField
                value={member}
                onChangeText={(value) => updateMember(index, value)}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter member address"
                className="flex-1"
              />
              <IconButton
                accessibilityLabel={`Remove member ${index + 1}`}
                onPress={() => removeMember(index)}
                className="h-12 w-12"
              >
                <X color="#090A0F" size={17} strokeWidth={2.4} />
              </IconButton>
            </View>
          ))}

          <Button
            onPress={addMember}
            variant="secondary"
            leftIcon={<Plus color="#090A0F" size={17} strokeWidth={2.4} />}
          >
            Add Member
          </Button>
        </View>
      )}

      <View className="mt-6 flex-row gap-3">
        <Button onPress={onClose} variant="secondary" className="flex-1">
          Cancel
        </Button>
        <Button
          onPress={step === 'details' ? () => setStep('members') : handleCreate}
          disabled={step === 'details' ? !canGoNext : !canCreate}
          className="flex-1"
        >
          {step === 'details' ? 'Next' : 'Create'}
        </Button>
      </View>
    </SmoothModal>
  )
}

export default CreateMultisigModal
