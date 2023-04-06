import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const ALCHEMY_KEY = process.env.ALCHEMY_KEY || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    arbitrumGoerli: {
      url: `https://arb-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  solidity: "0.8.16",
};

export default config;
