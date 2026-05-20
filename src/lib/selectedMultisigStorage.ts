import AsyncStorage from '@react-native-async-storage/async-storage'

const SELECTED_MULTISIG_STORAGE_KEY = 'squads-mobile:selected-multisig'

export async function getSelectedMultisigAddress() {
  const storedValue = await AsyncStorage.getItem(SELECTED_MULTISIG_STORAGE_KEY)

  return storedValue || ''
}

export async function saveSelectedMultisigAddress(address: string) {
  await AsyncStorage.setItem(SELECTED_MULTISIG_STORAGE_KEY, address)

  return address
}
