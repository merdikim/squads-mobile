import * as multisig from '@sqds/multisig'
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  //type TransactionSignatures
} from '@solana/web3.js'
import { ImportableSquadsMultisig, SquadsMultisigData, SquadsProposalData } from '../types'
import { RPC_URL } from '../constants'
import { shortenAddress, toPublicKey } from '../utils'


const { Permission, Permissions } = multisig.types

export type SignWeb3Transaction = (transaction: VersionedTransaction) => Promise<VersionedTransaction>

export function createSquadsConnection() {
  return new Connection(RPC_URL, 'confirmed')
}

export async function fetchImportableMultisig(address: string): Promise<ImportableSquadsMultisig> {
  try {
    const connection = createSquadsConnection()
    const multisigPda = toPublicKey(address)
    const account = await multisig.accounts.Multisig.fromAccountAddress(connection, multisigPda)

    return {
      address: multisigPda.toBase58(),
      name: `Multisig ${shortenAddress(multisigPda.toBase58())}`,
      threshold: account.threshold,
      members: account.members.map((member) => member.key.toBase58()),
    }
  } catch (error) {
    console.error('Error fetching importable multisig:', error)
    throw new Error('Enter a valid Squads multisig account address.')
  }
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
        transactionIndex: index,
        //title: `Vault transaction #${index.toString()}`,
        status: proposal.status.__kind,
        approvals: proposal.approved.length,
        rejects: proposal.rejected.length,
        cancellations: proposal.cancelled.length,
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

export async function addMember({
  multisigAddress,
  creatorAddress,
  newMemberAddress,
  signAndSendTransactions,
}: {
  multisigAddress: string
  creatorAddress: string | PublicKey
  newMemberAddress: string
  signAndSendTransactions: (transaction: VersionedTransaction, minContextSlot: number) => Promise<string>
}) {
  const connection = createSquadsConnection()
  const multisigPda = toPublicKey(multisigAddress)
  const creator = creatorAddress instanceof PublicKey ? creatorAddress : toPublicKey(creatorAddress)

  try {
    const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(
      connection,
      multisigPda,
    )
    const newTransactionIndex = BigInt(Number(multisigInfo.transactionIndex) + 1)
    const addMemberIx = multisig.instructions.configTransactionCreate({
      multisigPda,
      actions: [
        {
          __kind: 'AddMember',
          newMember: {
            key: toPublicKey(newMemberAddress),
            permissions: Permissions.all(),
          },
        },
      ],
      creator,
      transactionIndex: newTransactionIndex,
      rentPayer: creator,
    })

    const proposalIx = buildProposalIx(
      multisigPda,
      creator,
      newTransactionIndex,
    )

    const {
      context: { slot: minContextSlot },
      value: latestBlockhash,
    } = await connection.getLatestBlockhashAndContext()

    const message = new TransactionMessage({
      instructions: [addMemberIx, proposalIx],
      payerKey: creator,
      recentBlockhash: latestBlockhash.blockhash,
    }).compileToLegacyMessage()

    const transaction = new VersionedTransaction(message)

    console.log('Adding member with transaction:', transaction)
    const signature = await signAndSendTransactions(transaction, minContextSlot)

    console.log(`Signed transaction: ${signature}!`)
  } catch (error) {
    console.log('Error adding member:', error)
    console.error('Error adding member:', error)
    throw new Error('Failed to add member. Please try again.')
  }
}

function buildProposalIx(
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


// const createProposal = async ({
//   multisigAddress,
//   creatorAddress,
//   recipientAddress,
//   lamports = LAMPORTS_PER_SOL / 100,
// }: {
//   multisigAddress: string
//   creatorAddress: string
//   recipientAddress: string
//   lamports?: number
// }) => {

//   const connection = createSquadsConnection()
//   const multisigPda = toPublicKey(multisigAddress)
// }


























// async function sendWalletTransaction({
//   connection,
//   transaction,
//   signTransaction,
//   localSigners = [],
// }: {
//   connection: Connection
//   transaction: VersionedTransaction
//   signTransaction: SignWeb3Transaction
//   localSigners?: Keypair[]
// }) {
//   if (localSigners.length > 0) {
//     transaction.sign(localSigners)
//   }

//   const signedTransaction = await signTransaction(transaction)
//   const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
//     skipPreflight: false,
//   })
//   const latestBlockhash = await connection.getLatestBlockhash()

//   await connection.confirmTransaction(
//     {
//       signature,
//       blockhash: latestBlockhash.blockhash,
//       lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
//     },
//     'confirmed',
//   )

//   return signature
// }


// export async function createSingleMemberMultisig({
//   creatorAddress,
//   signTransaction,
// }: {
//   creatorAddress: string
//   signTransaction: SignWeb3Transaction
// }) {
//   const connection = createSquadsConnection()
//   const creator = toPublicKey(creatorAddress)
//   const createKey = Keypair.generate()
//   const [multisigPda] = multisig.getMultisigPda({ createKey: createKey.publicKey })
//   const [programConfigPda] = multisig.getProgramConfigPda({})
//   const programConfig = await multisig.accounts.ProgramConfig.fromAccountAddress(connection, programConfigPda)
//   const latestBlockhash = await connection.getLatestBlockhash()

//   const transaction = multisig.transactions.multisigCreateV2({
//     blockhash: latestBlockhash.blockhash,
//     createKey: createKey.publicKey,
//     creator,
//     multisigPda,
//     configAuthority: null,
//     timeLock: 0,
//     members: [
//       {
//         key: creator,
//         permissions: Permissions.all(),
//       },
//     ],
//     threshold: 1,
//     rentCollector: null,
//     treasury: programConfig.treasury,
//     memo: 'Created from Squads Mobile',
//   })

//   const signature = await sendWalletTransaction({
//     connection,
//     transaction,
//     signTransaction,
//     localSigners: [createKey],
//   })

//   return {
//     address: multisigPda.toBase58(),
//     signature,
//   }
// }

// export async function createSolTransferProposal({
//   multisigAddress,
//   creatorAddress,
//   recipientAddress,
//   signTransaction,
//   lamports = LAMPORTS_PER_SOL / 100,
// }: {
//   multisigAddress: string
//   creatorAddress: string
//   recipientAddress: string
//   signTransaction: SignWeb3Transaction
//   lamports?: number
// }) {
//   const connection = createSquadsConnection()
//   const multisigPda = toPublicKey(multisigAddress)
//   const creator = toPublicKey(creatorAddress)
//   const recipient = toPublicKey(recipientAddress)
//   const [vaultPda] = multisig.getVaultPda({ multisigPda, index: 0 })
//   const account = await multisig.accounts.Multisig.fromAccountAddress(connection, multisigPda)
//   const transactionIndex = BigInt(account.transactionIndex.toString()) + 1n
//   const transferBlockhash = await connection.getLatestBlockhash()
//   const transferMessage = new TransactionMessage({
//     payerKey: vaultPda,
//     recentBlockhash: transferBlockhash.blockhash,
//     instructions: [
//       SystemProgram.transfer({
//         fromPubkey: vaultPda,
//         toPubkey: recipient,
//         lamports,
//       }),
//     ],
//   })

//   const createTransaction = multisig.transactions.vaultTransactionCreate({
//     blockhash: transferBlockhash.blockhash,
//     feePayer: creator,
//     multisigPda,
//     transactionIndex,
//     creator,
//     vaultIndex: 0,
//     ephemeralSigners: 0,
//     transactionMessage: transferMessage,
//     memo: `Transfer ${formatSol(lamports)} to ${shortenAddress(recipientAddress)}`,
//   })
//   const transactionSignature = await sendWalletTransaction({
//     connection,
//     transaction: createTransaction,
//     signTransaction,
//   })

//   const proposalBlockhash = await connection.getLatestBlockhash()
//   const createProposal = multisig.transactions.proposalCreate({
//     blockhash: proposalBlockhash.blockhash,
//     feePayer: creator,
//     multisigPda,
//     transactionIndex,
//     creator,
//   })
//   const proposalSignature = await sendWalletTransaction({
//     connection,
//     transaction: createProposal,
//     signTransaction,
//   })

//   return {
//     transactionIndex,
//     transactionSignature,
//     proposalSignature,
//   }
// }

// export async function approveProposal({
//   multisigAddress,
//   memberAddress,
//   transactionIndex,
//   signTransaction,
// }: {
//   multisigAddress: string
//   memberAddress: string
//   transactionIndex: bigint
//   signTransaction: SignWeb3Transaction
// }) {
//   const connection = createSquadsConnection()
//   const member = toPublicKey(memberAddress)
//   const latestBlockhash = await connection.getLatestBlockhash()
//   const transaction = multisig.transactions.proposalApprove({
//     blockhash: latestBlockhash.blockhash,
//     feePayer: member,
//     multisigPda: toPublicKey(multisigAddress),
//     transactionIndex,
//     member,
//     memo: 'Approved from Squads Mobile',
//   })

//   return sendWalletTransaction({ connection, transaction, signTransaction })
// }

// export async function executeProposal({
//   multisigAddress,
//   memberAddress,
//   transactionIndex,
//   signTransaction,
// }: {
//   multisigAddress: string
//   memberAddress: string
//   transactionIndex: bigint
//   signTransaction: SignWeb3Transaction
// }) {
//   const connection = createSquadsConnection()
//   const member = toPublicKey(memberAddress)
//   const latestBlockhash = await connection.getLatestBlockhash()
//   const transaction = await multisig.transactions.vaultTransactionExecute({
//     connection,
//     blockhash: latestBlockhash.blockhash,
//     feePayer: member,
//     multisigPda: toPublicKey(multisigAddress),
//     transactionIndex,
//     member,
//   })

//   return sendWalletTransaction({ connection, transaction, signTransaction })
// }

export { LAMPORTS_PER_SOL, Permission, Permissions }
