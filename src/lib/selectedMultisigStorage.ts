import AsyncStorage from '@react-native-async-storage/async-storage'

const SELECTED_MULTISIG_STORAGE_KEY = 'squads-mobile:selected-multisig'

export async function getSelectedMultisigAddress() {
  return (await AsyncStorage.getItem(SELECTED_MULTISIG_STORAGE_KEY)) ?? ''
}

export async function saveSelectedMultisigAddress(address: string) {
  await AsyncStorage.setItem(SELECTED_MULTISIG_STORAGE_KEY, address)
}

export async function clearSelectedMultisigAddress() {
  await AsyncStorage.removeItem(SELECTED_MULTISIG_STORAGE_KEY)
}
