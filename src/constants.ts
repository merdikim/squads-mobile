export const APP_NAME = 'Squads'
export const APP_BACKGROUND_COLOR = '#ebedf0'

const configuredRpcUrl = process.env.EXPO_PUBLIC_SOLANA_RPC_URL?.trim()

if (!configuredRpcUrl && !__DEV__) {
  throw new Error('Missing EXPO_PUBLIC_SOLANA_RPC_URL')
}

export const RPC_URL = configuredRpcUrl
