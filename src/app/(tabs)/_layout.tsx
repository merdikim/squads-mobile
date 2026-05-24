import { Tabs } from 'expo-router'
import { Home, Settings, UsersRound } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { APP_BACKGROUND_COLOR } from '../../constants'

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: APP_BACKGROUND_COLOR,
        },
        tabBarActiveTintColor: '#090A0F',
        tabBarInactiveTintColor: 'rgba(9, 10, 15, 0.45)',
        tabBarShowLabel: false,

        tabBarStyle: {
          backgroundColor: APP_BACKGROUND_COLOR,
          height: 60 + insets.bottom,
          paddingTop: 10,
          paddingBottom: insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={2.4} />,
        }}
      />

      <Tabs.Screen
        name="members"
        options={{
          title: 'Members',
          tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} strokeWidth={2.4} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} strokeWidth={2.4} />,
        }}
      />
    </Tabs>
  )
}
