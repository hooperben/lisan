import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { ForeignCallHandler, Noir } from "@noir-lang/noir_js";
import { promises as fs } from "fs";
import { JSONRPCClient } from "json-rpc-2.0";
import toml from "toml";
import { Hex, isHex } from "viem";
import { getAndBuildCircuit } from "../helpers/getAndBuildCircuit";
import { Abi, InputMap, abiEncode } from "@noir-lang/noirc_abi";

interface ProofData {
  proof: Uint8Array;
  inputMap: InputMap;
}

export const BYTE_HEX_LEN = 2;

export function encodeHexStringToArray(value: string): Uint8Array {
  if (!isHex(value)) {
    throw new Error(`Invalid hex string: ${value}`);
  }
  if (value.length % BYTE_HEX_LEN !== 0) {
    value = value.slice(0, BYTE_HEX_LEN) + "0" + value.slice(BYTE_HEX_LEN);
  }
  const arr = [];
  for (let i = 2; i < value.length; i += BYTE_HEX_LEN) {
    arr.push(parseInt(value.substr(i, BYTE_HEX_LEN), 16));
  }
  return new Uint8Array(arr);
}

async function readProof(path: string): Promise<Uint8Array> {
  const proofHex = await fs.readFile(path, "utf-8");
  return encodeHexStringToArray("0x" + proofHex);
}

async function readInputMap(path: string): Promise<InputMap> {
  const verifierData = await fs.readFile(path, "utf-8");
  const inputMap = toml.parse(verifierData) as InputMap;
  return inputMap;
}

export async function readProofData(): Promise<ProofData> {
  const proofPath = `/Users/benhooper/dev/eth-global-brussels/circuits/proofs/circuits.proof`;
  const inputMapPath = `/Users/benhooper/dev/eth-global-brussels/circuits/Verifier.toml`;

  return {
    proof: await readProof(proofPath),
    inputMap: await readInputMap(inputMapPath),
  };
}
