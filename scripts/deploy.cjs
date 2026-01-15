const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying SecureVotePoll contract to Arbitrum Sepolia...");

    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

    // Deploy contract
    const SecureVotePoll = await hre.ethers.getContractFactory("SecureVotePoll");
    const contract = await SecureVotePoll.deploy();

    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ SecureVotePoll deployed to:", address);

    // Save deployment info
    const fs = require("fs");
    const deploymentInfo = {
        address: address,
        network: "arbitrumSepolia",
        chainId: 421614,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
        "deployment.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📦 Deployment info saved to deployment.json");
    console.log("\n🔗 View on Explorer:", `https://sepolia.arbiscan.io/address/${address}`);
    console.log("\n⚠️  NEXT STEPS:");
    console.log("1. Update lib/contract.ts with this address");
    console.log("2. Register Chainlink Automation upkeep at: https://automation.chain.link/");
    console.log("   - Select 'Custom logic' upkeep type");
    console.log("   - Use this contract address:", address);
    console.log("   - Recommended gas limit: 500,000");
    console.log("   - You'll need LINK tokens on Arbitrum Sepolia");
    console.log("\n📚 See chainlink-automation-setup.md for detailed setup guide");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
