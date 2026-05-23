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

export type SquadsProposalData = {
  address: string
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
  [key: string]: unknown
}

export type SquadsApiTransactionAccount = {
  actions: SquadsApiTransactionAction[]
  creator: string
  index: number
  multisig: string
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
  balanceLamports: number
  threshold: number
  members: string[]
  transactionIndex: bigint
  proposals: SquadsProposalData[]
}

export type Multisig = SquadsMultisigData & {
  name: string
  imageUri?: string
}
