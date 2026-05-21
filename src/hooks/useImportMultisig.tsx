import { isAddress } from '@solana/kit'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useState } from 'react'
import useMultisigs from './useMultisigs'
import { useQueryClient } from '@tanstack/react-query'
import { fetchImportableMultisig } from '../lib/squads'
import { saveMultisigToStorage } from '../lib/multisigStorage'
import { ImportableSquadsMultisig } from '../types'

const useImportMultisig = (multisigAddress:string) => {
    const { account } = useMobileWallet()
    const address = account?.address.toString() ?? ''
    const { multisigs = [] } = useMultisigs(address)
    const [isImporting, setIsImporting] = useState(false)
    const [multisigError, setMultisigError] = useState('')
    const queryClient = useQueryClient()

    const trimmedAddress = multisigAddress.trim()

    const handleImportMultisig = async (address: string) => {
        if (!trimmedAddress) {
            setMultisigError('Solana address is required.')
            return
        }

        if (!isAddress(trimmedAddress)) {
            setMultisigError('Enter a valid Solana address.')
            return
        }
    
        if (multisigs.map((multisig) => multisig.address).includes(trimmedAddress)) {
            setMultisigError('This multisig has already been imported.')
            return
        }

        try {
            setIsImporting(true)
            const importableMultisig = await fetchImportableMultisig(address)
            return importableMultisig
        } catch (error) {
            throw error instanceof Error ? error : new Error('Unable to import this multisig.')
        }finally {            
            setIsImporting(false)
        }
    }

    const handleSaveMultisig = async (multisig:ImportableSquadsMultisig) => {
        try {
            await saveMultisigToStorage({name: multisig.name, address: multisig.address})
            await queryClient.invalidateQueries({ queryKey: ['multisigs', address] })
        } catch (error) {
            setMultisigError(error instanceof Error ? error.message : 'Unable to import this multisig.')
        }
    }

  
    return {
        isImporting,
        setIsImporting,
        multisigError,
        setMultisigError,
        handleImportMultisig,
        handleSaveMultisig
    }
}

export default useImportMultisig
