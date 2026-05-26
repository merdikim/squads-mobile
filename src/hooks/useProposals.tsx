import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { SquadsApiProposalRow, SquadsApiProposalsResponse, SquadsProposalData } from '../types'
import { isSolanaAddress } from '../utils'
import { multisigsQueryKey } from './useMultisigs'

const PROPOSALS_DATA_STALE_TIME = 180 * 1000
const PROPOSALS_DATA_GC_TIME = 10 * 60 * 1000
const PROPOSALS_PAGE_SIZE = 20

const configTypes: Record<string, string> = {
  AddMember: 'Add Member',
  RemoveMember: 'Remove Member',
}

export const multisigProposalsQueryKey = [...multisigsQueryKey, 'proposals']

const humanizeType = (value?: string) => {
  if (!value) {
    return ''
  }

  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
}

const formatNativeTransferTitle = (lamports?: number, symbol = 'SOL') => {
  if (typeof lamports !== 'number') {
    return `${symbol} Transfer`
  }

  const amount = lamports / 1_000_000_000

  return `Transfer ${amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`
}

const normalizeProposalRow = (row: SquadsApiProposalRow): SquadsProposalData => {
  const { proposal, transaction, category } = row
  const firstAction = transaction.account.actions?.[0]
  const summary = transaction.metadata.summary
  const summaryData = summary?.data
  const memo = transaction.metadata.info.memo?.trim()
  const actionType = firstAction?.type
  const summaryType = summary?.type
  const transactionType = transaction.type
  const title = actionType
    ? (configTypes[actionType] ?? humanizeType(actionType))
    : summaryType === 'NativeTransfer'
      ? formatNativeTransferTitle(summaryData?.lamports, summaryData?.metadata?.symbol)
      : humanizeType(summaryType) || humanizeType(transactionType) || `${humanizeType(category)} Proposal`
  const memberAddress =
    actionType === 'AddMember'
      ? firstAction?.newMember?.key
      : actionType === 'RemoveMember'
        ? firstAction?.oldMember
        : (summaryData?.destination ?? transaction.account.creator)

  return {
    address: transaction.address,
    multisigAddress: proposal.multisig,
    title,
    category,
    memo,
    transactionIndex: BigInt(proposal.transactionIndex),
    status: proposal.status.type,
    approvals: proposal.approved,
    rejects: proposal.rejected,
    cancellations: proposal.cancelled,
    memberAddress,
    relatedAddressLabel:
      actionType === 'AddMember' || actionType === 'RemoveMember'
        ? 'Member address'
        : summaryData?.destination
          ? 'Destination'
          : 'Creator',
    timestamp: proposal.status.timestamp,
    hasApproved: false,
  }
}

const useProposals = (multisigAddress: string) => {
  const [page, setPage] = useState(1)
  const selectedMultisigAddress = multisigAddress

  useEffect(() => {
    setPage(1)
  }, [selectedMultisigAddress])

  const {
    data: proposalsPage,
    error: proposalsError,
    isLoading: isProposalsLoading,
    isFetching: isProposalsFetching,
  } = useQuery({
    queryKey: [...multisigProposalsQueryKey, selectedMultisigAddress, page],
    queryFn: async () => {
      if (!selectedMultisigAddress || !isSolanaAddress(selectedMultisigAddress)) {
        return {
          proposals: [],
          page: 1,
          totalEntries: 0,
          totalPages: 1,
        }
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PROPOSALS_PAGE_SIZE),
      })
      const response = await fetch(
        `https://multisig-api.squads.xyz/transactions/multisig/${selectedMultisigAddress}/active?${params.toString()}`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch proposals: ${response.status}`)
      }

      const result = (await response.json()) as SquadsApiProposalsResponse

      return {
        proposals: (result.transactions ?? []).map(normalizeProposalRow),
        page: result.page ?? page,
        totalEntries: result.total_entries ?? 0,
        totalPages: Math.max(result.total_pages ?? 1, 1),
      }
    },
    enabled: !!selectedMultisigAddress && isSolanaAddress(selectedMultisigAddress),
    staleTime: PROPOSALS_DATA_STALE_TIME,
    gcTime: PROPOSALS_DATA_GC_TIME,
  })

  const totalPages = proposalsPage?.totalPages ?? 1
  const hasPreviousPage = page > 1
  const hasNextPage = page < totalPages

  return {
    proposals: proposalsPage?.proposals,
    proposalsError,
    isProposalsLoading,
    isProposalsFetching,
    page,
    totalEntries: proposalsPage?.totalEntries,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    previousPage: () => setPage((currentPage) => Math.max(currentPage - 1, 1)),
    nextPage: () => setPage((currentPage) => Math.min(currentPage + 1, totalPages)),
  }
}

export default useProposals
