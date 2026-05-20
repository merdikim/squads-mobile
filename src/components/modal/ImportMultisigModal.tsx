import { isAddress } from '@solana/kit'
import { useEffect, useState } from 'react'
import { Modal, Pressable, Text, TextInput, View } from 'react-native'

type ImportMultisigModalProps = {
  visible: boolean
  existingAddresses: string[]
  onClose: () => void
  onImport: (multisig: { address: string; name?: string }) => void
}

export function ImportMultisigModal({ visible, existingAddresses, onClose, onImport }: ImportMultisigModalProps) {
  const [address, setAddress] = useState('')
  const [name, setName] = useState('')
  const [addressError, setAddressError] = useState('')
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    if (!visible) {
      setAddress('')
      setName('')
      setAddressError('')
      setNameError('')
    }
  }, [visible])

  const validateAddress = (value: string) => {
    const trimmedAddress = value.trim()

    if (!trimmedAddress) {
      return 'Solana address is required.'
    }

    if (!isAddress(trimmedAddress)) {
      return 'Enter a valid Solana address.'
    }

    if (existingAddresses.includes(trimmedAddress)) {
      return 'This multisig has already been imported.'
    }

    return ''
  }

  const validateName = (value: string) => {
    if (value.trim().length > 40) {
      return 'Name must be 40 characters or fewer.'
    }

    return ''
  }

  const handleImport = () => {
    const nextAddressError = validateAddress(address)
    const nextNameError = validateName(name)

    setAddressError(nextAddressError)
    setNameError(nextNameError)

    if (nextAddressError || nextNameError) {
      return
    }

    onImport({
      address: address.trim(),
      name: name.trim() || undefined,
    })
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/30 px-4 pb-6" onPress={onClose}>
        <Pressable className="rounded-lg bg-white p-5" onPress={(event) => event.stopPropagation()}>
          <Text className="text-xl font-black text-black">Import Multisig</Text>
          <Text className="mt-2 text-sm leading-6 text-black/60">
            Add an existing multisig by entering its Solana address.
          </Text>

          <View className="mt-5">
            <Text className="text-sm font-bold text-black">Solana address</Text>
            <TextInput
              value={address}
              onChangeText={(value) => {
                setAddress(value)
                if (addressError) {
                  setAddressError(validateAddress(value))
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Enter multisig address"
              placeholderTextColor="rgba(0,0,0,0.35)"
              className="mt-2 min-h-12 rounded-lg border border-black/15 px-3 text-sm text-black"
            />
            {addressError ? <Text className="mt-2 text-xs font-bold text-red-600">{addressError}</Text> : null}
          </View>

          <View className="mt-4">
            <Text className="text-sm font-bold text-black">Name optional</Text>
            <TextInput
              value={name}
              onChangeText={(value) => {
                setName(value)
                if (nameError) {
                  setNameError(validateName(value))
                }
              }}
              placeholder="Give it a display name"
              placeholderTextColor="rgba(0,0,0,0.35)"
              className="mt-2 min-h-12 rounded-lg border border-black/15 px-3 text-sm text-black"
            />
            {nameError ? <Text className="mt-2 text-xs font-bold text-red-600">{nameError}</Text> : null}
          </View>

          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="h-12 flex-1 items-center justify-center rounded-lg border border-black/15 active:bg-black/5"
            >
              <Text className="text-base font-bold text-black">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleImport}
              className="h-12 flex-1 items-center justify-center rounded-lg bg-black active:bg-black/80"
            >
              <Text className="text-base font-bold text-white">Import</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
