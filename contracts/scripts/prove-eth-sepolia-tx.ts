import { Contract } from "ethers";
import { deployments, ethers, network } from "hardhat";
import { Abi, abiEncode } from "@noir-lang/noirc_abi";
import circuit_acir from "../../circuits/target/circuits.json";
import { ProofOfETHSepoliaTransfer } from "../typechain-types";
import { readProofData } from "../helpers/general-helpers";

// @ts-ignore -- should be fine I think
const abi = circuit_acir.abi as unknown as Abi;

interface InputMap {
  block_hash: string[];
  block_number: string;
  chain_id: string;
  tx_index: string;
  to: {
    _is_some: boolean;
    value: string[];
  };
  value: {
    lo: string;
    hi: string;
  };
}

async function main() {
  const [Deployer] = await ethers.getSigners();

  const { address, abi: contractAbi } = await deployments.get(
    "ProofOfETHSepoliaTransfer"
  );

  const ProofOfETHSepoliaTransfer = new Contract(
    address,
    contractAbi,
    Deployer
  ) as unknown as ProofOfETHSepoliaTransfer;

  const proofData = await readProofData();

  const publicInputs = abiEncode(
    abi,
    proofData.inputMap,
    proofData.inputMap.return
  );

  const input = Array.from(publicInputs.values());
  const tx = await ProofOfETHSepoliaTransfer.proveETHSepoliaTransfer(
    proofData.proof,
    [...input]
  );

  console.log(tx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
