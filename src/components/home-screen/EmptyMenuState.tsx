import { Image, View } from 'react-native'
import { AppText } from '../ui/AppText'

type EmptyMenuStateProps = {
  title: string
  description: string
}

export function EmptyMenuState({ title, description }: EmptyMenuStateProps) {
  return (
    <View className="mt-5 min-h-56 items-center justify-center">
      <View className="flex-row items-center justify-center">
        <Image source={require('../../assets/logo.png')} className="mr-4 h-5 w-5" />
        <AppText className="text-lg font-mono-semibold">{title}</AppText>
      </View>
      <AppText className="mt-4 font-mono-light text-neutral-500">{description}</AppText>
    </View>
  )
}
