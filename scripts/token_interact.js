const { ethers, Signer } = require("hardhat");

const crypto = require("crypto");
require("dotenv").config();

const token_abi = require("./token_abi");

async function main() {
  try {
    const DEPLOYED_CONTRACT_ADDRESS = process.env.DEPLOYED_CONTRACT_ADDRESS;

    const TOKEN_ADDRESS = process.env.DEPLOYED_TOKEN_ADDRESS; // Replace this with your token's address

    const YOUR_WALLET_ADDRESS = "0x102E8bcBb7d0835b2BdAA68550d7CFc2e83aa0A4";
    console.log("Accounts:", YOUR_WALLET_ADDRESS); // Displaying the first account

    // Retrieve the default provider from Hardhat
    const provider = ethers.provider;
    const signer = await provider.getSigner();

    // Connect to the ERC20 token contract
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, token_abi, signer);

    // Call the balanceOf function of the ERC20 token contract
    const tokenBalance = await tokenContract.balanceOf(YOUR_WALLET_ADDRESS);
    console.log("Token Balance: ", tokenBalance.toString());

    const Dice = await ethers.getContractFactory("Dice");
    const contract = await Dice.attach(DEPLOYED_CONTRACT_ADDRESS);

    const target = 50;
    const betDirection = 0;
    const amountToSend = ethers.parseUnits("5", 18); // Amount of tokens to send

    console.log("Sending: ", amountToSend);

    console.log("Target: ", target);
    if (betDirection === 0) {
      console.log("Bet Direction: RollOver");
    } else {
      console.log("Bet Direction: RollUnder");
    }

    try {
      let clientSeed = generateRandomClientSeed();
      console.log("Client Seed: ", clientSeed);

      // const tx = await contract.bet(target, betDirection, clientSeed, {
      //   value: amountToSend,
      // });

      // Transfer tokens to the smart contract
      // const transferTx = await tokenContract.transfer(
      //   DEPLOYED_CONTRACT_ADDRESS,
      //   amountToSend
      // );
      // await transferTx.wait();

      const getHouseFunds = await contract.getHouseFunds();

      console.log("House funds: ", getHouseFunds);

      // Approve the smart contract to spend tokens on behalf of the sender
      const approveTx = await tokenContract.approve(
        DEPLOYED_CONTRACT_ADDRESS,
        amountToSend
      );
      await approveTx.wait();

      // Call the bet function of the smart contract
      const betTx = await contract.bet(
        target,
        betDirection,
        clientSeed,
        amountToSend
      );

      // get deployed contract
      const myContract = await ethers.getContractAt(
        Dice.interface,
        DEPLOYED_CONTRACT_ADDRESS
      );

      const filterBetPlaced = myContract.filters.BetPlaced();
      const filterRandomNumber = myContract.filters.RandomNumber();

      // Subscribe to the event
      myContract.on(filterBetPlaced, (eventData) => {
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
        console.log("Amount:", ethers.formatEther(amount), "token");
        console.log("Target:", target);
        console.log("Bet Direction:", betDirection);
        console.log("Multiplier:", multiplier);
        console.log("Payout:", ethers.formatEther(payout), "token");
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

      // const amount = ethers.parseUnits("10", 18);
      // const transaction = await contract.withdrawHouseFunds(amount);
      // console.log(transaction.hash);
    } catch (error) {
      console.error(error.message);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}
function generateRandomClientSeed() {
  return crypto.randomBytes(40).toString("hex");
}

main();
