import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "dotenv/config";

if (!process.env.PRIVATE_KEY) throw new Error("missing private key brev");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
          },
        },
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.ETHEREUM_JSON_RPC_API_URL_SEPOLIA,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true,
    },
    amoy: {
      url: process.env.POYLGON_JSON_RPC_API_URL_AMOY,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true,
    },
    arbitrumSepolia: {
      url: process.env.ARBITRUM_JSON_RPC_API_URL_SEPOLIA,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true,
    },
  },
  mocha: {
    timeout: 100_000,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGON_ETHERSCAN_API_KEY!,
      sepolia: process.env.ETHERSCAN_API_KEY!,
    },
  },
};

export default config;
