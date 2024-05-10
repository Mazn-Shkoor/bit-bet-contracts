const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require("dotenv").config();

const DEPLOYED_TOKEN_ADDRESS = process.env.DEPLOYED_TOKEN_ADDRESS;

module.exports = buildModule("DiceModule", (m) => {
  const tokenAddress = m.getParameter("_tokenAddress", DEPLOYED_TOKEN_ADDRESS);

  const dice = m.contract("Dice", [tokenAddress]);
  return { dice };
});
