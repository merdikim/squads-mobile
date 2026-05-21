import { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native'
import useImportMultisig from '../../hooks/useImportMultisig'
import { ImportableSquadsMultisig, MultisigListItem } from '../../types'
import { Accessibility } from 'lucide-react-native'

type ImportMultisigModalProps = {
  visible: boolean
  onClose: () => void
}

export function ImportMultisigModal({ visible, onClose }: ImportMultisigModalProps) {
  const [address, setAddress] = useState('')
  const [importedMultisig, setImportedMultisig] = useState<ImportableSquadsMultisig | undefined>()
  const { isImporting, setIsImporting, multisigError, setMultisigError, handleImportMultisig , handleSaveMultisig} = useImportMultisig(address)

  useEffect(() => {
    if (!visible) {
      setAddress('')
      setMultisigError('')
      setImportedMultisig(undefined)
      setIsImporting(false)
    }
  }, [visible])


  const handleImport = async () => {
    try {
      const multisig = await handleImportMultisig(address.trim())
      setImportedMultisig(multisig)
    } catch (error) {
      setMultisigError(error instanceof Error ? error.message : 'Unable to import this multisig.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleDone = async () => {
    if (!importedMultisig) return
    try {
      await handleSaveMultisig(importedMultisig)
      onClose()
    } catch (error) {
      setMultisigError(error instanceof Error ? error.message : 'Unable to save this multisig.')
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/30 px-4 pb-6" onPress={onClose}>
        <Pressable className="rounded-lg bg-white p-5" onPress={(event) => event.stopPropagation()}>
          <Text className="text-xl font-black text-black">Import Multisig</Text>
          <Text className="mt-2 text-sm leading-6 text-black/60">
            Enter the Squads multisig account address. We will fetch the account before saving it.
          </Text>

          <View className="mt-5">
            <Text className="text-sm font-bold text-black">Multisig account address</Text>
            <TextInput
              value={address}
              onChangeText={(value) => {
                setAddress(value)
                setImportedMultisig(undefined)
                setMultisigError('')
              }}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Enter multisig address"
              placeholderTextColor="rgba(0,0,0,0.35)"
              className="mt-2 min-h-12 rounded-lg border border-black/15 px-3 text-sm text-black"
            />
            {multisigError ? <Text className="mt-2 text-xs font-bold text-red-600">{multisigError}</Text> : null}
          </View>

          {importedMultisig ? (
            <View className="mt-4 rounded-lg border border-black/10 bg-black/5 p-3">
              <Text className="text-xs font-bold uppercase text-black/45">Imported</Text>
              <Text className="mt-1 text-base font-black text-black">{importedMultisig.name}</Text>
              <Text className="mt-1 text-sm text-black/55">
                {importedMultisig.members?.length ?? 0} members, threshold {importedMultisig.threshold ?? 1}
              </Text>
            </View>
          ) : null}

          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="h-12 flex-1 items-center justify-center rounded-lg border border-black/15 active:bg-black/5"
            >
              <Text className="text-base font-bold text-black">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={importedMultisig ? handleDone : () => void handleImport()}
              disabled={isImporting}
              className="h-12 flex-1 items-center justify-center rounded-lg bg-black active:bg-black/80"
            >
              { isImporting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-base font-bold text-white">
                  {importedMultisig ? 'Done' : 'Import'}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
