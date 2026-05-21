import '../global.css'

import { Slot } from 'expo-router'
import { AppIdentity, createSolanaMainnet, MobileWalletProvider } from '@wallet-ui/react-native-kit'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { APP_NAME, RPC_URL } from '../constants'

const cluster = createSolanaMainnet(RPC_URL)
const identity: AppIdentity = { name: APP_NAME }

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
