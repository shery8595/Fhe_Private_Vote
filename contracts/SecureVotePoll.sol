// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, InEuint64} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

/**
 * @title IERC20
 * @notice Minimal ERC20 interface for token balance checks
 */
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title SecureVotePoll
 * @notice FHE-enabled voting contract for privacy-preserving polls with Chainlink Automation
 * @dev Uses Fhenix FHE to keep votes encrypted on-chain and Chainlink to auto-end polls
 */
contract SecureVotePoll is AutomationCompatibleInterface {
    struct Poll {
        string question;
        string description;
        string category;
        uint256 endsAt;
        address creator;
        bool isActive;
        bool resultsRevealed;
        uint256 optionCount;
        string[] optionLabels;
        // Token-gating fields (address(0) = no gating)
        address tokenAddress;
        uint256 minimumTokenBalance;
        // Optional poll image URL
        string imageUrl;
    }

    // Poll ID => Poll data
    mapping(uint256 => Poll) public polls;
    
    // Poll ID => Option ID => Encrypted vote count
    mapping(uint256 => mapping(uint256 => euint64)) public encryptedVoteCounts;
    
    // Poll ID => Option ID => Decrypted vote count (only after reveal)
    mapping(uint256 => mapping(uint256 => uint64)) public revealedVoteCounts;
    
    // Poll ID => Voter address => Has voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Poll ID => Total votes
    mapping(uint256 => uint256) public totalVotes;

    uint256 public pollCounter;

    // Array to track all active poll IDs for Chainlink automation
    uint256[] private activePollIds;
    // Mapping to track the index of each poll in activePollIds array
    mapping(uint256 => uint256) private activePollIndex;
    // Mapping to check if a poll is in the active array
    mapping(uint256 => bool) private isInActiveArray;

    event PollCreated(uint256 indexed pollId, address indexed creator, string question);
    event VoteCast(uint256 indexed pollId, address indexed voter);
    event PollEnded(uint256 indexed pollId);
    event ResultsRevealed(uint256 indexed pollId);

    /**
     * @notice Create a new poll
     * @param _question The poll question
     * @param _description Detailed description
     * @param _category Category of the poll
     * @param _durationInMinutes How long the poll should be active (in minutes)
     * @param _optionLabels Names of voting options
     * @param _tokenAddress ERC20 token address for gating (address(0) for no gating)
     * @param _minimumTokenBalance Minimum token balance required to vote (ignored if _tokenAddress is address(0))
     * @param _imageUrl Optional image URL for the poll (can be empty string)
     */
    function createPoll(
        string memory _question,
        string memory _description,
        string memory _category,
        uint256 _durationInMinutes,
        string[] memory _optionLabels,
        address _tokenAddress,
        uint256 _minimumTokenBalance,
        string memory _imageUrl
    ) external returns (uint256) {
        uint256 _optionCount = _optionLabels.length;
        require(_optionCount >= 2, "At least 2 options required");
        require(_durationInMinutes > 0, "Duration must be positive");

        uint256 pollId = pollCounter++;
        
        polls[pollId] = Poll({
            question: _question,
            description: _description,
            category: _category,
            endsAt: block.timestamp + (_durationInMinutes * 1 minutes),
            creator: msg.sender,
            isActive: true,
            resultsRevealed: false,
            optionCount: _optionCount,
            optionLabels: _optionLabels,
            tokenAddress: _tokenAddress,
            minimumTokenBalance: _minimumTokenBalance,
            imageUrl: _imageUrl
        });

        // Initialize encrypted vote counts for each option to 0
        for (uint256 i = 0; i < _optionCount; i++) {
            encryptedVoteCounts[pollId][i] = FHE.asEuint64(0);
            FHE.allowThis(encryptedVoteCounts[pollId][i]);
        }

        // Add poll to active tracking array
        activePollIndex[pollId] = activePollIds.length;
        activePollIds.push(pollId);
        isInActiveArray[pollId] = true;

        emit PollCreated(pollId, msg.sender, _question);
        return pollId;
    }

    /**
     * @notice Cast an encrypted vote
     * @param _pollId The poll ID
     * @param _optionId The option to vote for
     * @param _encryptedVote Encrypted vote value (should be encrypted 1)
     */
    function castVote(
        uint256 _pollId,
        uint256 _optionId,
        InEuint64 calldata _encryptedVote
    ) external {
        Poll storage poll = polls[_pollId];
        
        require(poll.isActive, "Poll is not active");
        require(block.timestamp < poll.endsAt, "Poll has ended");
        require(!hasVoted[_pollId][msg.sender], "Already voted");
        require(_optionId < poll.optionCount, "Invalid option");
        
        // Check token-gating requirements
        if (poll.tokenAddress != address(0)) {
            uint256 voterBalance = IERC20(poll.tokenAddress).balanceOf(msg.sender);
            require(
                voterBalance >= poll.minimumTokenBalance,
                "Insufficient token balance to vote"
            );
        }

        // Convert encrypted input to euint64
        euint64 vote = FHE.asEuint64(_encryptedVote);
        
        // Add encrypted vote to the option's count
        encryptedVoteCounts[_pollId][_optionId] = FHE.add(
            encryptedVoteCounts[_pollId][_optionId],
            vote
        );
        
        // Allow contract to use the updated count
        FHE.allowThis(encryptedVoteCounts[_pollId][_optionId]);
        
        // Allow voter to read their vote (for unsealing)
        FHE.allow(encryptedVoteCounts[_pollId][_optionId], msg.sender);

        hasVoted[_pollId][msg.sender] = true;
        totalVotes[_pollId]++;

        emit VoteCast(_pollId, msg.sender);
    }

    /**
     * @notice End a poll
     * @dev Can be called by creator anytime, or by anyone (including Chainlink) after expiration
     * @param _pollId The poll ID
     */
    function endPoll(uint256 _pollId) public {
        Poll storage poll = polls[_pollId];
        require(poll.isActive, "Poll already ended");
        
        // Either creator can end early, or anyone can end after expiration
        require(
            msg.sender == poll.creator || block.timestamp >= poll.endsAt,
            "Only creator can end poll early"
        );

        poll.isActive = false;
        
        // Remove from active polls array
        _removeFromActiveArray(_pollId);
        
        emit PollEnded(_pollId);
    }

    /**
     * @notice Request decryption of all vote counts
     * @dev Can be called by creator anytime after poll ends, or by anyone (including Chainlink) for automatic reveal
     * @param _pollId The poll ID
     */
    function revealResults(uint256 _pollId) public {
        Poll storage poll = polls[_pollId];
        require(!poll.isActive, "Poll must be ended first");
        require(!poll.resultsRevealed, "Results already revealed");

        // Request decryption for all options
        for (uint256 i = 0; i < poll.optionCount; i++) {
            FHE.decrypt(encryptedVoteCounts[_pollId][i]);
        }

        poll.resultsRevealed = true;
        emit ResultsRevealed(_pollId);
    }

    /**
     * @notice Get decrypted result for an option (after reveal)
     * @param _pollId The poll ID
     * @param _optionId The option ID
     */
    function getDecryptedResult(
        uint256 _pollId,
        uint256 _optionId
    ) external view returns (uint128 value, bool isDecrypted) {
        require(polls[_pollId].resultsRevealed, "Results not revealed yet");
        return FHE.getDecryptResultSafe(encryptedVoteCounts[_pollId][_optionId]);
    }

    /**
     * @notice Get encrypted vote count handle (for unsealing client-side)
     * @param _pollId The poll ID
     * @param _optionId The option ID
     */
    function getEncryptedVoteCount(
        uint256 _pollId,
        uint256 _optionId
    ) external view returns (euint64) {
        return encryptedVoteCounts[_pollId][_optionId];
    }

    /**
     * @notice Get poll details
     */
    function getPoll(uint256 _pollId) external view returns (
        string memory question,
        string memory description,
        string memory category,
        uint256 endsAt,
        address creator,
        bool isActive,
        bool resultsRevealed,
        uint256 optionCount,
        uint256 totalVoteCount,
        string[] memory optionLabels,
        address tokenAddress,
        uint256 minimumTokenBalance,
        string memory imageUrl
    ) {
        Poll storage poll = polls[_pollId];
        return (
            poll.question,
            poll.description,
            poll.category,
            poll.endsAt,
            poll.creator,
            poll.isActive,
            poll.resultsRevealed,
            poll.optionCount,
            totalVotes[_pollId],
            poll.optionLabels,
            poll.tokenAddress,
            poll.minimumTokenBalance,
            poll.imageUrl
        );
    }

    /**
     * @notice Chainlink Automation - Check if any polls need automation
     * @dev This is called off-chain by Chainlink nodes to check for both ending and revealing
     * @return upkeepNeeded True if there are polls to process
     * @return performData Encoded struct with poll IDs that need ending and revealing
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        uint256 maxPolls = pollCounter;
        uint256[] memory pollsToEnd = new uint256[](activePollIds.length);
        uint256[] memory pollsToReveal = new uint256[](maxPolls);
        uint256 endCount = 0;
        uint256 revealCount = 0;
        
        // Check all active polls for expiration
        for (uint256 i = 0; i < activePollIds.length; i++) {
            uint256 pollId = activePollIds[i];
            Poll storage poll = polls[pollId];
            
            // If poll is still active and has expired, mark it for ending
            if (poll.isActive && block.timestamp >= poll.endsAt) {
                pollsToEnd[endCount] = pollId;
                endCount++;
            }
        }
        
        // Check all polls for unrevealed results (ended but not revealed)
        for (uint256 pollId = 0; pollId < pollCounter; pollId++) {
            Poll storage poll = polls[pollId];
            
            // If poll is ended but results not yet revealed, mark it for revealing
            if (!poll.isActive && !poll.resultsRevealed) {
                pollsToReveal[revealCount] = pollId;
                revealCount++;
            }
        }
        
        upkeepNeeded = (endCount > 0 || revealCount > 0);
        
        if (upkeepNeeded) {
            // Create properly sized arrays
            uint256[] memory endResult = new uint256[](endCount);
            uint256[] memory revealResult = new uint256[](revealCount);
            
            for (uint256 i = 0; i < endCount; i++) {
                endResult[i] = pollsToEnd[i];
            }
            for (uint256 i = 0; i < revealCount; i++) {
                revealResult[i] = pollsToReveal[i];
            }
            
            performData = abi.encode(endResult, revealResult);
        }
    }

    /**
     * @notice Chainlink Automation - End expired polls and reveal results
     * @dev This is called on-chain by Chainlink when checkUpkeep returns true
     * @param performData Encoded struct with poll IDs to end and reveal
     */
    function performUpkeep(bytes calldata performData) external override {
        (uint256[] memory pollsToEnd, uint256[] memory pollsToReveal) = abi.decode(
            performData,
            (uint256[], uint256[])
        );
        
        // First, end expired polls
        for (uint256 i = 0; i < pollsToEnd.length; i++) {
            uint256 pollId = pollsToEnd[i];
            Poll storage poll = polls[pollId];
            
            // Double-check conditions before ending
            if (poll.isActive && block.timestamp >= poll.endsAt) {
                poll.isActive = false;
                _removeFromActiveArray(pollId);
                emit PollEnded(pollId);
            }
        }
        
        // Then, reveal results for ended polls
        for (uint256 i = 0; i < pollsToReveal.length; i++) {
            uint256 pollId = pollsToReveal[i];
            Poll storage poll = polls[pollId];
            
            // Double-check conditions before revealing
            if (!poll.isActive && !poll.resultsRevealed) {
                // Request decryption for all options
                for (uint256 j = 0; j < poll.optionCount; j++) {
                    FHE.decrypt(encryptedVoteCounts[pollId][j]);
                }
                
                poll.resultsRevealed = true;
                emit ResultsRevealed(pollId);
            }
        }
    }

    /**
     * @notice Internal function to remove a poll from the active array
     * @param _pollId The poll ID to remove
     */
    function _removeFromActiveArray(uint256 _pollId) private {
        if (!isInActiveArray[_pollId]) {
            return; // Already removed
        }
        
        uint256 indexToRemove = activePollIndex[_pollId];
        uint256 lastIndex = activePollIds.length - 1;
        
        // If this isn't the last element, swap with the last element
        if (indexToRemove != lastIndex) {
            uint256 lastPollId = activePollIds[lastIndex];
            activePollIds[indexToRemove] = lastPollId;
            activePollIndex[lastPollId] = indexToRemove;
        }
        
        // Remove the last element
        activePollIds.pop();
        delete activePollIndex[_pollId];
        delete isInActiveArray[_pollId];
    }

    /**
     * @notice Get the number of active polls
     * @return The count of active polls
     */
    function getActivePollCount() external view returns (uint256) {
        return activePollIds.length;
    }

    /**
     * @notice Get all active poll IDs
     * @return Array of active poll IDs
     */
    function getActivePollIds() external view returns (uint256[] memory) {
        return activePollIds;
    }
}
