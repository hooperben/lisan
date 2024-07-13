import { getAndBuildCircuit } from "../helpers/getAndBuildCircuit";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { ForeignCallHandler, Noir } from "@noir-lang/noir_js";
import { JSONRPCClient } from "json-rpc-2.0";
import { Lisan, UltraVerifier } from "../typechain-types";
import { ethers } from "hardhat";
import { promises as fs } from "fs";
import toml from "toml";
import { Abi, InputMap, abiEncode } from "@noir-lang/noirc_abi";
import { Hex, isHex } from "viem";

import circuit_acir from "../../circuits/target/circuits.json";

// @ts-ignore -- should be fine I think
export const abi = circuit_acir.abi as unknown as Abi;

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

interface ProofData {
  proof: Uint8Array;
  inputMap: InputMap;
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

describe("testing lisan", async () => {
  let lisan: Lisan;
  let ultraVerifer: UltraVerifier;

  before(async () => {
    const ultraVerifierFactory = await ethers.getContractFactory(
      "UltraVerifier"
    );

    ultraVerifer = (await ultraVerifierFactory.deploy()) as UltraVerifier;
    const lisanFactory = await ethers.getContractFactory("Lisan");

    console.log(await ultraVerifer.getAddress());

    lisan = (await lisanFactory.deploy(
      await ultraVerifer.getAddress()
    )) as Lisan;

    console.log(await lisan.getAddress());
  });

  it.only("should run", async () => {
    // declaring the JSONRPCClient
    const client = new JSONRPCClient((jsonRPCRequest) => {
      // hitting the same JSON RPC Server we coded above
      return fetch("http://localhost:5555", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(jsonRPCRequest),
      }).then((response: any) => {
        if (response.status === 200) {
          return response
            .json()
            .then((jsonRPCResponse: any) => client.receive(jsonRPCResponse));
        } else if (jsonRPCRequest.id !== undefined) {
          return Promise.reject(new Error(response.statusText));
        }
      });
    });

    const removeHexPrefix = (hexString: string): string => {
      if (hexString.startsWith("0x")) {
        return hexString.slice(2);
      }
      return hexString;
    };

    // i don't normally any this hard but this is a hackathon
    const transformArray = (input: any) => {
      return input.map((innerArray: any) => {
        return { Single: removeHexPrefix(innerArray[0].toString("hex")) };
      });
    };

    const foreignCallHandler: ForeignCallHandler = async (
      name: any,
      input: any
    ) => {
      const data = await client.request(name, transformArray(input));
      const formatted = data.values.map(
        (value: any) => value.Single ?? value.Array
      );
      return formatted;
    };

    // const circuit = await getAndBuildCircuit("../circuits/");

    // const backend = new BarretenbergBackend(circuit, { threads: 5 });
    // const noir = new Noir(circuit, backend);

    // the rest of your NoirJS code
    // const input = {
    //   chainId: "11155111",
    //   blockNumber: "6298444",
    //   txIndex: "21",
    // };

    // console.log();
    // const { proof, publicInputs } = await noir.generateProof(
    //   input,
    //   foreignCallHandler
    // );

    console.log("generated proof");
    // console.log(proof);
    // console.log(publicInputs);

    const proofData = await readProofData();

    console.log(proofData);

    const publicInputs = abiEncode(
      abi,
      proofData.inputMap,
      proofData.inputMap.return
    );

    console.log(publicInputs);

    const bytes32Array = proofData.inputMap.block_hash.map(
      (hash) => `0x${hash.slice(-2)}`
    ); // Remove the '0x' prefix and leading zeros

    console.log(bytes32Array);

    function convertHexArrayToTxHash(hexArray: string[]): string {
      // Remove the '0x' prefix from each element in the array
      const cleanHexArray = hexArray.map((hexValue) =>
        hexValue.startsWith("0x") ? hexValue.slice(2) : hexValue
      );

      // Join the array into a single string
      const txHash = cleanHexArray.join("");

      // Add the '0x' prefix
      return "0x" + txHash;
    }

    const tx_hash = convertHexArrayToTxHash(bytes32Array);
    console.log(tx_hash);

    // console.log(bytes32String);

    // console.log(proof);

    // console.log(witness);

    console.log(publicInputs);

    const input = Array.from(publicInputs.values());

    console.log(input);

    console.log(Uint8Array.from(bytes32Array));

    // @ts-ignore
    await lisan.verifyInHistory(proofData.proof, [
      ...input,
      // @ts-ignore
      ...proofData.inputMap.block_hash,
    ]);
  });
});
