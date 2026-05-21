import AsyncStorage from '@react-native-async-storage/async-storage'

export type StoredMultisig = {
  name: string
  address: string
}

const MULTISIGS_STORAGE_KEY = 'squads-mobile:multisigs'

function isStoredMultisig(value: unknown): value is StoredMultisig {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<StoredMultisig>
  return typeof candidate.name === 'string' && typeof candidate.address === 'string'
}

export async function getStoredMultisigs() {
  const storedValue = await AsyncStorage.getItem(MULTISIGS_STORAGE_KEY)

  if (!storedValue) {
    return []
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isStoredMultisig)
  } catch {
    return []
  }
}

export async function saveMultisigToStorage(multisig: Omit<StoredMultisig, 'importedAt'>) {
  const storedMultisigs = await getStoredMultisigs()
  const nextMultisig: StoredMultisig = {
    ...multisig,
  }
  const nextMultisigs = [
    nextMultisig,
    ...storedMultisigs.filter((storedMultisig) => storedMultisig.address !== multisig.address),
  ]

  await AsyncStorage.setItem(MULTISIGS_STORAGE_KEY, JSON.stringify(nextMultisigs))

  return nextMultisig
}

export async function clearMultisigsFromStorage() {
  await AsyncStorage.removeItem(MULTISIGS_STORAGE_KEY)
}
