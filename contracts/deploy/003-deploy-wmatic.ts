import { type DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments, network } = hre;

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log(deployer);

  const { address } = await deploy("WMATIC", {
    from: deployer,
    args: [],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  console.log(
    `Deployed contract: WMatic, network: ${network.name}, address: ${address}`
  );
};

deploy.tags = ["wmatic"];

export default deploy;
