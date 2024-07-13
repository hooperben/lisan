import { Options } from "@layerzerolabs/lz-v2-utilities";
import { Contract, formatEther } from "ethers";
import hre, { deployments, ethers } from "hardhat";
import { Lisan, OChain } from "../typechain-types";

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

async function main() {
  const [Deployer] = await ethers.getSigners();

  const lzDetails = lzEndpoints[hre.network.name];

  if (!lzDetails) {
    throw new Error(
      "Missing LayerZero endpoint details for network " + hre.network.name
    );
  }

  const options = Options.newOptions()
    .addExecutorLzReceiveOption(200000, 0)
    .toHex()
    .toString();

  const { address, abi } = await deployments.get("Lisan");
  const Lisan = new Contract(address, abi, Deployer) as unknown as Lisan;

  const desiredBlockNumber = 6304922;

  console.log("Sending message to", lzDetails.eid);

  // Define native fee and quote for the message send operation
  const [nativeFee] = await Lisan.quote(
    40267,
    desiredBlockNumber,
    options,
    false
  );

  console.log(formatEther(nativeFee + (nativeFee * 20n) / 100n), "ETH");

  const tx = await Lisan.send(40267, 6304923, options, {
    value: nativeFee + (nativeFee * 20n) / 100n,
  });

  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
