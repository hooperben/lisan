import hre, { ethers } from "hardhat";
import { Lisan } from "../typechain-types";
import { zeroPadValue } from "ethers";

async function main() {
  const amoy = "0x5c37a27779c2C0CCc550B1Af3Ffe592Cd19582bb";
  const amoyId = 40267;

  const sepolia = "0xdEfbc7F979aD934a401e0c2A426243470f077313";
  const sepoliaId = 40161;

  const arbitrumSepolia = "0x381EBA262eb91f55ca44748B1151406F5Da5bd09";
  const arbitrumSepoliaId = 40231;

  const [Deployer] = await ethers.getSigners();

  let contract: Lisan;
  let remote;
  let remoteId;

  if (hre.network.name === "amoy") {
    contract = await ethers.getContractAt("Lisan", amoy, Deployer);
    remote = sepolia;
    remoteId = sepoliaId;

    let tx = await contract
      .connect(Deployer)
      .setPeer(remoteId, zeroPadValue(remote, 32));

    remote = arbitrumSepolia;
    remoteId = arbitrumSepoliaId;

    tx = await contract
      .connect(Deployer)
      .setPeer(remoteId, zeroPadValue(remote, 32));
    await tx.wait();
  }

  if (hre.network.name === "sepolia") {
    contract = await ethers.getContractAt("Lisan", sepolia, Deployer);
    remote = amoy;
    remoteId = amoyId;

    let tx = await contract
      .connect(Deployer)
      .setPeer(remoteId, zeroPadValue(remote, 32));

    await tx.wait();

    remote = arbitrumSepolia;
    remoteId = arbitrumSepoliaId;

    tx = await contract
      .connect(Deployer)
      .setPeer(remoteId, zeroPadValue(remote, 32));

    await tx.wait();
  }

  if (hre.network.name === "arbitrumSepolia") {
    contract = await ethers.getContractAt("Lisan", arbitrumSepolia, Deployer);
    remote = sepolia;
    remoteId = sepoliaId;

    let tx = await contract
      .connect(Deployer)
      .setPeer(remoteId, zeroPadValue(remote, 32));

    await tx.wait();

    console.log("wired sepolia to arbitrumSepolia");

    remote = amoy;
    remoteId = amoyId;

    tx = await contract
      .connect(Deployer)
      .setPeer(remoteId, zeroPadValue(remote, 32));

    console.log("wire amoy to arbitrumSepolia");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
