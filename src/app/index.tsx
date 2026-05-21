import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef } from 'react'
import { Animated, Easing, Image, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { ArrowRight } from 'lucide-react-native'
import { router } from 'expo-router'

const squadsLetters = ['S', 'Q', 'U', 'A', 'D', 'S']
const introDuration = 2000
const letterDuration = introDuration / squadsLetters.length

export default function App() {
  const { account, connect, disconnect } = useMobileWallet()
  const spinValue = useRef(new Animated.Value(0)).current
  const letterValues = useRef(squadsLetters.map(() => new Animated.Value(0))).current

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

  useEffect(() => {
    if (account) {
      router.push('/home')
    }
  }, [account])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 px-6 text-black">
        <View className='flex-1 items-center justify-center'>
          <View className="flex-row items-center justify-center">
            <Animated.View
              style={{ transform: [{ rotate: spin }] }}
            >
              <Image source={require('../assets/logo.png')} className="h-8 w-8" resizeMode="contain" />
            </Animated.View>

            <View className="ml-5 flex-row items-center justify-center">
              {squadsLetters.map((letter, index) => (
                <Animated.Text
                  key={`${letter}-${index}`}
                  className="mx-1 text-2xl font-black"
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

        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-4xl font-black leading-tight ">Secure and manage Solana assets</Text>
          <Text className="mt-5 text-center text-base leading-7 text-black/70">
            Management of developer and treasury assets for on-chain organizations
          </Text>
        </View>

        <View className="flex-1 justify-end pb-12">
          {account ? (
            <View className="items-center">
              <Text className="mb-4 text-center text-sm font-semibold text-black/65">
                Connected: {account.address.toString().slice(0, 8)}...
              </Text>
              <Pressable
                onPress={disconnect}
                className="h-12 w-full items-center justify-center rounded-lg bg-white active:bg-white/90 border border-black/30"
                style={{ borderWidth: 1, borderColor: 'black'}}
              >
                <Text className="text-base font-bold ">Disconnect Wallet</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={connect}
              className="h-12 w-full flex flex-row gap-2 items-center justify-center rounded-lg bg-white active:bg-white/90 border border-black/30"
            >
              <Text className="text-base font-bold text-[#090A0F]">Get started</Text>
              <ArrowRight size={20} strokeWidth={2.5} />
            </Pressable>
          )}
        </View>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  )
}
