import { GestureResponderEvent } from "react-native"

export type AddMultisigButtonProps = {
  isBusy?: boolean
  onCreate?: (event: GestureResponderEvent) => void
  onImport: (event: GestureResponderEvent) => void
}

export type MenuItem = 'Proposals' | 'Assets' | 'NFTs'

export type MultisigListItem = {
  name: string
  address: string
}

export type ImportableSquadsMultisig = MultisigListItem & {
  threshold: number
  members: string[]
}

export type SquadsProposalData = {
  address: string
  transactionIndex: bigint
  //title: string
  status: string
  approvals: number
  rejects: number
  cancellations: number
  //timestamp:string
  hasApproved: boolean
}

export type SquadsMultisigData = {
  address: string
  vaultAddress: string
  balanceLamports: number
  threshold: number
  members: string[]
  transactionIndex: bigint
  proposals: SquadsProposalData[]
}