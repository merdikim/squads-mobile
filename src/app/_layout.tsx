import '../global.css'

import { Slot } from 'expo-router'
import { AppIdentity, MobileWalletProvider } from '@wallet-ui/react-native-web3js'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ToastManager from 'toastify-react-native'
import { APP_NAME, RPC_URL } from '../constants'

const identity: AppIdentity = { name: APP_NAME }

const queryClient = new QueryClient()

export default function Layout() {
  return (
    <MobileWalletProvider chain="mainnet-beta" endpoint={RPC_URL} identity={identity}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <Slot />
          <ToastManager position="bottom" bottomOffset={72} duration={2600} useModal={false} showCloseIcon={false} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </MobileWalletProvider>
  )
}
