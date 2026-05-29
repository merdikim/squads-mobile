import { PublicKey } from '@solana/web3.js'

export function shortenAddress(address: string, size: number = 4) {
  if (!address) {
    return ''
  }

  return `${address.slice(0, size)}...${address.slice(-size)}`
}

export function formatTimeAgo(timestamp?: number) {
  if (!timestamp) {
    return ''
  }

  const timestampMs = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp
  const secondsAgo = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000))
  const units = [
    { label: 'year', seconds: 365 * 24 * 60 * 60 },
    { label: 'month', seconds: 30 * 24 * 60 * 60 },
    { label: 'week', seconds: 7 * 24 * 60 * 60 },
    { label: 'day', seconds: 24 * 60 * 60 },
    { label: 'hour', seconds: 60 * 60 },
    { label: 'minute', seconds: 60 },
  ]

  for (const unit of units) {
    const value = Math.floor(secondsAgo / unit.seconds)

    if (value >= 1) {
      return `${value} ${unit.label}${value === 1 ? '' : 's'} ago`
    }
  }

  return 'just now'
}

export function toPublicKey(address: string | PublicKey) {
  return address instanceof PublicKey ? address : new PublicKey(address)
}

export function isSolanaAddress(address?: string) {
  if (!address) {
    return false
  }

  try {
    toPublicKey(address)
    return true
  } catch {
    return false
  }
}

export function addressesEqual(left?: string, right?: string) {
  return !!left && !!right && left === right
}
