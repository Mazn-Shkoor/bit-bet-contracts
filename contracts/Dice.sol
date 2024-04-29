// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "hardhat/console.sol";

contract Dice {
    address public owner;

    enum BetDirection {RollOver, RollUnder}

    event BetPlaced(address indexed player, uint256 amount, uint256 target, BetDirection betDirection, uint256 multiplier, uint256 payout, uint256 randomNumber, bool result);

    event RandomNumber(string clientSeed, string serverSeed, string combinedSeed,  bytes32 indexed hashSeed, bytes5 firstTenHash, uint256 firstTenHashInt, uint256 randomNumber);


    constructor() {
        owner = msg.sender;
    }

    // Fallback function to handle failed transfers
    fallback() external {
        // Handle failed transfers here
        // You can emit an event or revert with an error message
        revert("Fallback function: Transfer failed");
    }


    function bet(uint256 target, BetDirection betDirection, string memory clientSeed) external payable {

        require(target >= 0 && target <= 100, "Invalid target number");

        uint256 betAmount = msg.value;

        uint256 randomNumber = generateRandomNumber(clientSeed);

        bool playerWon = isPlayerWinning(betDirection, randomNumber, target);

        uint256 multiplierValue = getMultiplier(target, betDirection);

        uint256 payout = calculateWinningAmount(betAmount, multiplierValue);

        if (playerWon) {
            require(payout <= getHouseFunds(), "Contract balance is insufficient.");
            // payable(msg.sender).transfer(payout);

            // Attempt transfer, fallback function will handle failures
            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success, "Transfer failed");
        }

        emit BetPlaced(msg.sender, betAmount, target, betDirection, multiplierValue, payout, randomNumber, playerWon);

    }

    function generateRandomNumber(string memory clientSeed) private returns (uint256) {

        string memory serverSeed = generateServerSeed();
        // Combine seeds
        string memory combinedSeed = string(abi.encodePacked(clientSeed, serverSeed));

        // Hash the combined seed
        bytes32 hash = sha256(abi.encodePacked(combinedSeed));

        bytes5 firstTenHash = getFirstTen(hash);


        // Convert the hash to uint256
        uint256 hashInt = bytes5ToUint(firstTenHash);


        // Generate random number between 1 and 100
        uint256 randomNumber = (hashInt % 100);

        emit RandomNumber(clientSeed, serverSeed, combinedSeed, hash, firstTenHash, hashInt, randomNumber);

        return randomNumber;
    }


    function getFirstTen(bytes32 data) private pure returns (bytes5) {
        return bytes5(data);
    }

    function bytes5ToUint(bytes5 data) private pure returns (uint256) {
        uint256 result = 0;
        for (uint256 i = 0; i < 5; i++) {
            result = result * 256 + uint8(data[i]);
        }
        return result;
    }

    function generateServerSeed() private view returns (string memory) {
            uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, blockhash(block.number - 1))));
            string memory charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            string memory result = "";

            for (uint256 i = 0; i < 40; i++) {
                uint256 index = (seed / (10**i)) % bytes(charset).length;
                result = string(abi.encodePacked(result, bytes(charset)[index]));
            }

            return result;
        }


    // Function to allow the owner to withdraw house funds
    function withdrawHouseFunds(uint256 amount) external {
        require(msg.sender == owner, "Only owner can withdraw house funds");
        require(amount <= getHouseFunds(), "Not enough funds available");
        payable(owner).transfer(amount);
    }


    function getHouseFunds() public view returns (uint256) {
        return uint(address(this).balance);
    }

    function getMultiplier(uint256 target, BetDirection betDirection) private pure returns (uint256) {
        uint256 maxValue = 100;
        uint256 multiplierValue = 0;

        if (betDirection == BetDirection.RollOver) {
            multiplierValue = (maxValue * maxValue) / (maxValue - target);
        } else {
            multiplierValue = (maxValue * maxValue) / target;
        }

        return multiplierValue;
    }
    
    function calculateWinningAmount(uint256 betAmount, uint256 multiplier) private pure returns (uint256) {
        uint256 winningAmount = (betAmount * multiplier)/ 100;       
        return winningAmount;
    }

    function isPlayerWinning(BetDirection betDirection, uint256 randomNumber, uint256 target) private pure returns (bool){
        bool playerWon;
        if (betDirection == BetDirection.RollOver) {
            playerWon = randomNumber >= target;
        } else {
            playerWon = randomNumber < target;
        }
        return playerWon;
    }
    
}
