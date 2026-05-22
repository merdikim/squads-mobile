import useMultisigs from '../hooks/useMultisigs'
import NoMultisigs from '../components/home-screen/NoMultisigs'
import { router } from 'expo-router'
import { Animated, Easing, Image, View } from 'react-native'
import { useEffect, useRef } from 'react'

const App = () => {
    const { multisigs = [], isMultisigsLoading } = useMultisigs()
    const spinValue = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (!isMultisigsLoading && multisigs.length > 0) {
            router.replace('/home')
        }
    }, [isMultisigsLoading, multisigs.length])

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
    return (
        <NoMultisigs/>
    )
}

export default App
