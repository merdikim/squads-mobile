import { View } from 'react-native'

export function CardSkeleton({ className = '' }: { className?: string }) {
  return <View className={`bg-black/5 ${className}`} />
}
