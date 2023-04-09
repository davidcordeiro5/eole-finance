import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const ALCHEMY_KEY = process.env.ALCHEMY_KEY || "";
const PRIVATE_KEY_OWNER_EOLE = process.env.PRIVATE_KEY_OWNER_EOLE || "";
const PRIVATE_KEY_OWNER_XEOLE = process.env.PRIVATE_KEY_OWNER_XEOLE || "";
const PRIVATE_KEY_TEAM = process.env.PRIVATE_KEY_TEAM || "";
const PRIVATE_KEY_FEE = process.env.PRIVATE_KEY_FEE || "";
const PRIVATE_KEY_VC = process.env.PRIVATE_KEY_VC || "";

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
      accounts: [
        `0x${PRIVATE_KEY_OWNER_EOLE}`,
        `0x${PRIVATE_KEY_OWNER_XEOLE}`,
        `0x${PRIVATE_KEY_TEAM}`,
        `0x${PRIVATE_KEY_VC}`,
        `0x${PRIVATE_KEY_FEE}`,
      ],
      gas: 8000000,
      gasPrice: 8000000000,
    },
  },
  solidity: "0.8.16",
};
// const ALCHEMY_KEY = process.env.ALCHEMY_KEY || "";
// const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

// const config: HardhatUserConfig = {
//   solidity: "0.8.18",
//   defaultNetwork: "hardhat",
//   networks: {
//     localhost: {
//       url: "http://127.0.0.1:8545",
//       chainId: 31337,
//     },
//     arbitrumGoerli: {
//       url: `https://arb-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`,
//       accounts: [`0x${PRIVATE_KEY}`],
//     },
//   },
//   solidity: "0.8.16",
// };

export default config;
