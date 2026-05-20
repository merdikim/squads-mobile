import '../global.css'

import { Slot } from 'expo-router'
import { AppIdentity, createSolanaDevnet, MobileWalletProvider } from '@wallet-ui/react-native-kit'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const cluster = createSolanaDevnet()
const identity: AppIdentity = { name: 'Squads' }

const queryClient = new QueryClient()

export default function Layout() {
  return (
    <MobileWalletProvider cluster={cluster} identity={identity}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <Slot />
        </QueryClientProvider>
      </SafeAreaProvider>
    </MobileWalletProvider>
  )
}
