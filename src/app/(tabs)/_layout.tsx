import { Tabs } from 'expo-router'
import { CheckCircle2, UsersRound, Wallet } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#090A0F',
        tabBarInactiveTintColor: 'rgba(9, 10, 15, 0.45)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarStyle: {
          borderTopColor: 'rgba(9, 10, 15, 0.12)',
          height: 84,
          paddingBottom: 24,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="assets"
        options={{
          title: 'Assets',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} strokeWidth={2.4} />,
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
        name="proposals"
        options={{
          title: 'Proposals',
          tabBarIcon: ({ color, size }) => <CheckCircle2 color={color} size={size} strokeWidth={2.4} />,
        }}
      />
    </Tabs>
  )
}
