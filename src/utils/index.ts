import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"

export function formatSol(lamports: number) {
  const sol = lamports / LAMPORTS_PER_SOL
  return `${sol.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`
}

export function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function toPublicKey(address: string) {
  return new PublicKey(address)
}