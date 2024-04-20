const { ethers } = require("hardhat");
const crypto = require("crypto");
require("dotenv").config();

const DEPLOYED_CONTRACT_ADDRESS = process.env.DEPLOYED_CONTRACT_ADDRESS;
// const contractABI = require("../artifacts/contracts/Dice.sol/Dice.json");

async function main() {
  try {
    const accounts = await ethers.provider.send("eth_accounts");
    const balance = await ethers.provider.getBalance(accounts[0]);
    console.log("Accounts:", accounts[0]);
    console.log("Balance: ", balance);

    // Get the provider from Hardhat
    // const provider = ethers.provider;

    // const contractAddress = "0xC8B0C089007CB7D3fD5BeA0b7fb2d1FA72a5f6DB";

    // Load the ABI from the compiled artifact file
    // const contractArtifact = require("../artifacts/contracts/Dice.sol/Dice.json");
    // const contractABI = contractArtifact.abi;

    // Connect to the contract
    // const contract = new ethers.Contract(
    //   contractAddress,
    //   contractABI,
    //   provider
    // );

    // Call the function to fetch results
    // try {
    //   const result = await contract.getResults(); // Replace 'getResults()' with your actual function name

    //   // Do something with the result
    //   console.log(result);
    // } catch (error) {
    //   console.error("Error fetching results:", error);
    // }

    // const contractBalance = await ethers.provider.getBalance(contractAddress);
    // console.log("Contract Balance: ", contractBalance);

    const Dice = await ethers.getContractFactory("Dice");
    const contract = await Dice.attach(DEPLOYED_CONTRACT_ADDRESS);

    // const randomNumber = await contract.generateRandomNumber();
    // console.log("Random Number : ", randomNumber);

    const target = 50;
    const betDirection = 1;
    const amountToSend = ethers.parseEther("0.1");

    console.log("Target: ", target);
    if (betDirection === 0) {
      console.log("Bet Direction: RollOver");
    } else {
      console.log("Bet Direction: RollUnder");
    }

    // console.log("Bet Amount: ", amountToSend);

    // const multiplierValue = await contract.getMultiplier(target, betDirection);
    // console.log("Multiplier: ", multiplierValue);

    // const winningAmount = await contract.calculateWinningAmount(
    //   amountToSend,
    //   multiplierValue
    // );
    // console.log("Winning Amount: ", winningAmount);

    // try {
    //   let clientSeed = generateRandomClientSeed();
    //   console.log("Client Seed: ", clientSeed);

    //   const tx = await contract.bet(target, betDirection, clientSeed, {
    //     value: amountToSend,
    //   });
    // } catch (error) {
    //   console.error(error.message);
    // }

    try {
      const amountInWei = ethers.parseEther("0.1"); // Withdraw 1 ETH, specify amount in Ether
      const transaction = await contract.withdrawHouseFunds(amountInWei);
      // const withdraw = await contract.withdrawHouseFunds(1000000000000000000);
      console.log(transaction.hash);
    } catch (error) {
      console.log(error.message);
    }

    // try {
    //   let clientSeed = generateRandomClientSeed();
    //   console.log("Client Seed: ", clientSeed);

    //   const randomNumber = await contract.generateRandomNumber(clientSeed);
    //   console.log(randomNumber);
    // } catch (error) {
    //   console.log(error);
    // }

    // const contractBalance = await ethers.provider.getBalance(contractAddress);
    // console.log("Contract Balance: ", contractBalance);

    // const houseFunds = await contract.getHouseFunds();
    // console.log("House Funds: ", houseFunds);

    // const result = await contract.isPlayerWinning(
    //   betDirection,
    //   randomNumber,
    //   target
    // );

    // console.log("Winning: ", result);

    // console.log("Result: ", result);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

function generateRandomClientSeed() {
  return crypto.randomBytes(40).toString("hex");
}

main();
