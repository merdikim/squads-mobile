import '../global.css'

import { Slot } from 'expo-router'
import { AppIdentity, createSolanaDevnet, MobileWalletProvider } from '@wallet-ui/react-native-kit'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const cluster = createSolanaDevnet()
const identity: AppIdentity = { name: 'Kit Expo Uniwind' }

export default function Layout() {
  return (
    <MobileWalletProvider cluster={cluster} identity={identity}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <Slot />
      </SafeAreaProvider>
    </MobileWalletProvider>
  )
}
