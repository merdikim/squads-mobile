import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, Image, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { useQueryClient } from '@tanstack/react-query'
import { LogOut, Plus } from 'lucide-react-native'
import { CreateMultisigModal } from '../modals/CreateMultisigModal'
import useMultisigs from '../../hooks/useMultisigs'
import { APP_BACKGROUND_COLOR } from '../../constants'
import { clearSelectedMultisigAddress } from '../../lib/selectedMultisigStorage'
import { AppText, Button, Card } from '../ui'

const squadsLetters = ['S', 'Q', 'U', 'A', 'D', 'S']
const introDuration = 1000
const letterDuration = introDuration / squadsLetters.length
const squadsLogo = require('../../assets/logo.png')

export default function NoMultisigs() {
  const { account, disconnect } = useMobileWallet()
  const queryClient = useQueryClient()
  const walletAddress = account?.address.toString() ?? ''
  const { multisigs = [], isMultisigsLoading } = useMultisigs(walletAddress)
  const loadingSpinValue = useRef(new Animated.Value(0)).current
  const spinValue = useRef(new Animated.Value(0)).current
  const letterValues = useRef(squadsLetters.map(() => new Animated.Value(0))).current
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false)

  useEffect(() => {
    if (!isMultisigsLoading && multisigs.length > 0) {
      router.replace('/home')
    }
  }, [isMultisigsLoading, multisigs.length])

  useEffect(() => {
    if (!isMultisigsLoading) {
      loadingSpinValue.stopAnimation()
      loadingSpinValue.setValue(0)
      return
    }

    loadingSpinValue.setValue(0)

    const loadingAnimation = Animated.loop(
      Animated.timing(loadingSpinValue, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )

    loadingAnimation.start()

    return () => {
      loadingAnimation.stop()
    }
  }, [isMultisigsLoading, loadingSpinValue])

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

  const loadingSpin = loadingSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const logout = () => {
    disconnect()
    queryClient.setQueryData(['selectedMultisigAddress'], '')
    void clearSelectedMultisigAddress()
    router.replace('/')
  }

  if (isMultisigsLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: APP_BACKGROUND_COLOR }}>
        <View className="flex-1 items-center justify-center">
          <Animated.View style={{ height: 48, width: 48, transform: [{ rotate: loadingSpin }] }}>
            <Image source={squadsLogo} style={{ height: 48, width: 48 }} resizeMode="contain" />
          </Animated.View>
        </View>

        <StatusBar style="dark" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: APP_BACKGROUND_COLOR }}>
      <View className="flex-1 px-6 pt-10 text-black">
        <Card className="flex-1 items-center justify-center bg-neutral-100">
          <View className="flex-row items-center justify-center">
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Image source={squadsLogo} className="h-12 w-12" resizeMode="contain" />
            </Animated.View>

            <View className="ml-5 flex-row items-center justify-center">
              {squadsLetters.map((letter, index) => (
                <Animated.Text
                  key={`${letter}-${index}`}
                  className="text-3xl font-mono-extrabold"
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
        </Card>

        <View className="flex-[1.25] items-center justify-center">
          <AppText variant="heading" className="text-center leading-tight">
            The safest way to manage funds together
          </AppText>

          <AppText variant="muted" className="mt-5 text-center leading-7 text-black/70">
            Built for teams that move assets together. Secure every transaction with collective approval
          </AppText>
        </View>

        <View className="flex-[0.75] justify-center">
          <Button
            onPress={() => setIsCreatingModalOpen(true)}
            className="h-14"
            leftIcon={<Plus color="#FFFFFF" size={18} strokeWidth={2.4} />}
          >
            Create Multisig
          </Button>
          <Button
            onPress={logout}
            variant="secondary"
            className="mt-3 h-11 border-black/10 bg-neutral-100/60"
            textClassName="text-sm text-black/55"
            leftIcon={<LogOut color="rgba(9, 10, 15, 0.55)" size={15} strokeWidth={2.4} />}
          >
            Log out
          </Button>
        </View>
      </View>

      <CreateMultisigModal visible={isCreatingModalOpen} onClose={() => setIsCreatingModalOpen(false)} />

      <StatusBar style="dark" />
    </SafeAreaView>
  )
}
