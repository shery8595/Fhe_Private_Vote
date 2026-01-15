<div align="center">
<img width="1200" height="475" alt="SecureVote-FHE Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# SecureVote-FHE 🗳️🔒

**Privacy-Preserving Decentralized Voting Platform with Fully Homomorphic Encryption**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.25-blue.svg)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Fhenix](https://img.shields.io/badge/Fhenix-CoFHE-brightgreen.svg)](https://www.fhenix.io/)
[![Chainlink](https://img.shields.io/badge/Chainlink-Automation-375bd2.svg)](https://chain.link/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Live Demo](#) • [Documentation](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Smart Contract Deployment](#-smart-contract-deployment)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Chainlink Automation Setup](#-chainlink-automation-setup)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**SecureVote-FHE** is a cutting-edge decentralized voting platform that leverages **Fully Homomorphic Encryption (FHE)** to ensure complete vote privacy while maintaining transparency and verifiability on the blockchain. Built on **Arbitrum Sepolia** with **Fhenix CoFHE** protocol, SecureVote enables users to create and participate in polls where votes remain encrypted on-chain and are only revealed after the poll ends.

### Why SecureVote-FHE?

Traditional blockchain voting solutions face a critical challenge: transparency vs. privacy. Votes stored on-chain can be decrypted or analyzed before polls end, leading to vote manipulation and coercion. SecureVote-FHE solves this by:

- **Encrypting votes on-chain** using FHE, making them impossible to decrypt until the poll creator reveals results
- **Computing on encrypted data** through homomorphic operations without exposing individual votes
- **Automating poll lifecycle** with Chainlink Automation for trustless execution
- **Token-gating participation** to ensure only qualified voters can participate

---

## ✨ Key Features

### 🔐 Privacy-First Voting
- **Fully Homomorphic Encryption**: Votes remain encrypted on-chain using Fhenix CoFHE protocol
- **Zero-Knowledge Proofs**: Verify vote validity without revealing voter choices
- **Private Vote Aggregation**: Tally encrypted votes without decrypting individual ballots

### 🎨 Rich Poll Creation
- **Multi-Option Polls**: Support for 2+ voting options with custom labels
- **Custom Categories**: Organize polls by Politics, Technology, Entertainment, Sports, and more
- **Poll Metadata**: Add descriptions, images, and detailed information
- **Flexible Duration**: Set custom poll durations from minutes to days

### 🛡️ Advanced Access Control
- **Token-Gating**: Require voters to hold specific ERC20 tokens with minimum balances
- **One Vote Per Address**: Prevent double-voting with on-chain verification
- **Creator Controls**: Poll creators can end polls early and reveal results

### ⚡ Automated Lifecycle Management
- **Chainlink Automation**: Automatically end polls when duration expires
- **Auto-Reveal Results**: Trigger decryption and result revelation automatically
- **Gas-Efficient Batching**: Process multiple poll endings in a single transaction

### 📊 Real-Time Analytics
- **Live Vote Counting**: Track total votes cast in real-time (without revealing choices)
- **Results Visualization**: Beautiful charts and graphs using Recharts
- **Poll Statistics**: View poll status, participation rates, and trending polls

### 🎯 User Experience
- **Wallet Integration**: Seamless connection with RainbowKit supporting multiple wallets
- **Responsive Design**: Works flawlessly on desktop, tablet, and mobile devices
- **Confetti Celebrations**: Delightful animations when voting and revealing results
- **AI-Powered Manifesto**: Gemini AI-generated project descriptions

---

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity 0.8.25** - Smart contract programming language
- **Hardhat** - Ethereum development environment
- **Fhenix CoFHE Contracts** - Fully Homomorphic Encryption library
- **Chainlink Automation** - Decentralized automation network

### Frontend
- **React 19.2** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **Wagmi/Viem** - Ethereum interaction libraries
- **RainbowKit** - Wallet connection UI

### Encryption & Privacy
- **CoFHE.js** - Client-side FHE library
- **Fhenix Protocol** - FHE-enabled blockchain infrastructure

### DevOps & Tools
- **Ethers.js v6** - Ethereum library
- **Recharts** - Charting library for results visualization
- **Google Gemini AI** - AI-powered content generation

### Network
- **Arbitrum Sepolia Testnet** (Chain ID: 421614)
- **Fhenix Helium** - FHE-enabled blockchain

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  React Frontend │ ◄─────► │  CoFHE.js SDK   │ ◄─────► │ Fhenix Relayer  │
│  (User Interface)│         │  (FHE Client)   │         │  (Decryption)   │
│                 │         │                  │         │                 │
└────────┬────────┘         └──────────────────┘         └─────────────────┘
         │                                                         ▲
         │ Web3 Calls                                             │
         │ (Wagmi/Viem)                                           │
         ▼                                                         │
┌─────────────────────────────────────────────────────────────────┴────┐
│                                                                       │
│               SecureVotePoll Smart Contract                          │
│               (Deployed on Arbitrum Sepolia)                         │
│                                                                       │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ Poll Creation   │  │ FHE Voting   │  │ Result Revelation  │     │
│  │ & Management    │  │ Logic        │  │ & Decryption       │     │
│  └─────────────────┘  └──────────────┘  └────────────────────┘     │
│                                                                       │
└───────────────────────────────────▲───────────────────────────────────┘
                                    │
                                    │ Automation
                                    │
                          ┌─────────┴──────────┐
                          │                    │
                          │ Chainlink Keepers  │
                          │ (Auto-end polls)   │
                          │                    │
                          └────────────────────┘
```

### Smart Contract Components

#### Poll Structure
```solidity
struct Poll {
    string question;           // Poll question
    string description;        // Detailed description
    string category;           // Category (Politics, Tech, etc.)
    uint256 endsAt;           // Unix timestamp for poll expiration
    address creator;          // Poll creator address
    bool isActive;            // Active status
    bool resultsRevealed;     // Whether results are decrypted
    uint256 optionCount;      // Number of voting options
    string[] optionLabels;    // Option names
    address tokenAddress;     // Token-gating address (0x0 = no gating)
    uint256 minimumTokenBalance; // Minimum tokens required to vote
    string imageUrl;          // Optional poll image
}
```

#### Key Functions
- **`createPoll()`** - Create a new encrypted poll
- **`castVote()`** - Submit an encrypted vote using FHE
- **`endPoll()`** - End a poll (creator or after expiration)
- **`revealResults()`** - Trigger FHE decryption of vote counts
- **`checkUpkeep()`** - Chainlink automation check
- **`performUpkeep()`** - Chainlink automation execution

### Frontend Architecture

```
src/
├── views/                  # Page components
│   ├── LandingPage.tsx    # Home page with poll carousel
│   ├── CreationSuite.tsx  # Poll creation wizard
│   ├── VotingBooth.tsx    # Voting interface
│   ├── ResultsCenter.tsx  # Results visualization
│   ├── Dashboard.tsx      # User dashboard
│   └── Profile.tsx        # User profile
├── components/            # Reusable components
│   ├── PollCard.tsx      # Poll display card
│   └── PrivacyIndicator.tsx # FHE status indicator
├── services/              # Business logic
│   ├── cofhe.ts          # CoFHE initialization
│   ├── fheService.ts     # FHE encryption utilities
│   └── contractService.ts # Smart contract interactions
├── lib/                   # Libraries
└── constants/             # App constants
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **MetaMask** or another Web3 wallet
- **Git** for cloning the repository

### Network Requirements
- Access to **Arbitrum Sepolia Testnet**
- Test ETH for gas fees ([Get from Arbitrum Faucet](https://faucet.quicknode.com/arbitrum/sepolia))
- LINK tokens for Chainlink Automation ([Get from Chainlink Faucet](https://faucets.chain.link/arbitrum-sepolia))

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/securevote-fhe.git
cd securevote-fhe
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React and React DOM
- Wagmi, Viem, and RainbowKit for Web3 interactions
- CoFHE.js for FHE operations
- Hardhat and Solidity development tools
- Recharts for data visualization

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your private key:

```env
# Deployer wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here_without_0x
```

> ⚠️ **Security Warning**: Never commit your private key. Ensure `.env` is in `.gitignore`.

---

## 📜 Smart Contract Deployment

### 1. Configure Network

The project is pre-configured for **Arbitrum Sepolia** in `hardhat.config.cjs`:

```javascript
networks: {
    arbitrumSepolia: {
        url: "https://arb-sepolia.g.alchemy.com/v2/jMuRVURBfpKOORxjfq6PU",
        accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        chainId: 421614,
    },
}
```

### 2. Deploy Contract

Deploy the `SecureVotePoll` contract to Arbitrum Sepolia:

```bash
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

### 3. Verify Deployment

After successful deployment, you'll see:

```
SecureVotePoll deployed to: 0x...
Network: arbitrumSepolia
Chain ID: 421614
```

The deployment information is saved to `deployment.json`.

### 4. Verify Contract (Optional)

Verify your contract on Arbiscan:

```bash
npx hardhat verify --network arbitrumSepolia <CONTRACT_ADDRESS>
```

---

## ⚙️ Configuration

### Frontend Configuration

The deployed contract address is automatically loaded from `deployment.json`. Update `constants/` if you need to customize:

**Contract Address**: Found in `deployment.json`

```json
{
  "address": "0xe1905D9235E20d6aA0Cbf7E672565fe3f72A729c",
  "network": "arbitrumSepolia",
  "chainId": 421614
}
```

### Wallet Configuration

RainbowKit is configured in `index.tsx` with support for:
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet
- And more...

### FHE Configuration

CoFHE is initialized in `services/cofhe.ts` with:
- **Environment**: `helium` (Fhenix testnet)
- **Network**: Arbitrum Sepolia (421614)
- **Provider**: Via Wagmi/Viem

---

## 🏃 Running the Application

### Development Mode

Start the Vite development server:

```bash
npm run dev
```

The application will be available at:
```
http://localhost:5173
```

### Production Build

Build the application for production:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Deploying to Vercel

The project includes a `vercel.json` configuration for easy deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 🤖 Chainlink Automation Setup

Chainlink Automation automatically ends polls when they expire and reveals results.

### Quick Setup

1. **Get LINK Tokens**
   - Visit [Chainlink Faucet](https://faucets.chain.link/arbitrum-sepolia)
   - Request LINK on Arbitrum Sepolia

2. **Register Upkeep**
   - Go to [Chainlink Automation](https://automation.chain.link/)
   - Click "Register new Upkeep"
   - Select "Custom logic"
   - Enter your contract address from `deployment.json`

3. **Configure Upkeep**
   - **Contract Address**: Your deployed contract
   - **Upkeep Name**: "SecureVotePoll Auto-End"
   - **Gas Limit**: 500,000
   - **Starting Balance**: 5 LINK

4. **Fund and Activate**
   - Approve LINK spending
   - Confirm transaction
   - Monitor in Chainlink dashboard

### How It Works

The smart contract implements `AutomationCompatibleInterface`:

- **`checkUpkeep()`**: Chainlink nodes call this to check for expired polls
- **`performUpkeep()`**: Automatically ends expired polls and reveals results
- **Gas Costs**: Deducted from your LINK balance

For detailed instructions, see [`chainlink-automation-setup.md`](chainlink-automation-setup.md).

---

## 📖 Usage Guide

### Creating a Poll

1. **Connect Wallet**
   - Click "Connect Wallet" in the header
   - Select your wallet provider
   - Ensure you're on Arbitrum Sepolia

2. **Navigate to Creation Suite**
   - Click "Create Poll" from the navigation

3. **Fill Poll Details**
   - **Question**: Enter your poll question
   - **Description**: Provide context and details
   - **Category**: Select a category (Politics, Tech, Entertainment, etc.)
   - **Duration**: Set how long the poll should run (in minutes)
   - **Options**: Add 2+ voting options
   - **Image** (optional): Provide an image URL
   - **Token-Gating** (optional): Specify ERC20 token and minimum balance

4. **Submit**
   - Review your poll
   - Click "Create Poll"
   - Confirm the transaction in your wallet
   - Wait for confirmation

### Voting on a Poll

1. **Browse Polls**
   - View active polls on the Landing Page
   - Or navigate to Voting Booth

2. **Select a Poll**
   - Click on a poll card to view details

3. **Cast Your Vote**
   - Review poll information
   - Select your preferred option
   - Click "Cast Vote"
   - Confirm the FHE encryption transaction
   - Your vote is now encrypted on-chain! 🎉

> 💡 **Note**: Votes are encrypted using FHE and cannot be decrypted until the poll creator reveals results.

### Viewing Results

1. **Wait for Poll to End**
   - Polls automatically end after their duration expires (via Chainlink)
   - Or the creator can end early

2. **Reveal Results**
   - Results are automatically revealed after the poll ends
   - Or the creator can manually trigger revelation

3. **View Analytics**
   - Navigate to Results Center
   - View beautiful charts with vote distributions
   - See option-by-option breakdowns
   - Confetti celebration! 🎊

### Managing Your Polls

Navigate to **Profile** or **Dashboard** to:
- View your created polls
- See polls you've voted in
- End active polls early
- Reveal results for ended polls
- Track poll statistics

---

## 📁 Project Structure

```
securevote-fhe/
├── contracts/                    # Smart contracts
│   └── SecureVotePoll.sol       # Main FHE voting contract
├── scripts/                      # Deployment scripts
│   └── deploy.js                # Contract deployment script
├── test/                         # Smart contract tests
├── views/                        # React page components
│   ├── LandingPage.tsx          # Home page
│   ├── CreationSuite.tsx        # Poll creation
│   ├── VotingBooth.tsx          # Voting interface
│   ├── ResultsCenter.tsx        # Results display
│   ├── Dashboard.tsx            # User dashboard
│   ├── Profile.tsx              # User profile
│   ├── Technology.tsx           # Technology overview
│   ├── Manifesto.tsx            # Project manifesto
│   ├── Whitepaper.tsx           # Technical whitepaper
│   └── DebugFHE.tsx             # FHE debugging tools
├── components/                   # Reusable React components
│   ├── PollCard.tsx             # Poll display card
│   └── PrivacyIndicator.tsx     # FHE status indicator
├── services/                     # Business logic layer
│   ├── cofhe.ts                 # CoFHE initialization & config
│   ├── newCofhe.ts              # Alternative CoFHE setup
│   ├── fheService.ts            # FHE encryption utilities
│   └── contractService.ts       # Contract interaction layer
├── lib/                          # Shared utilities
├── constants/                    # App constants
│   └── index.ts                 # Contract ABI and addresses
├── App.tsx                       # Main application component
├── index.tsx                     # Application entry point
├── index.css                     # Global styles
├── types.ts                      # TypeScript type definitions
├── hardhat.config.cjs           # Hardhat configuration
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── vercel.json                  # Vercel deployment config
├── deployment.json              # Contract deployment info
├── chainlink-automation-setup.md # Chainlink setup guide
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs

Open an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Feature Requests

Open an issue with:
- Clear description of the feature
- Use cases and benefits
- Proposed implementation (optional)

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Fhenix Protocol](https://www.fhenix.io/)** - For providing FHE infrastructure
- **[Chainlink](https://chain.link/)** - For decentralized automation
- **[Arbitrum](https://arbitrum.io/)** - For L2 scaling solution
- **[RainbowKit](https://www.rainbowkit.com/)** - For beautiful wallet UX
- **[Wagmi](https://wagmi.sh/)** - For React hooks for Ethereum

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/securevote-fhe/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/securevote-fhe/discussions)
- **Email**: your.email@example.com

---

## 🔗 Links

- **Live Demo**: [https://securevote-fhe.vercel.app](https://securevote-fhe.vercel.app)
- **Contract on Arbiscan**: [View Contract](https://sepolia.arbiscan.io/address/0xe1905D9235E20d6aA0Cbf7E672565fe3f72A729c)
- **Fhenix Docs**: [https://docs.fhenix.io](https://docs.fhenix.io)
- **Chainlink Automation**: [https://automation.chain.link](https://automation.chain.link)

---

<div align="center">

**Built with ❤️ using Fhenix, Chainlink, and Arbitrum**

⭐ Star us on GitHub — it helps!

[⬆ Back to Top](#securevote-fhe-️)

</div>
