const { ethers, artifacts } = require("hardhat");
const crypto = require("crypto");
require("dotenv").config();

const DEPLOYED_CONTRACT_ADDRESS = process.env.DEPLOYED_CONTRACT_ADDRESS;

async function main() {
  try {
    const accounts = await ethers.provider.send("eth_accounts");
    const balance = await ethers.provider.getBalance(accounts[0]);
    console.log("Accounts:", accounts[0]);
    console.log("Balance: ", balance);

    const Dice = await ethers.getContractFactory("Dice");
    const contract = await Dice.attach(DEPLOYED_CONTRACT_ADDRESS);

    // const randomNumber = await contract.generateRandomNumber();
    // console.log("Random Number : ", randomNumber);

    const target = 30;
    const betDirection = 1;
    const amountToSend = ethers.parseEther("0.1");

    console.log("Target: ", target);
    if (betDirection === 0) {
      console.log("Bet Direction: RollOver");
    } else {
      console.log("Bet Direction: RollUnder");
    }

    try {
      let clientSeed = generateRandomClientSeed();
      console.log("Client Seed: ", clientSeed);

      const tx = await contract.bet(target, betDirection, clientSeed, {
        value: amountToSend,
      });

      // get deployed contract
      const myContract = await ethers.getContractAt(
        Dice.interface,
        DEPLOYED_CONTRACT_ADDRESS
      );

      const filter = myContract.filters.BetPlaced();
      const filterRandomNumber = myContract.filters.RandomNumber();

      // Subscribe to the event
      myContract.on(filter, (eventData) => {
        const args = eventData.args;

        const player = args[0];
        const amount = args[1];
        const target = args[2];
        const betDirection = args[3];
        const multiplier = args[4];
        const payout = args[5];
        const randomNumber = args[6];
        const result = args[7];

        console.log("BetPlaced Event:");
        console.log("-------------------");

        console.log("Player:", player);
        console.log("Amount:", ethers.formatEther(amount), "eth");
        console.log("Target:", target);
        console.log("Bet Direction:", betDirection);
        console.log("Multiplier:", multiplier);
        console.log("Payout:", ethers.formatEther(payout), "eth");
        console.log("Random Number:", randomNumber);
        console.log("Result:", result);
      });

      // Subscribe to the RandomNumber event
      myContract.on(filterRandomNumber, (eventData) => {
        const args = eventData.args;

        const clientSeed = args[0];
        const serverSeed = args[1];
        const combinedSeed = args[2];
        const hashSeed = args[3];
        const firstTenHash = args[4];
        const firstTenHashInt = args[5];
        const randomNumber = args[6];

        console.log("RandomNumber Event:");
        console.log("-------------------");

        console.log("Client Seed:", clientSeed);
        console.log("Server Seed:", serverSeed);
        console.log("Combined Seed:", combinedSeed);
        console.log("Hash Seed:", hashSeed);
        console.log("First Ten Hash:", firstTenHash);
        console.log("First Ten Hash Int:", firstTenHashInt);
        console.log("Random Number:", randomNumber);
      });

      // Wait for the event
      await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait for half a minute

      // Unsubscribe from the event
      myContract.removeAllListeners();

      // console.log(tx);
    } catch (error) {
      console.error(error.message);
    }

    // try {
    //   const amountInWei = ethers.parseEther("0.6"); // Withdraw 1 ETH, specify amount in Ether
    //   const transaction = await contract.withdrawHouseFunds(amountInWei);
    //   // const withdraw = await contract.withdrawHouseFunds(1000000000000000000);
    //   console.log(transaction.hash);
    // } catch (error) {
    //   console.log(error.message);
    // }

    //
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

function generateRandomClientSeed() {
  return crypto.randomBytes(40).toString("hex");
}

main();
