import { Image, Text, View } from 'react-native'

type EmptyMenuStateProps = {
  title: string
  description: string
}

export function EmptyMenuState({ title, description }: EmptyMenuStateProps) {
  return (
    <View className="mt-5 min-h-56 items-center justify-center">
      <View className="flex-row items-center justify-center">
        <Image source={require('../../assets/logo.png')} className="mr-4 h-5 w-5" />
        <Text className="text-lg ">{title}</Text>
      </View>
      <Text className="mt-4 text-neutral-500">{description}</Text>
    </View>
  )
}
