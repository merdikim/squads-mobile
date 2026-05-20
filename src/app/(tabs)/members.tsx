import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function MembersScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 px-6 py-8">
        <Text className="text-sm font-bold uppercase text-black/45">Multisig</Text>
        <Text className="mt-3 text-4xl font-black leading-tight text-black">Members</Text>
        <Text className="mt-4 text-base leading-7 text-black/65">
          Coordinate signers, thresholds, and roles before funds can move.
        </Text>

        <View className="mt-8 rounded-lg border border-black/10 p-4">
          <Text className="text-xl font-black text-black">3 of 5 approvals</Text>
          <Text className="mt-2 text-sm leading-6 text-black/65">
            A proposal needs three trusted members to approve before execution.
          </Text>
        </View>

        <View className="mt-4 rounded-lg border border-black/10 p-4">
          <Text className="text-base font-black text-black">Owners</Text>
          <Text className="mt-2 text-sm leading-6 text-black/65">Alex, Casey, Jordan, Morgan, Taylor</Text>
        </View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  )
}
