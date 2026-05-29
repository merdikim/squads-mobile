import useMultisigs from '../hooks/useMultisigs'
import NoMultisigs from '../components/home-screen/NoMultisigs'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { CheckCircle, HandshakeIcon, Network, ShieldCheck, Users, WalletCards } from 'lucide-react-native'
import { Animated, Easing, Image, Pressable, Text, View } from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { APP_BACKGROUND_COLOR } from '../constants'

const squadsLogo = require('../assets/logo.png')
const introWordDuration = 2000

const introWords = [
  {
    icon: ShieldCheck,
    text: 'Secure',
  },
  {
    icon: Network,
    text: 'Coordinate',
  },
  {
    icon: CheckCircle,
    text: 'Execute',
  },
  {
    icon: Users,
    text: 'Govern',
  },
  {
    icon: HandshakeIcon,
    text: 'Consensus',
  },
]

const getIntroWordIndex = (index: number) => {
  return (index + introWords.length) % introWords.length
}

const App = () => {
  const { account, connect } = useMobileWallet()
  const walletAddress = account?.address.toString() ?? ''
  const { multisigs = [], isMultisigsLoading } = useMultisigs(walletAddress)
  const isLoadingMultisigs = Boolean(walletAddress && isMultisigsLoading)
  const loadingSpinValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (walletAddress && !isLoadingMultisigs && multisigs.length > 0) {
      router.replace('/home')
    }
  }, [isLoadingMultisigs, multisigs.length, walletAddress])

  useEffect(() => {
    if (!isLoadingMultisigs) {
      loadingSpinValue.stopAnimation()
      loadingSpinValue.setValue(0)
      return
    }

    loadingSpinValue.setValue(0)

    const animation = Animated.loop(
      Animated.timing(loadingSpinValue, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [isLoadingMultisigs, loadingSpinValue])

  const loadingSpin = loadingSpinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  if (isLoadingMultisigs) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: APP_BACKGROUND_COLOR }}>
        <Animated.View style={{ height: 48, width: 48, transform: [{ rotate: loadingSpin }] }}>
          <Image source={squadsLogo} style={{ height: 48, width: 48 }} resizeMode="contain" />
        </Animated.View>
      </View>
    )
  }

  if (account && !isLoadingMultisigs && multisigs.length === 0) {
    return <NoMultisigs />
  }

  return (
    <>
      <View className="flex-1 overflow-hidden" style={{ backgroundColor: APP_BACKGROUND_COLOR }}>
        <View pointerEvents="none" className="absolute inset-0">
          <View
            className="absolute rounded-[36px] bg-[#D8E7EF]/80"
            style={{
              top: 250,
              left: -98,
              height: 250,
              width: 240,
              opacity: 0.58,
              transform: [{ rotate: '12deg' }],
            }}
          />
          <View
            className="absolute rounded-[42px] bg-[#F0E1BE]/80"
            style={{
              right: -80,
              bottom: 96,
              height: 240,
              width: 250,
              opacity: 0.46,
              transform: [{ rotate: '18deg' }],
            }}
          />
        </View>

        <View className="flex-1 px-6 pt-10 text-black">
          <IntroWordsCarousel />

          <View className="flex-[1.25] items-center justify-center">
            <Text className="text-center text-3xl font-mono-extrabold leading-tight">
              The coordination layer for onchain assets
            </Text>
            <View className="mt-7 flex-row items-center justify-center">
              <Image source={squadsLogo} className="h-8 w-8" resizeMode="contain" />
            </View>
          </View>

          <View className="flex-[0.75] justify-center gap-3 pb-10">
            <Pressable
              onPress={connect}
              disabled={!!account}
              className={`h-14 flex-row items-center justify-center rounded-xl px-5 ${
                account ? 'bg-black/70' : 'bg-black active:bg-black/80'
              }`}
            >
              <WalletCards color="#FFFFFF" size={18} strokeWidth={2.4} />
              <Text className="ml-2 text-base font-mono-extrabold text-white">
                {account ? 'Wallet Connected' : 'Connect Wallet'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <StatusBar style="dark" />
    </>
  )
}

function IntroWordsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const transitionValue = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const interval = setInterval(() => {
      transitionValue.setValue(0)
      setActiveIndex((currentIndex) => getIntroWordIndex(currentIndex + 1))

      Animated.timing(transitionValue, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start()
    }, introWordDuration)

    return () => {
      clearInterval(interval)
      transitionValue.stopAnimation()
    }
  }, [transitionValue])

  const previousWord = introWords[getIntroWordIndex(activeIndex - 1)]
  const currentWord = introWords[activeIndex]
  const nextWord = introWords[getIntroWordIndex(activeIndex + 1)]
  const CurrentIcon = currentWord.icon

  return (
    <View className="flex-1 items-center justify-center overflow-hidden">
      <View className="h-36 w-full items-center justify-center overflow-hidden">
        <Animated.View
          className="absolute w-36 items-center justify-center"
          style={{
            left: -10,
            opacity: 0.32,
          }}
        >
          <Text className="text-center text-xl font-mono-light text-black" numberOfLines={1}>
            {nextWord.text}
          </Text>
        </Animated.View>

        <Animated.View
          className="items-center justify-center"
          style={{
            transform: [
              {
                scale: transitionValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.98, 1],
                }),
              },
            ],
          }}
        >
          <View className="h-16 w-16 items-center justify-center">
            <CurrentIcon color="#090A0F" size={30} strokeWidth={2} />
          </View>
          <Text className="mt-4 text-center text-3xl font-mono-extrabold text-black" numberOfLines={1}>
            {currentWord.text}
          </Text>
        </Animated.View>

        <Animated.View
          className="absolute w-36 items-center justify-center"
          style={{
            right: -10,
            opacity: 0.32,
          }}
        >
          <Text className="text-center text-xl font-mono-light text-black" numberOfLines={1}>
            {previousWord.text}
          </Text>
        </Animated.View>
      </View>
    </View>
  )
}

export default App
