import * as dotenv from "dotenv";
dotenv.config();
import "@nomicfoundation/hardhat-ethers";

export default {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.DEPLOYER_KEY!]
    }
  }
};
