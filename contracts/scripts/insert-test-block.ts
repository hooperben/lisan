import { Contract } from "ethers";
import { deployments, ethers, network } from "hardhat";

import { Lisan } from "../typechain-types";

async function main() {
  const [Deployer] = await ethers.getSigners();

  const { address, abi } = await deployments.get("Lisan");
  const Lisan = new Contract(address, abi, Deployer) as unknown as Lisan;

  if (network.name !== "amoy")
    throw new Error("This script can only be run on the amoy network");

  const tx = await Lisan.addToHistory(
    "0x0000000000000000000000000000000000000000000000000000000000aa36a7",
    "0x0000000000000000000000000000000000000000000000000000000000601b4c",
    "0xf623c3755959147e55fa120cb836d8c23cbb978021984dd40b063203ccef9910"
  );

  console.log(tx);

  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
