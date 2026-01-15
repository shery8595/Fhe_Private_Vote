import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { defineChain } from 'viem';

// Alchemy RPC endpoint for Arbitrum Sepolia
const ALCHEMY_RPC = 'https://arb-sepolia.g.alchemy.com/v2/jMuRVURBfpKOORxjfq6PU';

// Define Arbitrum Sepolia chain
export const arbitrumSepolia = defineChain({
    id: 421614,
    name: 'Arbitrum Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: [ALCHEMY_RPC] },
    },
    blockExplorers: {
        default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' },
    },
    testnet: true,
});

// RainbowKit + Wagmi config
export const config = getDefaultConfig({
    appName: 'SecureVote FHE',
    projectId: 'securevote-fhe-demo',
    chains: [arbitrumSepolia],
    transports: {
        [arbitrumSepolia.id]: http(ALCHEMY_RPC),
    },
});

