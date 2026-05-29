import '../global.css'

import { useEffect } from 'react'
import { Slot } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { AppIdentity, MobileWalletProvider } from '@wallet-ui/react-native-web3js'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { APP_BACKGROUND_COLOR, APP_NAME, RPC_URL } from '../constants'
import { appFonts, applyAppFontDefaults } from '../lib/fonts'

const identity: AppIdentity = { name: APP_NAME, icon: require('../assets/logo.png') }

const queryClient = new QueryClient()

SplashScreen.preventAutoHideAsync().catch(() => null)
SplashScreen.setOptions({
  duration: 350,
  fade: true,
})

applyAppFontDefaults()

export default function Layout() {
  const [fontsLoaded] = useFonts(appFonts)

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <MobileWalletProvider chain="solana:mainnet" endpoint={RPC_URL} identity={identity}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: APP_BACKGROUND_COLOR }}>
        <QueryClientProvider client={queryClient}>
          <Slot />
        </QueryClientProvider>
      </SafeAreaProvider>
    </MobileWalletProvider>
  )
}
