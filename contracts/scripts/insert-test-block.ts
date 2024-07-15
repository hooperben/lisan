import { Contract } from "ethers";
import { deployments, ethers, network } from "hardhat";

import { Lisan } from "../typechain-types";

async function main() {
  const [Deployer] = await ethers.getSigners();

  const { address, abi } = await deployments.get("Lisan");
  const Lisan = new Contract(address, abi, Deployer) as unknown as Lisan;

  const tx = await Lisan.addToHistory(
    "0x0000000000000000000000000000000000000000000000000000000000aa36a7",
    "0x0000000000000000000000000000000000000000000000000000000000603586",
    "0xa48308fa4e1efd7b7e962af3dcc7a88834c1c6f1c0fee541211160f65c7d57c7"
  );

  console.log(tx);

  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
