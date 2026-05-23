import useMultisigs from '../hooks/useMultisigs'
import NoMultisigs from '../components/home-screen/NoMultisigs'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { WalletCards } from 'lucide-react-native'
import { Animated, Easing, Image, Pressable, Text, View } from 'react-native'
import { useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const App = () => {
    const { account, connect } = useMobileWallet()
    const walletAddress = account?.address.toString() ?? ''
    const { multisigs = [], isMultisigsLoading } = useMultisigs(walletAddress)
    const spinValue = useRef(new Animated.Value(0)).current
    const fadeValue = useRef(new Animated.Value(0)).current
    const liftValue = useRef(new Animated.Value(20)).current

    useEffect(() => {
        if (walletAddress && !isMultisigsLoading && multisigs.length > 0) {
            router.replace('/home')
        }
    }, [isMultisigsLoading, multisigs.length, walletAddress])

    useEffect(() => {
        if (!isMultisigsLoading) {
            spinValue.stopAnimation()
            spinValue.setValue(0)
            return
        }

        const animation = Animated.loop(
            Animated.timing(spinValue, {
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
    }, [isMultisigsLoading, spinValue])

    useEffect(() => {
        if (isMultisigsLoading) {
            return
        }

        Animated.parallel([
            Animated.timing(fadeValue, {
                toValue: 1,
                duration: 450,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(liftValue, {
                toValue: 0,
                duration: 450,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start()
    }, [fadeValue, isMultisigsLoading, liftValue])

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    })

    if(isMultisigsLoading) {
        return (
            <View className='flex-1 justify-center items-center'>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Image source={require('../assets/logo.png')} className="h-12 w-12" resizeMode="contain" />
                </Animated.View>
            </View>
        )
    }

    if (account && multisigs.length === 0) {
        return <NoMultisigs />
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View className="flex-1 px-6 pt-10 text-black">
                <Animated.View
                    className="flex-1 items-center justify-center rounded-xl bg-neutral-100 shadow"
                    style={{
                        opacity: fadeValue,
                        transform: [{ translateY: liftValue }],
                    }}
                >
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Image source={require('../assets/logo.png')} className="h-14 w-14" resizeMode="contain" />
                    </Animated.View>

                    <Text className="mt-6 text-center text-3xl font-extrabold tracking-normal text-black">
                        SQUADS
                    </Text>
                </Animated.View>

                <View className="flex-[1.25] items-center justify-center">
                    <View className="mb-6 h-14 w-14 items-center justify-center rounded-xl bg-black/5">
                        <WalletCards color="#090A0F" size={24} strokeWidth={2.4} />
                    </View>

                    <Text className="text-center text-3xl font-black leading-tight">
                        Connect your wallet
                    </Text>

                    <Text className="mt-5 text-center text-sm leading-7 text-black/70">
                        Use your Solana wallet to access your multisigs, manage members, and approve treasury activity.
                    </Text>
                </View>

                <View className="flex-[0.75] justify-center gap-3">
                    <Pressable
                        onPress={connect}
                        disabled={!!account}
                        className={`h-14 flex-row items-center justify-center rounded-xl px-5 ${
                            account ? 'bg-black/70' : 'bg-black active:bg-black/80'
                        }`}
                    >
                        <WalletCards color="#FFFFFF" size={18} strokeWidth={2.4} />
                        <Text className="ml-2 text-base font-black text-white">
                            {account ? 'Wallet Connected' : 'Connect Wallet'}
                        </Text>
                    </Pressable>
                </View>
            </View>

            <StatusBar style="dark" />
        </SafeAreaView>
    )
}

export default App
