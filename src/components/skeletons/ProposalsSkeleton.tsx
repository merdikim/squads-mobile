import { View } from 'react-native'
import { CardSkeleton } from './CardSkeleton'


export function ProposalsSkeleton() {
  return (
    <View className="mt-5 gap-3">
      <View className="rounded-xl border border-black/10 bg-white p-4">
        <CardSkeleton className="h-4 w-28" />
        <CardSkeleton className="mt-3 h-3 w-full" />
        <CardSkeleton className="mt-2 h-3 w-3/4" />
      </View>
      <View className="rounded-xl border border-black/10 bg-white p-4">
        <CardSkeleton className="h-4 w-28" />
        <CardSkeleton className="mt-3 h-3 w-full" />
        <CardSkeleton className="mt-2 h-3 w-3/4" />
      </View>
      <View className="rounded-xl border border-black/10 bg-white p-4">
        <CardSkeleton className="h-4 w-28" />
        <CardSkeleton className="mt-3 h-3 w-full" />
        <CardSkeleton className="mt-2 h-3 w-3/4" />
      </View>
    </View>
  )
}
