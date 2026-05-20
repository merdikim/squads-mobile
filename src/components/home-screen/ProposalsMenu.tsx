import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native'

const mockProposals = [
  {
    id: 'proposal-1',
    title: 'Transfer USDC to development wallet',
    description: 'Send 12,500 USDC for the next product milestone.',
    status: 'Pending',
    approvals: '2 of 3',
  },
  {
    id: 'proposal-2',
    title: 'Update treasury signer threshold',
    description: 'Raise the approval threshold from 2 to 3 members.',
    status: 'Active',
    approvals: '1 of 3',
  },
  {
    id: 'proposal-3',
    title: 'Renew infrastructure subscription',
    description: 'Approve annual payment for RPC and indexing services.',
    status: 'Ready',
    approvals: '3 of 3',
  },
  {
    id: 'proposal-4',
    title: 'Update treasury signer threshold',
    description: 'Raise the approval threshold from 2 to 3 members.',
    status: 'Active',
    approvals: '1 of 3',
  },
  {
    id: 'proposal-5',
    title: 'Update treasury signer threshold',
    description: 'Raise the approval threshold from 2 to 3 members.',
    status: 'Active',
    approvals: '1 of 3',
  },
]

export function ProposalsMenu() {
  if (mockProposals.length === 0) {
    return (
      <View className="mt-5 min-h-56 items-center justify-center">
        <View className='flex-row items-center justify-center'>
          <Image source={require('../../assets/logo.png')} className="h-6 w-6 mr-4" />
          <Text className="text-xl font-black text-black">No Proposals</Text>
        </View>
        <Text className="mt-2 text-center text-sm leading-6 text-black/60">
          No proposals for this multisig yet.
        </Text>
        <Pressable
          onPress={() => Alert.alert('Create Proposal', 'Start a new proposal for this multisig.')}
          className="mt-9 h-12 min-w-44 items-center justify-center rounded-lg bg-black px-5 active:bg-black/80"
        >
          <Text className="text-base font-bold text-white">Create a new proposal</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView className="mt-5">
      {mockProposals.map((proposal) => (
        <View key={proposal.id} className="rounded-lg border border-black/10 bg-white p-4 my-2">
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 text-base font-black leading-6 text-black">{proposal.title}</Text>
            <View className="rounded-md bg-black px-2 py-1">
              <Text className="text-xs font-bold text-white">{proposal.status}</Text>
            </View>
          </View>

          <Text className="mt-2 text-sm leading-6 text-black/60">{proposal.description}</Text>

          <View className="mt-4 flex-row items-center justify-between border-t border-black/10 pt-3">
            <Text className="text-xs font-bold uppercase text-black/40">Approvals</Text>
            <Text className="text-sm font-black text-black">{proposal.approvals}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}
