import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"

export function formatSol(lamports: number) {
  const sol = lamports / LAMPORTS_PER_SOL
  return `${sol.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`
}

export function shortenAddress(address: string, size:number = 4) {
  return `${address.slice(0, size)}...${address.slice(-size)}`
}

export function toPublicKey(address: string) {
  return new PublicKey(address)
}