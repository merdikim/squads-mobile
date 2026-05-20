import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { UsersRound } from 'lucide-react-native'
import { Dropdown } from '../../components/Dropdown'
import { AssetsMenu } from '../../components/home-screen/AssetsMenu'
import { NftsMenu } from '../../components/home-screen/NftsMenu'
import { ProposalsMenu } from '../../components/home-screen/ProposalsMenu'

const multisigs = [
  {
    name: 'Moonbase Coffee Fund',
    participants: 7,
    balance: '$84,219.33',
    publickKey: '0x7fa3b91c20de4488a67c99fb12e04d3c88a15001',
  },
  {
    name: 'Neon Yacht DAO',
    participants: 3,
    balance: '$9,734,002.08',
    publickKey: '0x41bd0f8a93cc17e55f29a7d3b081e04cc6b67219',
  },
  {
    name: 'Library Snacks Ops',
    participants: 12,
    balance: '$312.45',
    publickKey: '0x0e6f873b2c99af413dd08961b74282ec5aa7b0fd',
  },
  {
    name: 'Pixel Embassy Vault',
    participants: 9,
    balance: '$1,208,640.91',
    publickKey: '0xd26c1a52e0934b717089e65324cc769f418fa4b8',
  }
]

const menuItems = ['Proposals', 'Assets', 'NFTs'] as const
const multisigDropdownItems = multisigs.map((multisig) => ({
  key: multisig.publickKey,
  label: multisig.name,
}))

type MenuItem = (typeof menuItems)[number]

function MenuContent({ selectedMenuItem }: { selectedMenuItem: MenuItem }) {
  if (selectedMenuItem === 'Assets') {
    return <AssetsMenu />
  }

  if (selectedMenuItem === 'NFTs') {
    return <NftsMenu />
  }

  return <ProposalsMenu />
}

export default function HomeScreen() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem>('Proposals')
  const [selectedMultisig, setSelectedMultisig] = useState(multisigs[0])

  const selectMultisig = (publicKey: string) => {
    const multisig = multisigs.find((m) => m.publickKey === publicKey)
    if (multisig) {
      setSelectedMultisig(multisig)
    }
    setIsDropdownOpen(false)
  }

  const importMultisig = () => {
    setIsDropdownOpen(false)
    Alert.alert('Import Multisig', 'Import a new multisig into this workspace.')
  }

  return (
    <Pressable className="flex-1" onPress={() => setIsDropdownOpen(false)}>
      <View className="p-4">
        <View className="mt-4 h-48 w-full rounded-xl px-3 shadow-2xl">
          <View className="absolute inset-0 overflow-hidden rounded-xl border border-black/20 bg-white">
            <View className="absolute -right-16 -top-12 h-40 w-40 rounded-full bg-black/3" />
            <View className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-black/3" />
          </View>

          <View className="z-10 flex-row items-start justify-between">
            <Dropdown
              items={multisigDropdownItems}
              selectedKey={selectedMultisig.publickKey}
              isOpen={isDropdownOpen}
              onToggle={() => setIsDropdownOpen((value) => !value)}
              onSelect={selectMultisig}
              menuMaxHeight={260}
              bottomAction={{
                label: 'Import Multisig',
                onPress: importMultisig,
              }}
            />

            <View className="h-10 flex-row items-center gap-1 rounded-md">
              <UsersRound color="#090A0F" size={16} strokeWidth={2.4} />
              <Text className="text-sm font-bold text-black">{selectedMultisig.participants}</Text>
            </View>
          </View>

          <View className="z-0 flex-1 items-center justify-center">
            <Text className="text-sm font-bold uppercase text-black/45">Assets balance</Text>
            <Text className="mt-3 text-center text-4xl font-black text-black">{selectedMultisig.balance}</Text>
          </View>
        </View>

        <View className="mt-5 flex-row rounded-lg border border-black/10 bg-white p-1">
          {menuItems.map((item) => {
            const isSelected = selectedMenuItem === item

            return (
              <Pressable
                key={item}
                onPress={() => setSelectedMenuItem(item)}
                className={`h-11 flex-1 items-center justify-center rounded-md ${isSelected ? 'bg-black' : 'bg-white active:bg-black/5'}`}
              >
                <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-black/60'}`}>{item}</Text>
              </Pressable>
            )
          })}
        </View>

        <MenuContent selectedMenuItem={selectedMenuItem} />
      </View>

      <StatusBar style="dark" />
    </Pressable>
  )
}
