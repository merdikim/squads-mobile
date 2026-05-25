import * as multisig from '@sqds/multisig'
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import { SquadsMultisigData, SquadsProposalData } from '../types'
import { RPC_URL } from '../constants'
import { toPublicKey } from '../utils'


const { Permission, Permissions } = multisig.types

export function createSquadsConnection() {
  return new Connection(RPC_URL, 'confirmed')
}

export async function fetchMultisigData({
  address,
  memberAddress,
}: {
  address: string
  memberAddress?: string
}): Promise<SquadsMultisigData> {
  try {
    const connection = createSquadsConnection()
    const multisigPda = toPublicKey(address)
    const { Multisig, Proposal } = multisig.accounts
    const account = await Multisig.fromAccountAddress(connection, multisigPda)
    const [vaultPda] = multisig.getVaultPda({ multisigPda, index: 0 })
    const balanceLamports = await connection.getBalance(vaultPda)
    const transactionIndex = BigInt(account.transactionIndex.toString())
    const currentMember = memberAddress ? toPublicKey(memberAddress) : null
    const proposals: SquadsProposalData[] = []
    const firstIndex = transactionIndex > 10n ? transactionIndex - 9n : 1n

    for (let index = firstIndex; index <= transactionIndex; index += 1n) {
      const [proposalPda] = multisig.getProposalPda({
        multisigPda,
        transactionIndex: index,
      })
      const proposal = await Proposal.fromAccountAddress(connection, proposalPda)

      proposals.unshift({
        address: proposalPda.toBase58(),
        multisigAddress: address,
        transactionIndex: index,
        title: `Vault transaction #${index.toString()}`,
        category: 'vault',
        status: proposal.status.__kind,
        approvals: proposal.approved.map((approvedMember) => approvedMember.toBase58()),
        rejects: proposal.rejected.map((rejectedMember) => rejectedMember.toBase58()),
        cancellations: proposal.cancelled.map((cancelledMember) => cancelledMember.toBase58()),
        //timestamp: proposal.status.timestamp,
        hasApproved: currentMember
          ? proposal.approved.some((approvedMember) => approvedMember.equals(currentMember))
          : false,
      })
    }

    return {
      address,
      vaultAddress: vaultPda.toBase58(),
      balanceLamports,
      threshold: account.threshold,
      members: account.members.map((member) => member.key.toBase58()),
      transactionIndex,
      proposals,
    }
  } catch (error) {
    console.error('Error fetching multisig Data:', error)
    throw new Error('Failed to fetch multisig Data')
  }
}

export function buildProposalIx(
  multisigPda: PublicKey,
  member: PublicKey,
  transactionIndex: bigint,
): TransactionInstruction {
  return multisig.instructions.proposalCreate({
    multisigPda,
    creator: member,
    isDraft: false,
    transactionIndex,
    rentPayer: member,
  })
}

export function buildProposalApprovalIx(
  multisigPda: PublicKey,
  member: PublicKey,
  transactionIndex: bigint,
): TransactionInstruction {
  return multisig.instructions.proposalApprove({
    multisigPda,
    member,
    transactionIndex,
  })
}

export function buildProposalIxs(
  multisigPda: PublicKey,
  member: PublicKey,
  transactionIndex: bigint,
): TransactionInstruction[] {
  return [
    buildProposalIx(multisigPda, member, transactionIndex),
    buildProposalApprovalIx(multisigPda, member, transactionIndex),
  ]
}


export { LAMPORTS_PER_SOL, Permission, Permissions }
