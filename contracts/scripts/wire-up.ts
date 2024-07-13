import hre, { ethers } from "hardhat";
import { Lisan } from "../typechain-types";
import { zeroPadValue } from "ethers";

async function main() {
  const amoy = "0x5c37a27779c2C0CCc550B1Af3Ffe592Cd19582bb";
  const amoyId = 40267;

  const sepolia = "0xdEfbc7F979aD934a401e0c2A426243470f077313";
  const sepoliaId = 40161;

  const [Deployer] = await ethers.getSigners();

  let contract: Lisan;
  let remote;
  let remoteId;

  if (hre.network.name === "amoy") {
    contract = await ethers.getContractAt("Lisan", amoy, Deployer);
    remote = sepolia;
    remoteId = sepoliaId;

    await contract
      .connect(Deployer)
      .setPeer(remoteId, zeroPadValue(remote, 32));
  }

  if (hre.network.name === "sepolia") {
    contract = await ethers.getContractAt("Lisan", sepolia, Deployer);
    remote = amoy;
    remoteId = amoyId;

    await contract
      .connect(Deployer)
      .setPeer(remoteId, zeroPadValue(remote, 32));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
