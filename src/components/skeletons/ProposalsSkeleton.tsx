import { View } from 'react-native'
import { CardSkeleton } from './CardSkeleton'
import { Card } from '../ui'

export function ProposalsSkeleton() {
  const proposalRows = Array.from({ length: 3 })

  return (
    <View className="mt-5">
      {proposalRows.map((_, index) => (
        <Card key={index} className="my-2 p-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <CardSkeleton className="h-5 w-4/5 rounded-md" />
              <CardSkeleton className="mt-2 h-5 w-2/5 rounded-md" />
            </View>
            <CardSkeleton className="h-6 w-16 rounded-xl bg-black/10" />
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <CardSkeleton className="h-3 w-24 rounded-md" />
            <View className="flex-row items-center gap-1">
              <CardSkeleton className="h-3.5 w-3.5 rounded-full" />
              <CardSkeleton className="h-3 w-16 rounded-md" />
            </View>
          </View>
        </Card>
      ))}
    </View>
  )
}
