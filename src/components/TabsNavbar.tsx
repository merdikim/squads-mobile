import { Image, View } from 'react-native'
import { ProfileModalTrigger } from './modals/ProfileModalTrigger'

export function TabsNavbar() {
  return (
    <View>
      <View className="h-16 flex-row items-center justify-between border-b border-black/10 px-4">
        <Image source={require('../assets/logo.png')} className="h-8 w-8" resizeMode="contain" />

        <ProfileModalTrigger />
      </View>
    </View>
  )
}
