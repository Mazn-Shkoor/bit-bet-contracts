const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// const MINIMUM_BET = 1;

module.exports = buildModule("DiceModule", (m) => {
  // const minimumBet = m.getParameter("minimumBet", MINIMUM_BET);
  const dice = m.contract("Dice", []);
  return { dice };
});
