import { Image, Text, View } from 'react-native'

type EmptyMenuStateProps = {
  title: string
  description: string
}

export function EmptyMenuState({ title, description }: EmptyMenuStateProps) {
  return (
    <View className="mt-5 min-h-56 items-center justify-center">
      <View className="flex-row items-center justify-center">
        <Image source={require('../../assets/logo.png')} className="mr-4 h-6 w-6" />
        <Text className="text-xl font-black text-black">{title}</Text>
      </View>
      <Text className="mt-2 text-center text-sm leading-6 text-black/60">{description}</Text>
    </View>
  )
}
