import { type DeployFunction } from "hardhat-deploy/types";

interface lzRecord {
  [key: string]: {
    endpoint: string;
    eid: number;
  };
}

const lzEndpoints: lzRecord = {
  amoy: {
    endpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    eid: 40267,
  },
  sepolia: {
    endpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    eid: 40161,
  },
};

const deploy: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments, network } = hre;

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log(deployer);

  const lzDetails = lzEndpoints[network.name];

  if (!lzDetails) {
    throw new Error(
      "Missing LayerZero endpoint details for network " + network.name
    );
  }

  const { address } = await deploy("Lisan", {
    from: deployer,
    args: [deployer, lzDetails.endpoint],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  console.log(
    `Deployed contract: Lisan, network: ${network.name}, address: ${address}`
  );
};

deploy.tags = ["lisan"];

export default deploy;
