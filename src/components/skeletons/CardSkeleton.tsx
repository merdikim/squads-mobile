import { View } from "react-native";

export function CardSkeleton({ className = '' }: { className?: string }) {
  return <View className={`rounded-xl bg-black/10 ${className}`} />
}