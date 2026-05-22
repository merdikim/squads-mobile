import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, Image, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Plus, Upload } from 'lucide-react-native'
import { ImportMultisigModal } from '../modals/ImportMultisigModal'
import CreateMultisigModal from '../modals/CreateMultisigModal'

const squadsLetters = ['S', 'Q', 'U', 'A', 'D', 'S']
const introDuration = 1000
const letterDuration = introDuration / squadsLetters.length

export default function NoMultisigs() {
  const spinValue = useRef(new Animated.Value(0)).current
  const letterValues = useRef(squadsLetters.map(() => new Animated.Value(0))).current
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false)

  useEffect(() => {
    const introAnimation = Animated.sequence(
      squadsLetters.map((_, index) =>
        Animated.parallel([
          Animated.timing(spinValue, {
            toValue: index + 1,
            duration: letterDuration,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(letterValues[index], {
            toValue: 1,
            duration: letterDuration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ),
    )

    introAnimation.start()

    return () => {
      introAnimation.stop()
    }
  }, [letterValues, spinValue])

  const spin = spinValue.interpolate({
    inputRange: [0, squadsLetters.length],
    outputRange: ['0deg', `${squadsLetters.length * 45}deg`],
  })


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 px-6 pt-10 text-black">
        <View className='flex-1 items-center justify-center bg-neutral-100 shadow rounded-xl'>
          <View className="flex-row items-center justify-center">
            <Animated.View
              style={{ transform: [{ rotate: spin }] }}
            >
              <Image source={require('../../assets/logo.png')} className="h-12 w-12" resizeMode="contain" />
            </Animated.View>

            <View className="ml-5 flex-row items-center justify-center">
              {squadsLetters.map((letter, index) => (
                <Animated.Text
                  key={`${letter}-${index}`}
                  className="mx-1 text-3xl font-extrabold"
                  style={{
                    opacity: letterValues[index],
                    transform: [
                      {
                        translateY: letterValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [18, 0],
                        }),
                      },
                      {
                        scale: letterValues[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.82, 1],
                        }),
                      },
                    ],
                  }}
                >
                  {letter}
                </Animated.Text>
              ))}
            </View>
          </View>
        </View>

        <View className="flex-[1.25] items-center justify-center">
          <Text className="text-center text-3xl font-black leading-tight">
            Secure and manage Solana assets 
          </Text>

          <Text className="mt-5 text-center text-sm leading-7 text-black/70">
            Built for teams, DAOs, treasuries, and on-chain organizations
          </Text>
        </View>

        <View className="flex-[0.75] justify-center gap-3">
          <Pressable
            onPress={() => setIsCreatingModalOpen(true)}
            className="h-14 flex-row items-center justify-center rounded-lg bg-black px-5 active:bg-black/80"
          >
            <Plus color="#FFFFFF" size={18} strokeWidth={2.4} />
            <Text className="ml-2 text-base font-black text-white">Create Multisig</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsImportModalOpen(true)}
            className="h-14 flex-row items-center justify-center rounded-lg border border-black/15 bg-white px-5 active:bg-black/5"
          >
            <Upload color="#090A0F" size={18} strokeWidth={2.4} />
            <Text className="ml-2 text-base font-black text-black">Import Multisig</Text>
          </Pressable>
        </View>
      </View>

      <ImportMultisigModal
        visible={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
      <CreateMultisigModal
        visible={isCreatingModalOpen}
        onClose={() => setIsCreatingModalOpen(false)}
      />

      <StatusBar style="light" />
    </SafeAreaView>
  )
}
