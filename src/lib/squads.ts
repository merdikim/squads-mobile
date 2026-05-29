import * as multisig from '@sqds/multisig'
import { LAMPORTS_PER_SOL, PublicKey, TransactionInstruction } from '@solana/web3.js'


const { Permission, Permissions } = multisig.types


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
