import { cofhejs, FheTypes, Encryptable } from 'cofhejs/web';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

// Track initialization state
let isInitialized = false;

/**
 * Initialize CoFHE with ethers provider and signer
 * This must be called before any encryption/decryption operations
 */
export const initializeCofhe = async (
    provider: BrowserProvider,
    signer: JsonRpcSigner
): Promise<{ success: boolean; error?: string }> => {
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
            console.log('✅ CoFHE initialized successfully');
        } else {
            console.error('❌ CoFHE initialization failed:', result.error);
        }

        return result;
    } catch (error) {
        console.error('❌ CoFHE initialization error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown initialization error',
        };
    }
};

/**
 * Encrypt a vote choice using CoFHE
 * @param voteChoice - The vote option ID as a bigint (e.g., 0n, 1n, 2n)
 * @param onProgress - Callback for encryption state updates
 * @returns Encrypted vote data as a string
 */
export const encryptVote = async (
    voteChoice: bigint,
    onProgress?: (state: string) => void
): Promise<{ success: boolean; data?: string; error?: string }> => {
    if (!isInitialized) {
        return {
            success: false,
            error: 'CoFHE not initialized. Please connect your wallet first.',
        };
    }

    try {
        const encryptResult = await cofhejs.encrypt(
            [Encryptable.uint64(voteChoice)],
            onProgress
        );

        if (!encryptResult.success) {
            console.error('❌ Encryption failed:', encryptResult.error);
            return {
                success: false,
                error: encryptResult.error,
            };
        }

        console.log('✅ Vote encrypted successfully');
        return {
            success: true,
            data: encryptResult.data[0],
        };
    } catch (error) {
        console.error('❌ Encryption error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown encryption error',
        };
    }
};

/**
 * Create a permit for unsealing encrypted data
 * @param issuerAddress - The wallet address creating the permit
 */
export const createPermit = async (
    issuerAddress: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
    if (!isInitialized) {
        return {
            success: false,
            error: 'CoFHE not initialized. Please connect your wallet first.',
        };
    }

    try {
        const permitResult = await cofhejs.createPermit({
            type: 'self',
            issuer: issuerAddress,
        });

        if (!permitResult.success) {
            console.error('❌ Permit creation failed:', permitResult.error);
            return {
                success: false,
                error: permitResult.error,
            };
        }

        console.log('✅ Permit created successfully');
        return permitResult;
    } catch (error) {
        console.error('❌ Permit creation error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown permit error',
        };
    }
};

/**
 * Unseal encrypted data
 * @param encryptedValue - The encrypted value handle from the contract
 * @param issuer - The permit issuer address
 * @param permitHash - The permit hash
 */
export const unsealValue = async (
    encryptedValue: string,
    issuer: string,
    permitHash: string
): Promise<{ success: boolean; data?: bigint; error?: string }> => {
    if (!isInitialized) {
        return {
            success: false,
            error: 'CoFHE not initialized. Please connect your wallet first.',
        };
    }

    try {
        const unsealResult = await cofhejs.unseal(
            encryptedValue,
            FheTypes.Uint64,
            issuer,
            permitHash
        );

        if (!unsealResult.success) {
            console.error('❌ Unsealing failed:', unsealResult.error);
            return {
                success: false,
                error: unsealResult.error,
            };
        }

        console.log('✅ Value unsealed successfully');
        return unsealResult;
    } catch (error) {
        console.error('❌ Unsealing error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown unsealing error',
        };
    }
};

/**
 * Check if CoFHE is initialized
 */
export const isCofheReady = (): boolean => {
    return isInitialized;
};
