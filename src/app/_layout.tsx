import '../global.css'

import { Slot } from 'expo-router'
import { useFonts } from 'expo-font'
import { AppIdentity, MobileWalletProvider } from '@wallet-ui/react-native-web3js'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { APP_NAME, RPC_URL } from '../constants'
import { applyManropeFontDefaults, manropeFonts } from '../lib/fonts'

const identity: AppIdentity = { name: APP_NAME }

const queryClient = new QueryClient()

applyManropeFontDefaults()

export default function Layout() {
  const [fontsLoaded] = useFonts(manropeFonts)

  if (!fontsLoaded) {
    return null
  }

  return (
    <MobileWalletProvider chain="mainnet-beta" endpoint={RPC_URL} identity={identity}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <Slot />
        </QueryClientProvider>
      </SafeAreaProvider>
    </MobileWalletProvider>
  )
}
