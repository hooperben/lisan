import { type DeployFunction } from "hardhat-deploy/types";

const deploy: DeployFunction = async (hre) => {
  const { getNamedAccounts, deployments, network } = hre;

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log(deployer);

  if (network.name !== "amoy") {
    throw new Error("This deployment script is only for the amoy network");
  }

  const amoyLisan = "0x5c37a27779c2C0CCc550B1Af3Ffe592Cd19582bb";

  const { address: verifierAddress } = await deploy("UltraVerifier", {
    from: deployer,
    args: [],
    log: true,
    skipIfAlreadyDeployed: false,
    waitConfirmations: 1,
  });

  console.log(
    `Deployed contract: UltraVerifier, network: ${network.name}, address: ${verifierAddress}`
  );

  const { address } = await deploy("ProofOfETHSepoliaTransfer", {
    from: deployer,
    args: [verifierAddress, amoyLisan],
    log: true,
    skipIfAlreadyDeployed: false,
    waitConfirmations: 1,
  });

  console.log(
    `Deployed contract: ProofOfETHSepoliaTransfer, network: ${network.name}, address: ${address}`
  );
};

deploy.tags = ["proof"];

export default deploy;
