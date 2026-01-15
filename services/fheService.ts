
import { EncryptionState } from '../types';
import { encryptVoteNew } from './newCofhe';

/**
 * InEuint64 type definition for encrypted vote data
 * This matches the contract's expected struct format
 */
export interface InEuint64 {
  ctHash: bigint;
  securityZone: number;
  utype: number;
  signature: string;
}

/**
 * Encrypt a vote using the new CoFHE object-based API
 * Returns InEuint64 object that can be passed directly to the contract
 */
export const encryptVoteForSubmission = async (
  voteChoice: bigint,
  onProgress: (state: EncryptionState) => void
): Promise<InEuint64> => {
  // Start encryption progress
  onProgress({
    isEncrypting: true,
    progress: 20,
    message: 'Initializing FHE encryption...',
    cofheState: 'Extract',
  });

  onProgress({
    isEncrypting: true,
    progress: 50,
    message: 'Encrypting vote with FHE...',
    cofheState: 'Pack',
  });

  // Use the new object-based API that returns InEuint64
  const result = await encryptVoteNew(voteChoice);

  if (!result.success) {
    throw new Error(result.error instanceof Error ? result.error.message : 'Encryption failed');
  }

  onProgress({
    isEncrypting: true,
    progress: 90,
    message: 'Finalizing encrypted vote...',
    cofheState: 'Verify',
  });

  // Final state
  onProgress({
    isEncrypting: false,
    progress: 100,
    message: 'Vote encrypted successfully!',
    cofheState: 'Done',
  });

  // Return the InEuint64 object directly - do NOT convert to string
  return result.encrypted as InEuint64;
};

/**
 * Mock transaction submission
 * TODO: Replace with real contract interaction in Phase 3
 */
export const mockSubmitTransaction = async (): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};
