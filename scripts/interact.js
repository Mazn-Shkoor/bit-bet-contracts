const { ethers } = require("hardhat");
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

      const receipt = await tx.wait();

      for (const event of receipt.events) {
        console.log(`Event ${event.event} with args ${event.args}`);
      }
    } catch (error) {
      console.error(error.message);
    }

    // try {
    //   const amountInWei = ethers.parseEther("0.1"); // Withdraw 1 ETH, specify amount in Ether
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
