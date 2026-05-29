export type MenuItem = 'Proposals' | 'Coins' | 'NFTs'

export type SquadsApiMultisigMember = {
  key: string
  permissions?: SquadsApiPermissions
}

export type SquadsApiPermissions = {
  mask: number
}

export type SquadsApiMultisig = {
  address: string
  defaultVault: string
  account: {
    bump: number
    configAuthority: string
    createKey: string
    members: SquadsApiMultisigMember[]
    rentCollector: string | null
    staleTransactionIndex: string
    threshold: number
    timeLock: number
    transactionIndex: string
  }
  metadata: {
    createdAt: number
    description: string
    image: string
    name: string
  } | null
}

export type SquadsApiMultisigsResponse = SquadsApiMultisig[]

export type SquadsApiBalance = {
  amount: number
  pricePerUnit: number
  uiAmount: number
  uiPrice: number
  source: string
  mint: string
  symbol: string
  decimals: number
  wrapped: boolean
  logoUri?: string
  name: string
}

export type SquadsApiStakingBalances = {
  stakingAccountsCount: number
  totalStakingBalanceSol: number
  totalStakingBalanceUsd: number
}

export type SquadsApiBalancesResponse = {
  balances: SquadsApiBalance[]
  staking: SquadsApiStakingBalances
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
  uri?: string
  collection?: {
    name?: string
    address?: string
  } | null
  metadata?: {
    name?: string
    symbol?: string
    image?: string
    imageUri?: string
    uri?: string
    [key: string]: unknown
  } | null
  [key: string]: unknown
}

export type SquadsApiNftsResponse = {
  next_cursor: string | null
  prev_cursor: string | null
  nfts: SquadsApiNft[]
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
  hasApproved: boolean
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
  newMember?: SquadsApiMultisigMember
  oldMember?: string
  [key: string]: unknown
}

export type SquadsApiTransactionMessage = {
  accountKeys?: string[]
  addressTableLookups?: unknown[]
  instructions?: unknown[]
  numSigners?: number
  numWritableNonSigners?: number
  numWritableSigners?: number
}

export type SquadsApiTransactionAccount = {
  actions?: SquadsApiTransactionAction[]
  creator: string
  index: number
  message?: SquadsApiTransactionMessage
  multisig: string
  subaccountIndex?: number
}

export type SquadsApiTransactionMetadataInfo = {
  createdSignature: string
  createdTime: number
  memo: string | null
  thresholdAtCreation: number
  votersAtCreation: number
}

export type SquadsApiTransactionMultisigMetadata = {
  autoReclaim: boolean
  cosigned: boolean
  createdAt: string
  description: string
  imageUrl: string
  multisigAddress: string
  name: string
  privacy: boolean
  updatedAt: string
}

export type SquadsApiTransactionPrevConfig = {
  address: string
  bump: number
  configAuthority: string
  createKey: string
  members: SquadsApiMultisigMember[]
  metadata: SquadsApiTransactionMultisigMetadata
  signature: string
  slot: number
  staleTransactionIndex: number
  threshold: number
  timeLock: number
  transactionIndex: number
}

export type SquadsApiTransactionMetadata = {
  info: SquadsApiTransactionMetadataInfo
  prevConfig?: SquadsApiTransactionPrevConfig
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
  spendingLimitChanges: unknown[]
}

export type SquadsApiTransaction = {
  account: SquadsApiTransactionAccount
  address: string
  isReclaimed: boolean
  metadata: SquadsApiTransactionMetadata
  type: string
  unclaimedRent: number
}

export type SquadsApiProposalRow = {
  category: string
  proposal: SquadsApiProposal
  transaction: SquadsApiTransaction
}

export type SquadsApiProposalsResponse = {
  page: number
  total_entries: number
  total_pages: number
  transactions: SquadsApiProposalRow[]
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
