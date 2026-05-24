import '../global.css'

import { Slot } from 'expo-router'
import { useFonts } from 'expo-font'
import { AppIdentity, MobileWalletProvider } from '@wallet-ui/react-native-web3js'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { APP_BACKGROUND_COLOR, APP_NAME } from '../constants'
import { applyManropeFontDefaults, manropeFonts } from '../lib/fonts'
import { clusterApiUrl } from '@solana/web3.js'

const identity: AppIdentity = { name: APP_NAME, icon: require('../assets/logo.png') }

const queryClient = new QueryClient()

applyManropeFontDefaults()

export default function Layout() {
  const [fontsLoaded] = useFonts(manropeFonts)

  if (!fontsLoaded) {
    return null
  }

  const endpoint = clusterApiUrl('mainnet-beta')

  return (
    <MobileWalletProvider chain="solana:mainnet" endpoint={endpoint} identity={identity}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: APP_BACKGROUND_COLOR }}>
        <QueryClientProvider client={queryClient}>
          <Slot />
        </QueryClientProvider>
      </SafeAreaProvider>
    </MobileWalletProvider>
  )
}
