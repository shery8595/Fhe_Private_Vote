// Contract configuration
export const CONTRACT_CONFIG = {
    // Deployed contract with Chainlink Automation + Token-Gating
    address: '0x744d70e58B9eE0D3e09372c0BB33e1C332A05B4c' as const,

    // Arbitrum Sepolia chain ID
    chainId: 421614,
} as const;

// Contract ABI - only the functions we need for the frontend
export const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "pollCounter",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_question", "type": "string" },
            { "internalType": "string", "name": "_description", "type": "string" },
            { "internalType": "string", "name": "_category", "type": "string" },
            { "internalType": "uint256", "name": "_durationInMinutes", "type": "uint256" },
            { "internalType": "string[]", "name": "_optionLabels", "type": "string[]" },
            { "internalType": "address", "name": "_tokenAddress", "type": "address" },
            { "internalType": "uint256", "name": "_minimumTokenBalance", "type": "uint256" }
        ],
        "name": "createPoll",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_pollId", "type": "uint256" },
            { "internalType": "uint256", "name": "_optionId", "type": "uint256" },
            {
                "components": [
                    { "internalType": "uint256", "name": "ctHash", "type": "uint256" },
                    { "internalType": "uint8", "name": "securityZone", "type": "uint8" },
                    { "internalType": "uint8", "name": "utype", "type": "uint8" },
                    { "internalType": "bytes", "name": "signature", "type": "bytes" }
                ],
                "internalType": "struct InEuint64",
                "name": "_encryptedVote",
                "type": "tuple"
            }
        ],
        "name": "castVote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_pollId", "type": "uint256" }],
        "name": "endPoll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_pollId", "type": "uint256" }],
        "name": "revealResults",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_pollId", "type": "uint256" },
            { "internalType": "uint256", "name": "_optionId", "type": "uint256" }
        ],
        "name": "getDecryptedResult",
        "outputs": [
            { "internalType": "uint128", "name": "value", "type": "uint128" },
            { "internalType": "bool", "name": "isDecrypted", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_pollId", "type": "uint256" },
            { "internalType": "uint256", "name": "_optionId", "type": "uint256" }
        ],
        "name": "getEncryptedVoteCount",
        "outputs": [{ "internalType": "euint64", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "_pollId", "type": "uint256" }],
        "name": "getPoll",
        "outputs": [
            { "internalType": "string", "name": "question", "type": "string" },
            { "internalType": "string", "name": "description", "type": "string" },
            { "internalType": "string", "name": "category", "type": "string" },
            { "internalType": "uint256", "name": "endsAt", "type": "uint256" },
            { "internalType": "address", "name": "creator", "type": "address" },
            { "internalType": "bool", "name": "isActive", "type": "bool" },
            { "internalType": "bool", "name": "resultsRevealed", "type": "bool" },
            { "internalType": "uint256", "name": "optionCount", "type": "uint256" },
            { "internalType": "uint256", "name": "totalVoteCount", "type": "uint256" },
            { "internalType": "string[]", "name": "optionLabels", "type": "string[]" },
            { "internalType": "address", "name": "tokenAddress", "type": "address" },
            { "internalType": "uint256", "name": "minimumTokenBalance", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_pollId", "type": "uint256" },
            { "internalType": "address", "name": "", "type": "address" }
        ],
        "name": "hasVoted",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "pollId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": false, "internalType": "string", "name": "question", "type": "string" }
        ],
        "name": "PollCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "pollId", "type": "uint256" },
            { "indexed": true, "internalType": "address", "name": "voter", "type": "address" }
        ],
        "name": "VoteCast",
        "type": "event"
    }
] as const;
