import { View } from 'react-native'

type MultisigDataSkeletonProps = {
  className?: string
}

export function MultisigDataSkeleton({ className = '' }: MultisigDataSkeletonProps) {
  return <View className={`rounded-md bg-black/10 ${className}`} />
}

export function MultisigMenuSkeleton() {
  return (
    <View className="mt-5 gap-3">
      <View className="rounded-lg border border-black/10 bg-white p-4">
        <MultisigDataSkeleton className="h-4 w-28" />
        <MultisigDataSkeleton className="mt-3 h-3 w-full" />
        <MultisigDataSkeleton className="mt-2 h-3 w-3/4" />
      </View>
      <View className="rounded-lg border border-black/10 bg-white p-4">
        <MultisigDataSkeleton className="h-4 w-36" />
        <MultisigDataSkeleton className="mt-3 h-3 w-5/6" />
      </View>
    </View>
  )
}
