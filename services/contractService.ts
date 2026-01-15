import { Contract, BrowserProvider } from 'ethers';
import { CONTRACT_ABI, CONTRACT_CONFIG } from '../lib/contract';

/**
 * Submit an encrypted vote to the contract
 * @param pollId - The poll ID
 * @param optionId - The option index to vote for
 * @param encryptedVote - The encrypted vote data from cofhejs
 * @param provider - Ethers provider
 */
export const submitVoteToContract = async (
    pollId: number,
    optionId: number,
    encryptedVote: any,
    provider: BrowserProvider
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    try {
        console.log('🗳️ Submitting vote to contract:', { pollId, optionId, encryptedVote });

        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer);

        // Ensure IDs are BigInt for safety
        const pId = BigInt(pollId);
        const oId = BigInt(optionId);

        // Cast vote with encrypted data
        const tx = await contract.castVote(pId, oId, encryptedVote);
        console.log('📤 Vote transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log('✅ Vote confirmed in block:', receipt.blockNumber);

        return {
            success: true,
            txHash: receipt.hash,
        };
    } catch (error) {
        console.error('❌ Contract interaction error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

/**
 * Create a new poll on-chain
 * @param question - Poll question
 * @param description - Poll description
 * @param category - Poll category
 * @param durationInMinutes - How long the poll should run (in minutes)
 * @param optionCount - Number of voting options
 * @param provider - Ethers provider
 */
export const createPollOnChain = async (
    question: string,
    description: string,
    category: string,
    durationInMinutes: number,
    optionLabels: string[],
    provider: BrowserProvider,
    tokenAddress?: string,
    minimumTokenBalance?: string,
    imageUrl?: string
): Promise<{ success: boolean; pollId?: number; txHash?: string; error?: string }> => {
    try {
        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer);

        // Use address(0) for ungated polls
        const gatingAddress = tokenAddress && tokenAddress !== '' ? tokenAddress : '0x0000000000000000000000000000000000000000';
        const gatingBalance = minimumTokenBalance && minimumTokenBalance !== '' ? BigInt(minimumTokenBalance) : BigInt(0);
        const pollImageUrl = imageUrl || ''; // Empty string if no image

        const tx = await contract.createPoll(
            question,
            description,
            category,
            durationInMinutes,
            optionLabels,
            gatingAddress,
            gatingBalance,
            pollImageUrl
        );

        console.log('📤 Create poll transaction sent:', tx.hash);
        const receipt = await tx.wait();

        // Parse PollCreated event to get poll ID
        const event = receipt.logs.find((log: any) => {
            try {
                const parsed = contract.interface.parseLog(log);
                return parsed?.name === 'PollCreated';
            } catch {
                return false;
            }
        });

        const pollId = event ? Number(event.topics[1]) : 0;

        console.log('✅ Poll created with ID:', pollId);

        return {
            success: true,
            pollId,
            txHash: receipt.hash,
        };
    } catch (error) {
        console.error('❌ Create poll error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

/**
 * Get total number of polls from contract
 */
export const getPollCount = async (
    provider: BrowserProvider
): Promise<number> => {
    try {
        const contract = new Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, provider);
        const count = await contract.pollCounter();
        return Number(count);
    } catch (error) {
        console.error('Error fetching poll count:', error);
        return 0;
    }
};

/**
 * Check if user has already voted in a poll
 */
export const checkHasVoted = async (
    pollId: number,
    userAddress: string,
    provider: BrowserProvider
): Promise<boolean> => {
    try {
        const contract = new Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, provider);
        const hasVoted = await contract.hasVoted(pollId, userAddress);
        return hasVoted;
    } catch (error) {
        console.error('Error checking vote status:', error);
        return false;
    }
};

/**
 * Get poll details from contract
 */
export const getPollFromContract = async (
    pollId: number,
    provider: BrowserProvider
): Promise<any> => {
    try {
        const contract = new Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, provider);
        const [
            question,
            description,
            category,
            endsAt,
            creator,
            isActive,
            resultsRevealed,
            optionCount,
            totalVotes,
            optionLabels,
            tokenAddress,
            minimumTokenBalance,
            imageUrl
        ] = await contract.getPoll(pollId);

        return {
            question,
            description,
            category,
            endsAt: new Date(Number(endsAt) * 1000).toISOString(),
            creator,
            isActive,
            resultsRevealed,
            optionCount: Number(optionCount),
            totalVotes: Number(totalVotes),
            optionLabels: optionLabels || [],
            tokenAddress: tokenAddress || '0x0000000000000000000000000000000000000000',
            minimumTokenBalance: minimumTokenBalance?.toString() || '0',
            imageUrl: imageUrl || ''
        };
    } catch (error) {
        console.error('Error fetching poll:', error);
        return null;
    }
};

/**
 * End a poll (only creator)
 */
export const endPollOnChain = async (
    pollId: number,
    provider: BrowserProvider
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    try {


        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer);

        const tx = await contract.endPoll(pollId);
        const receipt = await tx.wait();

        return { success: true, txHash: receipt.hash };
    } catch (error) {
        console.error('Error ending poll:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

/**
 * Reveal poll results (request decryption)
 */
export const revealResultsOnChain = async (
    pollId: number,
    provider: BrowserProvider
): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    try {


        const signer = await provider.getSigner();
        const contract = new Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, signer);

        const tx = await contract.revealResults(pollId);
        const receipt = await tx.wait();

        return { success: true, txHash: receipt.hash };
    } catch (error) {
        console.error('Error revealing results:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

/**
 * Get decrypted result for a poll option (after reveal)
 */
export const getDecryptedResultFromContract = async (
    pollId: number,
    optionId: number,
    provider: BrowserProvider
): Promise<{ value: bigint; isDecrypted: boolean }> => {
    try {
        const contract = new Contract(CONTRACT_CONFIG.address, CONTRACT_ABI, provider);
        const result = await contract.getDecryptedResult(pollId, optionId);
        return {
            value: result.value,
            isDecrypted: result.isDecrypted,
        };
    } catch (error) {
        console.error('Error getting decrypted result:', error);
        return { value: BigInt(0), isDecrypted: false };
    }
};

/**
 * ERC20 ABI for token balance checks
 */
const ERC20_ABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)'
];

/**
 * Check token balance for an address
 */
export const checkTokenBalance = async (
    userAddress: string,
    tokenAddress: string,
    provider: BrowserProvider
): Promise<{ balance: bigint; symbol: string; decimals: number } | null> => {
    try {
        if (!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
            return null;
        }

        const contract = new Contract(tokenAddress, ERC20_ABI, provider);
        const [balance, symbol, decimals] = await Promise.all([
            contract.balanceOf(userAddress),
            contract.symbol().catch(() => 'TOKEN'),
            contract.decimals().catch(() => 18)
        ]);

        return {
            balance: BigInt(balance.toString()),
            symbol,
            decimals: Number(decimals)
        };
    } catch (error) {
        console.error('Error checking token balance:', error);
        return null;
    }
};
