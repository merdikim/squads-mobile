export type MenuItem = 'Proposals' | 'Coins' | 'NFTs'

export type SquadsApiMultisigMember = {
  key: string
}

export type SquadsApiMultisig = {
  address: string
  defaultVault: string
  account: {
    members: SquadsApiMultisigMember[]
    threshold: number
    transactionIndex: string
  }
  metadata: {
    image: string
    name: string
  } | null
}

export type SquadsApiBalance = {
  amount: number
  pricePerUnit: number
  uiAmount: number
  uiPrice: number
  source: string
  mint: string
  symbol: string
  decimals: number
  logoUri?: string
  name: string
}

export type SquadsBalanceData = {
  amount: number
  uiAmount: number
  uiPrice: number
  pricePerUnit: number
  source: string
  mint: string
  symbol: string
  decimals: number
  logoUri?: string
  name: string
}

export type SquadsApiNft = {
  mint?: string
  address?: string
  name?: string
  symbol?: string
  image?: string
  imageUri?: string
  collection?: {
    name?: string
  } | null
  metadata?: {
    name?: string
    symbol?: string
    image?: string
    imageUri?: string
  } | null
}

export type SquadsNftData = {
  id: string
  name: string
  symbol?: string
  imageUri?: string
  collectionName?: string
  mint?: string
}

export type SquadsProposalData = {
  address: string
  multisigAddress: string
  transactionIndex: bigint
  title: string
  memo?: string
  category: string
  status: string
  approvals: string[]
  rejects: string[]
  cancellations: string[]
  timestamp?: number
  memberAddress?: string
  relatedAddressLabel?: string
}

export type SquadsApiProposalStatus = {
  timestamp: number
  type: string
}

export type SquadsApiProposal = {
  approved: string[]
  cancelled: string[]
  multisig: string
  rejected: string[]
  status: SquadsApiProposalStatus
  transactionIndex: number
}

export type SquadsApiTransactionAction = {
  type: string
  newMember?: {
    key: string
  }
  oldMember?: string
}

export type SquadsApiTransactionAccount = {
  actions?: SquadsApiTransactionAction[]
  creator: string
}

export type SquadsApiTransactionMetadataInfo = {
  memo: string | null
}

export type SquadsApiTransactionMetadata = {
  info: SquadsApiTransactionMetadataInfo
  summary?: {
    data?: {
      destination?: string
      lamports?: number
      metadata?: {
        decimals?: number
        logo_url?: string
        mint?: string
        name?: string
        symbol?: string
      }
      operation?: string
      source?: string
    }
    type?: string
  }
}

export type SquadsApiTransaction = {
  account: SquadsApiTransactionAccount
  address: string
  metadata: SquadsApiTransactionMetadata
  type: string
}

export type SquadsApiProposalRow = {
  category: string
  proposal: SquadsApiProposal
  transaction: SquadsApiTransaction
}

export type SquadsMultisigData = {
  address: string
  vaultAddress: string
  threshold: number
  members: string[]
  transactionIndex: bigint
}

export type Multisig = SquadsMultisigData & {
  name: string
  imageUri?: string
}
