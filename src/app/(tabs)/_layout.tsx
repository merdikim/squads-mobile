import { Tabs } from 'expo-router'
import { CheckCircle2, Home, UsersRound } from 'lucide-react-native'
import { View } from 'react-native'

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor:'#fff'
        },
        tabBarActiveTintColor: '#090A0F',
        tabBarInactiveTintColor: 'rgba(9, 10, 15, 0.45)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          //borderTopColor: 'rgba(9, 10, 15, 0.12)',
          height: 80,
          paddingTop: 10,
        },
        tabBarShowLabel: false
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
        name="proposals"
        options={{
          title: 'Proposals',
          tabBarIcon: ({ color, size }) => <CheckCircle2 color={color} size={size} strokeWidth={2.4} />,
        }}
      />
    </Tabs>
    </View>
  )
}
