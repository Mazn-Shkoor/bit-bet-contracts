const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { hre } = require("hardhat");

describe("Dice", function () {
  let Dice;
  let dice;
  let owner;

  // Deploy the contract before each test
  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    Dice = await ethers.getContractFactory("Dice");
    dice = await Dice.deploy(1); // Deploy with minimum bet of 1 eth
  });

  it("should return correct multiplier value for RollOver direction", async function () {
    const multiplierValue = await dice.getMultiplier(10, 0);
    expect(multiplierValue).to.equal(111);
  });

  it("should return correct multiplier value for RollUnder direction", async function () {
    const multiplierValue = await dice.getMultiplier(40, 1);
    expect(multiplierValue).to.equal(250);
  });

  it("should return correct winning amount", async function () {
    const winningAmount = await dice.calculateWinningAmount(1, 200); // 1 is one eth, 200 means 2.0 multiplier
    expect(winningAmount).to.equal(2);
  });

  it("should return random number", async function () {
    const randomNumber = await dice.generateRandomNumber();
    console.log("Random number: ", randomNumber);
  });

  it("should return house fund", async function () {
    const houseFunds = await dice.getHouseFunds();
    console.log("House funds", houseFunds);
  });
});
