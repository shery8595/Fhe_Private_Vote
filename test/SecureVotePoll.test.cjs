const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SecureVotePoll - Chainlink Automation", function () {
    let secureVotePoll;
    let owner, voter1, voter2;

    beforeEach(async function () {
        [owner, voter1, voter2] = await ethers.getSigners();

        const SecureVotePoll = await ethers.getContractFactory("SecureVotePoll");
        secureVotePoll = await SecureVotePoll.deploy();
        await secureVotePoll.waitForDeployment();
    });

    describe("Chainlink Automation Integration", function () {
        it("Should return false from checkUpkeep when no polls are expired", async function () {
            // Create a poll with 60 minute duration
            await secureVotePoll.createPoll(
                "Test Poll",
                "Test Description",
                "Technology",
                60,
                ["Option A", "Option B"]
            );

            const [upkeepNeeded] = await secureVotePoll.checkUpkeep("0x");
            expect(upkeepNeeded).to.be.false;
        });

        it("Should return true from checkUpkeep when a poll expires", async function () {
            // Create a poll with 1 minute duration
            await secureVotePoll.createPoll(
                "Test Poll",
                "Test Description",
                "Technology",
                1,
                ["Option A", "Option B"]
            );

            // Fast forward time by 2 minutes
            await time.increase(2 * 60);

            const [upkeepNeeded, performData] = await secureVotePoll.checkUpkeep("0x");
            expect(upkeepNeeded).to.be.true;

            // Decode performData to verify it contains the poll ID
            const pollIds = ethers.AbiCoder.defaultAbiCoder().decode(["uint256[]"], performData);
            expect(pollIds[0].length).to.equal(1);
            expect(pollIds[0][0]).to.equal(0);
        });

        it("Should successfully end expired polls via performUpkeep", async function () {
            // Create a poll with 1 minute duration
            await secureVotePoll.createPoll(
                "Test Poll",
                "Test Description",
                "Technology",
                1,
                ["Option A", "Option B"]
            );

            // Verify poll is active
            const pollBefore = await secureVotePoll.getPoll(0);
            expect(pollBefore.isActive).to.be.true;

            // Fast forward time
            await time.increase(2 * 60);

            // Get the perform data
            const [upkeepNeeded, performData] = await secureVotePoll.checkUpkeep("0x");
            expect(upkeepNeeded).to.be.true;

            // Execute performUpkeep
            await secureVotePoll.performUpkeep(performData);

            // Verify poll is now inactive
            const pollAfter = await secureVotePoll.getPoll(0);
            expect(pollAfter.isActive).to.be.false;
        });

        it("Should handle multiple expired polls in one performUpkeep call", async function () {
            // Create 3 polls with 1 minute duration
            await secureVotePoll.createPoll("Poll 1", "Description", "Tech", 1, ["A", "B"]);
            await secureVotePoll.createPoll("Poll 2", "Description", "Tech", 1, ["A", "B"]);
            await secureVotePoll.createPoll("Poll 3", "Description", "Tech", 1, ["A", "B"]);

            // Fast forward time
            await time.increase(2 * 60);

            // Get perform data
            const [upkeepNeeded, performData] = await secureVotePoll.checkUpkeep("0x");
            expect(upkeepNeeded).to.be.true;

            // Decode to verify all 3 polls are included
            const pollIds = ethers.AbiCoder.defaultAbiCoder().decode(["uint256[]"], performData);
            expect(pollIds[0].length).to.equal(3);

            // Execute performUpkeep
            await secureVotePoll.performUpkeep(performData);

            // Verify all polls are now inactive
            const poll0 = await secureVotePoll.getPoll(0);
            const poll1 = await secureVotePoll.getPoll(1);
            const poll2 = await secureVotePoll.getPoll(2);

            expect(poll0.isActive).to.be.false;
            expect(poll1.isActive).to.be.false;
            expect(poll2.isActive).to.be.false;
        });

        it("Should allow creator to end poll early", async function () {
            await secureVotePoll.createPoll(
                "Test Poll",
                "Test Description",
                "Technology",
                60,
                ["Option A", "Option B"]
            );

            // Creator should be able to end poll before expiration
            await secureVotePoll.connect(owner).endPoll(0);

            const poll = await secureVotePoll.getPoll(0);
            expect(poll.isActive).to.be.false;
        });

        it("Should allow anyone to end poll after expiration", async function () {
            await secureVotePoll.createPoll(
                "Test Poll",
                "Test Description",
                "Technology",
                1,
                ["Option A", "Option B"]
            );

            // Fast forward time
            await time.increase(2 * 60);

            // Non-creator should be able to end expired poll
            await secureVotePoll.connect(voter1).endPoll(0);

            const poll = await secureVotePoll.getPoll(0);
            expect(poll.isActive).to.be.false;
        });

        it("Should prevent non-creator from ending poll early", async function () {
            await secureVotePoll.createPoll(
                "Test Poll",
                "Test Description",
                "Technology",
                60,
                ["Option A", "Option B"]
            );

            // Non-creator should NOT be able to end poll before expiration
            await expect(
                secureVotePoll.connect(voter1).endPoll(0)
            ).to.be.revertedWith("Only creator can end poll early");
        });

        it("Should correctly track active poll count", async function () {
            expect(await secureVotePoll.getActivePollCount()).to.equal(0);

            await secureVotePoll.createPoll("Poll 1", "Desc", "Tech", 60, ["A", "B"]);
            expect(await secureVotePoll.getActivePollCount()).to.equal(1);

            await secureVotePoll.createPoll("Poll 2", "Desc", "Tech", 60, ["A", "B"]);
            expect(await secureVotePoll.getActivePollCount()).to.equal(2);

            // End one poll
            await secureVotePoll.endPoll(0);
            expect(await secureVotePoll.getActivePollCount()).to.equal(1);

            // End the other poll
            await secureVotePoll.endPoll(1);
            expect(await secureVotePoll.getActivePollCount()).to.equal(0);
        });

        it("Should correctly return active poll IDs", async function () {
            await secureVotePoll.createPoll("Poll 1", "Desc", "Tech", 60, ["A", "B"]);
            await secureVotePoll.createPoll("Poll 2", "Desc", "Tech", 60, ["A", "B"]);

            const activeIds = await secureVotePoll.getActivePollIds();
            expect(activeIds.length).to.equal(2);
            expect(activeIds[0]).to.equal(0);
            expect(activeIds[1]).to.equal(1);
        });
    });
});
