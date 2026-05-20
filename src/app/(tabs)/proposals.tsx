import { StatusBar } from 'expo-status-bar'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProposalsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 px-6 py-8">
        <Text className="text-sm font-bold uppercase text-black/45">Multisig</Text>
        <Text className="mt-3 text-4xl font-black leading-tight text-black">Proposals</Text>
        <Text className="mt-4 text-base leading-7 text-black/65">
          Review, approve, and execute every transaction with a clear audit trail.
        </Text>

        <View className="mt-8 rounded-lg border border-black/10 p-4">
          <Text className="text-xl font-black text-black">12 pending</Text>
          <Text className="mt-2 text-sm leading-6 text-black/65">
            Pending transactions are waiting for member review before execution.
          </Text>
        </View>

        <View className="mt-4 rounded-lg border border-black/10 p-4">
          <Text className="text-base font-black text-black">Latest proposal</Text>
          <Text className="mt-2 text-sm leading-6 text-black/65">Transfer USDC to the development wallet.</Text>
        </View>
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  )
}
