import { cofhejs, Encryptable } from 'cofhejs/web';
import { Contract, BrowserProvider, JsonRpcSigner } from 'ethers';
import { CONTRACT_ABI, CONTRACT_CONFIG } from '../lib/contract';

// Track initialization state
let isInitialized = false;

// Initialize CoFHE with ethers provider and signer
export async function initializeNewCofhe(provider: BrowserProvider, signer: JsonRpcSigner) {
    if (isInitialized) {
        return { success: true };
    }

    try {
        const result = await cofhejs.initializeWithEthers({
            ethersProvider: provider,
            ethersSigner: signer,
            environment: 'TESTNET',
        });

        if (result.success) {
            isInitialized = true;
            console.log('✅ CoFHE initialized:', result);
        }

        return result;
    } catch (error) {
        console.error('❌ CoFHE initialization failed:', error);
        return { success: false, error };
    }
}

// Check if CoFHE is initialized
export function isNewCofheReady(): boolean {
    return isInitialized;
}

/**
 * Encrypt a vote using cofhejs
 * The encrypt function returns an object with the proper structure for InEuint64
 */
export async function encryptVoteNew(voteChoice: bigint) {
    if (!isInitialized) {
        return { success: false, error: new Error('CoFHE not initialized') };
    }

    try {
        // Use cofhejs.encrypt which returns the proper InEuint64 structure
        const result = await cofhejs.encrypt([Encryptable.uint64(voteChoice)]);

        if (!result.success) {
            console.error('❌ Encryption failed:', result.error);
            return { success: false, error: result.error };
        }

        // The encrypted data is in result.data[0]
        const encrypted = result.data[0];
        console.log('Encrypted vote (InEuint64 object):', encrypted);

        return { success: true, encrypted };
    } catch (error) {
        console.error('❌ Encryption failed:', error);
        return { success: false, error };
    }
}

// Submit the encrypted vote to contract
export async function submitVoteNew(pollId: number, optionId: number, encryptedVote: any, provider: BrowserProvider) {
    try {
        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer);

        console.log('Submitting vote to contract:', { pollId, optionId, encryptedVote });

        const tx = await contract.castVote(BigInt(pollId), BigInt(optionId), encryptedVote);
        console.log('Transaction sent:', tx.hash);

        const receipt = await tx.wait();
        console.log('✅ Vote submitted, tx hash:', receipt.hash);
        return { success: true, txHash: receipt.hash };
    } catch (error) {
        console.error('❌ Vote submission failed:', error);
        return { success: false, error };
    }
}
